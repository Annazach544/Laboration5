// src/js/map.js

/**
 * Hämtar koordinater för en given plats via Nominatim API
 * @async
 * @param {string} query - Platsnamn att söka efter
 * @returns {Promise<{lat: number, lon: number}>} Objekt med latitud och longitud
 */
async function fetchCoordinates(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP error ' + response.status);

    const data = await response.json();
    if (data.length === 0) throw new Error('Inga resultat för platsen');

    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (error) {
    console.error('Kunde inte hämta koordinater:', error);
    return null;
  }
}

/**
 * Initierar Leaflet-kartan
 * @param {number} lat - Startlatitud
 * @param {number} lon - Startlongitud
 * @param {number} zoom - Zoomnivå
 * @returns {L.Map} Leaflet-kartobjekt
 */
function initMap(lat = 59.8586, lon = 17.6389, zoom = 13) {
  const map = L.map('map').setView([lat, lon], zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  return map;
}

/**
 * Lägger till markör på kartan
 * @param {L.Map} map - Leaflet-kartobjekt
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @param {string} [popupText] - Text som visas i popup
 * @returns {L.Marker} Markörobjekt
 */
function addMarker(map, lat, lon, popupText = '') {
  const marker = L.marker([lat, lon]).addTo(map);
  if (popupText) marker.bindPopup(popupText).openPopup();
  return marker;
}

/**
 * Hämtar användarens position via webbläsarens geolokalisering
 * @param {function({lat:number, lon:number}):void} callback - Funktion som körs vid lyckad position
 */
function getUserLocation(callback) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => console.error('Kunde inte hämta användarens position:', error)
    );
  } else {
    console.error('Geolokalisering stöds inte i denna webbläsare');
  }
}

// === INITIERA KARTA ===
document.addEventListener('DOMContentLoaded', () => {
  // Starta karta med standardposition (Mittuniversitetet, Sundsvall)
  const map = initMap(62.3908, 17.3069, 13);

  // Om användarens position finns, visa den
  getUserLocation(({ lat, lon }) => {
    map.setView([lat, lon], 13);
    addMarker(map, lat, lon, 'Din plats');
  });

  // Koppla sök-knapp
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    const coords = await fetchCoordinates(query);
    if (coords) {
      map.setView([coords.lat, coords.lon], 13);
      addMarker(map, coords.lat, coords.lon, query);
    }
  });
});