<script setup>
import { defineProps, ref, watch } from "vue";

const { items, type, answers } = defineProps(["items", "type", "answers"]);
const inputResponses = ref([]);

const getAnswer = (item) => {
  return answers.find((answer) => answer.questionId === item.id)?.answerText;
};
watch(
  items,
  (newVal) => {
    if (newVal) {
      inputResponses.value = newVal.map((item) => {
        if (item.typeId === 3) {
          const answer = getAnswer(item);
          return answer ? answer.split(",") : [];
        } else if (item.typeId !== 3) {
          return getAnswer(item);
        } else {
          return null;
        }
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div v-if="items?.length > 0 && items[0]" class="rounded py-2">
    <template v-for="(item, index) in items" :key="index">
      <v-text-field
        v-if="item.typeId == 0"
        :model-value="inputResponses[index]"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        density="compact"
        disabled
        hide-details="auto"
      >
        <template v-slot:label>
          <span>{{ item.text }}</span>
          <span v-if="item.required" style="color: red">*</span>
        </template>
      </v-text-field>
      <v-textarea
        v-else-if="item.typeId == 1"
        :model-value="inputResponses[index]"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        density="compact"
        disabled
        hide-details="auto"
      >
        <template v-slot:label>
          <span>{{ item.text }}</span>
          <span v-if="item.required" style="color: red">*</span>
        </template>
      </v-textarea>
      <v-radio-group
        v-else-if="item.typeId == 2"
        :model-value="inputResponses[index]"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        disabled
        hide-details="auto"
      >
        <template v-slot:label>
          <span>{{ item.text }}</span>
          <span v-if="item.required" style="color: red">*</span>
        </template>
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
        <span>{{ item.text }}</span>
        <span v-if="item.required" style="color: red">*</span>
        <v-checkbox
          v-for="(childItem, childIndex) in item.options"
          :key="childIndex"
          :label="childItem"
          :model-value="inputResponses[index]"
          :value="childItem"
          density="compact"
          disabled
          hide-details="auto"
        ></v-checkbox>
      </div>
      <v-select
        v-else-if="item.typeId == 4 && item.options?.length > 0"
        :items="item.options"
        :model-value="inputResponses[index]"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        density="compact"
        disabled
        hide-details="auto"
      >
        <template v-slot:label>
          <span>{{ item.text }}</span>
          <span v-if="item.required" style="color: red">*</span>
        </template>
      </v-select>
      <v-divider v-if="index !== items.length - 1" class="my-8"></v-divider>
    </template>
  </div>
</template>

<style>
.v-field--disabled,
.v-input--disabled,
.v-selection-control--disabled {
  opacity: 0.85;
  pointer-events: none;
}
</style>
