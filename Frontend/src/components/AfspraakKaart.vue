<script setup>
import { computed } from 'vue'

const props = defineProps({
  afspraak: {
    type: Object,
    required: true
  }
})

// Check of de afspraak in het verleden ligt voor styling
const isVerleden = computed(() => {
  return new Date(props.afspraak.DatumTijdAfspraak) < new Date()
})

// Helper om datum en tijd netjes te splitsen en te tonen
const formatDatum = computed(() => {
  const datum = new Date(props.afspraak.DatumTijdAfspraak)
  return datum.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
})

const formatTijd = computed(() => {
  const datum = new Date(props.afspraak.DatumTijdAfspraak)
  return datum.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<template>
  <div class="afspraak-kaart" :class="{ 'is-verleden': isVerleden }">
    <div class="tijd-blok">
      <span class="tijd">{{ formatTijd }}</span>
      <span class="datum">{{ formatDatum }}</span>
    </div>
    <div class="info-blok">
      <h3 class="type">{{ afspraak.TypeAfspraak }}</h3>
      <span class="arts">met Dr. {{ afspraak.Voornaam }} {{ afspraak.Achternaam }}</span>
    </div>
    <div v="if" class="status-blok">
      <span v-if="isVerleden" class="status-badge verleden">Afgerond</span>
      <span v-else class="status-badge gepland">Gepland</span>
    </div>
  </div>
</template>

<style scoped>
.afspraak-kaart {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: #fff;
  border: 1px solid #e0eaf1;
  border-left: 5px solid #007bff; /* Blauw voor gepland */
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* (AC 3) Aparte stijl voor afspraken in het verleden */
.afspraak-kaart.is-verleden {
  border-left-color: #6c757d; /* Grijs voor verleden */
  opacity: 0.8;
}
.afspraak-kaart.is-verleden .tijd {
  color: #6c757d;
}
.afspraak-kaart.is-verleden .type {
  color: #555;
}


.tijd-blok {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 1.5rem;
  border-right: 1px solid #f0f0f0;
  min-width: 150px;
}

.tijd {
  font-size: 1.75rem;
  font-weight: 700;
  color: #007bff;
}

.datum {
  font-size: 0.9rem;
  color: #555;
  text-transform: capitalize;
}

.info-blok {
  flex-grow: 1;
}

.type {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  color: #333;
}

.arts {
  font-size: 1rem;
  color: #555;
  font-weight: 500;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}
.gepland {
  background-color: #e6f2ff;
  color: #0056b3;
}
.verleden {
  background-color: #f8f9fa;
  color: #6c757d;
}
</style>