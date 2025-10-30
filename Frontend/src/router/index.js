import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import OefeningenView from '../views/OefeningenView.vue'
import PijnRegistratieView from '../views/PijnRegistratieView.vue'
import LogboekView from '../views/LogboekView.vue'

// Importeer de nieuwe afspraken view
import AfsprakenView from '../views/AfsprakenView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/oefeningen',
      name: 'oefeningen',
      component: OefeningenView
    },
    {
      path: '/logboek',
      name: 'logboek',
      component: LogboekView 
    },
    {
      path: '/pijnregistratie',
      name: 'pijnregistratie',
      component: PijnRegistratieView
    },
    {
      // Vervang de placeholder door de echte view
      path: '/afspraken',
      name: 'afspraken',
      component: AfsprakenView 
    }
  ],
})

export default router