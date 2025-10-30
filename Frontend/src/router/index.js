import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import OefeningenView from '../views/OefeningenView.vue'

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
      component: OefeningenView // <-- Hier stond eerst de placeholder
    },
    {
      path: '/logboek',
      name: 'logboek',
      component: { template: '<div>Logboek Pagina</div>' } // Tijdelijk
    },
    {
      path: '/pijnregistratie',
      name: 'pijnregistratie',
      component: { template: '<div>Pijnregistratie Pagina</div>' } // Tijdelijk
    },
    {
      path: '/afspraken',
      name: 'afspraken',
      component: { template: '<div>Afspraken Pagina</div>' } // Tijdelijk
    }
  ],
})

export default router