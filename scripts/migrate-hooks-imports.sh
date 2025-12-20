#!/bin/bash
# Script to migrate hook imports from flat structure to module-based structure

echo "🔄 Migrating hook imports to module-based structure..."

# Define the migration mappings
declare -A MIGRATIONS=(
    ["@/hooks/useAccounts"]="@/hooks/accounts"
    ["@/hooks/useAccountContacts"]="@/hooks/accounts"
    ["@/hooks/useAccountDocuments"]="@/hooks/accounts"
    ["@/hooks/useAccountHealth"]="@/hooks/accounts"
    ["@/hooks/useAccountNotes"]="@/hooks/accounts"
    ["@/hooks/useAccountTeam"]="@/hooks/accounts"
    
    ["@/hooks/useOpportunities"]="@/hooks/opportunities"
    ["@/hooks/useOpportunity"]="@/hooks/opportunities"
    ["@/hooks/useOpportunityDocuments"]="@/hooks/opportunities"
    ["@/hooks/useOpportunityIngestion"]="@/hooks/opportunities"
    ["@/hooks/useOpportunityTabs"]="@/hooks/opportunities"
    ["@/hooks/useOpportunitiesAnalysis"]="@/hooks/opportunities"
    
    ["@/hooks/useFinance"]="@/hooks/finance"
    ["@/hooks/useExpenseCategories"]="@/hooks/finance"
    
    ["@/hooks/useProcurement"]="@/hooks/procurement"
    ["@/hooks/useProcurementVendors"]="@/hooks/procurement"
    
    ["@/hooks/useEmployees"]="@/hooks/resources"
    ["@/hooks/useEmployeeActivation"]="@/hooks/resources"
    ["@/hooks/useStaffPlanning"]="@/hooks/resources"
    
    ["@/hooks/useAIAgentic"]="@/hooks/ai"
    ["@/hooks/useChat"]="@/hooks/ai"
    ["@/hooks/useDataEnrichment"]="@/hooks/ai"
    
    ["@/hooks/useDeliveryModels"]="@/hooks/delivery-models"
    
    ["@/hooks/useAuth"]="@/hooks/auth"
    ["@/hooks/useauthbac"]="@/hooks/auth"
    ["@/hooks/useHybridAuth"]="@/hooks/auth"
    ["@/hooks/useLocalAuth"]="@/hooks/auth"
    ["@/hooks/useSimpleAuth"]="@/hooks/auth"
    ["@/hooks/useInviteAcceptance"]="@/hooks/auth"
    
    ["@/hooks/useOrganization"]="@/hooks/organization"
    ["@/hooks/useOrganizations"]="@/hooks/organization"
    
    ["@/hooks/useUserPermissions"]="@/hooks/user-management"
    ["@/hooks/useUserStats"]="@/hooks/user-management"
    ["@/hooks/useRoles"]="@/hooks/user-management"
    ["@/hooks/useSuperAdmin"]="@/hooks/user-management"
    ["@/hooks/useSuperAdminVendors"]="@/hooks/user-management"
    
    ["@/hooks/useNotes"]="@/hooks/notes"
    
    ["@/hooks/useToast"]="@/hooks/shared"
    ["@/hooks/use-toast"]="@/hooks/shared"
    ["@/hooks/useBreadcrumbs"]="@/hooks/shared"
    ["@/hooks/useGlobalLoading"]="@/hooks/shared"
    ["@/hooks/useSessionManager"]="@/hooks/shared"
    ["@/hooks/use-formbricks"]="@/hooks/shared"
)

# Find all TypeScript/TSX files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/hooks/*" | while read file; do
    # Skip if file doesn't exist or is empty
    [ ! -f "$file" ] && continue
    
    # Create a backup
    cp "$file" "$file.bak"
    
    # Apply migrations
    for old_path in "${!MIGRATIONS[@]}"; do
        new_path="${MIGRATIONS[$old_path]}"
        # Replace in the file
        sed -i '' "s|from ['\"]${old_path}['\"]|from '${new_path}'|g" "$file" 2>/dev/null
        sed -i '' "s|from [\"']${old_path}[\"']|from \"${new_path}\"|g" "$file" 2>/dev/null
    done
    
    # Remove backup if no changes were made
    if diff -q "$file" "$file.bak" > /dev/null 2>&1; then
        rm "$file.bak"
    else
        echo "✅ Updated: $file"
    fi
done

echo "✨ Migration complete! Review changes and remove .bak files when satisfied."

