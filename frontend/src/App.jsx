import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ItPolicies from "./pages/ItPolicies";
import "./index.css";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [page, setPage] = useState("dashboard");

  if (!loggedIn) {
    return <Login onSuccess={() => setLoggedIn(true)} />;
  }

  return page === "it-policies" ? (
    <ItPolicies onBack={() => setPage("dashboard")} />
  ) : (
    <Dashboard
      onLoggedOut={() => {
        setLoggedIn(false);
        setPage("dashboard");
      }}
      onNavigate={setPage}
    />
  );
}
