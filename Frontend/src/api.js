// Frontend/src/api.js
import axios from 'axios'
// Zorg dat deze import de 'a' klein heeft
import { useAuthStore } from './stores/AuthStore' 

// Maak een nieuwe 'instance' van axios
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // De basis-URL voor al onze API calls
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dit is een 'interceptor'. 
// Deze functie wordt automatisch uitgevoerd vóórdat een API call wordt verzonden.
apiClient.interceptors.request.use(
  (config) => {
    // Haal de auth store op
    const AuthStore = useAuthStore()
    const token = AuthStore.token

    if (token) {
      // Voeg het token toe aan de 'Authorization' header
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient