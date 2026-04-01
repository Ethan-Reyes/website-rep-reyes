"use strict";

/**
 * ============================================================
 * web-reyes.test.js
 * TDD Test Suite — Ethan Reyes Portfolio
 * Runner: Jest + JSDOM
 * Pattern: Arrange → Act → Assert (AAA)
 * Coverage: Section Toggling, Nav, Boot Sequence,
 *           Interview Card Toggle, Content Validation,
 *           Input Sanitization & Security
 * ============================================================
 */

// ── Helpers ──────────────────────────────────────────────────

/**
 * Hides all section elements by adding the 'hidden' class.
 * Mirrors the hideAll utility used in web-reyes.js.
 */
function hideAll(sections) {
    sections.forEach(section => section.classList.add('hidden'));
}

/**
 * Shows a single section by removing the 'hidden' class.
 */
function showSection(section) {
    section.classList.remove('hidden');
}

/**
 * Sanitizes user-facing string input to strip HTML tags and
 * script content. Defends against XSS if dynamic content
 * is ever injected into the DOM.
 */
function sanitizeInput(input) {
    return input
        .replace(/<script[\s\S]*?\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
}

/**
 * Mirrors the toggleInterview() function from web-reyes.js.
 * Extracted here so it can be unit tested independently.
 */
function toggleInterview(id) {
    const card   = document.getElementById(`card-${id}`);
    const toggle = document.getElementById(`toggle-${id}`);

    if (!card || !toggle) return;

    const isExpanded = card.classList.contains('expanded');

    // Collapse all cards first
    document.querySelectorAll('.interview-card.expanded').forEach(c => {
        c.classList.remove('expanded');
        const t = c.querySelector('.interview-card-toggle span:first-child');
        if (t) t.textContent = 'Read more';
    });

    // If it wasn't expanded, open it now
    if (!isExpanded) {
        card.classList.add('expanded');
        const label = toggle.querySelector('span:first-child');
        if (label) label.textContent = 'Close';
    }
}

/**
 * Mirrors launchSite() from web-reyes.js.
 */
function launchSite(bootScreen, mainSite) {
    bootScreen.classList.add('fade-out');
    mainSite.classList.remove('hidden');
    setTimeout(() => {
        bootScreen.style.display = 'none';
    }, 650);
}


// ══════════════════════════════════════════════════════════════
// SUITE 1 — Section Visibility Toggling
// ══════════════════════════════════════════════════════════════

describe("Section Visibility Toggling", () => {

    beforeEach(() => {
        // Arrange: Mirror the single-page section structure
        document.body.innerHTML = `
            <section id="hero"></section>
            <section id="about" class="hidden"></section>
            <section id="experience" class="hidden"></section>
            <section id="interviews" class="hidden"></section>
            <section id="contact" class="hidden"></section>
        `;
    });

    test("hideAll() should add 'hidden' class to every section", () => {
        // Arrange
        const sections = [
            document.getElementById('hero'),
            document.getElementById('about'),
            document.getElementById('experience'),
            document.getElementById('interviews'),
            document.getElementById('contact'),
        ];
        sections[0].classList.remove('hidden');

        // Act
        hideAll(sections);

        // Assert
        sections.forEach(section => {
            expect(section.classList.contains('hidden')).toBe(true);
        });
    });

    test("showSection() should remove 'hidden' from the target section only", () => {
        // Arrange
        const experience = document.getElementById('experience');
        const interviews = document.getElementById('interviews');
        hideAll([experience, interviews]);

        // Act
        showSection(experience);

        // Assert — experience is visible, interviews stays hidden
        expect(experience.classList.contains('hidden')).toBe(false);
        expect(interviews.classList.contains('hidden')).toBe(true);
    });

    test("calling showSection() twice should not break state", () => {
        // Arrange
        const experience = document.getElementById('experience');

        // Act
        showSection(experience);
        showSection(experience);

        // Assert
        expect(experience.classList.contains('hidden')).toBe(false);
        expect(experience.classList.length).toBeLessThanOrEqual(2);
    });

    test("all five page sections should exist in the DOM", () => {
        // Arrange & Act
        const ids = ['hero', 'about', 'experience', 'interviews', 'contact'];

        // Assert
        ids.forEach(id => {
            expect(document.getElementById(id)).not.toBeNull();
        });
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 2 — Navigation Links
// ══════════════════════════════════════════════════════════════

describe("Navigation Links", () => {

    beforeEach(() => {
        // Arrange: Render the nav as it appears in web-reyes.html
        document.body.innerHTML = `
            <nav id="main-nav">
                <a href="#hero" class="nav-logo">ER</a>
                <div class="nav-links">
                    <a href="#about">About</a>
                    <a href="#experience">Experience</a>
                    <a href="#interviews">Interviews</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>
        `;
    });

    test("nav should exist in the DOM", () => {
        // Arrange & Act
        const nav = document.getElementById('main-nav');

        // Assert
        expect(nav).not.toBeNull();
    });

    test("nav logo should link to #hero", () => {
        // Arrange
        const logo = document.querySelector('.nav-logo');

        // Act & Assert
        expect(logo.getAttribute('href')).toBe('#hero');
        expect(logo.textContent).toBe('ER');
    });

    test("nav should contain exactly 4 section links", () => {
        // Arrange
        const links = document.querySelectorAll('.nav-links a');

        // Act & Assert
        expect(links.length).toBe(4);
    });

    test("all nav links should use anchor hrefs pointing to page sections", () => {
        // Arrange
        const links = document.querySelectorAll('.nav-links a');
        const expected = ['#about', '#experience', '#interviews', '#contact'];

        // Act & Assert
        links.forEach((link, i) => {
            expect(link.getAttribute('href')).toBe(expected[i]);
        });
    });

    test("nav links should not use javascript: protocol", () => {
        // Arrange
        const links = document.querySelectorAll('#main-nav a');

        // Act & Assert — security check
        links.forEach(link => {
            expect(link.getAttribute('href')).not.toMatch(/^javascript:/i);
        });
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 3 — Boot Sequence
// ══════════════════════════════════════════════════════════════

describe("Boot Sequence", () => {

    beforeEach(() => {
        // Arrange: Simulate the boot screen and main site structure
        document.body.innerHTML = `
            <div id="boot-screen">
                <div id="boot-terminal">
                    <div id="boot-lines"></div>
                    <div id="boot-cursor"></div>
                </div>
                <button id="skip-boot">skip →</button>
            </div>
            <div id="main-site" class="hidden">
                <section id="hero"></section>
            </div>
        `;
    });

    test("boot screen should exist on page load", () => {
        // Arrange & Act
        const bootScreen = document.getElementById('boot-screen');

        // Assert
        expect(bootScreen).not.toBeNull();
    });

    test("main site should be hidden before boot completes", () => {
        // Arrange & Act
        const mainSite = document.getElementById('main-site');

        // Assert
        expect(mainSite.classList.contains('hidden')).toBe(true);
    });

    test("skip button should exist and be clickable", () => {
        // Arrange
        const skipBtn = document.getElementById('skip-boot');

        // Act & Assert
        expect(skipBtn).not.toBeNull();
        expect(() => skipBtn.click()).not.toThrow();
    });

    test("launchSite() should add fade-out class to boot screen", () => {
        // Arrange
        const bootScreen = document.getElementById('boot-screen');
        const mainSite   = document.getElementById('main-site');

        // Act
        launchSite(bootScreen, mainSite);

        // Assert
        expect(bootScreen.classList.contains('fade-out')).toBe(true);
    });

    test("launchSite() should remove hidden class from main site", () => {
        // Arrange
        const bootScreen = document.getElementById('boot-screen');
        const mainSite   = document.getElementById('main-site');

        // Act
        launchSite(bootScreen, mainSite);

        // Assert
        expect(mainSite.classList.contains('hidden')).toBe(false);
    });

    test("boot-lines container should start empty", () => {
        // Arrange & Act
        const bootLines = document.getElementById('boot-lines');

        // Assert
        expect(bootLines.children.length).toBe(0);
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 4 — Interview Card Toggle (toggleInterview)
// ══════════════════════════════════════════════════════════════

describe("Interview Card Toggle", () => {

    beforeEach(() => {
        // Arrange: Simulate two interview cards as in web-reyes.html
        document.body.innerHTML = `
            <div class="interview-card" id="card-billscott">
                <div class="interview-card-header">
                    <div class="interview-card-toggle" id="toggle-billscott">
                        <span>Read more</span>
                        <span class="toggle-arrow">↓</span>
                    </div>
                </div>
                <div class="interview-card-body" id="body-billscott"></div>
            </div>

            <div class="interview-card" id="card-hainestodd">
                <div class="interview-card-header">
                    <div class="interview-card-toggle" id="toggle-hainestodd">
                        <span>Read more</span>
                        <span class="toggle-arrow">↓</span>
                    </div>
                </div>
                <div class="interview-card-body" id="body-hainestodd"></div>
            </div>
        `;
    });

    test("toggleInterview() should add 'expanded' class to the target card", () => {
        // Arrange
        const card = document.getElementById('card-billscott');

        // Act
        toggleInterview('billscott');

        // Assert
        expect(card.classList.contains('expanded')).toBe(true);
    });

    test("toggleInterview() should update toggle label to 'Close' when expanded", () => {
        // Arrange
        const toggle = document.getElementById('toggle-billscott');

        // Act
        toggleInterview('billscott');

        // Assert
        const label = toggle.querySelector('span:first-child');
        expect(label.textContent).toBe('Close');
    });

    test("toggleInterview() should collapse an already expanded card", () => {
        // Arrange
        const card = document.getElementById('card-billscott');
        toggleInterview('billscott'); // open it first

        // Act
        toggleInterview('billscott'); // toggle again to close

        // Assert
        expect(card.classList.contains('expanded')).toBe(false);
    });

    test("opening one card should collapse any other open card", () => {
        // Arrange
        const billCard  = document.getElementById('card-billscott');
        const hainesCard = document.getElementById('card-hainestodd');
        toggleInterview('billscott'); // open bill first

        // Act
        toggleInterview('hainestodd'); // open haines

        // Assert — bill should now be collapsed
        expect(billCard.classList.contains('expanded')).toBe(false);
        expect(hainesCard.classList.contains('expanded')).toBe(true);
    });

    test("toggleInterview() should do nothing if card id does not exist", () => {
        // Arrange & Act & Assert — should not throw
        expect(() => toggleInterview('nonexistent')).not.toThrow();
    });

    test("collapsed card label should reset to 'Read more'", () => {
        // Arrange
        const toggle = document.getElementById('toggle-billscott');
        toggleInterview('billscott'); // open

        // Act
        toggleInterview('billscott'); // close

        // Assert
        const label = toggle.querySelector('span:first-child');
        expect(label.textContent).toBe('Read more');
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 5 — Interview Card Content (Bill Scott)
// ══════════════════════════════════════════════════════════════

describe("Interview Card Content — Bill Scott", () => {

    beforeEach(() => {
        // Arrange: Simulate the Bill Scott card structure
        document.body.innerHTML = `
            <div class="interview-card" id="card-billscott">
                <div class="interview-card-header">
                    <div class="interview-card-photo-wrap">
                        <img class="interview-card-photo" src="../Images and Links/Bill_Scott_Pic.jpeg" alt="Bill Scott">
                    </div>
                    <div class="interview-card-intro">
                        <p class="interview-card-eyebrow">Episode 01</p>
                        <h3 class="interview-card-name">Bill Scott</h3>
                        <p class="interview-card-title">Founder & CEO — BrainPaint Inc.</p>
                        <div class="interview-card-meta">
                            <span>Neurofeedback · EEG Biofeedback</span>
                            <span>Founded 2007 · Nevada</span>
                        </div>
                    </div>
                    <div class="interview-card-toggle" id="toggle-billscott">
                        <span>Read more</span>
                        <span class="toggle-arrow">↓</span>
                    </div>
                </div>
                <div class="interview-card-body" id="body-billscott">
                    <div class="quotes-grid">
                        <div class="quote-card"><blockquote>Quote 1</blockquote><span class="quote-tag">Tag 1</span></div>
                        <div class="quote-card"><blockquote>Quote 2</blockquote><span class="quote-tag">Tag 2</span></div>
                        <div class="quote-card"><blockquote>Quote 3</blockquote><span class="quote-tag">Tag 3</span></div>
                        <div class="quote-card"><blockquote>Quote 4</blockquote><span class="quote-tag">Tag 4</span></div>
                        <div class="quote-card"><blockquote>Quote 5</blockquote><span class="quote-tag">Tag 5</span></div>
                        <div class="quote-card"><blockquote>Quote 6</blockquote><span class="quote-tag">Tag 6</span></div>
                    </div>
                    <div class="insights-list">
                        <div class="insight-item"><span class="insight-num">01</span><div><h4>Insight 1</h4></div></div>
                        <div class="insight-item"><span class="insight-num">02</span><div><h4>Insight 2</h4></div></div>
                        <div class="insight-item"><span class="insight-num">03</span><div><h4>Insight 3</h4></div></div>
                        <div class="insight-item"><span class="insight-num">04</span><div><h4>Insight 4</h4></div></div>
                        <div class="insight-item"><span class="insight-num">05</span><div><h4>Insight 5</h4></div></div>
                        <div class="insight-item"><span class="insight-num">06</span><div><h4>Insight 6</h4></div></div>
                    </div>
                </div>
            </div>
        `;
    });

    test("Bill Scott card should exist in the DOM", () => {
        // Arrange & Act
        const card = document.getElementById('card-billscott');

        // Assert
        expect(card).not.toBeNull();
    });

    test("Bill Scott card should display Episode 01", () => {
        // Arrange
        const eyebrow = document.querySelector('.interview-card-eyebrow');

        // Act & Assert
        expect(eyebrow.textContent).toBe('Episode 01');
    });

    test("Bill Scott card should display correct name", () => {
        // Arrange
        const name = document.querySelector('.interview-card-name');

        // Act & Assert
        expect(name.textContent).toBe('Bill Scott');
    });

    test("Bill Scott card should display correct title", () => {
        // Arrange
        const title = document.querySelector('.interview-card-title');

        // Act & Assert
        expect(title.textContent).toBe('Founder & CEO — BrainPaint Inc.');
    });

    test("Bill Scott card photo should have alt text", () => {
        // Arrange
        const photo = document.querySelector('.interview-card-photo');

        // Act & Assert
        expect(photo.alt).toBe('Bill Scott');
        expect(photo.src).toBeTruthy();
    });

    test("Bill Scott card should have exactly 6 quote cards", () => {
        // Arrange
        const quotes = document.querySelectorAll('.quote-card');

        // Act & Assert
        expect(quotes.length).toBe(6);
    });

    test("Bill Scott card should have exactly 6 insight items", () => {
        // Arrange
        const insights = document.querySelectorAll('.insight-item');

        // Act & Assert
        expect(insights.length).toBe(6);
    });

    test("each insight should have a two-digit number label", () => {
        // Arrange
        const numbers = document.querySelectorAll('.insight-num');

        // Act & Assert
        numbers.forEach(num => {
            expect(num.textContent.trim()).toMatch(/^\d{2}$/);
        });
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 6 — Interview Card Placeholders (Haines Todd & John Davis)
// ══════════════════════════════════════════════════════════════

describe("Interview Card Placeholders — Upcoming Episodes", () => {

    beforeEach(() => {
        // Arrange: Simulate upcoming interview cards
        document.body.innerHTML = `
            <div class="interview-card interview-card--soon" id="card-hainestodd">
                <div class="interview-card-header">
                    <div class="interview-card-intro">
                        <p class="interview-card-eyebrow">Episode 02</p>
                        <h3 class="interview-card-name">Haines Todd</h3>
                        <p class="interview-card-title">Software Engineer — Textron Aviation</p>
                    </div>
                    <div class="interview-card-toggle interview-card-toggle--soon">
                        <span>Coming soon</span>
                    </div>
                </div>
            </div>
            <div class="interview-card interview-card--soon" id="card-johndavis">
                <div class="interview-card-header">
                    <div class="interview-card-intro">
                        <p class="interview-card-eyebrow">Episode 03</p>
                        <h3 class="interview-card-name">John Davis</h3>
                        <p class="interview-card-title">Programmer — National Guard & Wichita Universities</p>
                    </div>
                    <div class="interview-card-toggle interview-card-toggle--soon">
                        <span>Coming soon</span>
                    </div>
                </div>
            </div>
        `;
    });

    test("Haines Todd card should exist as Episode 02", () => {
        // Arrange
        const card = document.getElementById('card-hainestodd');
        const eyebrow = card.querySelector('.interview-card-eyebrow');

        // Act & Assert
        expect(card).not.toBeNull();
        expect(eyebrow.textContent).toBe('Episode 02');
    });

    test("Haines Todd card should display correct name and title", () => {
        // Arrange
        const name  = document.querySelector('#card-hainestodd .interview-card-name');
        const title = document.querySelector('#card-hainestodd .interview-card-title');

        // Act & Assert
        expect(name.textContent).toBe('Haines Todd');
        expect(title.textContent).toBe('Software Engineer — Textron Aviation');
    });

    test("John Davis card should exist as Episode 03", () => {
        // Arrange
        const card = document.getElementById('card-johndavis');
        const eyebrow = card.querySelector('.interview-card-eyebrow');

        // Act & Assert
        expect(card).not.toBeNull();
        expect(eyebrow.textContent).toBe('Episode 03');
    });

    test("John Davis card should display correct name and title", () => {
        // Arrange
        const name  = document.querySelector('#card-johndavis .interview-card-name');
        const title = document.querySelector('#card-johndavis .interview-card-title');

        // Act & Assert
        expect(name.textContent).toBe('John Davis');
        expect(title.textContent).toBe('Programmer — National Guard & Wichita Universities');
    });

    test("upcoming cards should have 'Coming soon' toggle label", () => {
        // Arrange
        const toggles = document.querySelectorAll('.interview-card-toggle--soon span');

        // Act & Assert
        toggles.forEach(toggle => {
            expect(toggle.textContent).toBe('Coming soon');
        });
    });

    test("upcoming cards should have the interview-card--soon class", () => {
        // Arrange
        const soonCards = document.querySelectorAll('.interview-card--soon');

        // Act & Assert
        expect(soonCards.length).toBe(2);
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 7 — Security & Input Sanitization
// ══════════════════════════════════════════════════════════════

describe("Security — Input Sanitization", () => {

    test("sanitizeInput() should strip script tags and their contents", () => {
        // Arrange
        const malicious = '<script>alert("xss")</script>Hello';

        // Act
        const result = sanitizeInput(malicious);

        // Assert
        expect(result).toBe('Hello');
        expect(result).not.toContain('<script>');
    });

    test("sanitizeInput() should strip inline event handler injection", () => {
        // Arrange
        const malicious = '<img src=x onerror=alert(1)>Caption';

        // Act
        const result = sanitizeInput(malicious);

        // Assert
        expect(result).toBe('Caption');
        expect(result).not.toContain('onerror');
    });

    test("sanitizeInput() should leave clean strings unchanged", () => {
        // Arrange
        const clean = 'Ethan Reyes — Cloud Engineer';

        // Act
        const result = sanitizeInput(clean);

        // Assert
        expect(result).toBe('Ethan Reyes — Cloud Engineer');
    });

    test("sanitizeInput() should trim leading and trailing whitespace", () => {
        // Arrange
        const padded = '   Hello World   ';

        // Act
        const result = sanitizeInput(padded);

        // Assert
        expect(result).toBe('Hello World');
    });

    test("contact links should use safe protocols only", () => {
        // Arrange
        document.body.innerHTML = `
            <nav id="main-nav">
                <a href="#hero" class="nav-logo">ER</a>
                <div class="nav-links">
                    <a href="#about">About</a>
                    <a href="#experience">Experience</a>
                    <a href="#interviews">Interviews</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>
            <section id="contact">
                <a href="mailto:Ethan.Paragon@gmail.com">Email</a>
                <a href="tel:3168479296">Phone</a>
                <a href="https://www.linkedin.com/in/ethan-reyes-88134a388">LinkedIn</a>
                <a href="https://github.com/Ethan-Reyes">GitHub</a>
                <a href="../Images and Links/Resume.PDF">Resume</a>
            </section>
        `;
        const links = document.querySelectorAll('a');

        // Act & Assert — no javascript: protocol injection anywhere
        links.forEach(link => {
            expect(link.getAttribute('href')).not.toMatch(/^javascript:/i);
        });
    });

    test("BOOT_LINES data should only contain plain text — no HTML injection", () => {
        // Arrange
        const BOOT_LINES = [
            "BIOS v2.26.0 · WSU Tech Systems",
            "Initializing hardware...",
            "CPU: Cloud Computing Core · 4.0GHz",
            "RAM: 16GB · AWS Certified",
            "Storage: GitHub Repository mounted",
            "$ whoami",
            "ethan_reyes · data_engineer · software_dev",
            "$ ls ./certifications",
            "aws_cloud_practitioner.cert  pcep_python.cert  tdd_jest.cert",
            "$ cat ./mission.txt",
            "Bridging heavy-industry data with cloud-native applications.",
            "$ ./launch_portfolio.sh",
            "Loading portfolio...",
            "✓ Portfolio ready. Welcome.",
        ];

        // Act & Assert — none of the boot lines should contain HTML tags
        BOOT_LINES.forEach(line => {
            expect(sanitizeInput(line)).toBe(line.trim());
        });
    });

});