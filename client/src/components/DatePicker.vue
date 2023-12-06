<script setup>
import { defineEmits, defineProps, ref, watch } from "vue";
import { formatDate } from "@/others/util";

const { label, color, modelValue, customClass } = defineProps([
  "label",
  "color",
  "modelValue",
  "customClass",
]);
const emit = defineEmits("update:modelValue");

const isMenuOpen = ref(false);
const selectedDate = ref(modelValue);

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
        :model-value="formatDate(selectedDate)"
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
