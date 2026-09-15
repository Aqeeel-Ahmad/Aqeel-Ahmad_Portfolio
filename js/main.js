/* ============================================================
   AQEEL AHMAD PORTFOLIO — main.js
   Canvas Background · Typed Text · Scroll Animations
   Skill Bars · Filters · Back to Top · Nav · Toast
   ============================================================ */

(function () {
  'use strict';

  /* ── PAGE LOADER ── */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.getElementById('page-loader');
      if (loader) loader.classList.add('hidden');
    }, 1600);
  });

  /* ── CANVAS PARTICLE NETWORK ── */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  const PARTICLE_COUNT = 80;
  const MAX_DIST = 140;
  const particles = [];

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = randomBetween(0, W);
      this.y = init ? randomBetween(0, H) : randomBetween(-20, H + 20);
      this.vx = randomBetween(-0.3, 0.3);
      this.vy = randomBetween(-0.3, 0.3);
      this.r = randomBetween(1, 2.5);
      this.alpha = randomBetween(0.3, 0.7);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.beginPath();
      ctx.arc(this.x, this.y, isLight ? this.r * 1.15 : this.r, 0, Math.PI * 2);
      ctx.fillStyle = isLight
        ? `rgba(8, 145, 178, ${Math.min(1, this.alpha * 1.3)})`
        : `rgba(6, 182, 212, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawLines() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const ratio = (1 - dist / MAX_DIST);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          if (isLight) {
            ctx.strokeStyle = `rgba(8, 145, 178, ${ratio * 0.32})`;
            ctx.lineWidth = 1.2;
          } else {
            ctx.strokeStyle = `rgba(6, 182, 212, ${ratio * 0.15})`;
            ctx.lineWidth = 1;
          }
          ctx.stroke();
        }
      }
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  });

  /* ── TYPED TEXT ── */
  const typedEl = document.getElementById('typed-text');
  const phrases = [
    'Python Developer',
    'Web Scraping Specialist',
    'AI Automation Engineer',
    'Full-Stack Developer',
    'Django Developer',
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let typedPause = false;

  function typeLoop() {
    if (!typedEl) return;
    const current = phrases[phraseIdx];
    if (!deleting) {
      typedEl.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        typedPause = true;
        setTimeout(() => { typedPause = false; deleting = true; }, 2200);
      }
    } else {
      typedEl.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }
    if (!typedPause) {
      setTimeout(typeLoop, deleting ? 45 : 90);
    }
  }
  setTimeout(typeLoop, 1800);

  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate skill bars when they appear
        entry.target.querySelectorAll('.skill-fill').forEach(fill => {
          fill.style.width = fill.dataset.width + '%';
        });
        // If it's a skill card itself
        if (entry.target.classList.contains('skill-card')) {
          const fill = entry.target.querySelector('.skill-fill');
          if (fill) fill.style.width = fill.dataset.width + '%';
        }
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── STAGGERED ANIMATION ── */
  function staggerChildren(container, selector, delayStep) {
    if (!container) return;
    container.querySelectorAll(selector).forEach((el, i) => {
      el.style.transitionDelay = `${i * delayStep}ms`;
    });
  }
  staggerChildren(document.getElementById('skills-grid'), '.skill-card', 60);
  staggerChildren(document.getElementById('projects-grid'), '.project-card', 80);

  /* ── SKILL FILTER ── */
  const skillFilterBtns = document.querySelectorAll('[data-filter]');
  const skillCards = document.querySelectorAll('[data-category]');

  skillFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      skillFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      skillCards.forEach(card => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.style.display = matches ? '' : 'none';
        if (matches) {
          card.classList.remove('visible');
          requestAnimationFrame(() => {
            card.classList.add('visible');
            const fill = card.querySelector('.skill-fill');
            if (fill) { fill.style.width = '0'; requestAnimationFrame(() => { fill.style.width = fill.dataset.width + '%'; }); }
          });
        }
      });
    });
  });

  /* ── PROJECT FILTER ── */
  const projFilterBtns = document.querySelectorAll('[data-pfilter]');
  const projCards = document.querySelectorAll('[data-pcategory]');

  projFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      projFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.pfilter;
      projCards.forEach(card => {
        const cats = (card.dataset.pcategory || '').split(' ');
        const matches = filter === 'all' || cats.includes(filter);
        card.style.display = matches ? '' : 'none';
        if (matches) {
          card.classList.remove('visible');
          setTimeout(() => card.classList.add('visible'), 20);
        }
      });
    });
  });

  /* ── NAVBAR SCROLL ── */
  const navbar = document.getElementById('navbar');
  const backTop = document.getElementById('back-top');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar scroll class
    navbar.classList.toggle('scrolled', scrollY > 60);

    // Back to top
    backTop.classList.toggle('visible', scrollY > 400);

    // Active nav link
    let current = '';
    sections.forEach(section => {
      if (scrollY >= section.offsetTop - 120) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  /* ── BACK TO TOP ── */
  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── MOBILE NAV ── */
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── SMOOTH SCROLL for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.offsetTop - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── TOAST NOTIFICATION ── */
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  /* ── COPY EMAIL ON CLICK ── */
  const emailLinks = document.querySelectorAll('[href="mailto:imaqeelahmad5@gmail.com"]');
  emailLinks.forEach(link => {
    link.addEventListener('click', () => {
      navigator.clipboard?.writeText('imaqeelahmad5@gmail.com').then(() => {
        showToast('📧 Email copied to clipboard!');
      }).catch(() => {});
    });
  });

  /* ── TILT EFFECT ON PHOTO ── */
  const photoFrame = document.querySelector('.photo-frame');
  if (photoFrame) {
    photoFrame.addEventListener('mousemove', e => {
      const rect = photoFrame.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      photoFrame.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    photoFrame.addEventListener('mouseleave', () => {
      photoFrame.style.transform = '';
    });
  }

  /* ── HERO COUNTER ANIMATION ── */
  function animateCounter(el, target, suffix, duration) {
    let start = 0;
    const step = target / (duration / 16);
    function update() {
      start = Math.min(start + step, target);
      const val = suffix === '.75' ? start.toFixed(2) : Math.floor(start);
      el.textContent = val + (suffix && suffix !== '.75' ? suffix : '');
      if (start < target) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stats = entry.target.querySelectorAll('.stat-value');
        stats.forEach(stat => {
          const text = stat.textContent.trim();
          if (text.includes('3.75')) animateCounter(stat, 3.75, '.75', 1200);
          else if (text.includes('5+')) { stat.textContent = '0+'; animateCounter(stat, 5, '+', 800); }
          else if (text === '5') animateCounter(stat, 5, '', 700);
        });
        heroObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) heroObserver.observe(heroStats);

  /* ── CEFR DOT ANIMATION ── */
  document.querySelectorAll('.lang-card').forEach(card => {
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const dots = entry.target.querySelectorAll('.cefr-dot.filled');
          dots.forEach((dot, i) => {
            dot.style.opacity = '0';
            setTimeout(() => { dot.style.opacity = '1'; dot.style.transition = 'opacity 0.3s ease'; }, i * 120);
          });
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    cardObserver.observe(card);
  });

  /* ── THEME TOGGLE ── */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobThemeToggleBtn = document.getElementById('mob-theme-toggle');

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('portfolio-theme', 'dark'); } catch (e) {}
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      try { localStorage.setItem('portfolio-theme', 'light'); } catch (e) {}
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  if (mobThemeToggleBtn) {
    mobThemeToggleBtn.addEventListener('click', toggleTheme);
  }

  /* ── MAILING FORM HANDLER ── */
  const mailingForm = document.getElementById('mailing-form');
  if (mailingForm) {
    mailingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('mail-name')?.value || '').trim();
      const email = (document.getElementById('mail-email')?.value || '').trim();
      const subject = (document.getElementById('mail-subject')?.value || '').trim();
      const message = (document.getElementById('mail-message')?.value || '').trim();
      const statusEl = document.getElementById('form-status');

      if (!name || !email || !subject || !message) {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.className = 'form-status status-error';
          statusEl.textContent = 'Please fill out all fields before sending.';
        }
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.className = 'form-status status-error';
          statusEl.textContent = 'Please enter a valid email address.';
        }
        return;
      }

      const defaultRecipient = 'imaqeelahmad5@gmail.com';
      const mailSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject} — from ${name}`);
      const mailBody = encodeURIComponent(
        `Hi Aqeel,\n\n${message}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSender Details:\nName: ${name}\nEmail: ${email}`
      );

      const mailtoUrl = `mailto:${defaultRecipient}?subject=${mailSubject}&body=${mailBody}`;

      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.className = 'form-status status-success';
        statusEl.innerHTML = `✓ Ready! Opening your email app to send to <strong>${defaultRecipient}</strong>...<br><span style="font-size:11.5px;opacity:0.9;">If your app doesn't open automatically, <a href="${mailtoUrl}" style="text-decoration:underline;color:inherit;font-weight:700;">click here to open</a>.</span>`;
      }

      // Open mailto link
      window.location.href = mailtoUrl;
    });
  }

  console.log('%c🚀 Aqeel Ahmad Portfolio Loaded', 'color:#06b6d4;font-size:16px;font-weight:bold;');
})();
