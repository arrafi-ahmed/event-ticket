<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import ColorPicker from "@/components/ColorPicker.vue";
import BadgePreview from "@/components/BadgePreview.vue";

const { mobile } = useDisplay();
const route = useRoute();
const router = useRouter();
const store = useStore();

const event = computed(() => store.state.event.event);
const forms = computed(() => store.state.registrationForm.forms);
const fields = computed(() => store.state.registrationForm.fields);
const badgeDesignWVisibility = computed(
  () => store.state.badgeDesign.badgeDesignWVisibility
);

let newBadgeDesign = reactive({
  id: null,
  title: null,
  colorScheme: null,
  textTopLeft: null,
  textTopRight: null,
  textBottomLeft: null,
  textBottomRight: null,
  registrationFormId: null,
  eventId: null,
  registrationForm: null,
  event: null,
});

const newBadgeVisibility = reactive({
  id: null,
  fieldIdFront: [],
  fieldIdRear: [],
  badgeDesignId: null,
});

const form = ref(null);
const isFormValid = ref(true);

let submitSaveBadge = false;
const handleSaveBadge = async () => {
  await form.value.validate();
  if (!newBadgeDesign.colorScheme) isFormValid.value = false;
  if (!isFormValid.value) return;

  newBadgeDesign.eventId = newBadgeDesign.event?.id;
  newBadgeDesign.registrationFormId = newBadgeDesign.registrationForm;

  delete newBadgeDesign.bdId;
  delete newBadgeDesign.bvId;
  delete newBadgeDesign.event;
  delete newBadgeDesign.registrationForm;
  delete newBadgeDesign.fieldIdFront;
  delete newBadgeDesign.fieldIdRear;
  delete newBadgeDesign.badgeDesignId;
  delete newBadgeVisibility.bdId;
  delete newBadgeVisibility.bvId;
  delete newBadgeVisibility.title;
  delete newBadgeVisibility.colorScheme;
  delete newBadgeVisibility.textTopLeft;
  delete newBadgeVisibility.textTopRight;
  delete newBadgeVisibility.textBottomLeft;
  delete newBadgeVisibility.textBottomRight;
  delete newBadgeVisibility.registrationFormId;
  delete newBadgeVisibility.eventId;

  submitSaveBadge = true;
  store
    .dispatch("badgeDesign/addBadgeDesign", {
      badgeDesign: newBadgeDesign,
      badgeVisibility: newBadgeVisibility,
    })
    .then((result) => {
      router.push({
        name: "event-single",
        params: { eventId: newBadgeDesign.eventId },
      });
    })
    .finally(() => (submitSaveBadge = false));
};

const dialog = ref(false);

watch(
  () => newBadgeDesign.registrationForm,
  (newVal, oldVal) => {
    if (submitSaveBadge) return;
    
    const foundForm = forms.value.find((item) => item.rfId == newVal);
    newBadgeDesign.title = foundForm?.name?.toUpperCase();
    store
      .dispatch("badgeDesign/setBadgeDesignByFormId", { formId: newVal })
      .then((result) => {
        console.log(4, result);
        return store.dispatch("badgeDesign/setBadgeDesignWVisibility", {
          badgeDesignId: result.id,
        });
      })
      .then((result) => {
        Object.assign(newBadgeDesign, {
          ...badgeDesignWVisibility.value,
          id: badgeDesignWVisibility.value.bdId,
        });
        Object.assign(newBadgeVisibility, {
          ...badgeDesignWVisibility.value,
          id: badgeDesignWVisibility.value.bvId,
        });
      });
  }
);

onMounted(async () => {
  if (route.params.eventId) {
    await Promise.all([
      store.dispatch("event/setEvent", route.params.eventId),
      store.dispatch("registrationForm/setForms", route.params.eventId),
      store.dispatch("registrationForm/setFields"),
    ]);
    newBadgeDesign.event = event.value;
  }
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title title="Edit Badge">
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
          @submit.prevent="handleSaveBadge"
        >
          <v-row>
            <v-col class="mt-2 mt-md-0" cols="12" md="6">
              <h4 class="pb-2">Badge Field Visibility</h4>
              <small><i>QR code will be displayed on back of badge</i></small>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Front</th>
                    <th>Rear</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in fields" :key="item.name">
                    <td>{{ item.fieldName }}</td>
                    <td>
                      <v-checkbox
                        v-model="newBadgeVisibility.fieldIdFront"
                        :value="item.id"
                        density="compact"
                        hide-details="auto"
                      ></v-checkbox>
                    </td>
                    <td>
                      <v-checkbox
                        v-model="newBadgeVisibility.fieldIdRear"
                        :value="item.id"
                        density="compact"
                        hide-details="auto"
                      ></v-checkbox>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
            <v-col cols="12" md="6">
              <h4 class="pb-2">Badge Details</h4>
              <v-select
                v-model="newBadgeDesign.event"
                :rules="[(v) => !!v || 'Event is required!']"
                density="comfortable"
                disabled
                hide-details="auto"
                item-title="name"
                item-value="id"
                label="Event"
              ></v-select>
              <v-select
                v-model="newBadgeDesign.registrationForm"
                :items="forms"
                :rules="[(v) => !!v || 'Form is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                item-title="name"
                item-value="rfId"
                label="Form"
              ></v-select>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="newBadgeDesign.title"
                    :rules="[(v) => !!v || 'Title is required!']"
                    class="mt-2 mt-md-4"
                    clearable
                    density="comfortable"
                    hide-details="auto"
                    label="Badge Title"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <color-picker
                    v-model="newBadgeDesign.colorScheme"
                    customClass="mt-2 mt-md-4"
                    label="Color Scheme"
                    :key="newBadgeDesign.colorScheme"
                  ></color-picker>
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col>
                  <v-text-field
                    v-model="newBadgeDesign.textTopLeft"
                    clearable
                    density="comfortable"
                    hide-details="auto"
                    label="Text above event logo"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="newBadgeDesign.textTopRight"
                    clearable
                    density="comfortable"
                    hide-details="auto"
                    label="Text above sponsor logo"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col>
                  <v-text-field
                    v-model="newBadgeDesign.textBottomLeft"
                    clearable
                    density="comfortable"
                    hide-details="auto"
                    label="Text below event logo"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="newBadgeDesign.textBottomRight"
                    clearable
                    density="comfortable"
                    hide-details="auto"
                    label="Text below sponsor logo"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row class="mt-2 mt-md-4" justify="end">
                <v-col cols="auto">
                  <v-btn
                    color="primary"
                    variant="tonal"
                    @click="dialog = !dialog"
                    >Design Preview
                  </v-btn>
                  <v-btn
                    :density="mobile ? 'comfortable' : 'default'"
                    class="ms-1"
                    color="primary"
                    type="submit"
                    variant="tonal"
                    >Save
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="dialog" width="700">
    <badge-preview
      :badge="{ ...newBadgeDesign, ...newBadgeVisibility }"
      :event="event"
      card-title="Badge Design Preview"
    ></badge-preview>
  </v-dialog>
</template>

<style scoped></style>
