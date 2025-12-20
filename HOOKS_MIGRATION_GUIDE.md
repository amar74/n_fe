# Hooks Migration Guide

## Overview

The hooks folder has been reorganized from a flat structure to a **module-based structure** for better organization and discoverability.

## New Structure

```
hooks/
├── accounts/          # Account-related hooks
├── opportunities/     # Opportunity-related hooks
├── finance/          # Finance-related hooks
├── procurement/      # Procurement-related hooks
├── resources/        # Employee & resource hooks
├── ai/               # AI-related hooks
├── delivery-models/  # Delivery model hooks
├── auth/             # Authentication hooks
├── organization/     # Organization hooks
├── user-management/  # User management hooks
├── notes/            # Notes hooks
├── shared/           # Shared/UI hooks
└── index.ts          # Main export (exports all modules)
```

## Migration Patterns

### Import Changes

**Before (Old Structure):**
```typescript
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useOpportunities } from '@/hooks/useOpportunities';
```

**After (New Structure):**
```typescript
// Option 1: Direct module import (Recommended)
import { useAccounts } from '@/hooks/accounts';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/shared';
import { useOpportunities } from '@/hooks/opportunities';

// Option 2: Centralized import (All modules)
import { useAccounts, useAuth, useToast, useOpportunities } from '@/hooks';
```

## Complete Migration Map

| Old Import | New Import |
|------------|------------|
| `@/hooks/useAccounts` | `@/hooks/accounts` |
| `@/hooks/useAccountContacts` | `@/hooks/accounts` |
| `@/hooks/useAccountDocuments` | `@/hooks/accounts` |
| `@/hooks/useAccountHealth` | `@/hooks/accounts` |
| `@/hooks/useAccountNotes` | `@/hooks/accounts` |
| `@/hooks/useAccountTeam` | `@/hooks/accounts` |
| `@/hooks/useOpportunities` | `@/hooks/opportunities` |
| `@/hooks/useOpportunity` | `@/hooks/opportunities` |
| `@/hooks/useOpportunityDocuments` | `@/hooks/opportunities` |
| `@/hooks/useOpportunityIngestion` | `@/hooks/opportunities` |
| `@/hooks/useOpportunityTabs` | `@/hooks/opportunities` |
| `@/hooks/useOpportunitiesAnalysis` | `@/hooks/opportunities` |
| `@/hooks/useFinance` | `@/hooks/finance` |
| `@/hooks/useExpenseCategories` | `@/hooks/finance` |
| `@/hooks/useProcurement` | `@/hooks/procurement` |
| `@/hooks/useProcurementVendors` | `@/hooks/procurement` |
| `@/hooks/useEmployees` | `@/hooks/resources` |
| `@/hooks/useEmployeeActivation` | `@/hooks/resources` |
| `@/hooks/useStaffPlanning` | `@/hooks/resources` |
| `@/hooks/useAIAgentic` | `@/hooks/ai` |
| `@/hooks/useChat` | `@/hooks/ai` |
| `@/hooks/useDataEnrichment` | `@/hooks/ai` |
| `@/hooks/useDeliveryModels` | `@/hooks/delivery-models` |
| `@/hooks/useAuth` | `@/hooks/auth` |
| `@/hooks/useauthbac` | `@/hooks/auth` |
| `@/hooks/useHybridAuth` | `@/hooks/auth` |
| `@/hooks/useLocalAuth` | `@/hooks/auth` |
| `@/hooks/useSimpleAuth` | `@/hooks/auth` |
| `@/hooks/useInviteAcceptance` | `@/hooks/auth` |
| `@/hooks/useOrganization` | `@/hooks/organization` |
| `@/hooks/useOrganizations` | `@/hooks/organization` |
| `@/hooks/useUserPermissions` | `@/hooks/user-management` |
| `@/hooks/useUserStats` | `@/hooks/user-management` |
| `@/hooks/useRoles` | `@/hooks/user-management` |
| `@/hooks/useSuperAdmin` | `@/hooks/user-management` |
| `@/hooks/useSuperAdminVendors` | `@/hooks/user-management` |
| `@/hooks/useNotes` | `@/hooks/notes` |
| `@/hooks/useToast` | `@/hooks/shared` |
| `@/hooks/use-toast` | `@/hooks/shared` |
| `@/hooks/useBreadcrumbs` | `@/hooks/shared` |
| `@/hooks/useGlobalLoading` | `@/hooks/shared` |
| `@/hooks/useSessionManager` | `@/hooks/shared` |
| `@/hooks/use-formbricks` | `@/hooks/shared` |

## Automated Migration

A migration script is available at `scripts/migrate-hooks-imports.sh`. 

**To run the migration:**

```bash
cd megapolis_fe
./scripts/migrate-hooks-imports.sh
```

**Note:** The script creates `.bak` backup files. Review the changes and remove backups when satisfied.

## Manual Migration Steps

If you prefer to migrate manually:

1. **Find all hook imports:**
   ```bash
   grep -r "from '@/hooks/use" src/
   ```

2. **Update each import** according to the migration map above

3. **Test the application** to ensure all imports work correctly

## Benefits

✅ **Better Organization**: Related hooks are grouped together  
✅ **Easy Discovery**: Find hooks by business domain  
✅ **Scalability**: Easy to add new hooks to the right module  
✅ **Clear Boundaries**: Module folders define feature boundaries  
✅ **Human-Friendly**: Matches how developers think about features  

## Verification

After migration, verify imports work by:

1. Running the TypeScript compiler:
   ```bash
   pnpm tsc --noEmit
   ```

2. Running the linter:
   ```bash
   pnpm lint
   ```

3. Starting the dev server:
   ```bash
   pnpm dev
   ```

## Questions?

If you encounter any issues during migration, check:
- The hook file exists in the new location
- The module's `index.ts` exports the hook
- TypeScript path aliases are configured correctly

