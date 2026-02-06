import { useEffect } from "react"
import { Toaster } from "react-hot-toast"
import { useAuthStore } from "./store/authStore"
import AppRouter from "../src/router/index"

export default function App() {
  const hydrate = useAuthStore(s => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
            fontFamily: "Geist, Inter, system-ui, sans-serif"
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#000"
            }
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#000"
            }
          }
        }}
      />


      <AppRouter />
    </>
  )
}
