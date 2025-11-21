<template>
  <ModalBase :title="title" :body="body" :closeOnOverlay="false" :onClose="() => emit('cancel')">
    <button class="btn btn-outline-secondary" @click="emit('cancel')">{{ cancelText }}</button>
    <button class="btn btn-outline-primary" @click="emit('confirm')">{{ confirmText }}</button>
  </ModalBase>
</template>

<script setup>
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import ModalBase from './ModalBase.vue'

const props = defineProps({
  title: { type: String, required: true },
  body: { type: [String, Object], required: true },
  confirmText: { type: String, default: 'Підтвердити' },
  cancelText: { type: String, default: 'Скасувати' },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>
