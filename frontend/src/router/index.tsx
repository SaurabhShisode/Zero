import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Landing from "../pages/landing";
import { useAuthStore } from "../store/authStore";

export default function AppRouter() {
  const token = useAuthStore((s) => s.token);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={token ? <Dashboard /> : <Landing />}
      />

      <Route
        path="/profile/:slug"
        element={token ? <Profile /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
