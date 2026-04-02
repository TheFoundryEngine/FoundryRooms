# GitHub Projects Setup for FoundryRooms

## Overview
This document explains how to set up GitHub Projects with Kanban boards to track ADRs, epics, and delivery waves for the FoundryRooms project.

## Project Structure

### Main Project: FoundryRooms Roadmap
**URL**: https://github.com/orgs/TheFoundryEngine/projects/1

**Views**:
- **Board View**: Kanban board for all work items
- **Table View**: Epic and wave tracking
- **Roadmap View**: Timeline view of delivery waves

**Fields**:
- **Title**: Issue/ADR title
- **Status**: (Backlog, Ready, In Progress, Review, Done)
- **Priority**: (Critical, High, Medium, Low)
- **Team**: (Governor, Team A, Team B, Team C)
- **Type**: (ADR, Epic, Wave, Feature, Bug)
- **Wave**: (Wave 0, Wave 1, Wave 2, Wave 3)
- **ADR Number**: For ADR tracking
- **Epic ID**: For epic tracking

### Team Projects

#### Team A - Community Core
**URL**: https://github.com/orgs/TheFoundryEngine/projects/2
**Focus**: Identity, Access, Community Structure, Memberships

#### Team B - Experience
**URL**: https://github.com/orgs/TheFoundryEngine/projects/3
**Focus**: Frontend, Discussions, Events, Resources, Realtime

#### Team C - Ops & Monetization
**URL**: https://github.com/orgs/TheFoundryEngine/projects/4
**Focus**: Commerce, Notifications, Automation, Deployment

## Automation Setup

### 1. GitHub Actions Integration
The `.github/workflows/project-automation.yml` workflow provides:

- **ADR Tracking**: Automatically creates issues when ADRs are updated
- **Epic Generation**: Creates epic issues from capability map
- **Wave Tracking**: Creates delivery wave issues
- **Team Synchronization**: Syncs issues to team projects

### 2. Label Configuration
Create these labels in the repository:

**Team Labels**:
- `team-a-community-core`
- `team-b-experience`
- `team-c-ops-monetization`
- `governor`

**Type Labels**:
- `adr`
- `epic`
- `wave`
- `feature`
- `bug`
- `chore`

**Status Labels**:
- `status-backlog`
- `status-ready`
- `status-in-progress`
- `status-review`
- `status-done`

**Priority Labels**:
- `priority-critical`
- `priority-high`
- `priority-medium`
- `priority-low`

**Wave Labels**:
- `wave-0`
- `wave-1`
- `wave-2`
- `wave-3`

### 3. Project Board Setup

#### Main Board Columns
```
Backlog → Ready for Planning → In Progress → Review → Done
```

#### Team Board Columns
```
Backlog → Ready → In Development → In Review → Testing → Done
```

## Workflow Integration

### ADR Workflow
1. ADR created/updated in `docs/adr/`
2. GitHub Action triggers automatically
3. Creates issue with `adr` label
4. Adds to main project board
5. Governor reviews and assigns to appropriate wave

### Epic Workflow
1. Capability map updated
2. GitHub Action extracts epic information
3. Creates epic issues with team labels
4. Adds to appropriate team project board
5. Team breaks down into features/stories

### Wave Management
1. Wave issues created from capability map
2. Used to track delivery progress
3. Dependencies managed across teams
4. Wave completion criteria tracked

## Setup Instructions

### 1. Create Projects
```bash
# Using GitHub CLI
gh project create --title "FoundryRooms Roadmap" --owner TheFoundryEngine
gh project create --title "Team A - Community Core" --owner TheFoundryEngine
gh project create --title "Team B - Experience" --owner TheFoundryEngine
gh project create --title "Team C - Ops & Monetization" --owner TheFoundryEngine
```

### 2. Configure Fields
For each project, add the custom fields listed above.

### 3. Set Up Automation
- Ensure GitHub Actions are enabled
- Add necessary permissions for project automation
- Configure workflow triggers

### 4. Link Projects
- Link team projects to main project
- Set up issue transfer between projects
- Configure cross-project visibility

## Usage Examples

### Creating a New Epic
```bash
# Epic will be auto-created from capability map
# Manual creation:
gh issue create \
  --title "EPIC-A-001: Auth and session foundation" \
  --body "Implementation of authentication system..." \
  --label "epic,team-a-community-core,wave-1" \
  --repo TheFoundryEngine/FoundryRooms
```

### Updating ADR Status
```bash
# When ADR is updated, automation creates/updates issue
# Manual status update:
gh issue edit <issue-number> \
  --add-label "status-in-progress" \
  --remove-label "status-ready"
```

### Moving Work Between Projects
```bash
# Transfer issue from main to team project
gh project item move <project-id> <item-id> --target-project <target-project-id>
```

## Best Practices

1. **Single Source of Truth**: Capability map drives epic creation
2. **Automation First**: Let GitHub Actions handle routine updates
3. **Clear Ownership**: Every item has a clear team owner
4. **Wave Alignment**: All work aligns with delivery waves
5. **Dependency Management**: Track cross-team dependencies explicitly

## Monitoring and Reporting

### Dashboards
- **Main Dashboard**: Overall progress across all teams
- **Team Dashboards**: Individual team progress
- **Wave Dashboard**: Delivery wave status

### Metrics
- **Cycle Time**: Time from Ready to Done
- **Throughput**: Items completed per week
- **Wave Progress**: Completion percentage per wave
- **Team Velocity**: Story points or items per sprint

### Alerts
- **Wave Blockers**: Items blocking wave progress
- **ADR Review**: ADRs pending governor review
- **Cross-Team Dependencies**: Items requiring coordination

## Integration with Other Tools

### GitHub Actions Integration
- Automated issue creation from ADR changes
- Epic generation from capability map
- Status synchronization across projects

### API Integration
- Custom dashboards using GitHub API
- Integration with external project tools
- Automated reporting workflows

### CI/CD Integration
- Link deployments to project items
- Track release progress in projects
- Automated status updates from builds
