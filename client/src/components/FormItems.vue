<script setup>
import { defineEmits, defineProps, ref, watch } from "vue";

const { items, overAllIndex, quantityIndex, type } = defineProps([
  "items",
  "overAllIndex",
  "quantityIndex",
  "type",
]);
const inputResponses = ref([]);

const emit = defineEmits(["update"]);

watch(
  items,
  (newVal) => {
    if (newVal) {
      inputResponses.value = newVal.map((item) =>
        item?.typeId == 3 ? [] : null
      );
    }
  },
  { immediate: true }
);

watch(inputResponses.value, (newVal) => {
  emit("update", { newVal, overAllIndex, quantityIndex });
});
</script>

<template>
  <div v-if="items?.length > 0 && items[0]" class="rounded py-2">
    <template v-for="(item, index) in items" :key="index">
      <v-text-field
        v-if="item.typeId == 0"
        v-model="inputResponses[index]"
        :label="item.text"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        density="compact"
        hide-details="auto"
      ></v-text-field>
      <v-textarea
        v-else-if="item.typeId == 1"
        v-model="inputResponses[index]"
        :label="item.text"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        density="compact"
        hide-details="auto"
      ></v-textarea>
      <v-radio-group
        v-else-if="item.typeId == 2"
        v-model="inputResponses[index]"
        :label="item.text"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        hide-details="auto"
      >
        <template v-if="item.options?.length > 0">
          <v-radio
            v-for="(childItem, index) in item.options"
            :key="index"
            :label="childItem"
            :value="childItem"
          ></v-radio>
        </template>
      </v-radio-group>
      <div
        v-else-if="item.typeId == 3 && item.options?.length > 0"
        class="mt-2 mt-md-4 v-label d-block pl-4"
      >
        <p>{{ item.text }}</p>
        <v-checkbox
          v-for="(childItem, childIndex) in item.options"
          :key="childIndex"
          v-model="inputResponses[index]"
          :label="childItem"
          :value="childItem"
          density="compact"
          hide-details="auto"
        ></v-checkbox>
      </div>
      <v-select
        v-else-if="item.typeId == 4 && item.options?.length > 0"
        v-model="inputResponses[index]"
        :items="item.options"
        :label="item.text"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        density="compact"
        hide-details="auto"
      ></v-select>
      <div v-if="item.instruction" class="text-caption font-italic pl-2">
        {{ item.instruction }}
      </div>
      <v-divider
        v-if="type === 'question' && index !== items.length - 1"
        class="my-8"
      ></v-divider>
    </template>
  </div>
</template>

<style scoped></style>
