"use strict";

const btnExperience = document.getElementById('btn-experience');
const btnInterviews = document.getElementById('btn-interviews');

btnExperience.addEventListener('click', () => {
    // We can make this show a hidden div later
    console.log("Experience clicked");
});

btnInterviews.addEventListener('click', () => {
    // Redirects to your new interviews page
    window.location.href = 'web-interviews.html';
});