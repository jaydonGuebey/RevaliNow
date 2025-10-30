<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../api' // Gebruik de beveiligde apiClient
import PijnGrafiek from '../components/PijnGrafiek.vue'
// Zorg dat deze import de 'a' klein heeft
import { useAuthStore } from '../stores/AuthStore'

const pijnScore = ref(5) 
const toelichting = ref('') 
const error = ref(null)
const successMessage = ref(null)
const loading = ref(true)
const allePijnscores = ref([]) 
const AuthStore = useAuthStore() // Haal de store op

// Helper om datum te formatteren
const formatDatumKort = (datumTijd) => {
  return new Date(datumTijd).toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Haal data op voor de grafiek
const fetchPijnData = async (patientId) => {
  loading.value = true
  try {
    const response = await apiClient.get(`/patienten/${patientId}/pijnindicaties`)
    allePijnscores.value = response.data
  } catch (err) {
    console.error('Fout bij ophalen pijndata:', err)
    error.value = 'Historische pijndata kon niet worden geladen.'
  } finally {
    loading.value = false
  }
}

// Formulier verzenden
const handleSubmit = async () => {
  error.value = null
  successMessage.value = null
  
  if (pijnScore.value < 0 || pijnScore.value > 10) {
    error.value = 'Pijnscore moet tussen 0 en 10 zijn.'
    return
  }
  
  try {
    // Haal de patientId uit de store
    const patientId = AuthStore.gebruiker?.patientId
    if (!patientId) {
      throw new Error('Geen patientId gevonden in token.')
    }
    
    // Gebruik apiClient en stuur de patientId mee in de body
    const response = await apiClient.post('/pijnindicaties', {
      patientId: patientId, 
      pijnScore: pijnScore.value,
      toelichting: toelichting.value
    })

    allePijnscores.value.push(response.data)
    pijnScore.value = 5
    toelichting.value = ''
    successMessage.value = 'Pijnindicatie succesvol opgeslagen!'

  } catch (err) {
    console.error('Fout bij opslaan pijnindicatie:', err)
    error.value = err.response?.data?.error || 'Er ging iets mis bij het opslaan.'
  }
}

// Data ophalen zodra de pagina laadt
onMounted(() => {
  const patientId = AuthStore.gebruiker?.patientId
  if (patientId) {
    fetchPijnData(patientId)
  }
})

// Data formattering voor het PijnGrafiek component
const computedChartData = computed(() => {
  return {
    labels: allePijnscores.value.map(p => formatDatumKort(p.DatumTijdRegistratie)),
    datasets: [
      {
        label: 'Pijnscore',
        backgroundColor: '#007bff',
        borderColor: '#007bff',
        tension: 0.2,
        data: allePijnscores.value.map(p => ({
            x: formatDatumKort(p.DatumTijdRegistratie),
            y: p.PijnScore,
            toelichting: p.Toelichting
        }))
      }
    ]
  }
})

</script>

<template>
  <main>
    <div class="page-grid">
      <div class="form-container widget">
        <h2>Pijn Registreren</h2>
        <p>Hoeveel pijn ervaar je op dit moment?</p>
        
        <form @submit.prevent="handleSubmit">
          
          <div class="form-group slider-group">
            <label for="pijnscore">Pijnscore: <strong>{{ pijnScore }} / 10</strong></label>
            <div class="slider-labels">
              <span>0 (Geen)</span>
              <span>10 (Ergst)</span>
            </div>
            <input 
              type="range" 
              id="pijnscore" 
              v-model.number="pijnScore" 
              min="0" 
              max="10" 
              step="1"
            />
          </div>
          
          <div class="form-group">
            <label for="toelichting">Toelichting (optioneel)</label>
            <textarea 
              id="toelichting" 
              v-model="toelichting"
              rows="3"
              placeholder="bv. Pijn na het traplopen"
            ></textarea>
          </div>
          
          <button type="submit" class="submit-knop">Opslaan</button>
          
          <div v-if="successMessage" class="message success">{{ successMessage }}</div>
          <div v-if="error" class="message error">{{ error }}</div>
        
        </form>
      </div>
      
      <div class="chart-wrapper">
        <h2>Pijnverloop</h2>
        <div v-if="loading">Grafiek laden...</div>
        <PijnGrafiek v-if="!loading && allePijnscores.length > 0" :chart-data="computedChartData" />
        <div v-if="!loading && allePijnscores.length === 0" class="no-data">
          Nog geen pijn geregistreerd.
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Alle stijlen voor PijnRegistratieView blijven hier ongewijzigd */
.page-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}
.widget {
  background-color: #ffffff;
  border: 1px solid #e0eaf1;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.widget h2 {
  margin-top: 0;
  color: #0056b3;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}
.slider-group label {
  margin-bottom: 1rem;
}
.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 0.25rem;
}
input[type="range"] {
  width: 100%;
  cursor: pointer;
}
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  box-sizing: border-box;
}
.submit-knop {
  width: 100%;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.85rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.submit-knop:hover {
  background-color: #0056b3;
}
.message {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}
.success {
  background-color: #e6f7ec;
  color: #155724;
  border: 1px solid #c3e6cb;
}
.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
.chart-wrapper h2 {
  color: #0056b3;
  margin-top: 0;
}
.no-data {
  text-align: center;
  font-size: 1.1rem;
  color: #777;
  padding: 3rem;
  background-color: #fff;
  border: 1px solid #e0eaf1;
  border-radius: 12px;
}
@media (max-width: 992px) {
  .page-grid {
    grid-template-columns: 1fr;
  }
}
</style>