import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { PlaylistPage } from "./components/PlaylistPage";
import { CoursePlayerPage } from "./components/CoursePlayerPage";
import { DevToolsGuard } from "./components/DevToolsGuard";
import { HomeView } from "./components/HomeView";
import { CourseListPage } from "./components/CourseListPage";
import { LoginPage } from "./components/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthService } from "./utils/authService";
import type { Course } from "./data/mockData";
import { Home as HomeIcon, LogOut } from "lucide-react";
import { useState } from "react";
import "./styles/App.css";

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const NavTooltip = ({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="nav-tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="nav-tooltip-popup">
          {text}
          <div className="nav-tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

// ─── Nav overlay (back + logout) ─────────────────────────────────────────────

function NavOverlay() {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = ["/", "/login"];
  if (hiddenPaths.includes(location.pathname)) return null;

  // Determine back destination
  const isCoursePage = location.pathname.startsWith("/course/");
  const backPath = isCoursePage ? "/courses" : "/";
  const backLabel = isCoursePage ? "Back to Courses" : "Back to Home";

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="nav-button-container">
      <NavTooltip text={backLabel}>
        <button
          onClick={() => navigate(backPath)}
          aria-label={backLabel}
          className="nav-home-button"
        >
          <HomeIcon size={20} />
        </button>
      </NavTooltip>

      <NavTooltip text="Sign Out">
        <button
          onClick={handleLogout}
          aria-label="Sign Out"
          className="nav-home-button nav-logout-button"
        >
          <LogOut size={18} />
        </button>
      </NavTooltip>
    </div>
  );
}

// ─── Course list page with navigation ────────────────────────────────────────

function CoursesPage() {
  const navigate = useNavigate();
  return (
    <CourseListPage
      onSelectCourse={(course: Course) =>
        navigate(`/course/${course.id}`, { state: { course } })
      }
      onBack={() => navigate("/")}
    />
  );
}

// ─── Course player page — reads course from router state ─────────────────────

import { useParams, useLocation as useRouterLocation } from "react-router-dom";
import { MOCK_COURSES } from "./data/mockData";

function CourseRoute() {
  const { id } = useParams<{ id: string }>();
  const location = useRouterLocation();

  // Prefer course passed via navigate state; fall back to lookup by id
  const course: Course | undefined =
    (location.state as { course?: Course })?.course ??
    MOCK_COURSES.find((c) => c.id === id);

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  return <CoursePlayerPage course={course} />;
}

// ─── Home with mode selector ──────────────────────────────────────────────────

function HomePage() {
  const navigate = useNavigate();
  return (
    <HomeView
      onSelectView={(view) => {
        if (view === "playlist") navigate("/streaming");
        else if (view === "courses") navigate("/courses");
      }}
    />
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="app-container">
      <DevToolsGuard />
      <NavOverlay />

      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/streaming"
          element={
            <ProtectedRoute>
              <PlaylistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/course/:id"
          element={
            <ProtectedRoute>
              <CourseRoute />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
