const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const menuLinks = document.querySelectorAll('.site-nav a');
const heroBg = document.querySelector('.hero-bg');
const cursor = document.querySelector('.cursor');
const projects = document.querySelectorAll('.project');
const revealItems = document.querySelectorAll('.reveal');
const copyButton = document.querySelector('[data-copy]');
const toast = document.querySelector('.toast');
const anthemPlayer = document.querySelector('.anthem-player');
const anthemToggle = document.querySelector('.anthem-toggle');
const anthemAudio = document.querySelector('#anthem-audio');
const anthemState = document.querySelector('.anthem-state');
const morphCard = document.querySelector('.morph-card');
const morphRange = document.querySelector('.morph-range');
const progressBar = document.querySelector('.scroll-progress span');
const tiltItems = document.querySelectorAll('[data-tilt]');

const updateHeader = () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${progress})`;
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
});

menuLinks.forEach((link) => link.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
  observer.observe(item);
});

if (matchMedia('(pointer:fine)').matches) {
  window.addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
  projects.forEach((project) => {
    project.addEventListener('mouseenter', () => cursor.classList.add('active'));
    project.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
  tiltItems.forEach((item) => {
    item.addEventListener('mousemove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      item.style.setProperty('--rx', `${y * -8}deg`);
      item.style.setProperty('--ry', `${x * 10}deg`);
    });
    item.addEventListener('mouseleave', () => {
      item.style.setProperty('--rx', '0deg');
      item.style.setProperty('--ry', '0deg');
    });
  });
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight * 1.2) {
      heroBg.style.transform = `scale(1.04) translateY(${window.scrollY * 0.09}px)`;
    }
  }, { passive: true });
}

copyButton.addEventListener('click', async () => {
  const value = copyButton.dataset.copy;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement('textarea');
    input.value = value;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
  toast.classList.add('show');
  copyButton.textContent = 'Berhasil disalin';
  setTimeout(() => {
    toast.classList.remove('show');
    copyButton.textContent = 'Salin nama';
  }, 1800);
});

anthemToggle.addEventListener('click', async () => {
  if (anthemAudio.paused) {
    try {
      await anthemAudio.play();
      anthemPlayer.classList.add('playing');
      anthemToggle.setAttribute('aria-pressed', 'true');
      anthemToggle.setAttribute('aria-label', 'Jeda Cant del Barça');
      anthemState.textContent = 'PAUSE';
    } catch {
      anthemState.textContent = 'RETRY';
    }
  } else {
    anthemAudio.pause();
    anthemPlayer.classList.remove('playing');
    anthemToggle.setAttribute('aria-pressed', 'false');
    anthemToggle.setAttribute('aria-label', 'Putar Cant del Barça');
    anthemState.textContent = 'PLAY';
  }
});

anthemAudio.addEventListener('ended', () => {
  anthemPlayer.classList.remove('playing');
  anthemToggle.setAttribute('aria-pressed', 'false');
  anthemToggle.setAttribute('aria-label', 'Putar Cant del Barça');
  anthemState.textContent = 'PLAY';
});

morphRange.addEventListener('input', () => {
  morphCard.style.setProperty('--reveal', `${morphRange.value}%`);
});
