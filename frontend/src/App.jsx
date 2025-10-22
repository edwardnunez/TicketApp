import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ErrorPage from "./pages/ErrorPage";
import AboutUs from "./pages/AboutUs";
import TicketPurchase from "./pages/TicketPurchase";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStatistics from "./pages/admin/AdminStatistics";
import EventCreation from "./pages/admin/EventCreation";
import EventSeatMapEditor from "./pages/admin/EventSeatmapEditor";
import HelpCenter from "./pages/HelpCenter";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LocationCreation from "./pages/admin/LocationCreation";

/**
 * Main application component that handles routing
 * @returns {JSX.Element} The main app component with routing configuration
 */
function App() {
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<ProtectedRoute element={<EventDetails />} />} />
        <Route path="/about-us" element={<ProtectedRoute element={<AboutUs />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/edit-profile" element={<ProtectedRoute element={<EditProfile />} />} />
        <Route path="/event/purchase/:id" element={<ProtectedRoute element={<TicketPurchase />} />} />
        <Route path="/help" element={<ProtectedRoute element={<HelpCenter />} />} />

        <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/statistics" element={<AdminRoute element={<AdminStatistics />} />} />
        <Route path="/admin/create-event" element={<AdminRoute element={<EventCreation />} />} />
        <Route path="/admin/create-location" element={<AdminRoute element={<LocationCreation />} />} />
        <Route path="/admin/event-seatmap-config" element={<AdminRoute element={<EventSeatMapEditor />} />} />

        <Route path="*" element={<ErrorPage />} /> 
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
