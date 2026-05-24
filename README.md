# 🎬 Secure Universal Video Player Platform

A professional, secure, and feature-rich video playback platform built with React, TypeScript, and Vite. This project delivers a high-fidelity viewing experience with advanced security measures like dynamic watermarking and DevTools lockdowns.

---

## 📸 Screenshots

### 🏠 Home Screen
> Choose between Streaming Mode and Academy Mode

![Home Screen](docs/screenshots/home.png)

---

### 📺 Streaming Mode — Player
> YouTube-style interface with playlist sidebar, video metadata, and auto-play

![Streaming Player](docs/screenshots/player-streaming.png)

---

### 🎓 Academy Mode — Course Gallery
> Browse your course library with thumbnails, progress tracking, and category tags

![Academy Courses](docs/screenshots/academy-courses.png)

---

### 📖 Course Player
> Structured lesson navigation with collapsible course content sidebar

![Course Player](docs/screenshots/player-course.png)

---

## 🚀 Key Features

### 1. **Robust Universal Player**

- **Hybrid Support**: Seamlessly handles both YouTube video IDs/URLs and direct HTML5 (MP4) links.
- **Hook Architecture**: Modular `useYouTubePlayer` and `useHtml5Player` hooks with a standardized `VideoPlayerAPI` interface.
- **Theater Mode**: Cinematic expansion mode that centers and scales the player for high-impact viewing.

### 2. **Advanced Security & Privacy**

- **Dynamic Watermarking**:
  - **Moving Watermark**: Floating user email that shifts positions to deter screen recording.
  - **Tiled Watermark**: Subtle, semi-transparent background overlays for constant user identification.
- **IFrame Shield**: Invisible interaction layer that prevents direct manipulation of the underlying video iframe.
- **Anti-DevTools Shield**: Disables right-click, inspection keyboard shortcuts (F12, Ctrl+Shift+I/J/C), and source viewing (Ctrl+U).
- **Console Lockout**: Detects when DevTools is open and prompts the user to close it.

### 3. **Premium UI/UX (Pill Design)**

- **Glassmorphism Controls**: Modern, blurred pill-shaped containers for player controls.
- **Dynamic Volume Slider**: A sleek volume control that smoothly expands on hover.
- **Custom Tooltips**: High-fidelity, animated tooltips for all playback icons.
- **HD Badge**: Visual indicator on settings to signify high-quality playback capabilities.
- **Timeline Polish**: Red progress bar and playhead for a professional, "live" feel.

### 4. **Dual Professional Layouts**

- **YouTube-Style Playlist**: A classic layout with a scrollable list of videos in a right-hand sidebar.
- **Udemy-Style Course Player**: A structured academic layout with a curriculum sidebar, section tabs, and progress tracking indicators.

## 🏗️ Technical Architecture

- **Clean Code & SOLID**: Adheres to Single Responsibility, Dependency Inversion, and Liskov Substitution principles.
- **Type Safety**: Fully typed with TypeScript interfaces for every component and hook.
- **Reusable Components**: Decentralized UI system using custom `Button`, `Card`, and `Tooltip` components.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Project Structure

- `src/components/SecureVideoPlayer.tsx`: The core container managing layout and security.
- `src/components/PlayerControls.tsx`: Custom UI controls and playback interactions.
- `src/hooks/`: Modular player logic hooks.
- `src/components/PlaylistPage.tsx`: YouTube-style layout.
- `src/components/CoursePlayerPage.tsx`: Course-style layout.

---

Built with ❤️ for secure, high-quality video content delivery.
