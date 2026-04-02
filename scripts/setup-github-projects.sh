#!/bin/bash

# FoundryRooms GitHub Projects Setup Script
# This script sets up the GitHub Projects structure for FoundryRooms

set -e

echo "🚀 Setting up FoundryRooms GitHub Projects..."

# Configuration
ORG_NAME="TheFoundryEngine"
REPO_NAME="FoundryRooms"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    log_error "Not authenticated with GitHub CLI. Run 'gh auth login' first."
    exit 1
fi

log_success "GitHub CLI authentication verified"

# Function to create a project
create_project() {
    local title="$1"
    local description="$2"
    
    log_info "Creating project: $title"
    
    # Create project using GitHub CLI
    project_id=$(gh project create \
        --title "$title" \
        --owner "$ORG_NAME" \
        --format json \
        --jq '.id' 2>/dev/null || echo "")
    
    if [ -n "$project_id" ]; then
        log_success "Created project: $title (ID: $project_id)"
        echo "$project_id"
    else
        log_warning "Project might already exist or couldn't be created: $title"
        echo ""
    fi
}

# Function to add labels to repository
create_labels() {
    log_info "Creating repository labels..."
    
    # Team labels
    gh label create "team-a-community-core" --color "#0075ca" --description "Team A - Community Core" 2>/dev/null || true
    gh label create "team-b-experience" --color "#a2eeef" --description "Team B - Experience" 2>/dev/null || true
    gh label create "team-c-ops-monetization" --color "#d876e3" --description "Team C - Ops & Monetization" 2>/dev/null || true
    gh label create "governor" --color "#5319e7" --description "Governor Agent" 2>/dev/null || true
    
    # Type labels
    gh label create "adr" --color "#f9d0c4" --description "Architectural Decision Record" 2>/dev/null || true
    gh label create "epic" --color "#c2e0c6" --description "Epic issue" 2>/dev/null || true
    gh label create "wave" --color "#bfdadc" --description "Delivery wave" 2>/dev/null || true
    gh label create "feature" --color "#0075ca" --description "Feature work" 2>/dev/null || true
    gh label create "bug" --color "#d73a49" --description "Bug report" 2>/dev/null || true
    gh label create "chore" --color "#ededed" --description "Maintenance task" 2>/dev/null || true
    
    # Status labels
    gh label create "status-backlog" --color "#f9f9f9" --description "Backlog" 2>/dev/null || true
    gh label create "status-ready" --color "#fef2c0" --description "Ready for work" 2>/dev/null || true
    gh label create "status-in-progress" --color "#006b75" --description "In progress" 2>/dev/null || true
    gh label create "status-review" --color "#0366d6" --description "In review" 2>/dev/null || true
    gh label create "status-done" --color "#2ea043" --description "Completed" 2>/dev/null || true
    
    # Priority labels
    gh label create "priority-critical" --color "#b60205" --description="Critical priority" 2>/dev/null || true
    gh label create "priority-high" --color="#d93f0b" --description="High priority" 2>/dev/null || true
    gh label create "priority-medium" --color="#fbca04" --description="Medium priority" 2>/dev/null || true
    gh label create "priority-low" --color="#0e8a16" --description="Low priority" 2>/dev/null || true
    
    # Wave labels
    gh label create "wave-0" --color="#f1f8ff" --description="Wave 0 - Foundation" 2>/dev/null || true
    gh label create "wave-1" --color="#e1e8ff" --description="Wave 1 - Core Viability" 2>/dev/null || true
    gh label create "wave-2" --color="#c8d1ff" --description="Wave 2 - Monetization" 2>/dev/null || true
    gh label create "wave-3" --color="#b1c7ff" --description="Wave 3 - Experience Hardening" 2>/dev/null || true
    
    log_success "Repository labels created"
}

