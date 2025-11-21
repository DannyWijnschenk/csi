<template>
  <ModalBase :title="title" :body="body" :closeOnOverlay="true" :onClose="() => emit('close')">
    <button class="btn btn-outline-primary" @click="emit('close')">{{ okText }}</button>
  </ModalBase>
</template>

<script setup>
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import ModalBase from './ModalBase.vue'

const props = defineProps({
  title: { type: String, required: true },
  body: { type: [String, Object], required: true },
  okText: { type: String, default: 'OK' },
})

const emit = defineEmits(['close'])
</script>
