<script setup>
import { ref } from 'vue'

const props = defineProps({
  logItem: {
    type: Object,
    required: true
  }
})

// Definieer de events die dit component kan uitzenden
const emit = defineEmits(['verwijder', 'update'])

// Lokale state om de edit-modus te beheren
const isEditing = ref(false)
const editedBeschrijving = ref(props.logItem.Beschrijving)

// Functie om de 'verwijder' actie door te geven aan de ouder
function handleVerwijder() {
  if (confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
    emit('verwijder', props.logItem.LogboekID)
  }
}

// Functie om de 'update' actie door te geven aan de ouder
function handleUpdate() {
  emit('update', props.logItem.LogboekID, editedBeschrijving.value)
  isEditing.value = false // Sluit de edit-modus
}

// Helper om datum netjes te tonen
function formatDatum(datumTijd) {
  return new Date(datumTijd).toLocaleString('nl-NL', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}
</script>

<template>
  <li class="log-item">
    <div v-if="!isEditing" class="item-display">
      <div class="item-content">
        <span class="item-datum">{{ formatDatum(logItem.DatumTijdActiviteit) }}</span>
        <p class="item-beschrijving">{{ logItem.Beschrijving }}</p>
      </div>
      <div class="item-knoppen">
        <button @click="isEditing = true" class="knop-edit">Bewerk</button>
        <button @click="handleVerwijder" class="knop-verwijder">Verwijder</button>
      </div>
    </div>

    <div v-else class="item-edit">
      <textarea v-model="editedBeschrijving" rows="3"></textarea>
      <div class="item-knoppen">
        <button @click="isEditing = false" class="knop-annuleer">Annuleer</button>
        <button @click="handleUpdate" class="knop-opslaan">Opslaan</button>
      </div>
    </div>
  </li>
</template>

<style scoped>
.log-item {
  list-style: none;
  background-color: #fff;
  border: 1px solid #e0eaf1;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.item-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.item-datum {
  font-size: 0.9rem;
  color: #777;
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
}

.item-beschrijving {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  line-height: 1.6;
}

.item-edit textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.item-knoppen {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0; /* Voorkom dat knoppen 'wrappen' */
}

/* Basis knopstijl */
.item-knoppen button {
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.knop-edit {
  background-color: #e6f2ff;
  color: #0056b3;
}
.knop-edit:hover {
  background-color: #d1e7ff;
}

.knop-verwijder {
  background-color: #f8d7da;
  color: #721c24;
}
.knop-verwijder:hover {
  background-color: #f5c6cb;
}

.knop-annuleer {
  background-color: #f4f4f4;
  color: #555;
}
.knop-annuleer:hover {
  background-color: #e0e0e0;
}

.knop-opslaan {
  background-color: #28a745;
  color: white;
}
.knop-opslaan:hover {
  background-color: #218838;
}
</style>