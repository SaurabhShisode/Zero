import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import AppRouter from "../src/router/index";

export default function App() {

   const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return <AppRouter />;
}
