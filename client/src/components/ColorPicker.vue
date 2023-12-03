<script setup>
import { computed, ref } from "vue";

const { modelValue, customClass } = defineProps(["modelValue", "customClass"]);
const emit = defineEmits(["update:modelValue"]);
const menu = ref(false);

const updateModelValue = (value) => {
  emit("update:modelValue", value);
};

const swatchStyle = computed(() => {
  return {
    backgroundColor: modelValue,
    cursor: "pointer",
    height: "30px",
    width: "30px",
    borderRadius: menu.value ? "50%" : "4px",
    transition: "border-radius 200ms ease-in-out",
  };
});
</script>
<template>
  <v-text-field
    :class="customClass"
    :model-value="modelValue"
    density="comfortable"
    hide-details
    @update:modelValue="updateModelValue"
  >
    <template v-slot:append-inner>
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        nudge-bottom="105"
        nudge-left="16"
        top
      >
        <template v-slot:activator="{ props }">
          <div :style="swatchStyle" v-bind="props" />
        </template>
        <v-card>
          <v-card-text class="pa-0">
            <v-color-picker
              :model-value="modelValue"
              hide-inputs
              show-swatches
              @update:modelValue="updateModelValue"
            />
          </v-card-text>
        </v-card>
      </v-menu>
    </template>
  </v-text-field>
</template>
<style scoped></style>
