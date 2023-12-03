<script setup>
import { computed, defineEmits, defineProps, ref, watch } from "vue";

const { label, color, modelValue, customClass } = defineProps([
  "label",
  "color",
  "modelValue",
  "customClass",
]);
const emit = defineEmits("update:modelValue");

const isMenuOpen = ref(false);
const selectedDate = ref(modelValue);

const formattedDate = computed(() => {
  if (selectedDate.value) {
    const date = new Date(selectedDate.value);
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return "";
});

watch(modelValue, (newDate) => {
  selectedDate.value = newDate;
});

watch(selectedDate, (newDate) => {
  emit("update:modelValue", newDate);
});
</script>

<template>
  <v-menu v-model="isMenuOpen">
    <template v-slot:activator="{ props }">
      <v-text-field
        :class="customClass"
        :label="label"
        :model-value="formattedDate"
        hide-details
        prepend-inner-icon="mdi-calendar"
        readonly
        v-bind="props"
      ></v-text-field>
    </template>
    <v-date-picker v-model="selectedDate" :color="color" hide-actions title="">
      <template v-slot:header></template>
    </v-date-picker>
  </v-menu>
</template>
