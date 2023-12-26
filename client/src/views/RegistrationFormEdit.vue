<script setup>
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { computed, onMounted, reactive, ref, toRaw, watch } from "vue";
import PageTitle from "@/components/PageTitle.vue";
import { useDisplay } from "vuetify";
import { input_fields } from "@/others/util";
import FormItemsEditable from "@/components/FormItemsEditable.vue";

const { mobile } = useDisplay();
const route = useRoute();
const router = useRouter();
const store = useStore();

const forms = computed(() => store.state.registrationForm.forms);
const form = computed(() => store.state.registrationForm.formWQuestion);
const newFormWQuestionInit = {
  id: null,
  formTypeId: null,
  eventId: null,
  terms: null,
  emailBody: null,
  name: null,
  questions: [],
};
const newFormWQuestion = reactive({ ...newFormWQuestionInit });
const selectedForm = ref(null);

const formItems = reactive([]);
const formItemTypes = reactive([...input_fields]);
const findFormItemTypeIndex = (id) =>
  formItemTypes.findIndex((item) => item.id == id);

const dialog = ref(false);
const selectedFormItemType = reactive({ id: null, title: null });
const terms = ref(null);
const emailBody = ref(null);

const questionInit = {
  typeId: null,
  text: null,
  instruction: null,
  required: true,
  options: [],
};
const question = reactive({ ...questionInit });
const isQuestionOptionsRequired = computed(() => {
  return selectedFormItemType.id != 0 && selectedFormItemType.id != 1;
});
const openDialog = (itemTypeId) => {
  Object.assign(question, { ...questionInit, options: [] });
  dialog.value = !dialog.value;
  const foundIndex = findFormItemTypeIndex(itemTypeId);
  Object.assign(selectedFormItemType, formItemTypes[foundIndex]);
};

const itemAddForm = ref(null);
const isItemAddFormValid = ref(true);

const addFormItem = async (selectedFormItemType) => {
  await itemAddForm.value.validate();
  if (isQuestionOptionsRequired.value && question.options.length === 0) {
    isItemAddFormValid.value = false;
  }
  if (!isItemAddFormValid.value) return;

  question.typeId = selectedFormItemType.id;
  if (selectedFormItemType.id == 0 || selectedFormItemType.id == 1) {
    delete question.options;
  }

  formItems.push({ ...question });
  newFormWQuestion.questions = newFormWQuestion.questions.concat(formItems);
  dialog.value = !dialog.value;
};

const publishForm = ref(null);
const isPublishFormValid = ref(true);

const submitForm = ref(false);
const handleSubmitPublishForm = async () => {
  await publishForm.value.validate();
  if (!isPublishFormValid.value) return;

  submitForm.value = true;
  store
    .dispatch("registrationForm/addForm", {
      id: selectedForm.value,
      formTypeId: newFormWQuestion.formTypeId,
      eventId: route.params.eventId,
      terms: newFormWQuestion.terms,
      emailBody: newFormWQuestion.emailBody,
      formItems: toRaw(newFormWQuestion.questions),
    })
    .then((result) => {
      router.push({
        name: "event-single",
        params: { eventId: route.params.eventId },
      });
    })
    .finally(() => (submitForm.value = false));
};

watch(
  () => selectedForm.value,
  (newVal, oldVal) => {
    if (submitForm.value) return;

    console.log(10, newFormWQuestion);
    Object.assign(newFormWQuestion, { ...newFormWQuestionInit });
    store
      .dispatch("registrationForm/setFormWQuestion", newVal)
      .then((result) => {
        Object.assign(newFormWQuestion, { ...form.value });
      });
  },
  { deep: true }
);

const additionalAnswers = ref([]);
const handleUpdateAdditionalAnswers = ({ newVal }) => {
  additionalAnswers.value = newVal;
  console.log(11, additionalAnswers.value);
};

