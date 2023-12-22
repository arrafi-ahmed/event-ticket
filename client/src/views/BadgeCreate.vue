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

let badgeDesign = reactive({
  colorScheme: "#3F51B5",
  textTopLeft: null,
  textTopRight: null,
  textBottomLeft: null,
  textBottomRight: null,
  registrationForm: null,
  event: null,
  title: null,
});

const getTitle = computed(() => {
  const foundForm = forms.value.find(
    (item) => item.rfId == badgeDesign.registrationForm
  );
  return foundForm?.name?.toUpperCase();
});

const badgeVisibility = reactive({
  fieldIdFront: [],
  fieldIdRear: [],
});

const form = ref(null);
const isFormValid = ref(true);

const handleAddBadge = async () => {
  await form.value.validate();
  if (!badgeDesign.colorScheme) isFormValid.value = false;
  if (!isFormValid.value) return;

  badgeDesign.eventId = badgeDesign.event?.id;
  badgeDesign.registrationFormId = badgeDesign.registrationForm;

  badgeDesign.event = undefined;
  badgeDesign.registrationForm = undefined;

  store
    .dispatch("badgeDesign/addBadgeDesign", { badgeDesign, badgeVisibility })
    .then((result) => {
      router.push({
        name: "event-single",
        params: { eventId: badgeDesign.eventId },
      });
    });
};

const dialog = ref(false);

watch(
  () => badgeDesign.registrationForm,
  (newVal, oldVal) => {
    const foundForm = forms.value.find((item) => item.rfId == newVal);
    badgeDesign.title = foundForm?.name?.toUpperCase();
  }
);

onMounted(async () => {
  if (route.params.eventId) {
    await Promise.all([
      store.dispatch("event/setEvent", route.params.eventId),
      store.dispatch("registrationForm/setForms", route.params.eventId),
      store.dispatch("registrationForm/setFields"),
    ]);
    badgeDesign.event = event.value;
  }
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title title="Create Badge">
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
          @submit.prevent="handleAddBadge"
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
                        v-model="badgeVisibility.fieldIdFront"
                        :value="item.id"
                        density="compact"
                        hide-details="auto"
                      ></v-checkbox>
                    </td>
                    <td>
                      <v-checkbox
                        v-model="badgeVisibility.fieldIdRear"
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
                v-model="badgeDesign.event"
                :rules="[(v) => !!v || 'Event is required!']"
                density="comfortable"
                disabled
                hide-details="auto"
                item-title="name"
                item-value="id"
                label="Event"
              ></v-select>
              <v-select
                v-model="badgeDesign.registrationForm"
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
                    v-model="badgeDesign.title"
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
                    v-model="badgeDesign.colorScheme"
                    customClass="mt-2 mt-md-4"
                    label="Color Scheme"
                  ></color-picker>
                </v-col>
              </v-row>

              <v-row class="mt-1">
                <v-col>
                  <v-text-field
                    v-model="badgeDesign.textTopLeft"
                    clearable
                    density="comfortable"
                    hide-details="auto"
                    label="Text above event logo"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="badgeDesign.textTopRight"
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
                    v-model="badgeDesign.textBottomLeft"
                    clearable
                    density="comfortable"
                    hide-details="auto"
                    label="Text below event logo"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="badgeDesign.textBottomRight"
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
                    >Create
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
      :badge="{ ...badgeDesign, ...badgeVisibility }"
      :badge-visibility="badgeVisibility"
      :event="event"
      card-title="Badge Design Preview"
    ></badge-preview>
  </v-dialog>
</template>

<style scoped></style>
