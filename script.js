let currentZoom = 1;
let panX = 0;
let panY = 0;
let isFullscreen = false;
let ticking = false;
let buildingsData = [];

function clampPan() {
  // Opcjonalna logika ograniczająca przesuwanie płótna
}

function updateStageTransform() {
  if (!ticking) {
    requestAnimationFrame(() => {
      clampPan();
      const displayZoom = Math.round(currentZoom * 100);
      const zoomValEl = document.getElementById('zoomVal');
      if (zoomValEl) {
        zoomValEl.innerText = (isNaN(displayZoom) ? 100 : displayZoom) + '%';
      }
      
      const stage = document.getElementById('stage');
      if (stage) {
        stage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentZoom})`;
        stage.style.setProperty('--inv-zoom', 1 / currentZoom);
      }
      ticking = false;
    });
    ticking = true;
  }
}

function fitToStage() {
  currentZoom = 1;
  panX = 0;
  panY = 0;
  updateStageTransform();
}

function toggleFullscreen() {
  const wrapper = document.getElementById('stageWrapper');
  const body = document.body;
  isFullscreen = !isFullscreen;
  
  if (wrapper) wrapper.classList.toggle('fullscreen', isFullscreen);
  if (body) body.classList.toggle('no-scroll', isFullscreen);
  
  fitToStage();
}

function initInteractions() {
  const wrapper = document.getElementById('stageWrapper');
  const showInfoCheckbox = document.getElementById('showInfoCheckbox');
  
  if (showInfoCheckbox) {
    showInfoCheckbox.addEventListener('change', (e) => {
      const stage = document.getElementById('stage');
      if (stage) {
        if (e.target.checked) {
          stage.classList.add('show-details');
        } else {
          stage.classList.remove('show-details');
        }
      }
    });
  }

  if (wrapper) {
    wrapper.addEventListener('wheel', (e) => {
      if (!isFullscreen) return;
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      currentZoom = Math.min(Math.max(0.2, currentZoom * zoomFactor), 5);
      updateStageTransform();
    }, { passive: false });
  }
}

function addToStage(building) {
  const stage = document.getElementById('stage');
  if (!stage) return;
  
  const item = document.createElement('div');
  item.className = 'building-item';
  
  const built = building.year_built || building.built || 'Brak danych';
  const h_m = building.height_m || 'Brak danych';
  const h_ft = building.height_ft || (building.height_m ? Math.round(building.height_m * 3.28084) : 'Brak danych');

  item.innerHTML = `
    <button class="remove-btn" onclick="this.parentElement.remove(); fitToStage();">❌</button>
    <div class="building-info">
      <strong>${building.name}</strong>
      <div class="extra-info">
        <strong>Zbudowano:</strong> ${built}<br>
        <strong>Wysokość:</strong> ${h_m} m / ${h_ft} ft
      </div>
    </div>
    <img src="${building.image_2d}" alt="${building.name}">
  `;

  const img = item.querySelector('img');
  if (img) img.onload = () => fitToStage();

  stage.appendChild(item);
  fitToStage();
}

function renderGrid(data) {
  const grid = document.getElementById('buildingsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  data.forEach(b => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => addToStage(b);
    card.innerHTML = `<img src="${b.thumbnail}" alt="${b.name}"><h3>${b.name}</h3>`;
    grid.appendChild(card);
  });
}

function setupFilters() {
  const catSelect = document.getElementById('categoryFilter');
  const countrySelect = document.getElementById('countryFilter');

  if (!catSelect || !countrySelect) return;

  const categories = [...new Set(buildingsData.map(b => b.category))].filter(Boolean);
  const countries = [...new Set(buildingsData.map(b => b.country))].filter(Boolean);

  catSelect.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(c => catSelect.innerHTML += `<option value="${c}">${c}</option>`);

  countrySelect.innerHTML = '<option value="">All Countries</option>';
  countries.forEach(c => countrySelect.innerHTML += `<option value="${c}">${c}</option>`);

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', filterData);
  catSelect.addEventListener('change', filterData);
  countrySelect.addEventListener('change', filterData);
}

function filterData() {
  const searchInput = document.getElementById('searchInput');
  const catSelect = document.getElementById('categoryFilter');
  const countrySelect = document.getElementById('countryFilter');

  const search = searchInput ? searchInput.value.toLowerCase() : '';
  const cat = catSelect ? catSelect.value : '';
  const country = countrySelect ? countrySelect.value : '';

  const filtered = buildingsData.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search);
    const matchCat = !cat || b.category === cat;
    const matchCountry = !country || b.country === country;
    return matchSearch && matchCat && matchCountry;
  });

  renderGrid(filtered);
}

async function loadData() {
  try {
    const response = await fetch('./budynki.json');
    if (!response.ok) throw new Error('Nie znaleziono pliku budynki.json');
    buildingsData = await response.json();
    renderGrid(buildingsData);
    setupFilters();
    initInteractions();
  } catch (error) {
    console.error('Błąd ładowania danych JSON:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadData);
