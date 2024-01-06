<script setup>
import { defineEmits, defineProps, ref, watch } from "vue";
import { getInputType } from "@/others/util";

const { items } = defineProps(["items"]);
const inputResponses = ref([]);
const emit = defineEmits(["update", "remove"]);

watch(
  () => items,
  (newItems) => {
    inputResponses.value = newItems;
  },
  { immediate: true }
);

watch(
  () => inputResponses.value,
  (newVal) => {
    emit("update", { newVal });
  }
);

const removeQuestion = (qId, index) => {
  emit("remove", qId, index);
};
</script>

<template>
  <div v-if="items && items.length > 0" class="rounded my-2">
    <template v-for="(item, index) in items" :key="index">
      <div
        v-if="item.options && item.options.length > 0"
        :class="{ 'mt-5': index > 0 }"
        class="border rounded pa-4"
      >
        <v-row justify="space-between" no-gutters>
          <v-col cols="auto" sm="8">
            <v-row align="center">
              <v-col cols="auto"
                ><h3>Question {{ index + 1 }}:</h3>
              </v-col>
              <v-col cols="auto">
                <v-checkbox
                  v-model="inputResponses[index].required"
                  class="ml-5"
                  density="compact"
                  hide-details="auto"
                  label="Required?"
                ></v-checkbox>
              </v-col>
            </v-row>
            <i
              ><small>Type: {{ getInputType(item.typeId).title }}</small></i
            >
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="error"
              variant="tonal"
              @click="removeQuestion(item.id, index)"
              >Remove
            </v-btn>
          </v-col>
        </v-row>

        <v-text-field
          v-model="inputResponses[index].text"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
          label="Question text"
        >
        </v-text-field>
        <v-text-field
          v-model="inputResponses[index].instruction"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
          label="Question instruction"
        >
        </v-text-field>

        <div v-if="item.options.length > 0" class="pt-6">
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
      <div v-else :class="{ 'mt-5': index > 0 }" class="border rounded pa-4">
        <v-row justify="space-between" no-gutters>
          <v-col cols="auto" sm="8">
            <v-row align="center">
              <v-col cols="auto"
                ><h3>Question {{ index + 1 }}:</h3>
              </v-col>
              <v-col cols="auto">
                <v-checkbox
                  v-model="inputResponses[index].required"
                  class="ml-5"
                  density="compact"
                  hide-details="auto"
                  label="Required?"
                ></v-checkbox>
              </v-col>
            </v-row>
            <i
              ><small>Type: {{ getInputType(item.typeId).title }}</small></i
            >
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="error"
              variant="tonal"
              @click="removeQuestion(item.id, index)"
              >Remove
            </v-btn>
          </v-col>
        </v-row>
        <v-text-field
          v-model="inputResponses[index].text"
          :rules="[(v) => !!v || !item.required || 'required']"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
          label="Question text"
        >
        </v-text-field>
        <v-text-field
          v-model="inputResponses[index].instruction"
          class="mt-2 mt-md-4"
          density="compact"
          hide-details="auto"
          label="Question instruction"
        >
        </v-text-field>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
