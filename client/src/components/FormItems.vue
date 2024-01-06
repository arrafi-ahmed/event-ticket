<script setup>
import { defineEmits, defineProps, ref, watch } from "vue";
import Phone from "@/components/Phone.vue";

const { items, overAllIndex, quantityIndex, type } = defineProps([
  "items",
  "overAllIndex",
  "quantityIndex",
  "type",
]);
const inputResponses = ref([]);

const emit = defineEmits(["update"]);

const handleUpdatePhone = ({ formattedPhone, index }) => {
  inputResponses.value[index] = formattedPhone;
};

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
      <div v-if="item.typeId == 0">
        <v-text-field
          v-model="inputResponses[index]"
          :label="item.text"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
        >
          <template v-slot:label>
            <span>{{ item.text }}</span>
            <span v-if="item.required" style="color: red">*</span>
          </template>
        </v-text-field>
        <div v-if="item.instruction" class="text-caption font-italic pb-1">
          {{ item.instruction }}
        </div>
      </div>

      <div v-else-if="item.typeId == 1">
        <v-textarea
          v-model="inputResponses[index]"
          :label="item.text"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
        >
          <template v-slot:label>
            <span>{{ item.text }}</span>
            <span v-if="item.required" style="color: red">*</span>
          </template>
        </v-textarea>
        <div v-if="item.instruction" class="text-caption font-italic pb-1">
          {{ item.instruction }}
        </div>
      </div>

      <div v-else-if="item.typeId == 2">
        <v-radio-group
          v-model="inputResponses[index]"
          :label="item.text"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          hide-details="auto"
        >
          <template v-slot:label>
            <span>{{ item.text }}</span>
            <span v-if="item.required" style="color: red">*</span>
          </template>
          <template v-if="item.options?.length > 0">
            <div
              v-if="item.instruction"
              class="text-caption font-italic pb-1 ps-2"
            >
              {{ item.instruction }}
            </div>
            <v-radio
              v-for="(childItem, index) in item.options"
              :key="index"
              :label="childItem"
              :value="childItem"
            ></v-radio>
          </template>
        </v-radio-group>
      </div>
      <div
        v-else-if="item.typeId == 3 && item.options?.length > 0"
        class="mt-2 mt-md-4 v-label d-block pl-4"
      >
        <span>{{ item.text }}</span>
        <span v-if="item.required" style="color: red">*</span>
        <div v-if="item.instruction" class="text-caption font-italic pb-1">
          {{ item.instruction }}
        </div>
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
      <div v-else-if="item.typeId == 4 && item.options?.length > 0">
        <v-select
          v-model="inputResponses[index]"
          :items="item.options"
          :label="item.text"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
        >
          <template v-slot:label>
            <span>{{ item.text }}</span>
            <span v-if="item.required" style="color: red">*</span>
          </template>
        </v-select>
        <div v-if="item.instruction" class="text-caption font-italic pb-1">
          {{ item.instruction }}
        </div>
      </div>

      <div v-else-if="item.typeId == 5 && item.options?.length > 0">
        <phone
          :index="index"
          :item="item"
          @update-phone="handleUpdatePhone"
        ></phone>
        <div v-if="item.instruction" class="text-caption font-italic pb-1">
          {{ item.instruction }}
        </div>
      </div>
      <v-divider
        v-if="type === 'question' && index !== items.length - 1"
        class="my-8"
      ></v-divider>
    </template>
  </div>
</template>

<style>
.v-label {
  opacity: var(--v-high-emphasis-opacity);
}
</style>
