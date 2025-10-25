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
import ProposalsPage from '@/pages/modules/proposals/ProposalsPage';
import ResourcesPage from '@/pages/modules/resources/ResourcesPage';
import ContractsPage from '@/pages/modules/contracts/ContractsPage';
import ProjectsPage from '@/pages/modules/projects/ProjectsPage';
import FinancePage from '@/pages/modules/finance/FinancePage';
import ProcurementPage from '@/pages/modules/procurement/ProcurementPage';
import KpisPage from '@/pages/modules/kpis/KpisPage';
import OrganizationUpdatePage from '@/pages/OrganizationUpdatePage';
import ProfilePage from '@/pages/ProfilePage';
import ProfileSettingsPage from '@/pages/ProfileSettingsPage';
import OrganizationSettingsPage from '@/pages/OrganizationSettingsPage';
// Custom Survey System Pages
import SurveysPage from '@/pages/SurveysPage/SurveysPage';
import SurveyBuilderPage from '@/pages/SurveyBuilderPage/SurveyBuilderPage';
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

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
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
        path: 'module/resources',
        element: <ResourcesPage />,
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
        path: 'module/procurement',
        element: <ProcurementPage />,
      },
      {
        path: 'module/kpis',
        element: <KpisPage />,
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
        path: 'surveys/builder',
        element: <SurveyBuilderPage />,
      },
      {
        path: 'surveys/:surveyId/edit',
        element: <SurveyBuilderPage />,
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
    element: <Outlet />,
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
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}