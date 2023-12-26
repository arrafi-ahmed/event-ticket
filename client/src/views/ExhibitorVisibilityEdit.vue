<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

const store = useStore();
const route = useRoute();
const router = useRouter();

const event = computed(() => store.state.event.event);
const forms = computed(() => store.state.registrationForm.forms);
const fields = computed(() => store.state.registrationForm.fields);
// const exhibitorVisibility = computed(
//   () => store.state.badge.exhibitorVisibility
// );

const formWQuestion = computed(
  () => store.state.registrationForm.formWQuestion
);

const newExhibitorVisibilityInit = {
  fieldIdStandard: [],
  fieldIdQuestion: [],
  registrationFormId: null,
};
const newExhibitorVisibility = reactive({ ...newExhibitorVisibilityInit });

const form = ref(null);
const isFormValid = ref(true);

const handleSubmit = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  store
    .dispatch("badge/addExhibitorVisibility", newExhibitorVisibility)
    .then((result) => {
      router.push({
        name: "event-single",
        params: { eventId: event.value.id },
      });
    });
};

watch(
  () => newExhibitorVisibility.registrationFormId,
  async (newVal, oldVal) => {
    // Object.assign(newExhibitorVisibility, { ...newExhibitorVisibilityInit });
    store.commit("registrationForm/resetFormWQuestion");
    await Promise.all([
      store.dispatch("registrationForm/setFormWQuestion", newVal),
      store.dispatch("badge/setExhibitorVisibilityByFormId", newVal),
    ]).then(([form, exhibitorVisibility]) => {
      if (exhibitorVisibility)
        Object.assign(newExhibitorVisibility, { ...exhibitorVisibility });
      else
        Object.assign(newExhibitorVisibility, {
          ...newExhibitorVisibilityInit,
          ...{ registrationFormId: newVal },
        });
    });
  }
);

onMounted(async () => {
  if (route.params.eventId) {
    Object.assign(newExhibitorVisibility, newExhibitorVisibilityInit);
    await Promise.all([
      store.dispatch("event/setEvent", route.params.eventId),
      store.dispatch("registrationForm/setForms", route.params.eventId),
      store.dispatch("registrationForm/setFields"),
    ]);
  }
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title title="Edit Exhibitor Visibility">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.back()"
          ></v-btn>
        </page-title>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col>
        <v-form
          ref="form"
          v-model="isFormValid"
          fast-fail
          @submit.prevent="handleSubmit"
        >
          <v-select
            v-model="event"
            :rules="[(v) => !!v || 'Event is required!']"
            density="comfortable"
            disabled
            hide-details="auto"
            item-title="name"
            item-value="id"
            label="Event"
          ></v-select>
          <v-select
            v-model="newExhibitorVisibility.registrationFormId"
            :items="forms"
            :rules="[(v) => !!v || 'Form is required!']"
            class="my-2 my-md-4"
            density="comfortable"
            hide-details="auto"
            item-title="name"
            item-value="rfId"
            label="Form"
          ></v-select>

          <v-row>
            <v-col>
              <h4 class="pb-2">Standard Fields</h4>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Field Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in fields" :key="item.id">
                    <td>
                      <div class="d-flex align-center justify-space-around">
                        <span class="pe-2">{{ item.fieldName }}</span>
                        <v-checkbox
                          v-model="newExhibitorVisibility.fieldIdStandard"
                          :value="item.id"
                          density="compact"
                          hide-details
                        ></v-checkbox>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
            <v-col cols="12" md="6">
              <h4 class="pb-2">Questions</h4>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Questions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in formWQuestion.questions"
                    :key="index"
                  >
                    <td v-if="item">
                      <div class="d-flex align-center justify-space-around">
                        <span class="pe-2">{{ item.text }}</span>
                        <v-checkbox
                          v-model="newExhibitorVisibility.fieldIdQuestion"
                          :value="item.id"
                          density="compact"
                          hide-details="auto"
                        ></v-checkbox>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
          <v-row class="mt-2 mt-md-4" justify="end">
            <v-col cols="auto">
              <v-btn class="ms-1" color="primary" type="submit" variant="tonal"
                >Submit
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
