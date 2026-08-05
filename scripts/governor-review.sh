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

# Free model fallback chain — ordered by capability
# Avoid openrouter/free (auto-selects unsuitable models like content safety classifiers)
FREE_MODELS=(
  "meta-llama/llama-3.3-70b-instruct:free"
  "google/gemini-2.0-flash-exp:free"
  "qwen/qwen-2.5-72b-instruct:free"
  "mistralai/mistral-7b-instruct:free"
)

REVIEW=""
for MODEL in "${FREE_MODELS[@]}"; do
  echo "Trying model: $MODEL" >&2
  PAYLOAD=$(jq -n \
    --arg system "$SYSTEM_PROMPT" \
    --arg user "$USER_MESSAGE" \
    --arg model "$MODEL" \
    '{
      model: $model,
      max_tokens: 1024,
      messages: [
        { role: "system", content: $system },
        { role: "user", content: $user }
      ]
    }')

  RESPONSE=$(curl -s https://openrouter.ai/api/v1/chat/completions \
    -H "Authorization: Bearer ${LLM_API_KEY}" \
    -H "HTTP-Referer: https://github.com/TheFoundryEngine/FoundryRooms" \
    -H "X-Title: FoundryRooms Governor Agent" \
    -H "content-type: application/json" \
    -d "$PAYLOAD")

  echo "Response (first 2000 chars):" >&2
  echo "$RESPONSE" | head -c 2000 >&2

  REVIEW=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')

  # Validate the response contains a verdict keyword
  if [ -n "$REVIEW" ] && [ "$REVIEW" != "null" ] && \
     (echo "$REVIEW" | grep -qi "APPROVED" || \
      echo "$REVIEW" | grep -qi "CHANGES REQUESTED" || \
      echo "$REVIEW" | grep -qi "REJECTED"); then
    echo "Got valid review with verdict from $MODEL" >&2
    break
  fi

  echo "No verdict found in response from $MODEL, trying next model..." >&2
  REVIEW=""
done

if [ -z "$REVIEW" ]; then
  REVIEW="Governor Agent review failed — all free models exhausted or returned no verdict. Check workflow logs for details. Manual review required."
fi

echo "review<<EOF" >> "$GITHUB_OUTPUT"
echo "$REVIEW" >> "$GITHUB_OUTPUT"
echo "EOF" >> "$GITHUB_OUTPUT"

if echo "$REVIEW" | grep -q "REJECTED"; then
  echo "Governor Agent rejected this PR. See PR comment for details."
  exit 1
fi
