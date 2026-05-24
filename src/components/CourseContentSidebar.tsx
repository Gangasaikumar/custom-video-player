import type { Course, Video } from "../data/mockData";
import { CheckCircle2, Circle, PlayCircle, Clock } from "lucide-react";
import "../styles/CourseContentSidebar.css";

interface CourseContentSidebarProps {
  course: Course;
  currentVideo: Video;
  completedVideos: Set<string>;
  onVideoSelect: (video: Video) => void;
  onToggleCompletion: (videoId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CourseContentSidebar({
  course,
  currentVideo,
  completedVideos,
  onVideoSelect,
  onToggleCompletion,
  className = "",
  style,
}: CourseContentSidebarProps) {
  const doneCount = completedVideos.size;
  const totalCount = course.videos.length;
  const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className={`sidebar-container ${className}`} style={style}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <span className="sidebar-heading">Course Content</span>
          <span className="sidebar-done-badge">
            {doneCount}/{totalCount} Done
          </span>
        </div>

        {/* Progress bar */}
        <div className="sidebar-progress-track">
          <div
            className="sidebar-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Section label */}
        <div className="sidebar-section-label">Curriculum</div>
      </div>

      {/* ── Lesson list ────────────────────────────────── */}
      <div className="sidebar-videos-container no-scrollbar">
        {course.videos.map((video, index) => {
          const isActive = currentVideo.id === video.id;
          const isCompleted = completedVideos.has(video.id);

          return (
            <div
              key={video.id}
              onClick={() => onVideoSelect(video)}
              className={`sidebar-lesson-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
            >
              {/* Left: number badge */}
              <div className="sidebar-lesson-number">
                {isCompleted
                  ? <CheckCircle2 size={16} className="lesson-check-icon done" />
                  : isActive
                    ? <PlayCircle size={16} className="lesson-check-icon playing" />
                    : <span className="lesson-num-text">{index + 1}</span>
                }
              </div>

              {/* Center: title + meta */}
              <div className="sidebar-lesson-body">
                <p className="sidebar-lesson-title">{video.title}</p>
                <div className="sidebar-lesson-meta">
                  <Clock size={11} />
                  <span>{video.duration}</span>
                </div>
              </div>

              {/* Right: completion toggle */}
              <button
                className="sidebar-check-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompletion(video.id);
                }}
                aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
              >
                {isCompleted
                  ? <CheckCircle2 size={18} className="check-done" />
                  : <Circle size={18} className="check-empty" />
                }
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
