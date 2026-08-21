import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// Main pages
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetDetails from "./pages/AssetDetails";
import Documents from "./pages/Documents";

// Custom designed pages
import Warranties from "./pages/Warranties";
import Maintenance from "./pages/Maintenance";
import Expenses from "./pages/Expenses";
import ServiceProviders from "./pages/ServiceProviders";
import Reminders from "./pages/Reminders";
import Family from "./pages/Family";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
// Pages which are still using the common ManagementPage
import ManagementPage from "./pages/ManagementPages";


function App() {
  return (
    <BrowserRouter>
      <MainLayout>

        <Routes>

          {/* ========================================
              DASHBOARD
          ======================================== */}

          <Route
            path="/"
            element={<Dashboard />}
          />


          {/* ========================================
              ASSETS
          ======================================== */}

          <Route
            path="/assets"
            element={<Assets />}
          />

          <Route
            path="/assets/:id"
            element={<AssetDetails />}
          />


          {/* ========================================
              DOCUMENTS
          ======================================== */}

          <Route
            path="/documents"
            element={<Documents />}
          />


          {/* ========================================
              WARRANTIES
              Custom Warranty page
          ======================================== */}

          <Route
            path="/warranties"
            element={<Warranties />}
          />


          {/* ========================================
              MAINTENANCE
              Custom Maintenance page
          ======================================== */}

          <Route
            path="/maintenance"
            element={<Maintenance />}
          />


          {/* ========================================
              EXPENSES
              Custom Expenses page
          ======================================== */}

          <Route
            path="/expenses"
            element={<Expenses />}
          />


          {/* ========================================
              REMINDERS
          ======================================== */}

         <Route
  path="/reminders"
  element={<Reminders />}
/>


          {/* ========================================
              FAMILY
          ======================================== */}

         <Route
  path="/family"
  element={<Family />}
/>


          {/* ========================================
              SERVICE PROVIDERS
              Custom Service Providers page
          ======================================== */}

          <Route
            path="/service-providers"
            element={<ServiceProviders />}
          />


          {/* ========================================
              CALENDAR
          ======================================== */}

          <Route
  path="/calendar"
  element={<Calendar />}
/>


          {/* ========================================
              ANALYTICS
          ======================================== */}

        <Route
  path="/analytics"
  element={<Analytics />}
/>


          {/* ========================================
              SETTINGS
          ======================================== */}

          <Route
  path="/settings"
  element={<Settings />}
/>


          {/* ========================================
              FALLBACK
              Unknown URL → Dashboard
          ======================================== */}

          <Route
            path="*"
            element={<Dashboard />}
          />

        </Routes>

      </MainLayout>
    </BrowserRouter>
  );
}


export default App;