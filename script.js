 clampPan();
      const displayZoom = Math.round(currentZoom * 100);
      document.getElementById('zoomVal').innerText = (isNaN(displayZoom) ? 100 : displayZoom) + '%';
      
      const stage = document.getElementById('stage');
      stage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentZoom})`;
      
      // PRZEKAZUJEMY ODWROTNOŚĆ SKALI DO CSS (do utrzymania stałego rozmiaru dymków)
      stage.style.setProperty('--inv-zoom', 1 / currentZoom);
      
      document.getElementById('stage').style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentZoom})`;
      ticking = false;
    });
    ticking = true;
@@ -103,18 +97,6 @@
function initInteractions() {
  const wrapper = document.getElementById('stageWrapper');

  const showInfoCheckbox = document.getElementById('showInfoCheckbox');
  if(showInfoCheckbox) {
    showInfoCheckbox.addEventListener('change', (e) => {
      const stage = document.getElementById('stage');
      if (e.target.checked) {
        stage.classList.add('show-details');
      } else {
        stage.classList.remove('show-details');
      }
    });
  }

  wrapper.addEventListener('wheel', (e) => {
    if (!isFullscreen) return;
    e.preventDefault();
@@ -247,73 +229,65 @@
  const stage = document.getElementById('stage');
  const item = document.createElement('div');
  item.className = 'building-item';
  
  const built = building.built || 'Brak danych';
  const h_m = building.height_m || 'Brak danych';
  const h_ft = building.height_ft || 'Brak danych';

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
  img.onload = () => fitToStage();

  stage.appendChild(item);
  fitToStage();
}

function renderGrid(data) {
  const grid = document.getElementById('buildingsGrid');
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

  const categories = [...new Set(buildingsData.map(b => b.category))].filter(Boolean);
  const countries = [...new Set(buildingsData.map(b => b.country))].filter(Boolean);

  catSelect.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(c => catSelect.innerHTML += `<option value="${c}">${c}</option>`);

  countrySelect.innerHTML = '<option value="">All Countries</option>';
  countries.forEach(c => countrySelect.innerHTML += `<option value="${c}">${c}</option>`);

  document.getElementById('searchInput').addEventListener('input', filterData);
  catSelect.addEventListener('change', filterData);
  countrySelect.addEventListener('change', filterData);
}

function filterData() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const country = document.getElementById('countryFilter').value;

  const filtered = buildingsData.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search);
    const matchCat = !cat || b.category === cat;
    const matchCountry = !country || b.country === country;
    return matchSearch && matchCat && matchCountry;
  });

  renderGrid(filtered);
}

loadData();
