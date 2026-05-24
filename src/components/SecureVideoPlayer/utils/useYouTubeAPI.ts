import "../types/youtube-api.d.ts";
let apiReady: Promise<void> | null = null;

export function loadYouTubeAPI(): Promise<void> {
  if (apiReady) return apiReady;

  apiReady = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => resolve();
  });

  return apiReady;
}
