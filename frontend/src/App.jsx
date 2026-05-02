import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import LauncherGrid from './components/LauncherGrid'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import DashboardBuilder from './dashboard/pages/DashboardBuilder'
import AIIntegration from './components/AIChat/AIIntegration'
import { ContactListPage, ContactDetailPage } from './modules/contact-management'
import { SMProvider } from './modules/sales-marketing/context/SMContext'
import { CRMProvider } from './modules/sales-marketing/core-crm/context/CRMContext'
import SMMToastProvider from './modules/sales-marketing/components/SMMToastProvider'
import SMContactManagement from './modules/sales-marketing/core-crm/pages/ContactManagementPage'
import AccountsPage from './modules/sales-marketing/core-crm/pages/AccountsPage'
import AccountDetailPage from './modules/sales-marketing/core-crm/pages/AccountDetailPage'
import Customer360Page from './modules/sales-marketing/core-crm/pages/Customer360Page'
import LeadDatabasePage from './modules/sales-marketing/core-crm/pages/LeadDatabasePage'
import DealManagementPage from './modules/sales-marketing/core-crm/pages/DealManagementPage'
import InteractionHistoryPage from './modules/sales-marketing/core-crm/pages/InteractionHistoryPage'
import ActivityTimelinePage from './modules/sales-marketing/core-crm/pages/ActivityTimelinePage'
import CommunicationLogsPage from './modules/sales-marketing/core-crm/pages/CommunicationLogsPage'
import DataEnrichmentPage from './modules/sales-marketing/core-crm/pages/DataEnrichmentPage'
import DuplicateDetectionPage from './modules/sales-marketing/core-crm/pages/DuplicateDetectionPage'
import LeadCaptureFormsPage from './modules/sales-marketing/lead-management/pages/LeadCaptureFormsPage'
import LeadImportPage from './modules/sales-marketing/lead-management/pages/LeadImportPage'
import AssignmentPageV2 from './modules/sales-marketing/lead-management/pages/AssignmentPageV2'
import LeadScoringPage from './modules/sales-marketing/lead-management/pages/LeadScoringPage'
import SMModuleGuard from './modules/sales-marketing/components/SMModuleGuard'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white text-lg">Loading...</div></div>;
  }
  // Also check localStorage for post-registration flow (signup → onboarding)
  const hasToken = isAuthenticated || !!localStorage.getItem('token');
  if (!hasToken) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isSuperAdmin, user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white text-lg">Loading...</div></div>;
  }
  // Only redirect if user is authenticated AND has completed onboarding (has org_id)
  // Users who registered but haven't completed onboarding (no org_id) should stay here
  const hasCompletedOnboarding = user?.org_id;
  if (isAuthenticated && hasCompletedOnboarding) {
    // Redirect authenticated, onboarded users to their role-appropriate dashboard
    return <Navigate to={isSuperAdmin ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function SuperAdminRoute({ children }) {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-white text-lg">Loading...</div></div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardProvider>
          <SMProvider>
            <SMMToastProvider>
              <CRMProvider>
                <Routes>
                <Route path="/" element={<LauncherGrid />} />
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                {/* Super Admin Dashboard — only for super_admin role, uses same DashboardBuilder */}
                <Route path="/admin" element={
                  <SuperAdminRoute>
                    <DashboardBuilder />
                  </SuperAdminRoute>
                } />
                {/* Regular Dashboard — for all authenticated users (org_admin, manager, user) */}
                <Route path="/dashboard/*" element={<ProtectedRoute><DashboardBuilder /></ProtectedRoute>} />

                {/* Contact Management — Sales module */}
                <Route path="/sales/contacts" element={<ProtectedRoute><ContactListPage /></ProtectedRoute>} />
                <Route path="/sales/contacts/:id" element={<ProtectedRoute><ContactDetailPage /></ProtectedRoute>} />

                {/* Sales & Marketing — Core CRM */}
                <Route path="/sm/core-crm/contacts" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="contacts">
                      <SMContactManagement />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/accounts" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="accounts">
                      <AccountsPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/accounts/:id" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="accounts">
                      <AccountDetailPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/customer-360" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="customer360">
                      <Customer360Page />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/customer-360/:id" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="customer360">
                      <Customer360Page />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                {/* Lead Database */}
                <Route path="/sm/core-crm/leads" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="leads">
                      <LeadDatabasePage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/leads/:id" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="leads">
                      <LeadDatabasePage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                {/* Deal Management */}
                <Route path="/sm/core-crm/deals" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="deals">
                      <DealManagementPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/deals/:id" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="deals">
                      <DealManagementPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/interactions" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="interactions">
                      <InteractionHistoryPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/activity-timeline" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="activity-timeline">
                      <ActivityTimelinePage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/communication-logs" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="interactions">
                      <CommunicationLogsPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/data-enrichment" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="data-enrichment">
                      <DataEnrichmentPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/core-crm/duplicate-detection" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="core-crm" featureId="duplicate-detection">
                      <DuplicateDetectionPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                {/* Lead Management */}
                <Route path="/sm/lead-management/capture-forms" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="lead-management" featureId="capture-forms">
                      <LeadCaptureFormsPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/lead-management/import" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="lead-management" featureId="import">
                      <LeadImportPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/lead-management/assignment" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="lead-management" featureId="assignment">
                      <AssignmentPageV2 />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                <Route path="/sm/lead-management/scoring" element={
                  <ProtectedRoute>
                    <SMModuleGuard sectionId="lead-management" featureId="assignment">
                      <LeadScoringPage />
                    </SMModuleGuard>
                  </ProtectedRoute>
                } />

                {/* Sales & Marketing — catch-all (renders nothing, handled by SM pages above) */}
                <Route path="/sm/*" element={<ProtectedRoute><div className="min-h-screen bg-gray-100" /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CRMProvider>
          </SMMToastProvider>
          <AIIntegration />
        </SMProvider>
      </DashboardProvider>
    </AuthProvider>
  </Router>
)
}

export default App
