import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventDetail from "./pages/EventDetail";
import Trash from "./pages/Trash";
import AdminDashboard from "./pages/AdminDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/create" element={
          <ProtectedRoute roles={["admin", "organizer"]}>
            <CreateEvent />
          </ProtectedRoute>
        } />
        <Route path="/events/:id/edit" element={
          <ProtectedRoute roles={["admin", "organizer"]}>
            <EditEvent />
          </ProtectedRoute>
        } />
        <Route path="/trash" element={
          <ProtectedRoute roles={["admin"]}>
            <Trash />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute roles={["admin", "organizer"]}>
            <OrganizerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}