# Function to create initial issues
create_initial_issues() {
    log_info "Creating initial tracking issues..."
    
    # Wave 0 issue
    gh issue create \
        --title "Wave 0: Foundation" \
        --body "## Wave 0 — Foundation\n**Owner:** Governor + support from all teams\n\n**Exit Criteria:**\n- [ ] main branch protected\n- [ ] folder structure agreed\n- [ ] global ADR foundation accepted\n- [ ] teams can start local ADRs and feature work\n\nThis wave is defined in the [Capability Map](docs/planning/CAPABILITY_MAP_AND_EPIC_BREAKDOWN.md)." \
        --label "wave,wave-0,delivery" \
        --repo "$ORG_NAME/$REPO_NAME" 2>/dev/null || true
    
    # Wave 1 issue
    gh issue create \
        --title "Wave 1: Core Viability" \
        --body "## Wave 1 — Core viability\n**Primary owners:** Team A + Team B\n**Support:** Team C\n\n**Exit Criteria:**\n- [ ] members can authenticate\n- [ ] members can enter communities/spaces/channels\n- [ ] members can create and view core content\n- [ ] admins can manage basic structure\n\nThis wave is defined in the [Capability Map](docs/planning/CAPABILITY_MAP_AND_EPIC_BREAKDOWN.md)." \
        --label "wave,wave-1,delivery" \
        --repo "$ORG_NAME/$REPO_NAME" 2>/dev/null || true
    
    # Wave 2 issue
    gh issue create \
        --title "Wave 2: Monetization and Operational Readiness" \
        --body "## Wave 2 — Monetization and operational readiness\n**Primary owner:** Team C\n**Support:** Team A + Team B\n\n**Exit Criteria:**\n- [ ] paid access works\n- [ ] notification flows are operational\n- [ ] async jobs are stable\n- [ ] self-host baseline is documented\n\nThis wave is defined in the [Capability Map](docs/planning/CAPABILITY_MAP_AND_EPIC_BREAKDOWN.md)." \
        --label "wave,wave-2,delivery" \
        --repo "$ORG_NAME/$REPO_NAME" 2>/dev/null || true
    
    # Wave 3 issue
    gh issue create \
        --title "Wave 3: Experience Hardening" \
        --body "## Wave 3 — Experience hardening\n**Owners:** Team B + Team C\n**Support:** Team A\n\n**Exit Criteria:**\n- [ ] UX is production-ready\n- [ ] realtime behavior is stable and hydration-safe\n- [ ] platform is releasable for OSS self-host evaluation\n\nThis wave is defined in the [Capability Map](docs/planning/CAPABILITY_MAP_AND_EPIC_BREAKDOWN.md)." \
        --label "wave,wave-3,delivery" \
        --repo "$ORG_NAME/$REPO_NAME" 2>/dev/null || true
    
    log_success "Initial wave issues created"
}

# Main execution
main() {
    log_info "Starting FoundryRooms GitHub Projects setup..."
    
    # Create labels first
    create_labels
    
    # Create main project
    MAIN_PROJECT_ID=$(create_project "FoundryRooms Roadmap" "Main project for tracking ADRs, epics, and delivery waves")
    
    # Create team projects
    TEAM_A_PROJECT_ID=$(create_project "Team A - Community Core" "Identity, Access, Community Structure, Memberships")
    TEAM_B_PROJECT_ID=$(create_project "Team B - Experience" "Frontend, Discussions, Events, Resources, Realtime")
    TEAM_C_PROJECT_ID=$(create_project "Team C - Ops & Monetization" "Commerce, Notifications, Automation, Deployment")
    
    # Create initial issues
    create_initial_issues
    
    log_success "GitHub Projects setup completed!"
    echo ""
    log_info "Next steps:"
    echo "1. Configure project fields and views in GitHub Projects UI"
    echo "2. Set up automation rules in project settings"
    echo "3. Configure team permissions for each project"
    echo "4. Test the GitHub Actions workflow by updating an ADR"
    echo ""
    log_info "Project IDs (for reference):"
    echo "- Main: $MAIN_PROJECT_ID"
    echo "- Team A: $TEAM_A_PROJECT_ID"
    echo "- Team B: $TEAM_B_PROJECT_ID"
    echo "- Team C: $TEAM_C_PROJECT_ID"
}

# Run main function
main "$@"
