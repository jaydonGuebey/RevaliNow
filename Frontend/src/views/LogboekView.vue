<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../api' // Gebruik de beveiligde apiClient
import LogboekItem from '../components/LogboekItem.vue' 
// Zorg dat deze import de 'a' klein heeft
import { useAuthStore } from '../stores/AuthStore'

const logboekItems = ref([])
const newBeschrijving = ref('')
const error = ref(null)
const loading = ref(true)
const AuthStore = useAuthStore() // Haal de store op

// Haal alle logboek items op
async function fetchLogboek(patientId) {
  loading.value = true
  error.value = null
  try {
    const response = await apiClient.get(`/patienten/${patientId}/logboek`)
    logboekItems.value = response.data
  } catch (err) {
    console.error('Fout bij ophalen logboek:', err)
    error.value = 'Logboek kon niet worden geladen.'
  } finally {
    loading.value = false
  }
}

// Voeg een nieuw item toe
async function handleToevoegen() {
  if (newBeschrijving.value.trim() === '') {
    error.value = 'Beschrijving mag niet leeg zijn.'
    return
  }
  error.value = null

  try {
    const patientId = AuthStore.gebruiker?.patientId
    if (!patientId) {
      throw new Error('Geen patientId gevonden in token.')
    }

    const response = await apiClient.post('/logboek', {
      patientId: patientId,
      beschrijving: newBeschrijving.value
    })
    
    logboekItems.value.unshift(response.data)
    newBeschrijving.value = '' 
  } catch (err) {
    console.error('Fout bij toevoegen logboekitem:', err)
    error.value = 'Item kon niet worden opgeslagen.'
  }
}

// Verwijder een item
async function handleVerwijder(logboekId) {
  try {
    await apiClient.delete(`/logboek/${logboekId}`)
    logboekItems.value = logboekItems.value.filter(item => item.LogboekID !== logboekId)
  } catch (err) {
    console.error('Fout bij verwijderen:', err)
    error.value = 'Item kon niet worden verwijderd.'
  }
}

// Bewerk een item
async function handleUpdate(logboekId, beschrijving) {
  try {
    await apiClient.put(`/logboek/${logboekId}`, {
      beschrijving: beschrijving
    })
    const index = logboekItems.value.findIndex(item => item.LogboekID === logboekId)
    if (index !== -1) {
      logboekItems.value[index].Beschrijving = beschrijving
    }
  } catch (err) {
    console.error('Fout bij updaten:', err)
    error.value = 'Item kon niet worden bijgewerkt.'
  }
}

// Haal de data op als de pagina laadt
onMounted(() => {
  const patientId = AuthStore.gebruiker?.patientId
  if (patientId) {
    fetchLogboek(patientId)
  }
})
</script>

<template>
  <main>
    <h1>Mijn Logboek</h1>
    <p>Houd hier je dagelijkse "huis-tuin-keuken" activiteiten bij.</p>

    <form @submit.prevent="handleToevoegen" class="nieuw-item-form widget">
      <h2>Nieuwe activiteit</h2>
      <div class="form-group">
        <label for="beschrijving">Beschrijf je activiteit:</label>
        <textarea 
          id="beschrijving" 
          v-model="newBeschrijving" 
          rows="3"
          placeholder="bv. Boodschappen gedaan, 20 minuten gewandeld..."
        ></textarea>
      </div>
      <button type="submit" class="submit-knop">Voeg toe aan logboek</button>
      <div v-if="error" class="message error">{{ error }}</div>
    </form>

    <div class="log-lijst">
      <h2>Eerdere activiteiten</h2>
      <div v-if="loading">Logboek laden...</div>
      <ul v-if="!loading && logboekItems.length > 0">
        <LogboekItem 
          v-for="item in logboekItems"
          :key="item.LogboekID"
          :log-item="item"
          @verwijder="handleVerwijder"
          @update="handleUpdate"
        />
      </ul>
      <div v-if="!loading && logboekItems.length === 0" class="no-data">
        Je hebt nog geen activiteiten gelogd.
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Alle stijlen voor LogboekView blijven hier ongewijzigd */
h1 {
  color: #0056b3;
}
.widget {
  background-color: #ffffff;
  border: 1px solid #e0eaf1;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
}
.widget h2 {
  margin-top: 0;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
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
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
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
.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
.log-lijst ul {
  padding: 0;
  margin: 0;
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
</style>