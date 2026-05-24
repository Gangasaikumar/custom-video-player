import { useState } from "react";
import { PlaylistPage } from "./components/PlaylistPage";
import { CoursePlayerPage } from "./components/CoursePlayerPage";
import { DevToolsGuard } from "./components/DevToolsGuard";
import { HomeView } from "./components/HomeView";
import type { Course } from "./data/mockData";
import { CourseListPage } from "./components/CourseListPage";
import { Home as HomeIcon } from "lucide-react";
import "./styles/App.css";

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

export default function App() {
  const [view, setView] = useState<
    "home" | "playlist" | "course" | "courses" | "focus"
  >("home");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const renderView = () => {
    switch (view) {
      case "playlist":
        return <PlaylistPage />;
      case "focus":
        return selectedCourse ? (
          <PlaylistPage
            key={selectedCourse.id}
            videos={selectedCourse.videos}
          />
        ) : null;
      case "courses":
        return (
          <CourseListPage
            onSelectCourse={(course) => {
              setSelectedCourse(course);
              setView("course");
            }}
            onBack={() => {
              setSelectedCourse(null);
              setView("home");
            }}
          />
        );
      case "course":
        return selectedCourse ? (
          <CoursePlayerPage
            key={selectedCourse.id}
            course={selectedCourse}
            onEnterFocusMode={() => setView("focus")}
          />
        ) : null;
      default:
        return <HomeView onSelectView={setView} />;
    }
  };

  return (
    <div className="app-container">
      <DevToolsGuard />

      {view !== "home" && view !== "courses" && (
        <div className="nav-button-container">
          <NavTooltip
            text={view === "focus" ? "Back to Course" : "Back to Home"}
          >
            <button
              onClick={() => {
                if (view === "focus") {
                  setView("course");
                } else {
                  setSelectedCourse(null);
                  setView("home");
                }
              }}
              aria-label="Back"
              className="nav-home-button"
            >
              <HomeIcon size={20} />
            </button>
          </NavTooltip>
        </div>
      )}

      {renderView()}
    </div>
  );
}
