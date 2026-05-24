import { useState, useEffect, useRef } from "react";
import { MOCK_COURSES } from "../data/mockData";
import type { Course } from "../data/mockData";
import { Play, Clock, BookOpen, ArrowUp } from "lucide-react";
import { useScrollToTop } from "../hooks/useScrollToTop";
import "../styles/CourseListPage.css";

interface CourseListPageProps {
  onSelectCourse: (course: Course) => void;
  onBack?: () => void;
}

export function CourseListPage({
  onSelectCourse,
}: CourseListPageProps) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { showScrollTop, scrollToTop } =
    useScrollToTop<HTMLDivElement>(scrollContainerRef);

  useEffect(() => {
    const savedProgress: Record<string, number> = {};
    MOCK_COURSES.forEach((course) => {
      let completedCount = 0;
      course.videos.forEach((video) => {
        const isCompleted =
          localStorage.getItem(`video-completed-${video.id}`) === "true";
        if (isCompleted) completedCount++;
      });
      savedProgress[course.id] = completedCount;
    });
    setProgress(savedProgress);
  }, []);

  return (
    <div className="course-list-page">
      {/* Scrollable Content Container */}
      <div
        ref={scrollContainerRef}
        className="course-list-scroll-container no-scrollbar"
      >
        {/* Cinematic Background Glows */}
        <div className="background-glow purple" />
        <div className="background-glow pink" />

        <header className="page-header">
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Your elite learning gallery</p>
        </header>

        <div className="course-grid">
          {MOCK_COURSES.map((course) => {
            const completedVideos = progress[course.id] || 0;
            const totalVideos = course.videos.length;
            const progressPercent = (completedVideos / totalVideos) * 100;

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="course-card"
              >
                {/* Thumbnail Area */}
                <div className="course-thumbnail-wrapper">
                  <img
                    className="course-img"
                    src={course.thumbnail}
                    alt={course.title}
                  />
                  <div className="course-overlay">
                    <div className="play-icon-circle">
                      <Play
                        size={24}
                        color="#ffffff"
                        fill="#ffffff"
                        className="play-icon-offset"
                      />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="category-badge">{course.category}</div>
                </div>

                {/* Content Area */}
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>

                  <div className="course-meta-row">
                    <div className="course-meta-item">
                      <BookOpen size={16} color="rgba(255,255,255,0.7)" />
                      {totalVideos} Videos
                    </div>
                    <div className="course-meta-item">
                      <Clock size={16} color="rgba(255,255,255,0.7)" />
                      {course.totalDuration}
                    </div>
                  </div>

                  {/* Neon Progress Section */}
                  <div className="progress-section">
                    <div className="progress-labels">
                      <span className="progress-percent">
                        {Math.round(progressPercent)}%{" "}
                        <span className="progress-status">READY</span>
                      </span>
                      <span className="progress-count">
                        {completedVideos} / {totalVideos}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="course-list-scroll-top-btn"
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
