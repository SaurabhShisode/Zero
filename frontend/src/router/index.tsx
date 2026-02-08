import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import Login from "../pages/Login"
import Signup from "../pages/Signup"
import Dashboard from "../pages/Dashboard"
import PublicProfile from "../pages/PublicProfile"

import Landing from "../pages/Landing"
import Onboarding from "../pages/Onboarding"
import ProblemPage from "../pages/ProblemPage"
import Loader from "../components/Loader"


export default function AppRouter() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (token && !user) {
  return <Loader text="Restoring session..." />
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
        path="/u/:slug"
        element={<PublicProfile />}
      />
    </Routes>
  )
}
