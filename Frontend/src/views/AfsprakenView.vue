<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import AfspraakKaart from '../components/AfspraakKaart.vue'

const alleAfspraken = ref([])
const loading = ref(true)
const error = ref(null)

// (AC 3) State om de actieve filter (tab) bij te houden
const actieveFilter = ref('toekomstig') // 'toekomstig' of 'verleden'

// Haal alle afspraken (verleden en toekomst) op van de API
async function fetchAfspraken(patientId) {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get(`http://localhost:3000/api/patienten/${patientId}/afspraken`)
    alleAfspraken.value = response.data
  } catch (err) {
    console.error('Fout bij ophalen afspraken:', err)
    error.value = 'Afspraken konden niet worden geladen.'
  } finally {
    loading.value = false
  }
}

// (AC 1) Maak een gefilterde lijst voor toekomstige afspraken
const toekomstigeAfspraken = computed(() => {
  const nu = new Date()
  return alleAfspraken.value
    .filter(a => new Date(a.DatumTijdAfspraak) >= nu)
    .sort((a, b) => new Date(a.DatumTijdAfspraak) - new Date(b.DatumTijdAfspraak)); // Sorteer oplopend (dichtstbijzijnde eerst)
})

// (AC 3) Maak een gefilterde lijst voor afspraken in het verleden
const afsprakenVerleden = computed(() => {
  const nu = new Date()
  return alleAfspraken.value
    .filter(a => new Date(a.DatumTijdAfspraak) < nu)
    // Sortering staat al op DESC (nieuwste eerst) vanuit de API
})

onMounted(() => {
  fetchAfspraken(1)
})
</script>

<template>
  <main>
    <h1>Mijn Afspraken</h1>
    <p>Bekijk hier je geplande en afgelopen afspraken.</p>

    <div class="filter-tabs">
      <button 
        @click="actieveFilter = 'toekomstig'"
        :class="{ 'actief': actieveFilter === 'toekomstig' }"
      >
        Toekomstig ({{ toekomstigeAfspraken.length }})
      </button>
      <button 
        @click="actieveFilter = 'verleden'"
        :class="{ 'actief': actieveFilter === 'verleden' }"
      >
        Verleden ({{ afsprakenVerleden.length }})
      </button>
    </div>

    <div v-if="loading" class="loading">Afspraken laden...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && actieveFilter === 'toekomstig'" class="afspraken-lijst">
      <div v-if="toekomstigeAfspraken.length > 0">
        <AfspraakKaart
          v-for="afspraak in toekomstigeAfspraken"
          :key="afspraak.AfspraakID"
          :afspraak="afspraak"
        />
      </div>
      <div v-else class="no-data">
        Je hebt geen toekomstige afspraken gepland.
      </div>
    </div>

    <div v-if="!loading && actieveFilter === 'verleden'" class="afspraken-lijst">
       <div v-if="afsprakenVerleden.length > 0">
        <AfspraakKaart
          v-for="afspraak in afsprakenVerleden"
          :key="afspraak.AfspraakID"
          :afspraak="afspraak"
        />
      </div>
      <div v-else class="no-data">
        Je hebt nog geen afspraken in het verleden.
      </div>
    </div>
  </main>
</template>

<style scoped>
h1 {
  color: #0056b3;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0eaf1;
}

.filter-tabs button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  background-color: transparent;
  color: #555;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.filter-tabs button:hover {
  color: #007bff;
}

.filter-tabs button.actief {
  color: #007bff;
  border-bottom-color: #007bff;
}

.loading, .no-data {
  text-align: center;
  font-size: 1.1rem;
  color: #777;
  padding: 3rem;
  background-color: #fff;
  border: 1px solid #e0eaf1;
  border-radius: 12px;
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