// Imports and Component Definition
import { useState, useCallback, useRef } from "react";
import { SecureVideoPlayer } from "./SecureVideoPlayer";
import type { Course, Video } from "../data/mockData";
import { Search, Star, Users, Clock, ArrowUp } from "lucide-react";
import { useScrollToTop } from "../hooks/useScrollToTop";

import { CourseContentSidebar } from "./CourseContentSidebar";
import "../styles/CoursePlayerPage.css";

interface CoursePlayerPageProps {
  course: Course;
  onEnterFocusMode?: () => void; // Keeping prop optional to avoid breaking parent usage immediately
}

export function CoursePlayerPage({ course }: CoursePlayerPageProps) {
  const [currentVideo, setCurrentVideo] = useState<Video>(course.videos[0]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(() => {
    const completed = new Set<string>();
    course.videos.forEach((video) => {
      if (localStorage.getItem(`video-completed-${video.id}`) === "true") {
        completed.add(video.id);
      }
    });
    return completed;
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { showScrollTop, scrollToTop } =
    useScrollToTop<HTMLDivElement>(scrollContainerRef);

  const toggleCompletion = useCallback((videoId: string) => {
    setCompletedVideos((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
        localStorage.removeItem(`video-completed-${videoId}`);
      } else {
        next.add(videoId);
        localStorage.setItem(`video-completed-${videoId}`, "true");
      }
      return next;
    });
  }, []);

  const handleVideoEnded = () => {
    toggleCompletion(currentVideo.id);

    if (autoPlayNext) {
      const currentIndex = course.videos.findIndex(
        (v) => v.id === currentVideo.id,
      );
      if (currentIndex >= 0 && currentIndex < course.videos.length - 1) {
        setCurrentVideo(course.videos[currentIndex + 1]);
      }
    }
  };

  return (
    <div
      className={`player-page-grid ${
        isTheaterMode ? "theater-mode" : "normal-mode"
      }`}
    >
      {/* LEFT COLUMN: Player + Tabs + Content */}
      <div
        ref={scrollContainerRef}
        className="player-scroll-container no-scrollbar"
      >
        {/* Dark Player Section */}
        <div className="player-dark-section">
          <div className="player-container-inner">
            <SecureVideoPlayer
              src={currentVideo.src}
              userEmail="student@example.com"
              isTheaterMode={isTheaterMode}
              onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
              fullWidth={true}
              autoPlay={true}
              onEnded={handleVideoEnded}
              autoPlayNext={autoPlayNext}
              onToggleAutoPlayNext={() => setAutoPlayNext(!autoPlayNext)}
            />
          </div>
        </div>

        {/* Cinematic Tabs Bar */}
        <div className="tabs-bar">
          <div className="search-icon-wrapper">
            <Search size={18} />
          </div>

          {["Overview", "Q&A", "Notes", "Announcements", "Reviews"].map(
            (tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`tab-item ${
                  activeTab === tab.toLowerCase() ? "active" : ""
                }`}
              >
                {tab}
              </div>
            ),
          )}
        </div>

        {/* Tab Content + Floating Sidebar in Theater Mode */}
        <div
          className={`player-content-wrapper ${
            isTheaterMode ? "" : "contained"
          }`}
        >
          {/* Main Content Area */}
          <div className="video-main-content">
            <h2 className="video-title">{currentVideo.title}</h2>

            <div className="video-stats-row">
              <div className="stat-badge text-star-yellow">
                <Star size={16} fill="#f39c12" />
                <span className="stat-rating-score">4.8</span>
                <span className="stat-rating-count">(22.1k ratings)</span>
              </div>

              <div className="stat-badge">
                <Users size={16} /> 150k Students
              </div>
              <div className="stat-badge">
                <Clock size={16} /> {course.totalDuration}
              </div>
            </div>

            <div className="module-description">
              <p className="module-description-text">
                <strong className="description-label">
                  Module Description:
                </strong>
                {currentVideo.description || course.description}
              </p>
            </div>
          </div>

          {/* Conditional Sidebar for Theater Mode */}
          {isTheaterMode && (
            <div className="theater-sidebar-container">
              <CourseContentSidebar
                course={course}
                currentVideo={currentVideo}
                completedVideos={completedVideos}
                onVideoSelect={setCurrentVideo}
                onToggleCompletion={toggleCompletion}
                className="sidebar-theater-override"
              />
            </div>
          )}
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="player-scroll-top-btn"
            style={{ right: isTheaterMode ? "40px" : "420px" }}
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} />
          </button>
        )}
      </div>

      {/* Right Column: Sidebar (Normal Mode) */}
      {!isTheaterMode && (
        <CourseContentSidebar
          course={course}
          currentVideo={currentVideo}
          completedVideos={completedVideos}
          onVideoSelect={setCurrentVideo}
          onToggleCompletion={toggleCompletion}
        />
      )}
    </div>
  );
}
