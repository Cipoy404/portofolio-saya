const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.scroll-progress span');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

function updateScrollUI() {
  const top = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle('scrolled', top > 24);
  if (progress) progress.style.width = `${height > 0 ? (top / height) * 100 : 0}%`;
}

updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation?.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
});

const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.site-nav a')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -58%', threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));
}

const rotatingText = document.querySelector('[data-words]');
if (rotatingText && !reducedMotion) {
  const words = (rotatingText.dataset.words || '').split('|').filter(Boolean);
  let wordIndex = 0;
  if (words.length > 1) {
    window.setInterval(() => {
      rotatingText.classList.add('is-changing');
      window.setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotatingText.textContent = words[wordIndex];
        rotatingText.classList.remove('is-changing');
      }, 220);
    }, 2400);
  }
}

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!reducedMotion && finePointer) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const strength = card.classList.contains('skill-row') ? 2 : 4;
      card.style.transform = `perspective(1200px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

const contributionGrid = document.querySelector('.contribution-grid');
if (contributionGrid) {
  const pattern = [0,1,0,2,1,0,0,1,2,3,1,0,2,1,0,3,2,1,0,1,2,0,3,1,2,1,0,2,3,1,0,1,2,3,2,0,1,0,2,1,3,2,0,1,2,0,1,3,2,1,0,2,1,3];
  pattern.forEach((level) => {
    const cell = document.createElement('i');
    if (level) cell.classList.add(`level-${level}`);
    contributionGrid.appendChild(cell);
  });
}

const player = document.querySelector('.anthem-player');
const audio = document.querySelector('#anthem-audio');
const audioButton = document.querySelector('.anthem-toggle');
const audioLabel = audioButton?.querySelector('b');
let autoScrollFrame = 0;

function stopAnthemScroll() {
  if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame);
  autoScrollFrame = 0;
  document.documentElement.classList.remove('anthem-scrolling');
  player?.classList.remove('auto-scrolling');
}

function startAnthemScroll() {
  stopAnthemScroll();
  if (!audio || audio.paused || !Number.isFinite(audio.duration) || audio.duration <= audio.currentTime) return;

  if (audio.currentTime < 0.5) window.scrollTo(0, 0);
  const startY = window.scrollY;
  const targetY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const startAudioTime = audio.currentTime;
  const remainingAudio = audio.duration - startAudioTime;
  if (targetY <= startY || remainingAudio <= 0) return;

  document.documentElement.classList.add('anthem-scrolling');
  player?.classList.add('auto-scrolling');

  const advance = () => {
    if (audio.paused || audio.ended) {
      stopAnthemScroll();
      return;
    }
    const progress = Math.min(1, Math.max(0, (audio.currentTime - startAudioTime) / remainingAudio));
    const easedProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    window.scrollTo(0, startY + (targetY - startY) * easedProgress);
    autoScrollFrame = requestAnimationFrame(advance);
  };

  autoScrollFrame = requestAnimationFrame(advance);
}

audioButton?.addEventListener('click', async () => {
  if (!audio) return;
  try {
    if (audio.paused) await audio.play();
    else audio.pause();
  } catch {
    if (audioLabel) audioLabel.textContent = 'COBA LAGI';
  }
});

audio?.addEventListener('play', () => {
  player?.classList.add('playing');
  audioButton?.setAttribute('aria-pressed', 'true');
  audioButton?.setAttribute('aria-label', 'Jeda Cant del Barça');
  if (audioLabel) audioLabel.textContent = 'PAUSE';
  startAnthemScroll();
});

audio?.addEventListener('pause', () => {
  stopAnthemScroll();
  player?.classList.remove('playing');
  audioButton?.setAttribute('aria-pressed', 'false');
  audioButton?.setAttribute('aria-label', 'Putar Cant del Barça');
  if (audioLabel) audioLabel.textContent = 'PLAY';
});

audio?.addEventListener('seeking', () => {
  if (!audio.paused) startAnthemScroll();
});

audio?.addEventListener('loadedmetadata', () => {
  if (!audio.paused && !autoScrollFrame) startAnthemScroll();
});

audio?.addEventListener('ended', () => {
  stopAnthemScroll();
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
});

const copyButton = document.querySelector('[data-copy]');
const toast = document.querySelector('.toast');
let toastTimer;
copyButton?.addEventListener('click', async () => {
  const value = copyButton.dataset.copy || '';
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const field = document.createElement('textarea');
    field.value = value;
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    document.execCommand('copy');
    field.remove();
  }
  toast?.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast?.classList.remove('show'), 2200);
});
