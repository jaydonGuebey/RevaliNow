// Frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
// Zorg dat deze import de 'a' klein heeft
import { useAuthStore } from '../stores/AuthStore'

// Importeer alle views
import DashboardView from '../views/DashboardView.vue'
import OefeningenView from '../views/OefeningenView.vue'
import PijnRegistratieView from '../views/PijnRegistratieView.vue'
import LogboekView from '../views/LogboekView.vue'
import AfsprakenView from '../views/AfsprakenView.vue'
import LoginView from '../views/LoginView.vue' 

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false } // Deze pagina vereist géén login
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true } // Deze pagina vereist wél login
  },
  {
    path: '/oefeningen',
    name: 'oefeningen',
    component: OefeningenView,
    meta: { requiresAuth: true }
  },
  {
    path: '/logboek',
    name: 'logboek',
    component: LogboekView,
    meta: { requiresAuth: true }
  },
  {
    path: '/pijnregistratie',
    name: 'pijnregistratie',
    component: PijnRegistratieView,
    meta: { requiresAuth: true }
  },
  {
    path: '/afspraken',
    name: 'afspraken',
    component: AfsprakenView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Dit is de 'Navigation Guard' (de frontend "poortwachter")
router.beforeEach((to, from, next) => {
  const AuthStore = useAuthStore()
  const isLoggedIn = AuthStore.isLoggedIn

  // Als de pagina login vereist en de gebruiker is NIET ingelogd
  if (to.meta.requiresAuth && !isLoggedIn) {
    // Stuur naar de login pagina
    next({ name: 'login' })
  } 
  // Als de gebruiker naar de login pagina wil, maar al ingelogd IS
  else if (to.name === 'login' && isLoggedIn) {
    // Stuur naar het dashboard
    next({ name: 'dashboard' })
  } 
  // Anders, laat de gebruiker door
  else {
    next()
  }
})

export default router