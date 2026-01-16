import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Landing from "../pages/Landing";
import Onboarding from "../pages/Onboarding";
import ProblemPage from "../pages/ProblemPage";

export default function AppRouter() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Restoring session...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/onboarding"
        element={token ? <Onboarding /> : <Navigate to="/login" />}
      />

      <Route
        path="/"
        element={token ? <Dashboard /> : <Landing />}
      />
      <Route
        path="/problems/:id"
        element={token ? <ProblemPage /> : <Navigate to="/login" />}
      />


      <Route
        path="/profile/:slug"
        element={token ? <Profile /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
