<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // Importeer axios

const dashboardData = ref(null);
const error = ref(null);

// Functie om dashboard data op te halen (we gebruiken patiënt 1 als test)
const fetchDashboardData = async (patientId) => {
  try {
    // DIT IS DE BELANGRIJKE REGEL:
    // We roepen de backend API aan die op poort 3000 draait
    const response = await axios.get(`http://localhost:3000/api/patienten/${patientId}/dashboard`);
    dashboardData.value = response.data;
  } catch (err) {
    console.error('Fout bij ophalen data:', err);
    error.value = 'Data laden is mislukt. Draait de backend server (npm run dev in de backend map)?';
  }
};

// Roep de functie aan zodra het component op het scherm komt
onMounted(() => {
  // We gebruiken '1' (Freddy Voetballer) als voorbeeld
  // Later vervang je dit door de ID van de ingelogde gebruiker
  fetchDashboardData(1); 
});
</script>

<template>
  <main>
    <h1>Mijn Dashboard</h1>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="dashboardData">
      <h2>Welkom terug, {{ dashboardData.voornaam }} {{ dashboardData.achternaam }}!</h2>
      
      </div>
    
    <div v-else-if="!error">
      Dashboard data laden...
    </div>
  </main>
</template>

<style scoped>
/* Je kunt de oude styles in App.vue weghalen en deze gebruiken */
main {
  font-family: Arial, sans-serif;
  padding: 2rem;
}

.error-message {
  color: red;
  font-weight: bold;
  border: 1px solid red;
  padding: 1rem;
  background-color: #ffeeee;
}
</style>