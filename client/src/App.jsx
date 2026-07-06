import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Events from "./pages/Events";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./utils/Toast";

const Login = lazy(function() { return import("./pages/Login") });
const Register = lazy(function() { return import("./pages/Register") });
const ForgotPassword = lazy(function() { return import("./pages/ForgotPassword") });
const ResetPassword = lazy(function() { return import("./pages/ResetPassword") });

const CreateEvent = lazy(function() { return import("./pages/CreateEvent") });
const EditEvent = lazy(function() { return import("./pages/EditEvent") });
const EventDetail = lazy(function() { return import("./pages/EventDetail") });
const EventSummary = lazy(function() { return import("./pages/EventSummary") });
const BlogDetail = lazy(function() { return import("./pages/BlogDetail") });
const CreateBlog = lazy(function() { return import("./pages/CreateBlog") });
const Trash = lazy(function() { return import("./pages/Trash") });
const AdminDashboard = lazy(function() { return import("./pages/AdminDashboard") });
const OrganizerDashboard = lazy(function() { return import("./pages/OrganizerDashboard") });
const MyTickets = lazy(function() { return import("./pages/MyTickets") });
const CheckInPage = lazy(function() { return import("./pages/CheckInPage") });
const Settings = lazy(function() { return import("./pages/Settings") });

function PageFallback() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    </div>
  );
}

function SafePage({ name, children }) {
  return (
    <ErrorBoundary name={name}>
      <Suspense fallback={<PageFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

const NO_NAV = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function App() {
  const location = useLocation();
  const showNav = !NO_NAV.includes(location.pathname);

  return (
    <ToastProvider>
      {showNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Events />} />
        <Route path="/login" element={<SafePage name="Login"><Login /></SafePage>} />
        <Route path="/register" element={<SafePage name="Register"><Register /></SafePage>} />
        <Route path="/forgot-password" element={<SafePage name="ForgotPassword"><ForgotPassword /></SafePage>} />
        <Route path="/reset-password" element={<SafePage name="ResetPassword"><ResetPassword /></SafePage>} />
        <Route path="/events/:id" element={<SafePage name="EventDetail"><EventDetail /></SafePage>} />
        <Route path="/events/:id/summary" element={<SafePage name="EventSummary"><EventSummary /></SafePage>} />
        <Route path="/blog/:id" element={<SafePage name="BlogDetail"><BlogDetail /></SafePage>} />
        <Route path="/my-tickets" element={
          <SafePage name="MyTickets">
            <ProtectedRoute roles={["user","admin","organizer"]}>
              <MyTickets />
            </ProtectedRoute>
          </SafePage>
        } />
        <Route path="/create" element={
          <SafePage name="CreateEvent">
            <ProtectedRoute roles={["admin", "organizer"]}>
              <CreateEvent />
            </ProtectedRoute>
          </SafePage>
        } />
        <Route path="/blog/create" element={
          <SafePage name="CreateBlog">
            <ProtectedRoute roles={["admin", "organizer"]}>
              <CreateBlog />
            </ProtectedRoute>
          </SafePage>
        } />
        <Route path="/events/:id/edit" element={
          <SafePage name="EditEvent">
            <ProtectedRoute roles={["admin", "organizer"]}>
              <EditEvent />
            </ProtectedRoute>
          </SafePage>
        } />
        <Route path="/trash" element={
          <SafePage name="Trash">
            <ProtectedRoute roles={["admin"]}>
              <Trash />
            </ProtectedRoute>
          </SafePage>
        } />
        <Route path="/admin" element={
          <SafePage name="AdminDashboard">
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          </SafePage>
        } />
        <Route path="/dashboard" element={
          <SafePage name="OrganizerDashboard">
            <ProtectedRoute roles={["admin", "organizer"]}>
              <OrganizerDashboard />
            </ProtectedRoute>
          </SafePage>
        } />
        <Route path="/checkin/:id" element={
          <SafePage name="CheckInPage">
            <ProtectedRoute roles={["admin", "organizer"]}>
              <CheckInPage />
            </ProtectedRoute>
          </SafePage>
        } />
        <Route path="/settings" element={
          <SafePage name="Settings">
            <ProtectedRoute roles={["user","admin","organizer"]}>
              <Settings />
            </ProtectedRoute>
          </SafePage>
        } />
      </Routes>
    </ToastProvider>
  );
}
