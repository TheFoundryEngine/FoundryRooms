#!/usr/bin/env bash
set -euo pipefail

# Updates the linked Linear issue when the Governor Agent flags a PR.
# Called from governor-review.yml with:
#   LINEAR_API_KEY — Linear API key (GitHub secret)
#   PR_NUMBER — PR number
#   PR_URL — PR URL
#   PR_TITLE — PR title
#   REVIEW_TEXT — Governor Agent review text
#   VERDICT — "rejected" (hard block) or "changes-requested" (advisory flag)
#
# Parses the PR title/body for Linear issue identifiers (e.g. FRA-12, KSO-5)
# and adds a comment + label to each matched issue.
# - "rejected" → adds "blocked" label (merge is blocked)
# - "changes-requested" → adds "governor-review" label (advisory, merge not blocked)

if [ -z "${LINEAR_API_KEY:-}" ]; then
  echo "LINEAR_API_KEY not set, skipping Linear update."
  exit 0
fi

# Extract Linear issue IDs from PR title and body (e.g. FRA-12, KSO-5)
ISSUE_IDS=$(echo "${PR_TITLE} ${PR_BODY:-}" | grep -oE '[A-Z]{2,5}-[0-9]+' || true)

if [ -z "$ISSUE_IDS" ]; then
  echo "No Linear issue references found in PR title/body, skipping Linear update."
  exit 0
fi

# Truncate review text to avoid overly long comments
REVIEW_SHORT=$(echo "$REVIEW_TEXT" | head -c 3000)

VERDICT="${VERDICT:-rejected}"

if [ "$VERDICT" = "changes-requested" ]; then
  COMMENT_BODY="## ⚠️ Governor Agent flagged PR #${PR_NUMBER}

**PR:** ${PR_URL}
**Title:** ${PR_TITLE}

The Governor Agent has posted advisory changes requested. The PR is **not blocked** — this is a flag for the team to review.

---

${REVIEW_SHORT}

**Action recommended:** Review the concerns above and consider addressing them in a follow-up. The PR can merge without fixing these, but they should be tracked."
  LINEAR_LABEL="governor-review"
else
  COMMENT_BODY="## ⛔ Governor Agent rejected PR #${PR_NUMBER}

**PR:** ${PR_URL}
**Title:** ${PR_TITLE}

The Governor Agent has rejected this PR for a hard rule violation. The PR **is blocked** from merge.

---

${REVIEW_SHORT}

**Action required:** Fix the issues listed above and push to the PR branch. The Governor Agent will re-review automatically."
  LINEAR_LABEL="blocked"
fi

for ISSUE_ID in $ISSUE_IDS; do
  echo "Updating Linear issue: $ISSUE_ID"

  # Query the issue to get its ID and team labels
  ISSUE_QUERY=$(jq -n --arg id "$ISSUE_ID" '{
    query: "query($id: String!) { issue(id: $id) { id team { id } labels { nodes { id name } } } }",
    variables: { id: $id }
  }')

  ISSUE_RESPONSE=$(curl -s https://api.linear.app/graphql \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "content-type: application/json" \
    -d "$ISSUE_QUERY")

  ISSUE_UUID=$(echo "$ISSUE_RESPONSE" | jq -r '.data.issue.id // empty')
  TEAM_ID=$(echo "$ISSUE_RESPONSE" | jq -r '.data.issue.team.id // empty')

  if [ -z "$ISSUE_UUID" ]; then
    echo "  Issue $ISSUE_ID not found in Linear, skipping."
    continue
  fi

  echo "  Found: $ISSUE_UUID (team: $TEAM_ID)"

  # Add comment to the Linear issue
  COMMENT_PAYLOAD=$(jq -n \
    --arg issueId "$ISSUE_UUID" \
    --arg body "$COMMENT_BODY" \
    '{
      query: "mutation($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { id } } }",
      variables: { input: { issueId: $issueId, body: $body } }
    }')

  COMMENT_RESPONSE=$(curl -s https://api.linear.app/graphql \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "content-type: application/json" \
    -d "$COMMENT_PAYLOAD")

  echo "  Comment: $(echo "$COMMENT_RESPONSE" | jq -r '.data.commentCreate.success // "failed"')"

  # Find the "blocked" label ID for this team
  LABEL_QUERY=$(jq -n --arg teamId "$TEAM_ID" '{
    query: "query($teamId: String!) { team(id: $teamId) { labels { nodes { id name } } } }",
    variables: { id: $teamId }
  }')

  LABEL_RESPONSE=$(curl -s https://api.linear.app/graphql \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "content-type: application/json" \
    -d "$LABEL_QUERY")

  BLOCKED_LABEL_ID=$(echo "$LABEL_RESPONSE" | jq -r --arg labelName "$LINEAR_LABEL" '.data.team.labels.nodes[] | select(.name == $labelName) | .id' | head -1)

  if [ -n "$BLOCKED_LABEL_ID" ]; then
    # Get current label IDs and add the label
    CURRENT_LABELS=$(echo "$ISSUE_RESPONSE" | jq -r '.data.issue.labels.nodes[].id' | tr '\n' ' ')
    ALL_LABELS="${CURRENT_LABELS}${BLOCKED_LABEL_ID}"

    LABEL_ARRAY=$(echo "$ALL_LABELS" | tr ' ' '\n' | grep -v '^$' | jq -R . | jq -s .)

    UPDATE_PAYLOAD=$(jq -n \
      --arg issueId "$ISSUE_UUID" \
      --argjson labels "$LABEL_ARRAY" \
      '{
        query: "mutation($input: IssueUpdateInput!, $id: String!) { issueUpdate(id: $id, input: $input) { success } }",
        variables: { id: $issueId, input: { labelIds: $labels } }
      }')

    UPDATE_RESPONSE=$(curl -s https://api.linear.app/graphql \
      -H "Authorization: $LINEAR_API_KEY" \
      -H "content-type: application/json" \
      -d "$UPDATE_PAYLOAD")

    echo "  ${LINEAR_LABEL} label: $(echo "$UPDATE_RESPONSE" | jq -r '.data.issueUpdate.success // "failed"')"
  else
    echo "  '${LINEAR_LABEL}' label not found in team, skipping label update."
  fi
done

echo "Linear update complete."
