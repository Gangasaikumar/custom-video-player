import { useState, useRef } from "react";
import { SecureVideoPlayer } from "./SecureVideoPlayer";
import { MOCK_PLAYLIST } from "../data/mockData";
import type { Video } from "../data/mockData";
import { Eye, Calendar, UserPlus, ArrowUp } from "lucide-react";
import { useScrollToTop } from "../hooks/useScrollToTop";
import "../styles/PlaylistPage.css";

import { PlaylistSidebar } from "./PlaylistSidebar";

interface PlaylistPageProps {
  videos?: Video[];
}

export function PlaylistPage({ videos = MOCK_PLAYLIST }: PlaylistPageProps) {
  const [currentVideo, setCurrentVideo] = useState<Video | undefined>(
    videos[0]
  );
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { showScrollTop, scrollToTop } =
    useScrollToTop<HTMLDivElement>(scrollContainerRef);

  if (!currentVideo) {
    return (
      <div className="playlist-empty-state">
        <h2>No videos found in this playlist.</h2>
      </div>
    );
  }

  const handleVideoEnded = () => {
    if (autoPlayNext && currentVideo) {
      const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
      if (currentIndex >= 0 && currentIndex < videos.length - 1) {
        setCurrentVideo(videos[currentIndex + 1]);
      }
    }
  };

  return (
    <div
      className={`playlist-page-grid ${
        isTheaterMode ? "theater-mode" : "normal-mode"
      }`}
    >
      {/* Cinematic Background Glows */}
      <div className="background-glow playlist-glow-primary" />

      {/* Left Column: Fixed Player + Info (Scrolls in Theater Mode) */}
      <div
        ref={scrollContainerRef}
        className={`playlist-main-column ${
          isTheaterMode ? "theater-mode" : ""
        } no-scrollbar`}
      >
        <div
          className={`playlist-content-width ${
            isTheaterMode ? "theater-mode" : ""
          }`}
        >
          {/* Player Wrapper */}
          <div
            className={`playlist-player-wrapper ${
              isTheaterMode ? "theater-mode" : ""
            }`}
          >
            <SecureVideoPlayer
              src={currentVideo.src}
              userEmail="user@example.com"
              isTheaterMode={isTheaterMode}
              onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
              fullWidth={true}
              autoPlay={true}
              onEnded={handleVideoEnded}
              autoPlayNext={autoPlayNext}
              onToggleAutoPlayNext={() => setAutoPlayNext(!autoPlayNext)}
            />
          </div>

          {/* Video Info Area & Playlist (Theater Mode) */}
          <div
            className={`playlist-info-area ${
              isTheaterMode ? "theater-mode" : ""
            }`}
          >
            {/* Description Section */}
            <div className="playlist-info-description-column">
              {" "}
              {/* Prevent overflow */}
              <h1 className="playlist-video-title">{currentVideo.title}</h1>
              <div className="channel-row">
                <div className="channel-info-group">
                  <div className="channel-avatar-gradient">
                    {currentVideo.channelName.charAt(0)}
                  </div>
                  <div>
                    <div className="channel-name">
                      {currentVideo.channelName}
                    </div>
                    <div className="channel-badge">
                      Verified Content Partner
                    </div>
                  </div>
                  <button className="subscribe-btn">
                    <UserPlus size={16} />
                    Subscribe
                  </button>
                </div>
              </div>
              {/* Premium Description Card */}
              <div className="premium-info-card">
                <div className="premium-stats-row">
                  <span className="premium-stat-item">
                    <Eye size={16} /> {currentVideo.views}
                  </span>
                  <span className="premium-stat-item">
                    <Calendar size={16} /> {currentVideo.postedAt}
                  </span>
                </div>

                <p className="premium-description">
                  {currentVideo.description}
                </p>
              </div>
            </div>

            {/* Playlist in Theater Mode */}
            {isTheaterMode && (
              <div className="theater-sidebar-wrapper">
                <PlaylistSidebar
                  videos={videos}
                  currentVideo={currentVideo}
                  onVideoSelect={setCurrentVideo}
                />
              </div>
            )}
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="scroll-to-top-btn"
            style={{
              right: isTheaterMode ? "40px" : "420px", // Dynamic adjustment
            }}
          >
            <ArrowUp size={24} />
          </button>
        )}
      </div>

      {/* Right Column: Scrollable Playlist (Normal Mode) */}
      {!isTheaterMode && (
        <div className="playlist-sidebar-column no-scrollbar">
          <PlaylistSidebar
            videos={videos}
            currentVideo={currentVideo}
            onVideoSelect={setCurrentVideo}
          />
        </div>
      )}
    </div>
  );
}
