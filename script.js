// ── Avatar Lightbox ──
const lightbox = document.getElementById('lightbox');
document.getElementById('avatarBtn').addEventListener('click', () => {
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
});
lightbox.addEventListener('click', () => {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
});

// ── Collapsible Sections ──
document.querySelectorAll('.section-header').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    btn.nextElementSibling.classList.toggle('collapsed', expanded);
  });
});

// ── Modal System ──
const modalData = {
  phone: {
    icon: 'fas fa-phone',
    title: 'Phone',
    key: '+34 692 200 389',
    qr: null,
    actions: [
      { label: 'Call', icon: 'fas fa-phone', href: 'tel:+34692200389' }
    ]
  },
  email: {
    icon: 'fas fa-envelope',
    title: 'Email',
    key: 'ignacio@balasch.es',
    qr: null,
    actions: [
      { label: 'Send Email', icon: 'fas fa-paper-plane', href: 'mailto:ignacio@balasch.es' }
    ]
  },
  nostr: {
    icon: 'fas fa-bolt',
    title: 'Nostr Public Key',
    key: 'npub1a2b3c4d5e6f7g8h9i0jklmnopqrstuvwxyz1234567890abcdefghijk',
    qr: 'npub1a2b3c4d5e6f7g8h9i0jklmnopqrstuvwxyz1234567890abcdefghijk',
    actions: []
  },
  crypto: {
    icon: 'fab fa-bitcoin',
    title: 'Crypto Wallet',
    key: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    qr: 'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    actions: []
  }
};

const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalQr = document.getElementById('modalQr');
const modalKey = document.getElementById('modalKey');
const modalCopy = document.getElementById('modalCopy');
const modalActions = document.getElementById('modalActions');
const toast = document.getElementById('toast');

let currentModalKey = '';

function showToast(msg) {
  toast.textContent = msg || 'Copied to clipboard';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function openModal(name) {
  const data = modalData[name];
  if (!data) return;

  modalIcon.innerHTML = `<i class="${data.icon}"></i>`;
  modalTitle.textContent = data.title;
  currentModalKey = data.key;
  modalKey.textContent = data.key;

  // QR
  modalQr.innerHTML = '';
  if (data.qr) {
    const qr = qrcode(0, 'M');
    qr.addData(data.qr);
    qr.make();
    const img = document.createElement('img');
    img.src = qr.createDataURL(4, 0);
    img.alt = 'QR Code';
    modalQr.appendChild(img);
  }

  // Actions
  modalActions.innerHTML = '';
  data.actions.forEach(a => {
    const link = document.createElement('a');
    link.href = a.href;
    link.className = 'modal-action-btn';
    link.innerHTML = `<i class="${a.icon}"></i> ${a.label}`;
    modalActions.appendChild(link);
  });

  // Reset copy button
  modalCopy.classList.remove('copied');
  modalCopy.innerHTML = '<i class="fas fa-copy"></i>';

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

// Triggers
document.querySelectorAll('.modal-trigger').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.modal));
});

// Close
document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
});

// Copy
modalCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentModalKey);
    modalCopy.classList.add('copied');
    modalCopy.innerHTML = '<i class="fas fa-check"></i>';
    showToast('Copied to clipboard');
    setTimeout(() => {
      modalCopy.classList.remove('copied');
      modalCopy.innerHTML = '<i class="fas fa-copy"></i>';
    }, 2000);
  } catch {}
});

// ── Back to Top ──
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Particle Colors ──
let particleRGB = '43, 92, 214';
let lineRGB = '43, 92, 214';

function getParticleColors() {
  const styles = getComputedStyle(document.documentElement);
  particleRGB = styles.getPropertyValue('--particle-rgb').trim() || '43, 92, 214';
  lineRGB = styles.getPropertyValue('--particle-line-rgb').trim() || '43, 92, 214';
}

// ── Particle Background ──
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.floor((canvas.width * canvas.height) / 20000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.4,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.3 + 0.05
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particleRGB}, ${p.opacity})`;
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
  });
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(${lineRGB}, ${0.04 * (1 - dist / 110)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  animationId = requestAnimationFrame(drawParticles);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function initParticles() {
  getParticleColors();
  if (prefersReducedMotion.matches) {
    if (animationId) cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  resize();
  createParticles();
  drawParticles();
}
window.addEventListener('resize', () => { resize(); createParticles(); });
prefersReducedMotion.addEventListener('change', initParticles);
initParticles();

function updateThemeColor() {
  const color = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', color);
}

const schemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
schemeQuery.addEventListener('change', () => {
  getParticleColors();
  updateThemeColor();
});
updateThemeColor();
