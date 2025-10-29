import { createRouter, createWebHistory } from 'vue-router'
// Importeer je nieuwe view
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    // Voorbeeld routes voor AC 5 (Navigatie)
    // Deze componenten moet je nog aanmaken (bv. in /views/ map)
    {
      path: '/oefeningen',
      name: 'oefeningen',
      // component: () => import('../views/OefeningenView.vue') // Lazy loaded
      component: { template: '<div>Oefeningen Pagina</div>' } // Tijdelijk
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