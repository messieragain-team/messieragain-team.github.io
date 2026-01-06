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
} else {
  body.classList.add("intro-ended");
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
    const offsetRaw = Number(section.dataset.transitionOffset) || 0;
    const offsetPx = Math.abs(offsetRaw) <= 1 ? offsetRaw * viewport : offsetRaw;
    let progress = 0;

    if (trigger === "exit") {
      progress = clamp(((viewport - rect.bottom - offsetPx) / (viewport * 0.6)) * speed, 0, 1);
    } else {
      progress = clamp(((viewport - rect.top - offsetPx) / (viewport + rect.height)) * speed, 0, 1);
    }

    if (style === "frame") {
      const insetMax = 40;
      const radiusMax = 28;
      const threshold = 0.12;
      const adjusted =
        progress <= threshold ? 0 : (progress - threshold) / (1 - threshold);
      const inset =
        type === "expand" ? insetMax * (1 - adjusted) : insetMax * adjusted;
      const radius =
        type === "expand" ? radiusMax * (1 - adjusted) : radiusMax * adjusted;
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

const staggerGroups = document.querySelectorAll("[data-stagger]");

if (staggerGroups.length) {
  body.classList.add("stagger-ready");
  const staggerObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const items = Array.from(entry.target.querySelectorAll(".notice-card"));
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("is-live");
          }, index * 160);
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  staggerGroups.forEach((group) => staggerObserver.observe(group));
}

const capsuleLinks = document.querySelectorAll(".capsule-link");

if (capsuleLinks.length) {
  const capsuleObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-animate");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  capsuleLinks.forEach((link) => capsuleObserver.observe(link));
}

const loopVideos = document.querySelectorAll("video[data-loop-start][data-loop-end]");

if (loopVideos.length) {
  loopVideos.forEach((video) => {
    const start = parseFloat(video.dataset.loopStart);
    const end = parseFloat(video.dataset.loopEnd);
    const rate = parseFloat(video.dataset.playbackRate) || 1;

    let loopStart = start;
    let loopEnd = end;

    const isValidRange = () =>
      Number.isFinite(loopStart) && Number.isFinite(loopEnd) && loopEnd > loopStart;

    const clampToStart = () => {
      if (!isValidRange()) {
        return;
      }
      if (video.currentTime < loopStart || video.currentTime > loopEnd) {
        video.currentTime = loopStart;
      }
    };

    const handleLoop = () => {
      if (!isValidRange()) {
        return;
      }
      if (video.currentTime >= loopEnd - 0.03) {
        video.currentTime = loopStart;
      }
    };

    const setupLoop = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration > 0) {
        loopEnd = Math.min(end, duration - 0.05);
        loopStart = Math.min(start, loopEnd - 0.1);
      }

      if (!isValidRange()) {
        return;
      }

      video.loop = false;
      video.playbackRate = rate;
      video.currentTime = loopStart;

      const playAfterSeek = () => {
        if (video.dataset.inView === "true") {
          video.play().catch(() => {});
        }
      };

      video.addEventListener("seeked", playAfterSeek, { once: true });
      video.addEventListener("timeupdate", handleLoop);
      video.addEventListener("seeking", clampToStart);

      const intervalId = setInterval(handleLoop, 120);
      video.addEventListener(
        "ended",
        () => {
          clearInterval(intervalId);
        },
        { once: true }
      );
    };

    if (video.readyState >= 1) {
      setupLoop();
    } else {
      video.addEventListener("loadedmetadata", setupLoop, { once: true });
    }

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.dataset.inView = "true";
            clampToStart();
            video.play().catch(() => {});
          } else {
            video.dataset.inView = "false";
            video.pause();
          }
        });
      },
      { threshold: 0.4 }
    );

    visibilityObserver.observe(video);
  });
}
