#!/usr/bin/env bash
set -euo pipefail

GOVERNOR_PROMPT=$(cat .github/agents/governor.agent.md)
AGENTS_MD=$(cat AGENTS.md)
DIFF=$(head -c 12000 pr.diff)
CHANGED=$(cat changed_files.txt)

SYSTEM_PROMPT="${GOVERNOR_PROMPT}

== Repository operating rules (AGENTS.md) ==

${AGENTS_MD}"

USER_MESSAGE="PR #${PR_NUMBER}: ${PR_TITLE}

Author: ${PR_AUTHOR}

PR description:
${PR_BODY}

== Changed files ==
${CHANGED}

== Diff (truncated to 12000 chars) ==
${DIFF}

== Instructions ==

Review this PR against your checklist. Be concise and specific. End your review with one of:
- APPROVED -- safe to merge, no blocking issues
- CHANGES REQUESTED -- list what must change before merge
- REJECTED -- explain what violated the rules and what must change"

PAYLOAD=$(jq -n \
  --arg system "$SYSTEM_PROMPT" \
  --arg user "$USER_MESSAGE" \
  '{
    model: "openrouter/free",
    max_tokens: 1024,
    messages: [
      { role: "system", content: $system },
      { role: "user", content: $user }
    ]
  }')

RESPONSE=$(curl -s https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer ${LLM_API_KEY}" \
  -H "content-type: application/json" \
  -d "$PAYLOAD")

REVIEW=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // "Governor Agent review failed -- check workflow logs."')

echo "review<<EOF" >> "$GITHUB_OUTPUT"
echo "$REVIEW" >> "$GITHUB_OUTPUT"
echo "EOF" >> "$GITHUB_OUTPUT"

if echo "$REVIEW" | grep -q "REJECTED"; then
  echo "Governor Agent rejected this PR. See PR comment for details."
  exit 1
fi
