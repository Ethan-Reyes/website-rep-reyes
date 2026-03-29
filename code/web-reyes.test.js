"use strict";
//This file is for testing my HTML and JS to ensure it works

/**
 * ============================================================
 * web-reyes.test.js
 * TDD Test Suite — Ethan Reyes Portfolio
 * Runner: Jest + JSDOM
 * Coverage: Navigation, Section Toggling, Interview Page,
 *           Input Sanitization & Security
 * ============================================================
 */

// ── Helpers ──────────────────────────────────────────────────

/**
 * Navigation handler — wraps location change so it can be
 * tested without touching the locked window.location object.
 */
const navigator = {
    go: (url) => { window.location.href = url; }
};

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


// ══════════════════════════════════════════════════════════════
// SUITE 1 — Section Visibility Toggling
// ══════════════════════════════════════════════════════════════

describe("Section Visibility Toggling", () => {

    beforeEach(() => {
        // Arrange: Set up the DOM to mirror the portfolio layout
        document.body.innerHTML = `
            <div id="content-contact"></div>
            <div id="content-experience" class="hidden"></div>
            <div id="content-interviews" class="hidden"></div>
        `;
    });

    test("hideAll() should add 'hidden' class to every section", () => {
        // Arrange
        const sections = [
            document.getElementById('content-contact'),
            document.getElementById('content-experience'),
            document.getElementById('content-interviews'),
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
        const experience = document.getElementById('content-experience');
        const interviews = document.getElementById('content-interviews');
        hideAll([experience, interviews]);

        // Act
        showSection(experience);

        // Assert — experience is visible, interviews stays hidden
        expect(experience.classList.contains('hidden')).toBe(false);
        expect(interviews.classList.contains('hidden')).toBe(true);
    });

    test("calling showSection() twice should not duplicate classes or break state", () => {
        // Arrange
        const experience = document.getElementById('content-experience');

        // Act
        showSection(experience);
        showSection(experience);

        // Assert
        expect(experience.classList.contains('hidden')).toBe(false);
        expect(experience.classList.length).toBeLessThanOrEqual(2);
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 2 — Button Click Navigation
// ══════════════════════════════════════════════════════════════

describe("Button Click Navigation", () => {

    let goSpy;

    beforeEach(() => {
        // Arrange: Mock the navigator.go method so we can track calls
        // without touching the locked window.location object in Jest 30
        goSpy = jest.spyOn(navigator, 'go').mockImplementation(() => {});

        // Arrange: Render the two main nav buttons from web-reyes.html
        document.body.innerHTML = `
            <div class="custom-button-container" id="btn-experience">
                <span class="button-label">EXPERIENCE & PROJECTS</span>
            </div>
            <div class="custom-button-container" id="btn-interviews">
                <span class="button-label">INTERVIEWS</span>
            </div>
        `;

        // Attach click logic mirroring web-reyes.js
        document.getElementById('btn-interviews').addEventListener('click', () => {
            navigator.go('web-interviews.html');
        });

        document.getElementById('btn-experience').addEventListener('click', () => {
            console.log("Experience clicked");
        });
    });

    afterEach(() => {
        goSpy.mockRestore();
    });

    test("clicking btn-interviews should navigate to web-interviews.html", () => {
        // Arrange
        const btn = document.getElementById('btn-interviews');

        // Act
        btn.click();

        // Assert
        expect(goSpy).toHaveBeenCalledWith('web-interviews.html');
    });

    test("btn-experience should exist in the DOM and be clickable", () => {
        // Arrange
        const btn = document.getElementById('btn-experience');

        // Act & Assert — should not throw
        expect(btn).not.toBeNull();
        expect(() => btn.click()).not.toThrow();
    });

    test("btn-interviews should have the correct label text", () => {
        // Arrange
        const btn = document.getElementById('btn-interviews');

        // Act
        const label = btn.querySelector('.button-label').textContent;

        // Assert
        expect(label).toBe('INTERVIEWS');
    });

    test("btn-experience should have the correct label text", () => {
        // Arrange
        const btn = document.getElementById('btn-experience');

        // Act
        const label = btn.querySelector('.button-label').textContent;

        // Assert
        expect(label).toBe('EXPERIENCE & PROJECTS');
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 3 — Return to Home Button (web-interviews.html)
// ══════════════════════════════════════════════════════════════

describe("Return to Home Button", () => {

    let goSpy;

    beforeEach(() => {
        // Arrange: Mock the navigator.go method
        goSpy = jest.spyOn(navigator, 'go').mockImplementation(() => {});

        // Arrange: Render the back button from web-interviews.html
        document.body.innerHTML = `
            <div class="custom-button-container" id="btn-back">
                <span class="button-label">RETURN TO HOME</span>
            </div>
        `;

        document.getElementById('btn-back').addEventListener('click', () => {
            navigator.go('web-reyes.html');
        });
    });

    afterEach(() => {
        goSpy.mockRestore();
    });

    test("clicking btn-back should navigate to web-reyes.html", () => {
        // Arrange
        const btn = document.getElementById('btn-back');

        // Act
        btn.click();

        // Assert
        expect(goSpy).toHaveBeenCalledWith('web-reyes.html');
    });

    test("btn-back should render with the correct label", () => {
        // Arrange
        const btn = document.getElementById('btn-back');

        // Act
        const label = btn.querySelector('.button-label').textContent;

        // Assert
        expect(label).toBe('RETURN TO HOME');
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 4 — Interview Page Content (Bill Scott)
// ══════════════════════════════════════════════════════════════

describe("Interview Page — Bill Scott Content", () => {

    beforeEach(() => {
        // Arrange: Simulate the key structural elements of web-interviews.html
        document.body.innerHTML = `
            <div class="interview-meta">
                <div class="meta-item">SUBJECT: <span>Bill Scott</span></div>
                <div class="meta-item">COMPANY: <span>BrainPaint Inc.</span></div>
            </div>
            <section class="interview-hero">
                <img class="interview-photo" src="../Images and Links/Bill_Scott_Pic.jpeg" alt="Bill Scott, CEO of BrainPaint">
                <div class="interview-bio">
                    <h2>Bill Scott</h2>
                    <p class="interview-title">Founder & CEO — BrainPaint Incorporated</p>
                </div>
            </section>
            <div class="quotes-grid">
                <div class="quote-card">
                    <blockquote>Test quote one.</blockquote>
                    <div class="quote-tag">On Technical Wisdom</div>
                </div>
                <div class="quote-card">
                    <blockquote>Test quote two.</blockquote>
                    <div class="quote-tag">On Leadership</div>
                </div>
            </div>
            <div class="insights-list">
                <div class="insight-item"><div class="insight-number">01</div></div>
                <div class="insight-item"><div class="insight-number">02</div></div>
                <div class="insight-item"><div class="insight-number">03</div></div>
                <div class="insight-item"><div class="insight-number">04</div></div>
                <div class="insight-item"><div class="insight-number">05</div></div>
                <div class="insight-item"><div class="insight-number">06</div></div>
            </div>
        `;
    });

    test("interview subject name should be Bill Scott", () => {
        // Arrange
        const spans = document.querySelectorAll('.meta-item span');

        // Act
        const subject = spans[0].textContent;

        // Assert
        expect(subject).toBe('Bill Scott');
    });

    test("interview company should be BrainPaint Inc.", () => {
        // Arrange
        const spans = document.querySelectorAll('.meta-item span');

        // Act
        const company = spans[1].textContent;

        // Assert
        expect(company).toBe('BrainPaint Inc.');
    });

    test("interview photo should have a valid src and alt attribute", () => {
        // Arrange
        const photo = document.querySelector('.interview-photo');

        // Act & Assert
        expect(photo).not.toBeNull();
        expect(photo.src).toBeTruthy();
        expect(photo.alt).toBe('Bill Scott, CEO of BrainPaint');
    });

    test("quotes grid should render at least 2 quote cards", () => {
        // Arrange
        const cards = document.querySelectorAll('.quote-card');

        // Act & Assert
        expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    test("insights list should render exactly 6 insight items", () => {
        // Arrange
        const insights = document.querySelectorAll('.insight-item');

        // Act & Assert
        expect(insights.length).toBe(6);
    });

    test("each insight item should have a numbered label", () => {
        // Arrange
        const numbers = document.querySelectorAll('.insight-number');

        // Act & Assert
        numbers.forEach(num => {
            expect(num.textContent.trim()).toMatch(/^\d{2}$/);
        });
    });

});


// ══════════════════════════════════════════════════════════════
// SUITE 5 — Security & Input Sanitization
// ══════════════════════════════════════════════════════════════

describe("Security — Input Sanitization", () => {

    test("sanitizeInput() should strip HTML tags from a string", () => {
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

    test("contact links should use safe protocols only (mailto and tel)", () => {
        // Arrange
        document.body.innerHTML = `
            <ul class="contact-list">
                <li><a href="mailto:Ethan.Paragon@gmail.com">Email</a></li>
                <li><a href="tel:3168479296">Phone</a></li>
                <li><a href="https://github.com/Ethan-Reyes">GitHub</a></li>
            </ul>
        `;
        const links = document.querySelectorAll('.contact-list a');

        // Act & Assert — no javascript: protocol injection
        links.forEach(link => {
            expect(link.href).not.toMatch(/^javascript:/i);
        });
    });

});