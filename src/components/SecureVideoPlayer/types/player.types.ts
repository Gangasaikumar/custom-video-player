export interface VideoPlayerState {
  ready: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  isFullscreen: boolean;
  quality: string;
  qualities: string[];
  playbackRate: number;
  loading: boolean;
  isPiP: boolean;
}

export interface VideoPlayerControls {
  play?: () => void;
  pause?: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setQuality: (quality: string) => void;
  setPlaybackRate: (rate: number) => void;
  togglePiP: () => void;
}

export interface VideoPlayerAPI extends VideoPlayerState, VideoPlayerControls {
  ref: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLDivElement | HTMLVideoElement | null>;
}

export interface SecureVideoPlayerProps {
  src: string;
  userEmail: string;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
  fullWidth?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
  autoPlayNext?: boolean;
  onToggleAutoPlayNext?: () => void;
}
