import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import LoginPage from '@pages/LoginPage';
import SignupPage from '@pages/SignupPage';
import ForgotPasswordPage from '@pages/ForgotPasswordPage';
import ResetPasswordPage from '@pages/ResetPasswordPage';
import CreateOrganizationPage from '@pages/CreateOrganizationPage';
import OrganizationPage from '@pages/OrganizationPage';
import AcceptInvitePage from '@pages/AcceptInvitePage';
import MainLayout from '@layouts/MainLayout';
import AuthLayout from '@layouts/AuthLayout';
import AdminLayout from '@layouts/AdminLayout';
import SuperAdminLayout from '@layouts/SuperAdminLayout';
import AdminSigninPage from '@pages/AdminSigninPage';
import AdminDashboardPage from '@/pages/admin/DashboardPage';
import AccountsPage from '@/pages/modules/accounts/AccountsPage';
import AccountDetailsPage from '@/pages/modules/accounts/AccountDetailsPage';
import AccountEdit from '@/pages/modules/AccountEdit';
import NotesPage from '@/pages/modules/notes/NotesPage';
import NoteDetailsPage from '@/pages/modules/notes/NoteDetailsPage';
import NoteEditPage from '@/pages/modules/notes/NoteEditPage';
import NoteCreatePage from '@/pages/modules/notes/NoteCreatePage';
import AccountsUserPermissions from '@/pages/modules/AccountsUserPermissions';
import OpportunitiesDashboardPage from '@/pages/modules/opportunities/OpportunitiesDashboardPage';
import AIAnalysisPage from '@/pages/modules/opportunities/AIAnalysisPage';
import PipelineOverviewPage from '@/pages/modules/opportunities/PipelineOverviewPage';
import IngestionQueuePage from '@/pages/modules/opportunities/IngestionQueuePage';
import {
  ProposalsPage,
  ProposalSetupPage,
  ProposalEditorPage,
  OngoingProposalsPage,
  CompletedProposalsPage,
} from '@/pages/modules/proposals/proposals/pages';
import ProposalDetailPage from '@/pages/modules/proposals/proposals/pages/ProposalDetailPage';
import {
  BrochuresPage,
  BrochuresSetupPage,
  BrochureEditorPage,
  OngoingBrochuresPage,
  CompletedBrochuresPage,
} from '@/pages/modules/proposals/brochures/pages';
import {
  InterviewsPage,
  InterviewsSetupPage,
  InterviewEditorPage,
  InterviewCreatePage,
  OngoingInterviewsPage,
  CompletedInterviewsPage,
} from '@/pages/modules/proposals/interviews/pages';
import {
  CampaignsPage,
  CampaignsSetupPage,
  CampaignEditorPage,
  CampaignCreatePage,
  OngoingCampaignsPage,
  CompletedCampaignsPage,
} from '@/pages/modules/proposals/campaigns/pages';
import ResourcesPage from '@/pages/modules/resources/ResourcesPage';
import ResourcesDashboardPage from '@/pages/modules/resources/ResourcesDashboardPage';
import OnboardingPage from '@/pages/modules/resources/OnboardingPage';
import EmployeeSearchPage from '@/pages/modules/resources/EmployeeSearchPage';
import EmployeeManagementPage from '@/pages/modules/resources/EmployeeManagementPage';
import EmployeeProfilePage from '@/pages/modules/resources/EmployeeProfilePage';
import PermissionsPage from '@/pages/modules/resources/PermissionsPage';
import RolesManagementPage from '@/pages/modules/resources/RolesManagementPage';
import AnalyticsPage from '@/pages/modules/resources/AnalyticsPage';
import TestIntegration from '@/pages/modules/resources/TestIntegration';
import { StaffingDashboard, CreateStaffPlan } from '@/pages/modules/staffing';
import ViewStaffPlan from '@/pages/modules/staffing/ViewStaffPlan';
import ContractsPage from '@/pages/modules/contracts/ContractsPage';
import ProjectsPage from '@/pages/modules/projects/ProjectsPage';
import FinancePage from '@/pages/modules/finance/FinancePage';
import FinancePlanningPage from '@/pages/modules/finance/FinancePlanningPage';
import ProcurementPage from '@/pages/modules/procurement/ProcurementPage';
import BudgetCreationPage from '@/pages/modules/procurement/BudgetCreationPage';
import { SubmissionsApprovalPage } from '@/pages/modules/procurement/SubmissionsApprovalPage';
import KpisPage from '@/pages/modules/kpis/KpisPage';
import AIAgenticPage from '@/pages/modules/ai-agentic/AIAgenticPage';
import OrganizationUpdatePage from '@/pages/OrganizationUpdatePage';
import ProfilePage from '@/pages/ProfilePage';
import ProfileSettingsPage from '@/pages/ProfileSettingsPage';
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';
import DeliveryModelsPage from '@/pages/modules/delivery-models/DeliveryModelsPage';
// Custom Survey System Pages
import SurveysPage from '@/pages/SurveysPage/SurveysPage';
import AccountSurveyDashboard from '@/pages/AccountSurveyDashboard/AccountSurveyDashboard';
import EmployeeSurveyDashboard from '@/pages/EmployeeSurveyDashboard/EmployeeSurveyDashboard';
import SurveyBuilderPage from '@/pages/SurveyBuilderPage/SurveyBuilderPage';
import EmployeeSurveyBuilderPage from '@/pages/EmployeeSurveyBuilderPage/EmployeeSurveyBuilderPage';
import EmployeeDashboardPage from '@/pages/EmployeeDashboardPage/EmployeeDashboardPage';
import { EmployeeAttendancePage } from '@/pages/EmployeeDashboardPage/components/EmployeeAttendancePage';
import SurveyResponsesPage from '@/pages/SurveyResponsesPage/SurveyResponsesPage';
import SurveyAnalyticsPage from '@/pages/SurveyAnalyticsPage/SurveyAnalyticsPage';
import SurveyPreviewPage from '@/pages/SurveyPreviewPage/SurveyPreviewPage';
import PublicSurveyPage from '@/pages/PublicSurveyPage/PublicSurveyPage';
import SignInPage from '@/pages/testUI/SignInPage';
import { ResetPasswordDialog } from '@/pages/testUI/ResetPasswordDialog';
import SetNewPassword from '@/pages/testUI/SetNewPassword';
import CreateOrganization from '@/pages/testUI/CreateOrganization';
import EditOrganizationDetails from '@/pages/testUI/EditOrganizationDetails';
import OrganizationDetailsView from '@/pages/testUI/OrganizationDetailsView';
import Dashboard from '@/pages/testUI/Dashboard';
import CreateAccountModal from '@/pages/testUI/CreateAccountModal';
import AccountOverview from '@/pages/testUI/AccountOverview';
import AccountOverviewEdit from '@/pages/testUI/AccountOverviewEdit';
import AccountContact from '@/pages/testUI/AccountContact';
import PastPerformance from '@/pages/testUI/PastPerformance';
import MyAccountNotes from '@/pages/testUI/MyAccountNotes';
import MyAccountFinancial from '@/pages/testUI/MyAccountFinancial';
import MyOpportunities from '@/pages/testUI/MyOpportunities';
import SuperAdminLoginPage from '@/pages/super-admin/SuperAdminLoginPage';
import SuperAdminDashboardPage from '@/pages/super-admin/SuperAdminDashboardPage';
import VendorListPage from '@/pages/super-admin/VendorListPage';
import VendorProfilePage from '@/pages/super-admin/VendorProfilePage';
import CreateVendorPage from '@/pages/super-admin/CreateVendorPage';
// Error Pages
import { NotFoundPage, ErrorBoundaryPage } from '@/pages/ErrorPages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'module/opportunities',
        element: <OpportunitiesDashboardPage />,
      },
      {
        path: 'module/opportunities/analysis',
        element: <AIAnalysisPage />,
      },
      {
        path: 'module/opportunities/pipeline/:opportunityId',
        element: <PipelineOverviewPage />,
      },
      {
        path: 'module/opportunities/ingestion',
        element: <IngestionQueuePage />,
      },
      {
        path: 'module/accounts',
        element: <AccountsPage />,
      },
      {
        path: 'module/accounts/:id',
        element: <AccountDetailsPage />,
      },
      {
        path: 'module/accounts/:id/edit',
        element: <AccountEdit />,
      },
      {
        path: 'module/proposals',
        element: <ProposalsPage />,
      },
      {
        path: 'module/proposals/brochures',
        element: <BrochuresPage />,
      },
      {
        path: 'module/proposals/brochures/setup',
        element: <BrochuresSetupPage />,
      },
      {
        path: 'module/proposals/brochures/create',
        element: <BrochureEditorPage />,
      },
      {
        path: 'module/proposals/brochures/:id/edit',
        element: <BrochureEditorPage />,
      },
      {
        path: 'module/proposals/brochures/ongoing',
        element: <OngoingBrochuresPage />,
      },
      {
        path: 'module/proposals/brochures/completed',
        element: <CompletedBrochuresPage />,
      },
      {
        path: 'module/proposals/interviews',
        element: <InterviewsPage />,
      },
      {
        path: 'module/proposals/interviews/setup',
        element: <InterviewsSetupPage />,
      },
      {
        path: 'module/proposals/interviews/create',
        element: <InterviewCreatePage />,
      },
      {
        path: 'module/proposals/interviews/:id/edit',
        element: <InterviewEditorPage />,
      },
      {
        path: 'module/proposals/interviews/ongoing',
        element: <OngoingInterviewsPage />,
      },
      {
        path: 'module/proposals/interviews/completed',
        element: <CompletedInterviewsPage />,
      },
      {
        path: 'module/proposals/campaigns',
        element: <CampaignsPage />,
      },
      {
        path: 'module/proposals/campaigns/setup',
        element: <CampaignsSetupPage />,
      },
      {
        path: 'module/proposals/campaigns/create',
        element: <CampaignCreatePage />,
      },
      {
        path: 'module/proposals/campaigns/:id/edit',
        element: <CampaignEditorPage />,
      },
      {
        path: 'module/proposals/campaigns/active',
        element: <OngoingCampaignsPage />,
      },
      {
        path: 'module/proposals/campaigns/completed',
        element: <CompletedCampaignsPage />,
      },
      // Proposal routes (without module prefix for cleaner URLs)
      {
        path: 'proposals',
        element: <ProposalsPage />,
      },
      {
        path: 'proposals/setup',
        element: <ProposalSetupPage />,
      },
      {
        path: 'proposals/create',
        element: <ProposalEditorPage />,
      },
      {
        path: 'proposals/:id',
        element: <ProposalDetailPage />,
      },
      {
        path: 'proposals/:id/edit',
        element: <ProposalEditorPage />,
      },
      {
        path: 'proposals/ongoing',
        element: <OngoingProposalsPage />,
      },
      {
        path: 'proposals/completed',
        element: <CompletedProposalsPage />,
      },
      {
        path: 'module/resources',
        element: <ResourcesDashboardPage />,
      },
      {
        path: 'module/resources/onboarding',
        element: <OnboardingPage />,
      },
      {
        path: 'module/resources/search',
        element: <EmployeeSearchPage />,
      },
      {
        path: 'module/resources/management',
        element: <EmployeeManagementPage />,
      },
      {
        path: 'module/resources/management/profile/:id',
        element: <EmployeeProfilePage />,
      },
      {
        path: 'module/resources/permissions',
        element: <PermissionsPage />,
      },
      {
        path: 'module/resources/roles',
        element: <RolesManagementPage />,
      },
      {
        path: 'module/resources/analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'module/resources/test',
        element: <TestIntegration />,
      },
      {
        path: 'staffing-plan',
        element: <StaffingDashboard />,
      },
      {
        path: 'staffing-plan/create',
        element: <CreateStaffPlan />,
      },
      {
        path: 'staffing-plan/:id',
        element: <ViewStaffPlan />,
      },
      {
        path: 'staffing-plan/edit/:id',
        element: <CreateStaffPlan />,
      },
      {
        path: 'module/contracts',
        element: <ContractsPage />,
      },
      {
        path: 'module/projects',
        element: <ProjectsPage />,
      },
      {
        path: 'module/finance',
        element: <FinancePage />,
      },
      {
        path: 'module/finance/planning',
        element: <FinancePlanningPage />,
      },
      {
        path: 'module/procurement',
        element: <ProcurementPage />,
      },
      {
        path: 'module/procurement/budget/create',
        element: <BudgetCreationPage />,
      },
      {
        path: 'submissions-approval',
        element: <SubmissionsApprovalPage />,
      },
      {
        path: 'module/delivery-models',
        element: <DeliveryModelsPage />,
      },
      {
        path: 'module/kpis',
        element: <KpisPage />,
      },
      {
        path: 'module/ai-agentic',
        element: <AIAgenticPage />,
      },
      {
        path: 'module/survey/account',
        element: <AccountSurveyDashboard />,
      },
      {
        path: 'module/survey/employee',
        element: <EmployeeSurveyDashboard />,
      },
      {
        path: 'module/notes',
        element: <NotesPage />,
      },
      {
        path: 'module/notes/create',
        element: <NoteCreatePage />,
      },
      {
        path: 'module/notes/:noteId',
        element: <NoteDetailsPage />,
      },
      {
        path: 'module/notes/:noteId/edit',
        element: <NoteEditPage />,
      },
      {
        path: 'modules/accounts-user-permissions',
        element: <AccountsUserPermissions />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'profile/settings',
        element: <ProfileSettingsPage />,
      },
      {
        path: 'settings/notifications',
        element: <ProfileSettingsPage />,
      },
      {
        path: 'employee/dashboard',
        element: <EmployeeDashboardPage />,
      },
      {
        path: 'employee/attendance',
        element: <EmployeeAttendancePage />,
      },
      {
        path: 'organization',
        element: <OrganizationPage />,
      },
      {
        path: 'organization/update',
        element: <OrganizationUpdatePage />,
      },
      {
        path: 'organization/settings',
        element: <OrganizationSettingsPage />,
      },
      // Custom Survey System Routes
      {
        path: 'surveys',
        element: <SurveysPage />,
      },
      {
        path: 'surveys/account-dashboard',
        element: <AccountSurveyDashboard />,
      },
      {
        path: 'surveys/employee-dashboard',
        element: <EmployeeSurveyDashboard />,
      },
      {
        path: 'surveys/builder',
        element: <SurveyBuilderPage />,
      },
      {
        path: 'surveys/employee-builder',
        element: <EmployeeSurveyBuilderPage />,
      },
      {
        path: 'surveys/:surveyId/edit',
        element: <SurveyBuilderPage />,
      },
      {
        path: 'surveys/:surveyId/employee-edit',
        element: <EmployeeSurveyBuilderPage />,
      },
      {
        path: 'surveys/:surveyId',
        element: <SurveyResponsesPage />,
      },
      {
        path: 'surveys/:surveyId/responses',
        element: <SurveyResponsesPage />,
      },
      {
        path: 'surveys/:surveyId/analytics',
        element: <SurveyAnalyticsPage />,
      },
      {
        path: 'surveys/preview',
        element: <SurveyPreviewPage />,
      },
      // Keep client-surveys for backward compatibility
      {
        path: 'client-surveys',
        element: <SurveysPage />,
      },
    ],
  },
  // Create Organization as standalone route (not under MainLayout)
  {
    path: '/organization/create',
    element: <CreateOrganizationPage />,
  },
  // Public Survey Page (no auth required)
  {
    path: '/survey/:surveyId',
    element: <PublicSurveyPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
    ],
  },
  {
    path: '/admin/signin',
    element: <AdminSigninPage />,
  },
  // Super Admin routes
  {
    path: '/super-admin/login',
    element: <SuperAdminLoginPage />,
  },
  {
    path: '/super-admin',
    element: <SuperAdminLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        path: 'dashboard',
        element: <SuperAdminDashboardPage />,
      },
      {
        path: 'vendors',
        element: <VendorListPage />,
      },
      {
        path: 'vendors/create',
        element: <CreateVendorPage />,
      },
      {
        path: 'vendors/:vendorId',
        element: <VendorProfilePage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    path: '/auth/reset-password',
    element: <ResetPasswordPage />,
  },
  // Forgot password standalone route (also accessible without /auth prefix)
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/invite/accept',
    element: <AcceptInvitePage />,
  },
  // testUI
  {
    path: '/testUI',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <SignInPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordDialog />,
      },
      {
        path: 'set-new-password',
        element: <SetNewPassword />,
      },
      {
        path: 'create-organization',
        element: <CreateOrganization />,
      },
      {
        path: 'organization-details',
        element: <OrganizationDetailsView />,
      },
      {
        path: 'organization-edit',
        element: <EditOrganizationDetails />,
      },
      {
        path: 'my-account',
        element: <Dashboard />,
      },
      {
        path: 'create-account',
        element: <CreateAccountModal />,
      },
      {
        path: 'my-account-overview',
        element: <AccountOverview />,
      },
      {
        path: 'my-account-overview-edit',
        element: <AccountOverviewEdit />,
      },
      {
        path: 'my-account-contact',
        element: <AccountContact />,
      },
      {
        path: 'my-account-performance',
        element: <PastPerformance />,
      },
      {
        path: 'my-account-notes',
        element: <MyAccountNotes />,
      },
      {
        path: 'my-account-finance',
        element: <MyAccountFinancial />,
      },
      {
        path: 'my-account-opportunities',
        element: <MyOpportunities />,
      },
    ],
  },
  // Catch-all 404 route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}