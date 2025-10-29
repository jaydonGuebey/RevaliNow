<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app-layout">
    <header>
      <div class="logo">RevaliNow</div>
      <nav>
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/oefeningen">Mijn Oefeningen</RouterLink>
        <RouterLink to="/logboek">Logboek</RouterLink>
        <RouterLink to="/pijnregistratie">Pijn Registreren</RouterLink>
        <RouterLink to="/afspraken">Afspraken</RouterLink>
      </nav>
    </header>

    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style>
/* Globale stijlen (niet 'scoped') voor een cleane basis */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f4f7f6; /* Hele lichte, neutrale achtergrond */
  color: #333;
}
</style>

<style scoped>
/* Stijlen specifiek voor App.vue */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2.5rem;
  background-color: #007bff; /* Een heldere, cleane blauw */
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

/* Stijl voor de actieve route */
nav a.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Hover-effect voor niet-actieve links */
nav a:not(.router-link-exact-active):hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.content {
  padding: 2.5rem;
  max-width: 1300px;
  margin: 0 auto;
}
</style>