import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ErrorPage from "./pages/ErrorPage";
import AboutUs from "./pages/AboutUs";
import TicketPurchase from "./pages/TicketPurchase";

import AdminDashboard from "./pages/admin/AdminDashboard";
import EventCreation from "./pages/admin/EventCreation";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/event/:id" element={<ProtectedRoute element={<EventDetails />} />} />
        <Route path="/checkout" element={<ProtectedRoute element={<Checkout />} />} />
        <Route path="/about-us" element={<ProtectedRoute element={<AboutUs />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/edit-profile" element={<ProtectedRoute element={<EditProfile />} />} />
        <Route path="/event/purchase/:id" element={<ProtectedRoute element={<TicketPurchase />} />} />

        <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
        <Route path="/create-event" element={<AdminRoute element={<EventCreation />} />} />

        <Route path="*" element={<ErrorPage />} /> 
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
