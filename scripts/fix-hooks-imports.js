#!/usr/bin/env node
/**
 * Script to fix all hook imports from old flat structure to new module-based structure
 * 
 * Usage: node scripts/fix-hooks-imports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Migration mappings
const MIGRATIONS = {
  // Accounts
  '@/hooks/useAccounts': '@/hooks/accounts',
  '@/hooks/useAccountContacts': '@/hooks/accounts',
  '@/hooks/useAccountDocuments': '@/hooks/accounts',
  '@/hooks/useAccountHealth': '@/hooks/accounts',
  '@/hooks/useAccountNotes': '@/hooks/accounts',
  '@/hooks/useAccountTeam': '@/hooks/accounts',
  '@hooks/useAccounts': '@/hooks/accounts',
  '@hooks/useAccountContacts': '@/hooks/accounts',
  '@hooks/useAccountDocuments': '@/hooks/accounts',
  '@hooks/useAccountHealth': '@/hooks/accounts',
  '@hooks/useAccountNotes': '@/hooks/accounts',
  '@hooks/useAccountTeam': '@/hooks/accounts',
  
  // Opportunities
  '@/hooks/useOpportunities': '@/hooks/opportunities',
  '@/hooks/useOpportunity': '@/hooks/opportunities',
  '@/hooks/useOpportunityDocuments': '@/hooks/opportunities',
  '@/hooks/useOpportunityIngestion': '@/hooks/opportunities',
  '@/hooks/useOpportunityTabs': '@/hooks/opportunities',
  '@/hooks/useOpportunitiesAnalysis': '@/hooks/opportunities',
  '@hooks/useOpportunities': '@/hooks/opportunities',
  '@hooks/useOpportunity': '@/hooks/opportunities',
  '@hooks/useOpportunityDocuments': '@/hooks/opportunities',
  '@hooks/useOpportunityIngestion': '@/hooks/opportunities',
  '@hooks/useOpportunityTabs': '@/hooks/opportunities',
  '@hooks/useOpportunitiesAnalysis': '@/hooks/opportunities',
  
  // Finance
  '@/hooks/useFinance': '@/hooks/finance',
  '@/hooks/useExpenseCategories': '@/hooks/finance',
  '@hooks/useFinance': '@/hooks/finance',
  '@hooks/useExpenseCategories': '@/hooks/finance',
  
  // Procurement
  '@/hooks/useProcurement': '@/hooks/procurement',
  '@/hooks/useProcurementVendors': '@/hooks/procurement',
  '@hooks/useProcurement': '@/hooks/procurement',
  '@hooks/useProcurementVendors': '@/hooks/procurement',
  
  // Resources
  '@/hooks/useEmployees': '@/hooks/resources',
  '@/hooks/useEmployeeActivation': '@/hooks/resources',
  '@/hooks/useStaffPlanning': '@/hooks/resources',
  '@hooks/useEmployees': '@/hooks/resources',
  '@hooks/useEmployeeActivation': '@/hooks/resources',
  '@hooks/useStaffPlanning': '@/hooks/resources',
  
  // AI
  '@/hooks/useAIAgentic': '@/hooks/ai',
  '@/hooks/useChat': '@/hooks/ai',
  '@/hooks/useDataEnrichment': '@/hooks/ai',
  '@hooks/useAIAgentic': '@/hooks/ai',
  '@hooks/useChat': '@/hooks/ai',
  '@hooks/useDataEnrichment': '@/hooks/ai',
  
  // Delivery Models
  '@/hooks/useDeliveryModels': '@/hooks/delivery-models',
  '@hooks/useDeliveryModels': '@/hooks/delivery-models',
  
  // Auth
  '@/hooks/useAuth': '@/hooks/auth',
  '@/hooks/useauthbac': '@/hooks/auth',
  '@/hooks/useHybridAuth': '@/hooks/auth',
  '@/hooks/useLocalAuth': '@/hooks/auth',
  '@/hooks/useSimpleAuth': '@/hooks/auth',
  '@/hooks/useInviteAcceptance': '@/hooks/auth',
  '@hooks/useAuth': '@/hooks/auth',
  '@hooks/useauthbac': '@/hooks/auth',
  '@hooks/useHybridAuth': '@/hooks/auth',
  '@hooks/useLocalAuth': '@/hooks/auth',
  '@hooks/useSimpleAuth': '@/hooks/auth',
  '@hooks/useInviteAcceptance': '@/hooks/auth',
  
  // Organization
  '@/hooks/useOrganization': '@/hooks/organization',
  '@/hooks/useOrganizations': '@/hooks/organization',
  '@hooks/useOrganization': '@/hooks/organization',
  '@hooks/useOrganizations': '@/hooks/organization',
  
  // User Management
  '@/hooks/useUserPermissions': '@/hooks/user-management',
  '@/hooks/useUserStats': '@/hooks/user-management',
  '@/hooks/useRoles': '@/hooks/user-management',
  '@/hooks/useSuperAdmin': '@/hooks/user-management',
  '@/hooks/useSuperAdminVendors': '@/hooks/user-management',
  '@hooks/useUserPermissions': '@/hooks/user-management',
  '@hooks/useUserStats': '@/hooks/user-management',
  '@hooks/useRoles': '@/hooks/user-management',
  '@hooks/useSuperAdmin': '@/hooks/user-management',
  '@hooks/useSuperAdminVendors': '@/hooks/user-management',
  
  // Notes
  '@/hooks/useNotes': '@/hooks/notes',
  '@hooks/useNotes': '@/hooks/notes',
  
  // Shared
  '@/hooks/useToast': '@/hooks/shared',
  '@/hooks/use-toast': '@/hooks/shared',
  '@/hooks/useBreadcrumbs': '@/hooks/shared',
  '@/hooks/useGlobalLoading': '@/hooks/shared',
  '@/hooks/useSessionManager': '@/hooks/shared',
  '@/hooks/use-formbricks': '@/hooks/shared',
  '@hooks/useToast': '@/hooks/shared',
  '@hooks/use-toast': '@/hooks/shared',
  '@hooks/useBreadcrumbs': '@/hooks/shared',
  '@hooks/useGlobalLoading': '@/hooks/shared',
  '@hooks/useSessionManager': '@/hooks/shared',
  '@hooks/use-formbricks': '@/hooks/shared',
};

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, dist, etc.
      if (!['node_modules', '.git', 'dist', '.next', 'build'].includes(file)) {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Skip files in hooks directory itself
      if (!filePath.includes('/hooks/') || filePath.includes('/hooks/README.md')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Apply each migration
  for (const [oldPath, newPath] of Object.entries(MIGRATIONS)) {
    // Match both single and double quotes
    const patterns = [
      new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`from ["']${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g'),
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          const quote = match.includes("'") ? "'" : '"';
          return `from ${quote}${newPath}${quote}`;
        });
        modified = true;
      }
    });
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔄 Fixing hook imports...\n');
  
  const srcDir = path.join(__dirname, '../src');
  const files = findFiles(srcDir);
  
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixImports(file)) {
      console.log(`✅ Fixed: ${path.relative(srcDir, file)}`);
      fixedCount++;
    }
  });
  
  console.log(`\n✨ Fixed ${fixedCount} files!`);
  console.log('\n📝 Next steps:');
  console.log('   1. Review the changes');
  console.log('   2. Run: pnpm tsc --noEmit (to check for TypeScript errors)');
  console.log('   3. Run: pnpm lint (to check for linting errors)');
  console.log('   4. Test the application');
}

main();

