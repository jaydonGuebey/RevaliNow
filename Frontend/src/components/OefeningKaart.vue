<script setup>
import { computed } from 'vue';

// Dit component verwacht een 'oefening' object als "prop"
const props = defineProps({
  oefening: {
    type: Object,
    required: true
  }
});

// Definieer de events die dit component kan 'uitzenden'
const emit = defineEmits(['vink-af']);

// Roept het 'vink-af' event aan met de ID van deze oefening
const onVinkAfClick = () => {
  emit('vink-af', props.oefening.PatientOefenplanID);
};

// Helper functie om van een 'watch?v=' link een '/embed/' link te maken
const embedUrl = computed(() => {
  if (!props.oefening.InstructieVideoURL) {
    return null;
  }
  try {
    const url = new URL(props.oefening.InstructieVideoURL);
    const videoId = url.searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (e) {
    console.error('Ongeldige video URL:', props.oefening.InstructieVideoURL);
    return null;
  }
});
</script>

<template>
  <div class="oefening-kaart" :class="{ 'is-afgerond': oefening.IsVandaagAfgerond }">
    <div class="kaart-content">
      <span v-if="oefening.IsVandaagAfgerond" class="status-badge">Vandaag afgerond</span>
      <h3>{{ oefening.Naam }}</h3>
      <p class="details">{{ oefening.Sets }} sets · {{ oefening.Herhalingen }} herhalingen</p>
      <p class="beschrijving">{{ oefening.Beschrijving }}</p>
      
      <button 
        v-if="!oefening.IsVandaagAfgerond" 
        @click="onVinkAfClick" 
        class="vink-af-knop"
      >
        Vink af als afgerond
      </button>

    </div>
    
    <div v-if="embedUrl" class="kaart-video">
      <iframe 
        :src="embedUrl" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        title="Instructievideo">
      </iframe>
    </div>
  </div>
</template>

<style scoped>
.oefening-kaart {
  display: flex;
  flex-wrap: wrap; /* Zorgt dat video onder content springt op mobiel */
  background-color: #ffffff;
  border: 1px solid #e0eaf1;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5rem;
  overflow: hidden; /* Zorgt dat de video de radius volgt */
  position: relative;
}

.kaart-content {
  flex: 3; /* Neemt 3/5e van de ruimte */
  padding: 2rem;
  min-width: 300px; /* Zorgt voor goede wrapping */
}

.kaart-video {
  flex: 2; /* Neemt 2/5e van de ruimte */
  min-width: 250px;
  min-height: 200px;
  background-color: #f0f0f0;
}

.kaart-video iframe {
  width: 100%;
  height: 100%;
  border: none;
}

h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #007bff;
}

.details {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-top: 0;
}

.beschrijving {
  color: #555;
  line-height: 1.6;
}

/* Styling voor 'Afgerond' status */
.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #28a745; /* Groen */
  color: white;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.oefening-kaart.is-afgerond {
  border-left: 5px solid #28a745;
}

.oefening-kaart.is-afgerond h3 {
  color: #28a745;
}

.vink-af-knop {
  margin-top: 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.vink-af-knop:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}
</style>