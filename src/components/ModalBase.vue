<template>
  <teleport to="body">
    <div class="mb-overlay" @click="closeOnOverlay && onClose && onClose()"></div>
    <div class="mb-wrap" role="dialog" aria-modal="true" :aria-label="title">
      <header class="mb-header">
        <h3 class="mb-title">{{ title }}</h3>
      </header>

      <div class="mb-body">
        <p v-if="typeof body === 'string'">{{ body }}</p>
        <component v-else :is="body" />
      </div>

      <footer class="mb-footer">
        <slot />
      </footer>
    </div>
  </teleport>
</template>

<script setup>
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const props = defineProps({
  title: { type: String, required: true },
  body: { type: [String, Object], required: true },
  closeOnOverlay: { type: Boolean, default: false },
  onClose: { type: Function },
})
</script>

<style scoped>
.mb-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 9998;
}

.mb-wrap {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: min(480px, 90vw);
  z-index: 9999;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

.mb-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.mb-body {
  padding: 20px;
}

.mb-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #f9f9f9;
}

.mb-title {
  margin: 0;
  font-weight: 600;
  font-size: 1.1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
</style>

