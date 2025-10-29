<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; 

const dashboardData = ref(null);
const error = ref(null);

const fetchDashboardData = async (patientId) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/patienten/${patientId}/dashboard`);
    dashboardData.value = response.data;
  } catch (err) {
    console.error('Fout bij ophalen data:', err);
    error.value = 'Data laden is mislukt. Draait de backend server?';
  }
};

onMounted(() => {
  fetchDashboardData(1); 
});

const formatDatum = (datumTijd) => {
  if (!datumTijd) return '';
  // Opties voor een kortere, cleanere datum/tijd
  const options = {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(datumTijd).toLocaleString('nl-NL', options);
};
</script>

<template>
  <main class="dashboard">
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="dashboardData" class="dashboard-grid">
      <div class="widget welkom">
        <h2>Welkom terug, {{ dashboardData.voornaam }}!</h2>
        <p>Hier is een overzicht van je revalidatie.</p>
      </div>

      <div class="widget afspraak">
        <h3>Eerstvolgende Afspraak</h3>
        <div v-if="dashboardData.volgendeAfspraak">
          <p class="widget-data">{{ dashboardData.volgendeAfspraak.TypeAfspraak }}</p>
          <p class="widget-meta">{{ formatDatum(dashboardData.volgendeAfspraak.DatumTijdAfspraak) }}</p>
        </div>
        <div v-else>
          <p class="widget-meta">Geen afspraken gepland.</p>
        </div>
      </div>

      <div class="widget pijn">
        <h3>Recente Pijnindicaties</h3>
        <ul v-if="dashboardData.recentePijnindicaties.length > 0">
          <li v-for="pijn in dashboardData.recentePijnindicaties" :key="pijn.DatumTijdRegistratie">
            <span class="pijn-score">{{ pijn.PijnScore }}/10</span>
            <span class="widget-meta">{{ formatDatum(pijn.DatumTijdRegistratie) }}</span>
          </li>
        </ul>
        <div v-else>
          <p class="widget-meta">Nog geen pijn geregistreerd.</p>
        </div>
      </div>

      <div class="widget oefeningen">
        <h3>Oefeningen voor Vandaag</h3>
        <ul v-if="dashboardData.oefeningenVandaag.length > 0">
          <li v-for="oefening in dashboardData.oefeningenVandaag" :key="oefening.Naam">
            <span class="widget-data">{{ oefening.Naam }}</span>
            <span class="widget-meta">{{ oefening.Sets }} sets x {{ oefening.Herhalingen }} herhalingen</span>
          </li>
        </ul>
        <div v-else>
          <p class="widget-meta">Geen oefeningen voor vandaag.</p>
        </div>
      </div>

    </div>
    
    <div v-else-if="!error" class="loading">
      Dashboard data laden...
    </div>
  </main>
</template>

<style scoped>
/* H1 weghalen, de welkom-widget is nu de titel */
h1 {
  display: none;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.widget {
  background-color: #ffffff;
  border: 1px solid #e0eaf1; /* Lichte blauw-grijze rand */
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}


.widget h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #007bff; /* Blauwe titels */
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Stijlen voor data en metadata in widgets */
.widget-data {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.25rem 0;
}

.widget-meta {
  font-size: 0.9rem;
  color: #777;
  margin: 0;
}

/* Specifieke widget stijlen */
.widget.welkom {
  grid-column: 1 / -1; /* Volle breedte */
  background: linear-gradient(to right, #e6f2ff, #f0f7ff);
  border-color: #d1e7ff;
}

.widget.welkom h2 {
  margin-top: 0;
  margin-bottom: 0.25rem;
  color: #0056b3; /* Donkerder blauw */
  font-size: 2rem;
  font-weight: 700;
}
.widget.welkom p {
  font-size: 1.1rem;
  color: #0056b3;
  margin: 0;
}

/* Pijn & Oefeningen lijsten */
.widget ul {
  padding-left: 0;
  margin: 0;
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.widget ul li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f4f4f4;
}
.widget ul li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.pijn-score {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0056b3;
  background-color: #e6f2ff;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}

/* Error & Loading */
.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.loading {
  font-size: 1.2rem;
  color: #555;
  text-align: center;
  padding: 3rem;
}
</style>