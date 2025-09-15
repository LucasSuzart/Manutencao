<script setup lang="ts">
import { computed, watch } from 'vue'
import QRCode from 'qrcode'
import { toRef, ref, onMounted } from 'vue'

const props = defineProps({ 
  value: { type: String, required: true },
  size: { type: Number, default: 180 },
  background: { type: String, default: '#FFFFFF' },
  color: { type: String, default: '#000000' },
  caption: { type: String, default: '' }
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Regenerate QR code when value changes
watch(() => props.value, renderQRCode)

onMounted(renderQRCode)

async function renderQRCode() {
  if (!canvasRef.value) return
  try {
    await QRCode.toCanvas(canvasRef.value, props.value, { 
      width: props.size,
      color: {
        dark: props.color,
        light: props.background
      },
      margin: 2
    })
  } catch (err) {
    console.error('QR render error', err)
  }
}

// Expose a method for parents to get data URL for printing
function toDataURL() {
  if (!canvasRef.value) return ''
  return canvasRef.value.toDataURL('image/png')
}
defineExpose({ toDataURL })
</script>

<template>
  <div class="qr-panel">
    <canvas ref="canvasRef"></canvas>
    <div v-if="caption" class="qr-caption">{{ caption }}</div>
  </div>
</template>

<style scoped>
.qr-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

canvas {
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border);
  padding: var(--spacing-sm);
  background: var(--color-surface);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.qr-caption {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
