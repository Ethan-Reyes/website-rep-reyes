"use strict";

/* ============================================================
   web-reyes.js — Ethan Reyes Portfolio
   Features: Terminal boot animation, interview expand/collapse,
             smooth nav highlight on scroll
   ============================================================ */

// ── Boot Sequence ─────────────────────────────────────────────

const BOOT_LINES = [
    { text: "BIOS v2.26.0 · T.A.L.I.O.N Tech Systems", type: "output", delay: 0 },
    { text: "Initializing hardware...", type: "output", delay: 300 },
    { text: "CPU: Cloud Computing Core · 4.0GHz", type: "output", delay: 600 },
    { text: "RAM: 16GB · AWS Certified", type: "output", delay: 850 },
    { text: "Storage: GitHub Repository mounted", type: "output", delay: 1100 },
    { text: "──────────────────────────────────", type: "output", delay: 1350 },
    { text: "$ whoami", type: "prompt", delay: 1700 },
    { text: "ethan_reyes · data_engineer · software_dev", type: "success", delay: 2050 },
    { text: "$ ls ./certifications", type: "prompt", delay: 2500 },
    { text: "aws_cloud_practitioner.cert  pcep_python.cert  tdd_jest.cert", type: "output", delay: 2850 },
    { text: "$ cat ./mission.txt", type: "prompt", delay: 3300 },
    { text: "Bridging heavy-industry data with cloud-native applications.", type: "output", delay: 3650 },
    { text: "$ ./launch_portfolio.sh", type: "prompt", delay: 4200 },
    { text: "Loading portfolio...", type: "output", delay: 4550 },
    { text: "✓ Portfolio ready. Welcome.", type: "highlight", delay: 5000 },
];

const BOOT_DURATION = 5600;

/**
 * Renders the boot terminal animation line by line,
 * then fades out and reveals the main site.
 */
function runBootSequence() {
    const bootScreen  = document.getElementById('boot-screen');
    const bootLines   = document.getElementById('boot-lines');
    const skipBtn     = document.getElementById('skip-boot');
    const mainSite    = document.getElementById('main-site');

    if (!bootScreen || !mainSite) return;

    BOOT_LINES.forEach(({ text, type, delay }) => {
        setTimeout(() => {
            const span = document.createElement('span');
            span.classList.add('line', type);
            span.textContent = text;
            bootLines.appendChild(span);
            bootLines.scrollTop = bootLines.scrollHeight;
        }, delay);
    });

    const launchTimer = setTimeout(() => launchSite(bootScreen, mainSite), BOOT_DURATION);

    skipBtn.addEventListener('click', () => {
        clearTimeout(launchTimer);
        launchSite(bootScreen, mainSite);
    });
}

/**
 * Fades out the boot screen and reveals the main site.
 */
function launchSite(bootScreen, mainSite) {
    bootScreen.classList.add('fade-out');
    mainSite.classList.remove('hidden');

    setTimeout(() => {
        bootScreen.style.display = 'none';
    }, 650);
}

// ── Interview Card Toggle ─────────────────────────────────────

/**
 * Toggles the expanded state of an interview card.
 * Collapses any other open cards first.
 * @param {string} id - The interview identifier (e.g. 'billscott')
 */
function toggleInterview(id) {
    const card   = document.getElementById(`card-${id}`);
    const toggle = document.getElementById(`toggle-${id}`);

    if (!card || !toggle) return;

    const isExpanded = card.classList.contains('expanded');

    document.querySelectorAll('.interview-card.expanded').forEach(c => {
        c.classList.remove('expanded');
        const t = c.querySelector('.interview-card-toggle span:first-child');
        if (t) t.textContent = 'Read more';
    });

    if (!isExpanded) {
        card.classList.add('expanded');
        const label = toggle.querySelector('span:first-child');
        if (label) label.textContent = 'Close';

        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

window.toggleInterview = toggleInterview;

// ── Active Nav Highlight on Scroll ───────────────────────────

/**
 * Highlights the nav link matching the currently visible section
 * using IntersectionObserver for performance.
 */
function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.style.color = link.getAttribute('href') === `#${id}`
                        ? 'var(--amber)'
                        : '';
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
}

// ── Nav Compact on Scroll ─────────────────────────────────────

function initNavCompact() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.style.padding = '12px 40px';
        } else {
            nav.style.padding = '20px 40px';
        }
    }, { passive: true });
}

// ── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    runBootSequence();
    initNavHighlight();
    initNavCompact();
});