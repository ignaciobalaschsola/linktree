// ── Collapsible Sections ──
document.querySelectorAll('.section-header').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    btn.nextElementSibling.classList.toggle('collapsed', expanded);
  });
});

// ── Nostr Widget Toggle ──
const nostrBtn = document.getElementById('nostrBtn');
const nostrDrawer = document.getElementById('nostrDrawer');

nostrBtn.addEventListener('click', () => {
  const expanded = nostrBtn.getAttribute('aria-expanded') === 'true';
  nostrBtn.setAttribute('aria-expanded', !expanded);
  nostrDrawer.classList.toggle('open', !expanded);
});

// ── Copy Buttons ──
const toast = document.getElementById('toast');

function showToast(msg) {
  toast.textContent = msg || 'Copied to clipboard';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fas fa-check"></i>';
      showToast('Copied to clipboard');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fas fa-copy"></i>';
      }, 2000);
    } catch {}
  });
});

// ── Back to Top ──
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Share Button ──
const shareBtn = document.getElementById('shareBtn');

shareBtn.addEventListener('click', async () => {
  const url = window.location.href;
  const data = { title: 'Ignacio Balasch Solá — Links', url };

  if (navigator.share) {
    try { await navigator.share(data); } catch {}
  } else {
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard');
  }
});

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
    ctx.fillStyle = `rgba(43, 92, 214, ${p.opacity})`;
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
        ctx.strokeStyle = `rgba(43, 92, 214, ${0.04 * (1 - dist / 110)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  animationId = requestAnimationFrame(drawParticles);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initParticles() {
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
