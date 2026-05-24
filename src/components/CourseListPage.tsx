import { useState, useEffect, useRef, useMemo } from "react";
import { MOCK_COURSES } from "../data/mockData";
import type { Course } from "../data/mockData";
import { Play, Clock, BookOpen, ArrowUp, Search, X } from "lucide-react";
import { useScrollToTop } from "../hooks/useScrollToTop";
import "../styles/CourseListPage.css";

interface CourseListPageProps {
  onSelectCourse: (course: Course) => void;
  onBack?: () => void;
}

// ── Derive unique categories from data (future-proof) ────────────────────────
const ALL_CATEGORIES = ["All", ...Array.from(new Set(MOCK_COURSES.map((c) => c.category))).sort()];

export function CourseListPage({ onSelectCourse }: CourseListPageProps) {
  const [progress, setProgress]       = useState<Record<string, number>>({});
  const [query, setQuery]             = useState("");
  const [activeCategory, setCategory] = useState("All");
  const scrollContainerRef            = useRef<HTMLDivElement>(null);
  const searchRef                     = useRef<HTMLInputElement>(null);

  const { showScrollTop, scrollToTop } = useScrollToTop<HTMLDivElement>(scrollContainerRef);

  // ── Load completion progress ───────────────────────────────────────────────
  useEffect(() => {
    const savedProgress: Record<string, number> = {};
    MOCK_COURSES.forEach((course) => {
      let completedCount = 0;
      course.videos.forEach((video) => {
        if (localStorage.getItem(`video-completed-${video.id}`) === "true")
          completedCount++;
      });
      savedProgress[course.id] = completedCount;
    });
    setProgress(savedProgress);
  }, []);

  // ── Filtered + searched courses ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_COURSES.filter((course) => {
      const matchesCategory =
        activeCategory === "All" || course.category === activeCategory;
      const matchesQuery =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const clearSearch = () => {
    setQuery("");
    searchRef.current?.focus();
  };

  return (
    <div className="course-list-page">
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

        {/* ── Search + Filter bar ──────────────────────────────────────────── */}
        <div className="course-search-bar">
          {/* Search input */}
          <div className="course-search-input-wrapper">
            <Search size={16} className="course-search-icon" />
            <input
              ref={searchRef}
              type="text"
              className="course-search-input"
              placeholder="Search courses…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search courses"
            />
            {query && (
              <button
                className="course-search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="course-category-pills" role="group" aria-label="Filter by category">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`course-category-pill ${activeCategory === cat ? "active" : ""}`}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ────────────────────────────────────────────────── */}
        {(query || activeCategory !== "All") && (
          <p className="course-results-count">
            {filtered.length === 0
              ? "No courses match your search"
              : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        )}

        {/* ── Course grid ──────────────────────────────────────────────────── */}
        <div className="course-grid">
          {filtered.map((course) => {
            const completedVideos  = progress[course.id] || 0;
            const totalVideos      = course.videos.length;
            const progressPercent  = (completedVideos / totalVideos) * 100;

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="course-card"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelectCourse(course)}
                aria-label={`Open ${course.title}`}
              >
                {/* Thumbnail */}
                <div className="course-thumbnail-wrapper">
                  <img
                    className="course-img"
                    src={course.thumbnail}
                    alt={course.title}
                  />
                  <div className="course-overlay">
                    <div className="play-icon-circle">
                      <Play size={24} color="#ffffff" fill="#ffffff" className="play-icon-offset" />
                    </div>
                  </div>
                  <div className="category-badge">{course.category}</div>
                </div>

                {/* Content */}
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

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="course-empty-state">
              <span className="course-empty-icon">🔍</span>
              <p className="course-empty-title">No courses found</p>
              <p className="course-empty-sub">Try a different search term or category</p>
              <button
                className="course-empty-reset"
                onClick={() => { setQuery(""); setCategory("All"); }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

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
