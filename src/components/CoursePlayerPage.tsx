// Imports and Component Definition
import { useState, useCallback, useRef } from "react";
import { SecureVideoPlayer } from "./SecureVideoPlayer";
import type { Course, Video } from "../data/mockData";
import { Search, Star, Users, Clock, ArrowUp, MessageSquare, FileText, Bell, ThumbsUp, Send } from "lucide-react";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { AuthService } from "../utils/authService";

import { CourseContentSidebar } from "./CourseContentSidebar";
import "../styles/CoursePlayerPage.css";

interface CoursePlayerPageProps {
  course: Course;
  onEnterFocusMode?: () => void; // Keeping prop optional to avoid breaking parent usage immediately
}

export function CoursePlayerPage({ course }: CoursePlayerPageProps) {
  const currentUser = AuthService.getUser();
  const userEmail = currentUser?.email ?? "guest@example.com";

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
              userEmail={userEmail}
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
            {activeTab === "overview" && (
              <>
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
                    <strong className="description-label">Module Description: </strong>
                    {currentVideo.description || course.description}
                  </p>
                </div>
              </>
            )}

            {activeTab === "q&a" && (
              <QATab courseId={course.id} userEmail={userEmail} />
            )}

            {activeTab === "notes" && (
              <NotesTab videoId={currentVideo.id} videoTitle={currentVideo.title} />
            )}

            {activeTab === "announcements" && (
              <AnnouncementsTab courseName={course.title} />
            )}

            {activeTab === "reviews" && (
              <ReviewsTab />
            )}
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

// ─── Q&A Tab ─────────────────────────────────────────────────────────────────

interface QAEntry {
  id: number;
  author: string;
  avatar: string;
  time: string;
  question: string;
  answers: number;
  upvotes: number;
}

const MOCK_QA: QAEntry[] = [
  { id: 1, author: "Ravi Kumar", avatar: "R", time: "2 days ago", question: "How does dependency injection work in .NET Core compared to older .NET?", answers: 3, upvotes: 12 },
  { id: 2, author: "Priya Sharma", avatar: "P", time: "5 days ago", question: "Is it necessary to use async/await everywhere or only for I/O bound operations?", answers: 5, upvotes: 8 },
  { id: 3, author: "Anil Reddy", avatar: "A", time: "1 week ago", question: "Can we deploy this project directly to Azure App Service?", answers: 2, upvotes: 4 },
];

function QATab({ courseId: _courseId, userEmail }: { courseId: string; userEmail: string }) {
  const [questions, setQuestions] = useState<QAEntry[]>(MOCK_QA);
  const [newQuestion, setNewQuestion] = useState("");
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set());

  const handleSubmit = () => {
    const trimmed = newQuestion.trim();
    if (!trimmed) return;
    const entry: QAEntry = {
      id: Date.now(),
      author: userEmail.split("@")[0],
      avatar: userEmail[0].toUpperCase(),
      time: "just now",
      question: trimmed,
      answers: 0,
      upvotes: 0,
    };
    setQuestions((prev) => [entry, ...prev]);
    setNewQuestion("");
  };

  const handleUpvote = (id: number) => {
    setUpvoted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setQuestions((q) => q.map((e) => e.id === id ? { ...e, upvotes: e.upvotes - 1 } : e));
      } else {
        next.add(id);
        setQuestions((q) => q.map((e) => e.id === id ? { ...e, upvotes: e.upvotes + 1 } : e));
      }
      return next;
    });
  };

  return (
    <div className="tab-content-panel">
      <h3 className="tab-panel-title"><MessageSquare size={18} /> Questions & Answers</h3>

      {/* Ask a Question */}
      <div className="qa-input-row">
        <div className="qa-avatar">{userEmail[0].toUpperCase()}</div>
        <div className="qa-input-wrapper">
          <textarea
            className="qa-textarea"
            placeholder="Ask a question about this lecture…"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={2}
          />
          <button
            className="qa-submit-btn"
            onClick={handleSubmit}
            disabled={!newQuestion.trim()}
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </div>

      {/* Question List */}
      <div className="qa-list">
        {questions.map((q) => (
          <div key={q.id} className="qa-item">
            <div className="qa-item-avatar">{q.avatar}</div>
            <div className="qa-item-body">
              <div className="qa-item-meta">
                <span className="qa-author">{q.author}</span>
                <span className="qa-time">{q.time}</span>
              </div>
              <p className="qa-question">{q.question}</p>
              <div className="qa-item-actions">
                <button
                  className={`qa-upvote-btn ${upvoted.has(q.id) ? "active" : ""}`}
                  onClick={() => handleUpvote(q.id)}
                >
                  <ThumbsUp size={13} /> {q.upvotes}
                </button>
                <span className="qa-answer-count">{q.answers} answer{q.answers !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────

function NotesTab({ videoId, videoTitle }: { videoId: string; videoTitle: string }) {
  const storageKey = `notes-${videoId}`;
  const [notes, setNotes] = useState(() => localStorage.getItem(storageKey) ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(storageKey, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setNotes("");
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="tab-content-panel">
      <h3 className="tab-panel-title"><FileText size={18} /> My Notes</h3>
      <p className="tab-panel-subtitle">Notes for: <em>{videoTitle}</em></p>
      <textarea
        className="notes-textarea"
        placeholder="Write your notes for this lesson here…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={10}
      />
      <div className="notes-actions">
        <button className="notes-save-btn" onClick={handleSave}>
          {saved ? "✓ Saved!" : "Save Notes"}
        </button>
        <button className="notes-clear-btn" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
}

// ─── Announcements Tab ────────────────────────────────────────────────────────

interface Announcement {
  id: number;
  title: string;
  body: string;
  date: string;
  instructor: string;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "New section added: Advanced Patterns",
    body: "I've added 6 new lectures covering advanced design patterns including CQRS and Event Sourcing. Check the curriculum sidebar!",
    date: "May 20, 2026",
    instructor: "Course Instructor",
  },
  {
    id: 2,
    title: "Updated source code on GitHub",
    body: "The GitHub repository has been updated with the latest project files. The link is in the resources section of Lecture 1.",
    date: "May 10, 2026",
    instructor: "Course Instructor",
  },
  {
    id: 3,
    title: "Welcome to the course!",
    body: "Thank you for enrolling! Please introduce yourself in the Q&A section. I personally read every question and try to respond within 24 hours.",
    date: "April 1, 2026",
    instructor: "Course Instructor",
  },
];

function AnnouncementsTab({ courseName }: { courseName: string }) {
  return (
    <div className="tab-content-panel">
      <h3 className="tab-panel-title"><Bell size={18} /> Announcements</h3>
      <p className="tab-panel-subtitle">Updates from the instructor for <em>{courseName}</em></p>
      <div className="announcements-list">
        {MOCK_ANNOUNCEMENTS.map((a) => (
          <div key={a.id} className="announcement-item">
            <div className="announcement-header">
              <span className="announcement-title">{a.title}</span>
              <span className="announcement-date">{a.date}</span>
            </div>
            <p className="announcement-body">{a.body}</p>
            <span className="announcement-instructor">— {a.instructor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  body: string;
}

const MOCK_REVIEWS: Review[] = [
  { id: 1, author: "Suresh P.", avatar: "S", rating: 5, date: "May 2026", body: "Absolutely brilliant course! The instructor explains complex concepts in a very simple way. Highly recommended for anyone starting with .NET Core." },
  { id: 2, author: "Meena R.", avatar: "M", rating: 5, date: "Apr 2026", body: "Best course on this topic I've found. Real-world examples, clean code, and great pacing. Worth every minute." },
  { id: 3, author: "Kiran T.", avatar: "K", rating: 4, date: "Mar 2026", body: "Very thorough coverage. Would love to see more exercises, but the video explanations are top-notch." },
  { id: 4, author: "Deepa N.", avatar: "D", rating: 5, date: "Feb 2026", body: "I was a complete beginner and now I feel confident building full-stack .NET applications. Thank you!" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          fill={s <= rating ? "#f39c12" : "none"}
          color={s <= rating ? "#f39c12" : "rgba(255,255,255,0.3)"}
        />
      ))}
    </div>
  );
}

function ReviewsTab() {
  const avg = (MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);
  return (
    <div className="tab-content-panel">
      <h3 className="tab-panel-title"><ThumbsUp size={18} /> Student Reviews</h3>
      <div className="reviews-summary">
        <span className="reviews-avg">{avg}</span>
        <StarRating rating={Math.round(Number(avg))} />
        <span className="reviews-count">({MOCK_REVIEWS.length} reviews)</span>
      </div>
      <div className="reviews-list">
        {MOCK_REVIEWS.map((r) => (
          <div key={r.id} className="review-item">
            <div className="review-avatar">{r.avatar}</div>
            <div className="review-body">
              <div className="review-header">
                <span className="review-author">{r.author}</span>
                <StarRating rating={r.rating} />
                <span className="review-date">{r.date}</span>
              </div>
              <p className="review-text">{r.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
