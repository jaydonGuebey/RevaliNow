<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '../api'; // Gebruik de beveiligde apiClient
import OefeningKaart from '../components/OefeningKaart.vue';
// Zorg dat deze import de 'a' klein heeft
import { useAuthStore } from '../stores/AuthStore'; 

const oefenplannen = ref([]); 
const error = ref(null);
const loading = ref(true);
const filterStatus = ref('all'); 
const AuthStore = useAuthStore(); // Haal de store op

// Haal data op van de nieuwe API
const fetchOefenplannen = async (patientId) => {
  loading.value = true;
  error.value = null;
  try {
    // Gebruik de beveiligde apiClient en relatieve URL
    const response = await apiClient.get(`/patienten/${patientId}/oefenplannen`);
    oefenplannen.value = response.data;
  } catch (err) {
    console.error('Fout bij ophalen oefenplannen:', err);
    error.value = 'Oefenplannen laden is mislukt.';
  } finally {
    loading.value = false;
  }
};

// Filter logica
const gefilterdeOefeningen = computed(() => {
  if (filterStatus.value === 'todo') {
    return oefenplannen.value.filter(oef => !oef.IsVandaagAfgerond);
  }
  if (filterStatus.value === 'done') {
    return oefenplannen.value.filter(oef => oef.IsVandaagAfgerond);
  }
  return oefenplannen.value;
});

// Handler voor 'Vink af'
const handleVinkAf = async (planId) => {
  try {
    // Gebruik apiClient
    await apiClient.post('/uitgevoerde-oefeningen', { 
      patientOefenplanId: planId 
    });

    // Update de lokale state
    const oefening = oefenplannen.value.find(oef => oef.PatientOefenplanID === planId);
    if (oefening) {
      oefening.IsVandaagAfgerond = true;
    }

  } catch (err) {
    if (err.response && err.response.status === 409) {
      const oefening = oefenplannen.value.find(oef => oef.PatientOefenplanID === planId);
      if (oefening) oefening.IsVandaagAfgerond = true;
    } else {
      console.error('Fout bij afvinken:', err);
      alert('Er ging iets mis bij het afvinken. Probeer het opnieuw.');
    }
  }
};

// Handler voor 'Ongedaan maken'
const handleOngedaan = async (planId) => {
  try {
    // Gebruik apiClient
    await apiClient.delete('/uitgevoerde-oefeningen', { 
      data: { patientOefenplanId: planId }
    });

    // Update de lokale state
    const oefening = oefenplannen.value.find(oef => oef.PatientOefenplanID === planId);
    if (oefening) {
      oefening.IsVandaagAfgerond = false;
    }

  } catch (err) {
    console.error('Fout bij ongedaan maken:', err);
    alert('Er ging iets mis bij het ongedaan maken. Probeer het opnieuw.');
  }
};

// Haal data op bij het laden van de pagina
onMounted(() => {
  // Haal de patientId veilig uit de store
  const patientId = AuthStore.gebruiker?.patientId;
  if(patientId) {
    fetchOefenplannen(patientId);
  }
});
</script>

<template>
  <main>
    <header class="page-header">
      <h1>Mijn Oefeningen</h1>
      <div class="filter-controls">
        <label>
          <input type="radio" v-model="filterStatus" value="all" name="filter" />
          <span>Alles</span>
        </label>
        <label>
          <input type="radio" v-model="filterStatus" value="todo" name="filter" />
          <span>Nog te doen</span>
        </label>
        <label>
          <input type="radio" v-model="filterStatus" value="done" name="filter" />
          <span>Vandaag afgerond</span>
        </label>
      </div>
    </header>

    <div v-if="loading" class="loading">Oefeningen laden...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="oefeningen-lijst">
      <div v-if="gefilterdeOefeningen.length > 0">
        <OefeningKaart
          v-for="oefening in gefilterdeOefeningen"
          :key="oefening.PatientOefenplanID"
          :oefening="oefening" 
          @vink-af="handleVinkAf"
          @maak-ongedaan="handleOngedaan"
        />
      </div>
      <div v-else class="no-results">
        <p>Geen oefeningen gevonden die aan je filter voldoen.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Alle stijlen voor OefeningenView blijven hier ongewijzigd */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0eaf1;
  padding-bottom: 1.5rem;
}
.page-header h1 {
  margin: 0;
  color: #0056b3;
}
.filter-controls {
  display: flex;
  gap: 0.5rem;
  background-color: #e6f2ff;
  border-radius: 8px;
  padding: 0.5rem;
}
.filter-controls label {
  display: flex;
  align-items: center;
  position: relative;
}
.filter-controls input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.filter-controls span {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: #0056b3;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}
.filter-controls input:checked + span {
  background-color: #007bff;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
}
.loading, .no-results {
  text-align: center;
  font-size: 1.2rem;
  color: #777;
  padding: 3rem;
}
.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1.5rem;
  border-radius: 12px;
  font-weight: 500;
}
</style>