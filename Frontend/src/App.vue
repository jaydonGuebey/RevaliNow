<script setup>
import { RouterLink, RouterView } from 'vue-router'
// Zorg dat deze import de 'a' klein heeft
import { useAuthStore } from './stores/AuthStore'

const AuthStore = useAuthStore()
</script>

<template>
  <div id="app-layout">
    <header v-if="AuthStore.isLoggedIn">
      <div class="logo">RevaliNow</div>
      <nav>
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/oefeningen">Mijn Oefeningen</RouterLink>
        <RouterLink to="/logboek">Logboek</RouterLink>
        <RouterLink to="/pijnregistratie">Pijn Registreren</RouterLink>
        <RouterLink to="/afspraken">Afspraken</RouterLink>
      </nav>
      <button @click="AuthStore.logout()" class="logout-knop">Uitloggen</button>
    </header>

    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style>
/* Globale stijlen */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f4f7f6; 
  color: #333;
}
</style>

<style scoped>
/* Stijlen voor de header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2.5rem;
  background-color: #007bff; 
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.logo {
  font-size: 1.6rem;
  font-weight: 600;
}
nav {
  display: flex;
  gap: 1rem;
  flex-grow: 1; 
  margin-left: 2rem;
}
nav a {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}
nav a.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.2);
}
nav a:not(.router-link-exact-active):hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-knop {
  background-color: transparent;
  border: 1px solid #fff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.logout-knop:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.content {
  max-width: 1300px;
  margin: 0 auto;
}

/* Deze :deep() selector zorgt ervoor dat alle <main> tags
  (zoals in DashboardView, OefeningenView, etc.) de padding krijgen,
  maar de LoginView (die geen <main> tag heeft) niet.
*/
:deep(main) {
  padding: 2.5rem;
}
</style>