// src/js/charts.js
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

/**
 * Hämtar antagningsstatistik HT2025 från public/admissions.json
 * @async
 * @returns {Promise<Object[]>} Array med objekt som innehåller typ, namn och totalt antal sökande
 */
async function fetchAdmissionsData() {
  try {
    const response = await fetch('/admissions.json'); // public/admissions.json
    if (!response.ok) throw new Error('HTTP error ' + response.status);
    return await response.json();
  } catch (error) {
    console.error('Kunde inte hämta data:', error);
    return [];
  }
}

/**
 * Skapar stapeldiagram för kurser
 * @param {Array<{name: string, applicantsTotal: number}>} courses Array med kursobjekt
 */
function createBarChart(courses) {
  const ctx = document.getElementById('barChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: courses.map(c => c.name),
      datasets: [{
        label: 'Antal sökande',
        data: courses.map(c => parseInt(c.applicantsTotal)),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: { responsive: true }
  });
}

/**
 * Skapar cirkeldiagram för program
 * @param {Array<{name: string, applicantsTotal: number}>} programs Array med programobjekt
 */
function createPieChart(programs) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  const colors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)'
  ];

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: programs.map(p => p.name),
      datasets: [{
        data: programs.map(p => parseInt(p.applicantsTotal)),
        backgroundColor: colors.slice(0, programs.length)
      }]
    },
    options: { responsive: true }
  });
}

/**
 * Initierar diagrammen på sidan
 * Hämtar data, filtrerar top 6 kurser och top 5 program, och skapar diagrammen.
 */
(async function initCharts() {
  const data = await fetchAdmissionsData();
  if (!data.length) return;

  const courses = data
    .filter(i => i.type === 'Kurs')
    .sort((a,b)=>parseInt(b.applicantsTotal)-parseInt(a.applicantsTotal))
    .slice(0,6);

  const programs = data
    .filter(i => i.type === 'Program')
    .sort((a,b)=>parseInt(b.applicantsTotal)-parseInt(a.applicantsTotal))
    .slice(0,5);

  createBarChart(courses);
  createPieChart(programs);
})();
