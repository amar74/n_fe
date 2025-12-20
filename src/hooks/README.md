# Hooks Documentation

This directory contains custom React hooks organized by **module/feature** for better maintainability and discoverability.

## 📁 Module-Based Organization

Hooks are organized into module folders that match the business domains:

```
hooks/
├── accounts/          # Account management hooks
├── opportunities/     # Opportunity tracking hooks
├── finance/          # Financial data hooks
├── procurement/      # Procurement hooks
├── resources/        # Employee & resource hooks
├── ai/               # AI agentic hooks
├── delivery-models/  # Delivery model hooks
├── auth/             # Authentication hooks
├── organization/     # Organization management hooks
├── user-management/  # User permissions & roles hooks
├── notes/            # Notes management hooks
├── shared/           # Shared UI/utility hooks
└── index.ts          # Main export file
```

## 🎯 Benefits of Module-Based Structure

1. **Easy Discovery**: Find hooks by business domain, not technical name
2. **Better Organization**: Related hooks are grouped together
3. **Scalability**: Easy to add new hooks to the right module
4. **Clear Boundaries**: Module folders define feature boundaries
5. **Human-Friendly**: Matches how developers think about features

## 📦 Import Patterns

### Option 1: Direct Module Import (Recommended)
```typescript
// Import from specific module
import { useAccounts } from '@/hooks/accounts';
import { useOpportunities } from '@/hooks/opportunities';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/shared';
```

### Option 2: Centralized Import
```typescript
// Import from main index (all modules)
import { useAccounts, useOpportunities, useAuth, useToast } from '@/hooks';
```

### Option 3: Module Namespace Import
```typescript
// Import entire module
import * as AccountsHooks from '@/hooks/accounts';
import * as AuthHooks from '@/hooks/auth';

// Usage
const { data } = AccountsHooks.useAccounts();
```

## 📚 Module Details

### Accounts (`hooks/accounts/`)
- `useAccounts` - Main accounts CRUD operations
- `useAccountContacts` - Account contact management
- `useAccountDocuments` - Account document handling
- `useAccountHealth` - Account health scoring
- `useAccountNotes` - Account notes management
- `useAccountTeam` - Account team assignments

### Opportunities (`hooks/opportunities/`)
- `useOpportunities` - Main opportunities CRUD
- `useOpportunity` - Single opportunity operations
- `useOpportunityDocuments` - Opportunity documents
- `useOpportunityIngestion` - Data ingestion
- `useOpportunityTabs` - Tab management
- `useOpportunitiesAnalysis` - Analytics & reporting

### Finance (`hooks/finance/`)
- `useFinance` - Financial data operations
- `useExpenseCategories` - Expense category management

### Procurement (`hooks/procurement/`)
- `useProcurement` - Procurement operations
- `useProcurementVendors` - Vendor management

### Resources (`hooks/resources/`)
- `useEmployees` - Employee management
- `useEmployeeActivation` - Employee activation workflow
- `useStaffPlanning` - Staff planning & allocation

### AI (`hooks/ai/`)
- `useAIAgentic` - AI agentic features
- `useChat` - Chat functionality
- `useDataEnrichment` - Data enrichment operations

### Delivery Models (`hooks/delivery-models/`)
- `useDeliveryModels` - Delivery model templates

### Auth (`hooks/auth/`)
- `useAuth` - Main authentication hook
- `useHybridAuth` - Hybrid authentication
- `useLocalAuth` - Local authentication
- `useSimpleAuth` - Simplified auth
- `useInviteAcceptance` - Invite acceptance flow

### Organization (`hooks/organization/`)
- `useOrganization` - Single organization operations
- `useOrganizations` - Multiple organizations management

### User Management (`hooks/user-management/`)
- `useUserPermissions` - User permissions management
- `useUserStats` - User statistics
- `useRoles` - Role management
- `useSuperAdmin` - Super admin operations
- `useSuperAdminVendors` - Vendor admin operations

### Notes (`hooks/notes/`)
- `useNotes` - Notes CRUD operations

### Shared (`hooks/shared/`)
- `useToast` - Toast notifications
- `useBreadcrumbs` - Breadcrumb navigation
- `useGlobalLoading` - Global loading state
- `useSessionManager` - Session management
- `useFormbricks` - Formbricks integration

## 🔧 Adding New Hooks

When adding a new hook:

1. **Identify the Module**: Determine which business domain it belongs to
2. **Create in Module Folder**: Add the hook file to the appropriate module folder
3. **Export from Module Index**: Add export to `hooks/{module}/index.ts`
4. **Update Main Index** (if needed): The main `index.ts` auto-exports all modules

### Example: Adding a New Hook

```typescript
// hooks/accounts/useAccountAnalytics.ts
export function useAccountAnalytics() {
  // Hook implementation
}

// hooks/accounts/index.ts
export { useAccountAnalytics } from './useAccountAnalytics';

// Now it's available via:
import { useAccountAnalytics } from '@/hooks/accounts';
```

## 🎨 Best Practices

1. **One Hook Per File**: Keep each hook in its own file
2. **Module Cohesion**: Group related hooks in the same module
3. **Clear Naming**: Use descriptive names that indicate the module
4. **Type Safety**: Always use TypeScript with proper types
5. **Documentation**: Add JSDoc comments for complex hooks

## 📖 Migration Guide

If you're updating imports from the old flat structure:

**Before:**
```typescript
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
```

**After:**
```typescript
import { useAccounts } from '@/hooks/accounts';
import { useAuth } from '@/hooks/auth';
```

Or use the centralized import:
```typescript
import { useAccounts, useAuth } from '@/hooks';
```
