// Frontend/src/stores/AuthStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useRouter } from 'vue-router'

// We gebruiken 'defineStore' om een nieuwe store te maken
export const useAuthStore = defineStore('auth', {
  // 'state' bevat alle data
  state: () => ({
    // Haal het token uit de localStorage om ingelogd te blijven
    token: localStorage.getItem('token') || null,
  }),
  
  // 'getters' zijn berekende properties, zoals 'isLoggedIn'
  getters: {
    // Checkt of er een token is
    isLoggedIn: (state) => !!state.token,

    // Leest de data (payload) uit het token
    gebruiker: (state) => {
      if (!state.token) return null
      try {
        // Decodeer het middelste deel van het JWT (Base64)
        const payload = JSON.parse(atob(state.token.split('.')[1]))
        return payload
      } catch (e) {
        console.error('Fout bij decoderen token:', e)
        return null
      }
    },
    
    // Een helper die de 'Authorization' header maakt voor API calls
    authHeader: (state) => {
      return { Authorization: `Bearer ${state.token}` }
    }
  },
  
  // 'actions' zijn de functies die de state kunnen aanpassen
  actions: {
    // De inlog-actie
    async login(gebruikersnaam, wachtwoord) {
      // Haal de router op om te kunnen navigeren
      const router = useRouter() 

      try {
        // Roep de backend login route aan
        const response = await axios.post('http://localhost:3000/api/login', {
          gebruikersnaam,
          wachtwoord,
        })

        // Sla het ontvangen token op in de state
        this.token = response.data.token
        // Sla het ook op in localStorage voor persistentie
        localStorage.setItem('token', response.data.token)
        
        // Stuur de gebruiker naar het dashboard
        router.replace('/')

      } catch (error) {
        console.error('Login mislukt:', error)
        // Gooi een error zodat de LoginView deze kan opvangen
        throw new Error('Inloggen mislukt. Controleer je gegevens.')
      }
    },
    
    // De uitlog-actie
    logout() {
      const router = useRouter()

      // Maak alles leeg
      this.token = null
      localStorage.removeItem('token')
      
      // Stuur de gebruiker terug naar de login-pagina
      router.replace('/login')
    },
  },
})