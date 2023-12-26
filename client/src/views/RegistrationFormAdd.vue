<script setup>
import {useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";
import {computed, onMounted, reactive, ref, toRaw} from "vue";
import PageTitle from "@/components/PageTitle.vue";
import {useDisplay} from "vuetify";
import {input_fields} from "@/others/util";

const {mobile} = useDisplay();
const route = useRoute();
const router = useRouter();
const store = useStore();

const formTypes = computed(() => store.state.registrationForm.formTypes);
const selectedFormType = ref(null);

const formItems = reactive([]);
const formItemTypes = reactive([...input_fields]);
const findFormItemTypeIndex = (id) =>
  formItemTypes.findIndex((item) => item.id == id);

const dialog = ref(false);
const selectedFormItemType = reactive({id: null, title: null});
const terms = ref(null);
const emailBody = ref(null);

const questionInit = {
  typeId: null,
  text: null,
  instruction: null,
  required: true,
  options: [],
};
const question = reactive({...questionInit});
const isQuestionOptionsRequired = computed(() => {
  return selectedFormItemType.id != 0 && selectedFormItemType.id != 1;
});
const openDialog = (itemTypeId) => {
  Object.assign(question, {...questionInit, options: []});
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

  formItems.push({...question});

  dialog.value = !dialog.value;
};

const publishForm = ref(null);
const isPublishFormValid = ref(true);

const handleSubmitPublishForm = async () => {
  await publishForm.value.validate();
  if (!isPublishFormValid.value) return;

  store
    .dispatch("registrationForm/addForm", {
      form: {
        formTypeId: selectedFormType.value,
        eventId: route.params.eventId,
        terms: terms.value,
        emailBody: emailBody.value,
      },
      formItems: toRaw(formItems),
    })
    .then((result) => {
      router.push({
        name: "event-single",
        params: {eventId: route.params.eventId},
      });
    });
};

onMounted(() => {
  store.dispatch("registrationForm/setFormTypes", route.params.eventId);
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title justify="space-between" title="Add Registration Form">
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
                v-model="selectedFormType"
                :items="formTypes"
                :rules="[(v) => !!v || 'Type is required!']"
                class="mt-2"
                density="compact"
                hide-details
                item-title="name"
                item-value="id"
                label="Form Type"
                required
              ></v-select>
            </v-col>

            <v-col cols="auto">
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
            v-if="formItems.length > 0"
            class="mt-2 mt-md-6 rounded pa-2 border"
          >
            <template v-for="(item, index) in formItems" :key="index">
              <i v-if="item.instruction" class="text-caption text-disabled">{{
                  item.instruction
                }}</i>
              <v-text-field
                v-if="item.typeId == 0"
                :label="item.text"
                class="mt-2"
                density="compact"
                disabled
                hide-details="auto"
              ></v-text-field>
              <v-textarea
                v-else-if="item.typeId == 1"
                :label="item.text"
                class="mt-2"
                density="compact"
                disabled
                hide-details="auto"
              ></v-textarea>
              <v-radio-group
                v-else-if="item.typeId == 2"
                :label="item.text"
                class="mt-2"
                disabled
                hide-details="auto"
              >
                <template v-if="item.options.length > 0">
                  <v-radio
                    v-for="(childItem, index) in item.options"
                    :key="index"
                    :label="childItem"
                  ></v-radio>
                </template>
              </v-radio-group>
              <div
                v-else-if="item.typeId == 3"
                class="mt-2 v-label d-block pl-4"
              >
                <p>{{ item.text }}</p>
                <template v-if="item.options.length > 0">
                  <v-checkbox
                    v-for="(childItem, index) in item.options"
                    :key="index"
                    :label="childItem"
                    density="compact"
                    disabled
                    hide-details="auto"
                  ></v-checkbox>
                </template>
              </div>
              <v-select
                v-if="item.typeId == 4"
                :items="item.options"
                :label="item.text"
                class="mt-2"
                density="compact"
                disabled
                hide-details="auto"
              ></v-select>
              <v-divider
                v-if="formItems.length != index + 1"
                class="my-2"
              ></v-divider>
            </template>
          </div>
          <v-textarea
            v-model="terms"
            class="mt-2 mt-md-4 text-pre-wrap"
            clearable
            density="compact"
            hide-details="auto"
            label="Registration Terms & Condition"
          >
          </v-textarea>
          <v-textarea
            v-model="emailBody"
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
              >Publish
              </v-btn>
            </v-col>
          </v-row>
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
