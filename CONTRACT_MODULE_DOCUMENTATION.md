# Contract Module Documentation

## Overview

The Contract Management module in `megapolis_fe` provides comprehensive contract lifecycle management with AI-powered analysis, clause library, and workflow automation. This implementation matches the functionality and design of the `mystic-heaven` contract management system.

## Features

### 1. Dashboard Tab
- **AI Predictive Alerts**: Real-time alerts for contract expirations, overdue reviews, and renewal opportunities
- **Key Metrics**: Active contracts, high-risk contracts, pending reviews, and completed contracts
- **Recent Activity**: Quick view of recent contract activity with status and risk indicators
- **Risk Distribution**: Visual representation of risk distribution across active contracts with AI trend analysis

### 2. Contracts Tab
- **Upload New Contract**: Drag & drop interface with AI-powered features:
  - Automated data extraction from contract documents
  - Auto-population of client name, dates, and contract value
  - Instant risk assessment and clause identification
- **AI-Powered Search**: Natural language search with AI suggestions
- **Quick Actions**: Filter buttons for high-risk, pending reviews, and archived contracts
- **Contract Repository**: Table view with:
  - Contract ID, Client/Project, Status, Risk Analysis
  - Assigned Reviewer, Last Modified
  - Action buttons (View, Edit)

### 3. AI Analysis Tab
- **Contract Summary**: Overview of selected contract with risk breakdown
- **Detailed Clause Analysis**: RAG (Red/Amber/Green) reporting system:
  - **Red**: Non-negotiable clauses that conflict with company policy
  - **Amber**: Not ideal but may be acceptable or negotiable
  - **Green**: Standard, acceptable clauses
- **AI Executive Summary**: Comprehensive analysis with:
  - Contract overview
  - Key financial terms
  - Critical action items
  - AI recommendations

### 4. Clause Library Tab
- **Pre-approved Clauses**: Standard clauses with:
  - Preferred language
  - Acceptable alternatives
  - Fallback positions
- **AI-Powered Features**:
  - Alternative wording generation
  - Learning library that learns from successful negotiations
- **Categories**: Organized by Risk Management, Financial, IP, Termination, etc.

### 5. Workflow Tab
- **AI-Optimized Workflow**: 
  - Workflow optimization suggestions
  - Auto reviewer assignment based on contract type and risk
- **Review Process Steps**:
  1. Document Upload (AI analysis triggers automatically)
  2. Initial AI Review (Risk assessment and clause identification)
  3. Legal Review (Attorney review of high-risk items)
  4. Exception Approval (Management approval)
  5. Client Negotiation (Submit exceptions and negotiate)
- **Role Assignments**: Legal reviewers and approval authority levels
- **AI Automation Rules**: Smart routing and escalation rules

## File Structure

```
megapolis_fe/src/
├── pages/modules/contracts/
│   ├── ContractManagementPage.tsx    # Main tabbed interface (NEW)
│   ├── ContractsPage.tsx             # Simple list view (kept for backward compatibility)
│   ├── ContractDetailPage.tsx        # Contract detail view
│   ├── ContractCreatePage.tsx        # Create contract form
│   ├── ContractEditPage.tsx          # Edit contract form
│   └── index.ts                      # Exports
├── hooks/contracts/
│   ├── useContracts.ts                # React Query hooks for contracts
│   └── index.ts                      # Exports
└── services/api/
    └── contractsApi.ts               # API client for contracts
```

## Routes

- `/module/contracts` - Main Contract Management page with tabs (NEW - default)
- `/module/contracts/list` - Simple contracts list view (alternative)
- `/module/contracts/create` - Create new contract
- `/module/contracts/:id` - Contract detail view
- `/module/contracts/:id/edit` - Edit contract

## API Integration

The module uses the `contractsApi` service which:
- Handles API calls to `/api/contracts` endpoint
- Returns empty list gracefully if backend API doesn't exist yet (404/501)
- Supports filtering by status, risk_level, account, and search query
- Provides CRUD operations: list, get, create, update, archive, delete

## Data Flow

1. **Contract List**: `useContractsList` hook fetches contracts from API
2. **Contract Detail**: `useContract` hook fetches single contract
3. **Create/Update**: Mutations handle contract creation and updates
4. **Cache Management**: React Query automatically manages cache invalidation

## Styling

- Uses `font-outfit` class throughout for consistent typography
- Matches mystic-heaven design with `border-2` cards
- Color-coded risk indicators (red/amber/green)
- Responsive grid layouts
- Consistent spacing and padding

## Key Components Used

- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Tab navigation
- `Card`, `CardHeader`, `CardTitle`, `CardContent` - Content cards
- `Badge` - Status and risk indicators
- `Button`, `Input`, `Select` - Form controls
- Lucide React icons for visual indicators

## Future Enhancements

- Backend API integration when contracts API is implemented
- File upload functionality for contract documents
- AI analysis integration with actual AI service
- Clause library management (add/edit/delete clauses)
- Workflow automation configuration
- Real-time notifications for contract alerts

## Notes

- The module gracefully handles missing backend API by returning empty lists
- All UI components are styled to match the megapolis_fe design system
- The implementation follows the Development Guide patterns for hooks and API clients
- TypeScript types are defined in `contractsApi.ts` for type safety

