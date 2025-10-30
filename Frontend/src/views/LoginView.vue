<script setup>
import { ref } from 'vue'
// Zorg dat deze import de 'a' klein heeft
import { useAuthStore } from '../stores/AuthStore'

const AuthStore = useAuthStore()
const gebruikersnaam = ref('freddy') // Standaard ingevuld voor testgemak
const wachtwoord = ref('freddy123') // Standaard ingevuld voor testgemak
const error = ref(null)
const loading = ref(false)

const handleLogin = async () => {
  error.value = null
  loading.value = true
  try {
    // Roep de 'login' actie in de store aan
    await AuthStore.login(gebruikersnaam.value, wachtwoord.value)
    // De store regelt zelf de redirect naar het dashboard
  } catch (err) {
    // Vang de fout op die de store gooit
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-container widget">
      <h2>Inloggen RevaliNow</h2>
      <p>Log in met je patiënt-account.</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="gebruikersnaam">Gebruikersnaam</label>
          <input type="text" id="gebruikersnaam" v-model="gebruikersnaam" required />
        </div>
        <div class="form-group">
          <label for="wachtwoord">Wachtwoord</label>
          <input type="password" id="wachtwoord" v-model="wachtwoord" required />
        </div>
        
        <button type="submit" class="submit-knop" :disabled="loading">
          {{ loading ? 'Bezig...' : 'Inloggen' }}
        </button>
        
        <div v-if="error" class="message error">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Gedeelde widget-stijl */
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

.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* Override de :deep(main) padding */
  padding: 0 !important; 
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
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
}
.submit-knop:disabled {
  background-color: #ccc;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
}
.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>