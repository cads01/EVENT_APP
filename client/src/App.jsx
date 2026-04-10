import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const token = localStorage.getItem("token");

  return token ? <Dashboard /> : <Auth />;
}