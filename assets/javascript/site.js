const introVideo = document.querySelector("#intro-video");
const body = document.body;

if (introVideo) {
  let introTimeoutId;

  const showIntroText = () => {
    body.classList.add("intro-ended");
  };

  const scheduleIntroEnd = () => {
    if (introTimeoutId) {
      clearTimeout(introTimeoutId);
    }
    const duration = Number.isFinite(introVideo.duration) ? introVideo.duration : 0;
    const fallback = 3;
    const wait = duration > 0 ? duration / introVideo.playbackRate : fallback;
    introTimeoutId = setTimeout(showIntroText, wait * 1000);
  };

  const startPlayback = () => {
    introVideo.playbackRate = 3;
    introVideo
      .play()
      .then(() => {
        scheduleIntroEnd();
      })
      .catch(() => {
        scheduleIntroEnd();
      });
  };

  if (introVideo.readyState >= 2) {
    startPlayback();
  } else {
    introVideo.addEventListener("canplay", startPlayback, { once: true });
  }

  introVideo.addEventListener("ended", showIntroText);
  introVideo.addEventListener("error", showIntroText);
}

const revealItems = document.querySelectorAll(".reveal");

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const mediaSections = document.querySelectorAll(".section-media");

if (mediaSections.length) {
  const mediaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  mediaSections.forEach((section) => mediaObserver.observe(section));
}

const transitionSections = document.querySelectorAll("[data-transition]");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateTransitions = () => {
  if (!transitionSections.length) {
    return;
  }

  const viewport = window.innerHeight;

  transitionSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const type = section.dataset.transition;
    const speed = Number(section.dataset.transitionSpeed) || 1.6;
    const trigger = section.dataset.transitionTrigger;
    const style = section.dataset.transitionStyle;
    let progress = 0;

    if (trigger === "exit") {
      progress = clamp(((viewport - rect.bottom) / (viewport * 0.6)) * speed, 0, 1);
    } else {
      progress = clamp(((viewport - rect.top) / (viewport + rect.height)) * speed, 0, 1);
    }

    if (style === "frame") {
      const insetMax = 40;
      const radiusMax = 28;
      const inset =
        type === "expand" ? insetMax * (1 - progress) : insetMax * progress;
      const radius =
        type === "expand" ? radiusMax * (1 - progress) : radiusMax * progress;
      section.style.setProperty("--frame-inset", `${inset.toFixed(1)}px`);
      section.style.setProperty("--frame-radius", `${radius.toFixed(1)}px`);
      section.style.setProperty("--section-scale", "1");
      section.style.setProperty("--section-radius", "0px");
      return;
    }

    if (style === "radius") {
      const radius = 32 * progress;
      section.style.setProperty("--section-scale", "1");
      section.style.setProperty("--section-radius", `${radius.toFixed(1)}px`);
      return;
    }

    if (type === "shrink") {
      const scale = 1 - progress * 0.06;
      const radius = 32 * progress;
      section.style.setProperty("--section-scale", scale.toFixed(3));
      section.style.setProperty("--section-radius", `${radius.toFixed(1)}px`);
    }

    if (type === "expand") {
      const scale = 0.94 + progress * 0.06;
      const radius = 32 - 32 * progress;
      section.style.setProperty("--section-scale", scale.toFixed(3));
      section.style.setProperty("--section-radius", `${radius.toFixed(1)}px`);
    }
  });
};

let ticking = false;

const onScroll = () => {
  if (ticking) {
    return;
  }

  ticking = true;
  requestAnimationFrame(() => {
    updateTransitions();
    ticking = false;
  });
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateTransitions);
updateTransitions();