onMounted(() => {
  store.dispatch("registrationForm/setForms", route.params.eventId);
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title justify="space-between" title="Edit Registration Form">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.back()"
          ></v-btn>
        </page-title>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-form
          ref="publishForm"
          v-model="isPublishFormValid"
          fast-fail
          @submit.prevent="handleSubmitPublishForm"
        >
          <v-row align="center">
            <v-col class="flex-grow-1" cols="auto">
              <v-select
                v-model="selectedForm"
                :items="forms"
                :rules="[(v) => !!v || 'Form is required!']"
                class="mt-2"
                density="compact"
                hide-details
                item-title="name"
                item-value="id"
                label="Form"
                required
              ></v-select>
            </v-col>

            <v-col cols="auto" v-if="newFormWQuestion.id">
              <div class="d-flex justify-end">
                <v-spacer></v-spacer>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      prepend-icon="mdi-plus"
                      size="small"
                      stacked
                      v-bind="props"
                      >Question
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item
                      v-for="item in formItemTypes"
                      :key="item.id"
                      :title="item.title"
                      density="compact"
                      link
                      @click="openDialog(item.id)"
                    ></v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </v-col>
          </v-row>

          <div
            v-if="
              newFormWQuestion &&
              newFormWQuestion.questions &&
              newFormWQuestion.questions.length > 0 &&
              newFormWQuestion.questions[0]
            "
          >
            <form-items-editable
              :items="newFormWQuestion.questions"
              :key="newFormWQuestion.questions.length"
              @update="handleUpdateAdditionalAnswers"
            />
          </div>
          <div v-if="newFormWQuestion.id">
            <v-textarea
              v-if="newFormWQuestion && newFormWQuestion.id"
              v-model="newFormWQuestion.terms"
              class="mt-2 mt-md-4 text-pre-wrap"
              clearable
              density="compact"
              hide-details="auto"
              label="Registration Terms & Condition"
            >
            </v-textarea>
            <v-textarea
              v-if="newFormWQuestion && newFormWQuestion.id"
              v-model="newFormWQuestion.emailBody"
              class="mt-2 mt-md-4 text-pre-wrap"
              clearable
              density="compact"
              hide-details="auto"
              label="Email content for invoice"
            >
            </v-textarea>
            <v-row class="mt-2 mt-md-4" justify="end">
              <v-col cols="auto">
                <v-btn
                  :density="mobile ? 'compact' : 'default'"
                  color="primary"
                  type="submit"
                  variant="tonal"
                  >Save
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="dialog" width="500">
    <v-card density="compact">
      <v-card-title>
        <div class="d-flex align-center justify-lg-space-between">
          <span class="flex-grow-1">Add {{ selectedFormItemType?.title }}</span>
          <v-checkbox
            v-model="question.required"
            class="flex-grow-0"
            density="compact"
            hide-details
            label="Required?"
          ></v-checkbox>
        </div>
      </v-card-title>
      <v-card-text>
        <v-form
          ref="itemAddForm"
          v-model="isItemAddFormValid"
          fast-fail
          @submit.prevent="addFormItem(selectedFormItemType)"
        >
          <v-text-field
            v-model="question.text"
            :rules="[(v) => !!v || 'Question Text is required!']"
            clearable
            density="compact"
            hide-details="auto"
            label="Question Text"
          ></v-text-field>

          <v-text-field
            v-model="question.instruction"
            class="mt-2 mt-md-4"
            clearable
            density="compact"
            hide-details="auto"
            label="Instruction"
          ></v-text-field>

          <template v-if="isQuestionOptionsRequired">
            <v-row align="center" class="mt-2 mt-md-4">
              <v-col cols="auto"><h4>Answer Options:</h4></v-col>
              <v-col>
                <v-btn
                  density="comfortable"
                  icon="mdi-plus"
                  question
                  @click="question.options.push(null)"
                ></v-btn>
              </v-col>
            </v-row>
            <div class="mt-2 mt-md-4">
              <div
                v-for="(item, index) in question.options"
                :key="index"
                class="mt-1"
              >
                <v-text-field
                  v-model="question.options[index]"
                  :label="`Option ${index + 1}`"
                  :rules="[(v) => !!v || `Option ${index + 1} is required!`]"
                  clearable
                  density="compact"
                  hide-details="auto"
                ></v-text-field>
              </div>
            </div>
          </template>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :density="mobile ? 'compact' : 'default'"
              color="primary"
              type="submit"
              >Submit
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
