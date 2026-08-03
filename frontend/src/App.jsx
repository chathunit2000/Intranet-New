import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ItPolicies from "./pages/ItPolicies";
import ErpLearningHub from "./pages/ErpLearningHub";
import AttendanceReport from "./pages/AttendanceReport";
import "./index.css";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [page, setPage] = useState("dashboard");

  if (!loggedIn) {
    return <Login onSuccess={() => setLoggedIn(true)} />;
  }

  return page === "it-policies" ? (
    <ItPolicies onBack={() => setPage("dashboard")} />
  ) : page === "erp-learning-hub" ? (
    <ErpLearningHub onBack={() => setPage("dashboard")} />
  ) : page === "attendance" ? (
    <AttendanceReport onBack={() => setPage("dashboard")} />
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