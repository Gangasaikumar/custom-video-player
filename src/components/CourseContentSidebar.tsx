import type { Course, Video } from "../data/mockData";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
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
  return (
    <div className={`sidebar-container ${className}`} style={style}>
      <div className="sidebar-header">
        <span className="text-overline">Course Content</span>
        <span className="text-caption">
          {completedVideos.size}/{course.videos.length} DONE
        </span>
      </div>

      <div className="sidebar-videos-container no-scrollbar">
        <div className="sidebar-accordion-trigger">
          <span>CURRICULUM</span>
          <ChevronDown size={14} />
        </div>

        {course.videos.map((video, index) => {
          const isActive = currentVideo.id === video.id;
          const isCompleted = completedVideos.has(video.id);

          return (
            <div
              key={video.id}
              onClick={() => onVideoSelect(video)}
              className={`sidebar-video-item ${isActive ? "active" : ""}`}
            >
              <div
                className="sidebar-check-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompletion(video.id);
                }}
              >
                {isCompleted ? (
                  <CheckCircle2
                    size={18}
                    color="#a435f0"
                    fill="rgba(164, 53, 240, 0.2)"
                  />
                ) : (
                  <Circle size={18} color="rgba(255,255,255,0.2)" />
                )}
              </div>

              <div className="sidebar-video-info">
                <div className="text-subtitle">
                  {index + 1}. {video.title}
                </div>
                <div className="text-caption sidebar-duration-row">
                  <PlayCircle size={12} />
                  {video.duration}
                </div>
              </div>

              {isActive && <ChevronRight size={16} color="#a435f0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
