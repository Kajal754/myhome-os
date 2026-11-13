
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// Public pages
import HomePage from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboard pages
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

import SecondBrain from "./pages/SecondBrain";
import LifeRadar from "./pages/LifeRadar";
import LifeAuditor from "./pages/LifeAuditor";
import SmartAlerts from "./pages/SmartAlerts";

function ProtectedRoutes() {
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/second-brain" element={<SecondBrain />} />
        <Route path="/life-radar" element={<LifeRadar />} />
        <Route path="/life-auditor" element={<LifeAuditor />} />
        <Route path="/smart-alerts" element={<SmartAlerts />} />

        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/:id" element={<AssetDetails />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/warranties" element={<Warranties />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/family" element={<Family />} />
        <Route path="/service-providers" element={<ServiceProviders />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
