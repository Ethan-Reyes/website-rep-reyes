"use strict";

/* ============================================================
   globe.js — Three.js Visitor Globe
   Ethan Reyes Portfolio
   Pulls visitor country data from Netlify get-stats function
   and plots glowing amber pins on a rotating 3D globe.
   ============================================================ */

// ── Scene Setup ───────────────────────────────────────────────
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById("globe-container").appendChild(renderer.domElement);

camera.position.z = 2.5;

// ── Lighting ──────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xf5f0e8, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xd4854a, 1.2, 10);
pointLight.position.set(3, 3, 3);
scene.add(pointLight);

const rimLight = new THREE.PointLight(0xb5651d, 0.6, 10);
rimLight.position.set(-3, -2, -2);
scene.add(rimLight);

// ── Globe ─────────────────────────────────────────────────────
const globeGeometry = new THREE.SphereGeometry(1, 64, 64);

// Load earth texture
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load(
  "https://unpkg.com/three-globe/example/img/earth-dark.jpg",
);

const globeMaterial = new THREE.MeshPhongMaterial({
  map: earthTexture,
  bumpScale: 0.05,
  specular: new THREE.Color(0x333333),
  shininess: 15,
});

const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// ── Atmosphere Glow ───────────────────────────────────────────
const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
const atmosphereMaterial = new THREE.MeshPhongMaterial({
  color: 0xb5651d,
  transparent: true,
  opacity: 0.08,
  side: THREE.FrontSide,
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

// ── Orbit Controls ────────────────────────────────────────────
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.minDistance = 1.5;
controls.maxDistance = 4;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// ── Country Coordinates Lookup ────────────────────────────────
const COUNTRY_COORDS = {
  "United States": { lat: 37.09, lon: -95.71 },
  "United Kingdom": { lat: 51.5, lon: -0.12 },
  Canada: { lat: 56.13, lon: -106.34 },
  Australia: { lat: -25.27, lon: 133.77 },
  Germany: { lat: 51.16, lon: 10.45 },
  France: { lat: 46.23, lon: 2.21 },
  India: { lat: 20.59, lon: 78.96 },
  Brazil: { lat: -14.24, lon: -51.93 },
  Japan: { lat: 36.2, lon: 138.25 },
  Mexico: { lat: 23.63, lon: -102.55 },
  Netherlands: { lat: 52.13, lon: 5.29 },
  Sweden: { lat: 60.13, lon: 18.64 },
  Norway: { lat: 60.47, lon: 8.47 },
  Denmark: { lat: 56.26, lon: 9.5 },
  Finland: { lat: 61.92, lon: 25.75 },
  Spain: { lat: 40.46, lon: -3.75 },
  Italy: { lat: 41.87, lon: 12.57 },
  Poland: { lat: 51.92, lon: 19.14 },
  Russia: { lat: 61.52, lon: 105.32 },
  China: { lat: 35.86, lon: 104.19 },
  "South Korea": { lat: 35.91, lon: 127.77 },
  Singapore: { lat: 1.35, lon: 103.82 },
  "South Africa": { lat: -30.56, lon: 22.94 },
  Nigeria: { lat: 9.08, lon: 8.68 },
  Kenya: { lat: -0.02, lon: 37.91 },
  Argentina: { lat: -38.42, lon: -63.62 },
  Chile: { lat: -35.68, lon: -71.54 },
  Colombia: { lat: 4.57, lon: -74.3 },
  "New Zealand": { lat: -40.9, lon: 174.89 },
  Pakistan: { lat: 30.38, lon: 69.35 },
  Unknown: { lat: 0, lon: 0 },
};

// ── Convert lat/lon to 3D vector ──────────────────────────────
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// ── Place a glowing pin on the globe ─────────────────────────
function addPin(lat, lon, visits) {
  const size = Math.min(0.012 + visits * 0.003, 0.04);
  const geometry = new THREE.SphereGeometry(size, 8, 8);
  const material = new THREE.MeshPhongMaterial({
    color: 0xb5651d,
    emissive: 0xd4854a,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
  });

  const pin = new THREE.Mesh(geometry, material);
  const position = latLonToVector3(lat, lon, 1.02);
  pin.position.copy(position);
  globe.add(pin);

  // Outer glow ring
  const glowGeometry = new THREE.SphereGeometry(size * 2, 8, 8);
  const glowMaterial = new THREE.MeshPhongMaterial({
    color: 0xd4854a,
    transparent: true,
    opacity: 0.25,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.copy(position);
  globe.add(glow);
}

// ── Fetch visitor data and plot pins ─────────────────────────
async function loadVisitorData() {
  try {
    const response = await fetch("/.netlify/functions/get-stats");
    const data = await response.json();

    if (!data.success || !data.countrySummary) return;

    data.countrySummary.forEach(({ country, visits }) => {
      const coords = COUNTRY_COORDS[country];
      if (coords) {
        addPin(coords.lat, coords.lon, visits);
      }
    });

    // Update visitor count display
    const countEl = document.getElementById("globe-visitor-count");
    if (countEl) countEl.textContent = data.totals.visitors.toLocaleString();
  } catch (error) {
    console.warn("Could not load visitor data:", error.message);
    // Plot a default pin on Kansas so globe isn't empty
    addPin(37.69, -97.33, 1);
  }
}

// ── Handle window resize ──────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Animation Loop ────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ── Init ──────────────────────────────────────────────────────
loadVisitorData();
animate();
