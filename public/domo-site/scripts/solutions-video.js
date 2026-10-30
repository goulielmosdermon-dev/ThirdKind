const videoControl = document.querySelector('.solutions-video-control');
const videoContainer = document.querySelector('.solutions-video');
let heroVideo;
let videoPlaying = false;
function setVideoState(playing) {
  videoPlaying = playing;
  videoControl.classList.toggle('is-playing', playing);
  const label = playing ? 'Pause video' : 'Play video';
  videoControl.setAttribute('aria-label', window.DomoI18n?.t(label) || label);
}
videoControl.addEventListener('click', () => {
  if (!heroVideo) {
    heroVideo = document.createElement('iframe');
    const params = new URLSearchParams({autoplay:'1',controls:'0',playsinline:'1',rel:'0',enablejsapi:'1',disablekb:'1',loop:'1',playlist:'Tioj4DbNI6o',origin:window.location.origin});
    heroVideo.src = `https://www.youtube-nocookie.com/embed/Tioj4DbNI6o?${params}`;
    heroVideo.title = 'Your project, our story — Domogroup';
    heroVideo.allow = 'autoplay; encrypted-media; picture-in-picture';
    heroVideo.referrerPolicy = 'strict-origin-when-cross-origin';
    heroVideo.tabIndex = -1;
    videoContainer.append(heroVideo);
    heroVideo.addEventListener('load', () => {
      heroVideo.contentWindow.postMessage(JSON.stringify({event:'listening'}), 'https://www.youtube-nocookie.com');
    });
    setVideoState(true);
    return;
  }
  const command = videoPlaying ? 'pauseVideo' : 'playVideo';
  heroVideo.contentWindow.postMessage(JSON.stringify({event:'command',func:command,args:[]}), 'https://www.youtube-nocookie.com');
  setVideoState(!videoPlaying);
});
window.addEventListener('message', event => {
  if (!heroVideo || event.source !== heroVideo.contentWindow || event.origin !== 'https://www.youtube-nocookie.com') return;
  let data;
  try {data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;} catch {return;}
  if (data.event === 'onStateChange') {
    if (data.info === 1) setVideoState(true);
    if (data.info === 2 || data.info === 0) setVideoState(false);
  }
});

window.addEventListener('languagechange', () => setVideoState(videoPlaying));
