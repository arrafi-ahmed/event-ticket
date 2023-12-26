<script setup>
import { defineEmits, defineProps, ref, watch } from "vue";
import Phone from "@/components/Phone.vue";

const { items } = defineProps([
  "items",
  "overAllIndex",
  "quantityIndex",
]);
const inputResponses = ref([]);

const emit = defineEmits(["update"]);

watch(
  items,
  (newVal) => {
    console.log(13, newVal);
    if (newVal) {
      inputResponses.value = newVal;
    }
  },
  { immediate: true }
);
watch(
  () => inputResponses.value,
  (newVal) => {
    emit("update", { newVal });
  }
);
</script>

<template v-if="items">
  <div v-if="items && items.length > 0" class="rounded my-2">
    <template v-for="(item, index) in items" :key="index">
      <div
        v-if="item.options && item.options.length == 0"
        class="border rounded pa-2"
      >
        <h4>Question {{ index + 1 }}:</h4>
        <v-text-field
          v-model="inputResponses[index].text"
          label="Question text"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
        >
        </v-text-field>
        <v-text-field
          v-model="inputResponses[index].instruction"
          label="Question instruction"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
        >
        </v-text-field>
        <v-checkbox
          v-model="inputResponses[index].required"
          label="Required?"
        ></v-checkbox>
      </div>

      <div v-else class="border rounded pa-2">
        <h4>Question {{ index + 1 }}:</h4>
        <v-text-field
          v-model="inputResponses[index].text"
          label="Question text"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
        >
        </v-text-field>
        <v-text-field
          v-model="inputResponses[index].instruction"
          label="Question instruction"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
        >
        </v-text-field>
        <v-checkbox
          v-model="inputResponses[index].required"
          label="Required?"
          hide-details="auto"
        ></v-checkbox>

        <div v-if="item.options > 0">
          <h4>Options:</h4>
          <template
            v-for="(itemOption, childIndex) in item.options"
            :key="childIndex"
          >
            <v-text-field
              v-model="inputResponses[index].options[childIndex]"
              :label="`Option ${childIndex + 1}`"
              :rules="[(v) => !!v || 'required']"
              class="mt-2 mt-md-4"
              density="compact"
              hide-details="auto"
            >
            </v-text-field>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
