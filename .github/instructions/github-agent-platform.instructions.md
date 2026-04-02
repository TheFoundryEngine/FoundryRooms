# GitHub Agent Platform Adapter Instructions

Use this file only when FoundryRooms tasks are being run through GitHub-hosted agent capabilities.

## Goal
Apply the repository's existing governance model inside GitHub-hosted task execution.

## Source of truth order
1. product spec
2. ADRs
3. governance document
4. AGENTS.md
5. this file

## Agent behavior
- operate within a single bounded context whenever possible
- prefer short, reviewable changes over large refactors
- when a contract changes, update fixtures, mocks, and tests in the same PR
- do not invent architecture beyond existing ADRs
- flag required ADR changes instead of silently embedding them in code
- leave clear notes for human reviewers when uncertainty exists
