import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Main pages
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetDetails from "./pages/AssetDetails";
import Documents from "./pages/Documents";
import Warranties from "./pages/Warranties";
import Maintenance from "./pages/Maintenance";
import Expenses from "./pages/Expenses";
import ServiceProviders from "./pages/ServiceProviders";
import Reminders from "./pages/Reminders";
import Family from "./pages/Family";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

import ManagementPage from "./pages/ManagementPages";


// =====================================================
// PROTECTED ROUTES
// =====================================================

function ProtectedRoutes() {

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";


  // Login nahi hai
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }


  // Login hai
  return (
    <MainLayout>

      <Routes>

        {/* ================= DASHBOARD ================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* ================= ASSETS ================= */}

        <Route
          path="/assets"
          element={<Assets />}
        />

        <Route
          path="/assets/:id"
          element={<AssetDetails />}
        />


        {/* ================= DOCUMENTS ================= */}

        <Route
          path="/documents"
          element={<Documents />}
        />


        {/* ================= WARRANTIES ================= */}

        <Route
          path="/warranties"
          element={<Warranties />}
        />


        {/* ================= MAINTENANCE ================= */}

        <Route
          path="/maintenance"
          element={<Maintenance />}
        />


        {/* ================= EXPENSES ================= */}

        <Route
          path="/expenses"
          element={<Expenses />}
        />


        {/* ================= REMINDERS ================= */}

        <Route
          path="/reminders"
          element={<Reminders />}
        />


        {/* ================= FAMILY ================= */}

        <Route
          path="/family"
          element={<Family />}
        />


        {/* ================= SERVICE PROVIDERS ================= */}

        <Route
          path="/service-providers"
          element={<ServiceProviders />}
        />


        {/* ================= CALENDAR ================= */}

        <Route
          path="/calendar"
          element={<Calendar />}
        />


        {/* ================= ANALYTICS ================= */}

        <Route
          path="/analytics"
          element={<Analytics />}
        />


        {/* ================= SETTINGS ================= */}

        <Route
          path="/settings"
          element={<Settings />}
        />


        {/* ================= UNKNOWN PAGE ================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </MainLayout>
  );
}


// =====================================================
// MAIN APP
// =====================================================

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* ================= LOGIN ================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ================= REGISTER ================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ================= PROTECTED APP ================= */}

        <Route
          path="/*"
          element={<ProtectedRoutes />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;