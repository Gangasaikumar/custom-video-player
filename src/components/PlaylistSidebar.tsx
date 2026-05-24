import type { Video } from "../data/mockData";
import { PlayCircle, Eye } from "lucide-react";
import "../styles/PlaylistSidebar.css";

interface PlaylistSidebarProps {
  videos: Video[];
  currentVideo: Video;
  onVideoSelect: (video: Video) => void;
  className?: string; // Allow custom styling/classes if needed
}

export function PlaylistSidebar({
  videos,
  currentVideo,
  onVideoSelect,
  className = "",
}: PlaylistSidebarProps) {
  return (
    <div className={`playlist-container ${className}`}>
      <div className="playlist-header">
        <h3 className="playlist-header-title">Up Next</h3>
        <div className="playlist-header-accent" />
      </div>

      <div className="playlist-list">
        {videos.map((video) => {
          const isActive = video.id === currentVideo.id;
          return (
            <div
              key={video.id}
              onClick={() => onVideoSelect(video)}
              className={`playlist-item ${isActive ? "active" : ""}`}
            >
              {/* Thumbnail with duration */}
              <div className="playlist-thumbnail-container">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="playlist-thumbnail-img"
                />
                {/* Active Indicator Overlay */}
                {isActive && (
                  <div className="playlist-overlay">
                    <PlayCircle size={28} color="#fff" fill="#a435f0" />
                  </div>
                )}
                {/* Small Duration Badge */}
                <div className="playlist-duration-badge">{video.duration}</div>
              </div>

              {/* Meta */}
              <div className="playlist-meta">
                <h4 className="playlist-title">{video.title}</h4>
                <div className="playlist-channel">{video.channelName}</div>
                <div className="playlist-stats">
                  <Eye size={10} /> {video.views}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
