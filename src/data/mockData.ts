import dotnetCoreVideos from "./dotnet_core_course.json";
import sqlRealTimeVideos from "./sql_realtime_course.json";
import angularVideos from "./angular_course.json";

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  src: string; // YouTube ID or MP4 URL
  channelName: string;
  views: string;
  postedAt: string;
  duration: string; // e.g. "7min"
  completed?: boolean; // Optional, progress tracked in localStorage
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalDuration: string;
  videos: Video[];
  category: string;
}

export const MOCK_PLAYLIST: Video[] = [
  {
    id: "1",
    title: "Big Buck Bunny (MP4)",
    description:
      "Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass him, something snaps... and the bunny's gentle nature breaks out into the most violent revenge he can imagine.",
    thumbnail:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    channelName: "Blender Foundation",
    views: "10M views",
    postedAt: "10 years ago",
    duration: "10min",
    completed: true,
  },
  {
    id: "2",
    title: "Elephant Dream (YouTube)",
    description: "The first open movie from the Blender Foundation.",
    thumbnail: "https://i.ytimg.com/vi/TLkA0SPLKkjd/maxresdefault.jpg",
    src: "TLkA0SPLKkA", // Invalid ID in reality maybe, let's use a real one if possible, or just standard ID format.
    // Let's use the ID from previous user history if available, or a generic known one.
    // "bHG-zkLSj-c" was used before.
    channelName: "Blender Foundation",
    views: "2M views",
    postedAt: "15 years ago",
    duration: "11min",
    completed: false,
  },
  {
    id: "3",
    title: "For Bigger Blazes (MP4)",
    description:
      "HBO GO now works with Chromecast -- the easiest way to enjoy online video on your TV.",
    thumbnail:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    channelName: "Google",
    views: "500K views",
    postedAt: "3 years ago",
    duration: "15s",
    completed: false,
  },
  {
    id: "4",
    title: "Next.js 15 Crash Course",
    description: "Learn Next.js 15 in this comprehensive crash course.",
    thumbnail: "https://i.ytimg.com/vi/kGv85u0IoeM/maxresdefault.jpg",
    src: "kGv85u0IoeM", // YouTube ID
    channelName: "Web Dev Simplified",
    views: "150K views",
    postedAt: "2 months ago",
    duration: "1hr 5min",
    completed: false,
  },
  {
    id: "5",
    title: "Tears of Steel",
    description:
      "Tears of Steel was realized with crowd-funding by users of the open source 3D creation tool Blender.",
    thumbnail:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    channelName: "Blender Foundation",
    views: "4M views",
    postedAt: "7 years ago",
    duration: "12min",
    completed: true,
  },
  {
    id: "6",
    title: "Subaru Outback",
    description: "A commercial for the Subaru Outback.",
    thumbnail:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    channelName: "Subaru",
    views: "50K views",
    postedAt: "1 year ago",
    duration: "30sec",
    completed: false,
  },
  {
    id: "7",
    title: "Sintel (Short Movie)",
    description:
      "A lonely young woman, Sintel, searches for a pet dragon she fell in love with.",
    thumbnail:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    channelName: "Blender Foundation",
    views: "15M views",
    postedAt: "8 years ago",
    duration: "14min",
    completed: false,
  },
  {
    id: "8",
    title: "React Hooks Course",
    description:
      "Learn React Hooks in Depth - useState, useEffect, useRef, and more.",
    thumbnail: "https://i.ytimg.com/vi/TNhaISOUy6Q/maxresdefault.jpg",
    src: "TNhaISOUy6Q", // YouTube ID
    channelName: "Web Dev Simplified",
    views: "800K views",
    postedAt: "1 year ago",
    duration: "45min",
    completed: false,
  },
  {
    id: "9",
    title: "For Bigger Escape",
    description:
      "Introducing Chromecast. The easiest way to enjoy online video and music on your TV.",
    thumbnail:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    channelName: "Google",
    views: "200K views",
    postedAt: "3 years ago",
    duration: "15sec",
    completed: false,
  },
  {
    id: "10",
    title: "Tears of Steel (Part 2)",
    description: "Continuation of the sci-fi short film.",
    thumbnail:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    channelName: "Blender Foundation",
    views: "1M views",
    postedAt: "6 years ago",
    duration: "10min",
    completed: false,
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: "course-dotnet",
    title: ".Net Core Full Stack Development",
    description:
      "Build powerful full-stack applications with .Net Core. This comprehensive course in Telugu covers MVC, Entity Framework Core, Identity, N-Tier Architecture, and Web API from scratch.",
    thumbnail:
      "/course_videos/DotNet_Core_Full_Stack_Development/course_thumb.jpg",
    totalDuration: "35 hours",
    category: "Development",
    videos: dotnetCoreVideos as Video[],
  },
  {
    id: "course-sql-realtime",
    title: "SQL RealTime Scenarios",
    description: "Real-time SQL scenarios and interview questions.",
    thumbnail: "/course_videos/SQL_RealTime/course_thumb.jpg",
    totalDuration: "25 hours",
    category: "SQL",
    videos: sqlRealTimeVideos as Video[],
  },
  {
    id: "course-angular",
    title: "Mastering Angular 16",
    description:
      "Unleash the power of Angular \u26A1 and build dynamic web applications with this step-by-step learning experience.",
    thumbnail: "https://i.ytimg.com/vi/3BIuwVnddG0/maxresdefault.jpg",
    totalDuration: "20+ hours",
    category: "Development",
    videos: angularVideos as Video[],
  },
];
