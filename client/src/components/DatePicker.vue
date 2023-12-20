<script setup>
import { defineEmits, defineProps, ref, watch } from "vue";
import { formatDate } from "@/others/util";
import { useDisplay } from "vuetify";

const { label, color, modelValue, customClass, rules, variant } = defineProps([
  "label",
  "color",
  "modelValue",
  "customClass",
  "rules",
  "variant",
]);
const emit = defineEmits(["update:modelValue", "clickClear"]);

const { width, height, mobile } = useDisplay();
const isMenuOpen = ref(false);
const selectedDate = ref(modelValue);

const handleClickClear = () => {
  emit("clickClear");
};

watch(modelValue, (newDate) => {
  selectedDate.value = newDate;
});

watch(selectedDate, (newDate) => {
  emit("update:modelValue", newDate);
  isMenuOpen.value = false;
});
</script>

<template>
  <v-menu v-model="isMenuOpen" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-text-field
        :class="customClass"
        :label="label"
        :model-value="formatDate(selectedDate)"
        :rules="rules"
        :variant="variant"
        clearable
        density="compact"
        hide-details="auto"
        prepend-inner-icon="mdi-calendar"
        readonly
        v-bind="props"
        @click:clear="handleClickClear"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="selectedDate"
      :color="color"
      :height="mobile ? height : 'auto'"
      :width="mobile ? width : 'auto'"
      position="sticky"
      show-adjacent-months
      title=""
    >
    </v-date-picker>
  </v-menu>
</template>
<style>
.v-overlay__content:has(> .v-date-picker) {
  min-width: auto !important;
}

.v-picker-title {
  padding: 0 !important;
}

@media only screen and (max-width: 600px) {
  .v-overlay__content:has(> .v-date-picker) {
    left: 0 !important;
  }
}
</style>
