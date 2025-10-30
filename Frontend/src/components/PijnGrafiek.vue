<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
} from 'chart.js'

// Registreer de Chart.js modules die we nodig hebben
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
)

// Dit component verwacht de opgemaakte data als een 'prop'
const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

// Configuratie voor de grafiek
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false // We hebben maar één datalijn
    },
    tooltip: {
      callbacks: {
        // (AC 2) Toon de optionele toelichting in de tooltip
        afterBody: function(context) {
          const toelichting = context[0]?.raw?.toelichting;
          return toelichting ? `Toelichting: ${toelichting}` : '';
        }
      }
    }
  },
  scales: {
    y: {
      // (AC 5) Stel de schaal altijd in van 0 tot 10
      beginAtZero: true,
      min: 0,
      max: 10, 
      ticks: {
        stepSize: 1
      }
    },
    x: {
      // Draai de labels om overlap te voorkomen
      ticks: {
        maxRotation: 60,
        minRotation: 60
      }
    }
  }
}
</script>

<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e0eaf1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
</style>