import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import OefeningenView from '../views/OefeningenView.vue'
import PijnRegistratieView from '../views/PijnRegistratieView.vue'

// Importeer de nieuwe logboek view
import LogboekView from '../views/LogboekView.vue'

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
      // Vervang de placeholder door de echte view
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
      path: '/afspraken',
      name: 'afspraken',
      component: { template: '<div>Afspraken Pagina</div>' } // Tijdelijk
    }
  ],
})

export default router