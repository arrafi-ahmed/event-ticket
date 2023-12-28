<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import PageTitle from "@/components/PageTitle.vue";
import { useDisplay } from "vuetify";
import { getEventLogoUrl } from "@/others/util";

const { mobile } = useDisplay();

const route = useRoute();
const store = useStore();

const event = computed(() => store.state.event.event);
const forms = computed(() => store.state.registrationForm.forms);

const newFormTypeInit = { name: null, eventId: null };
const newFormType = reactive({ ...newFormTypeInit });

const formTypeDialog = ref(false);

const formTypeForm = ref(null);
const isFormTypeFormValid = ref(true);

const handleSubmitFormType = async () => {
  await formTypeForm.value.validate();
  if (!isFormTypeFormValid.value) return;

  newFormType.eventId = route.params.eventId;
  store.dispatch("registrationForm/addFormType", newFormType).then(() => {
    formTypeDialog.value = !formTypeDialog.value;
  });
};

const handleDownloadAttendeeReport = () => {
  store.dispatch("report/downloadAttendeeReport", route.params.eventId);
};
const handleDownloadCheckinReport = () => {
  store.dispatch("report/downloadCheckinReport", route.params.eventId);
};
const handleDownloadScannedBadgeReport = () => {
  store.dispatch("report/downloadScannedBadgeReport", route.params.eventId);
};
const handleDownloadFinancialReport = () => {
  store.dispatch("report/downloadFinancialReport", route.params.eventId);
};
const handleDownloadSurveyReport = () => {
  store.dispatch("report/downloadSurveyReport", route.params.eventId);
};

const fetchData = async () => {
  return Promise.all([
    store.dispatch("registrationForm/setFormTypes", route.params.eventId),
    store.dispatch("event/setEvent", route.params.eventId),
    store.dispatch("registrationForm/setForms", route.params.eventId),
  ]);
};
watch(
  () => route.params.eventId,
  async (newItem, oldItem) => {
    if (route.name === "event-single" && newItem && newItem !== oldItem) {
      await fetchData();
    }
  }
);
onMounted(() => {
  fetchData();
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title :title="event.name" justify="space-between">
          <v-row align="center">
            <v-col v-if="event.logoLeft" cols="auto">
              <div>
                <small>Event Logo:</small>
              </div>
              <v-avatar rounded="sm" size="x-large">
                <v-img :src="getEventLogoUrl(event.logoLeft)" />
              </v-avatar>
            </v-col>
            <v-col v-if="event.logoRight" cols="auto">
              <div>
                <small>Sponsor Logo:</small>
              </div>
              <v-avatar rounded="sm" size="x-large">
                <v-img :src="getEventLogoUrl(event.logoRight)" />
              </v-avatar>
            </v-col>

            <v-divider class="mx-2" inset vertical></v-divider>

            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  class="ml-5"
                  color="primary"
                  v-bind="props"
                  variant="tonal"
                >
                  Add
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item
                  density="compact"
                  link
                  title="Form Type"
                  @click="formTypeDialog = true"
                ></v-list-item>
                <v-list-item
                  :to="{
                    name: 'registration-form-add',
                  }"
                  density="compact"
                  title="Form"
                ></v-list-item>
                <v-list-item
                  :to="{
                    name: 'badge-create',
                    params: {
                      eventId: route.params.eventId,
                    },
                  }"
                  density="compact"
                  title="Badge"
                ></v-list-item>
                <v-list-item
                  :to="{
                    name: 'ticket-add',
                    params: {
                      eventId: route.params.eventId,
                    },
                  }"
                  density="compact"
                  title="Ticket"
                ></v-list-item>
                <v-list-item
                  :to="{
                    name: 'exhibitor-visibility-add',
                    params: {
                      eventId: route.params.eventId,
                    },
                  }"
                  density="compact"
                  title="Exhibitor Visibility"
                ></v-list-item>
                <v-list-item
                  :to="{
                    name: 'credential-generate',
                    params: {
                      eventId: route.params.eventId,
                    },
                  }"
                  density="compact"
                  title="Generate Credential"
                ></v-list-item>
              </v-list>
            </v-menu>
          </v-row>
        </page-title>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6">
        <v-card density="compact">
          <v-card-title>
            <span>Forms</span>
            <v-divider class="my-2"></v-divider>
          </v-card-title>
          <v-card-text>
            <v-list v-if="forms.length > 0" density="compact">
              <template v-for="(item, index) in forms">
                <v-list-item
                  v-if="item"
                  :key="index"
                  :title="`${item?.name} Registration`"
                  :to="{
                    name: 'registration-form-single',
                    params: {
                      eventId: route.params.eventId,
                      formId: item.rfId,
                    },
                  }"
                ></v-list-item>
              </template>
            </v-list>
            <v-alert v-else border="start" closable density="compact"
              >No items found!
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card density="compact">
          <v-card-title>
            <span>Attendees</span>
            <v-divider class="my-2"></v-divider>
          </v-card-title>
          <v-card-text>
            <v-list v-if="forms.length > 0" density="compact">
              <template v-for="(item, index) in forms">
                <v-list-item
                  v-if="item"
                  :key="index"
                  :title="`${item?.name}`"
                  :to="{
                    name: 'users',
                    params: {
                      eventId: route.params.eventId,
                      formId: item.rfId,
                    },
                  }"
                ></v-list-item>
              </template>
            </v-list>
            <v-alert v-else border="start" closable density="compact"
              >No items found!
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card density="compact">
          <v-card-title>
            <span>Reports</span>
            <v-divider class="my-2"></v-divider>
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                link
                title="Attendee Report"
                @click="handleDownloadAttendeeReport"
              ></v-list-item>
              <v-list-item
                link
                title="Check-In Report"
                @click="handleDownloadCheckinReport"
              ></v-list-item>
              <v-list-item
                link
                title="Scanned Badge Report"
                @click="handleDownloadScannedBadgeReport"
              ></v-list-item>
              <v-list-item
                link
                title="Revenue Report"
                @click="handleDownloadFinancialReport"
              ></v-list-item>
              <v-list-item
                link
                title="Survey Report"
                @click="handleDownloadSurveyReport"
              ></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card density="compact">
          <v-card-title>
            <span>Modify Data</span>
            <v-divider class="my-2"></v-divider>
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                :to="{
                  name: 'event-edit',
                  params: { eventId: $route.params.eventId },
                }"
                link
                title="Modify Event"
              ></v-list-item>
              <v-list-item
                :to="{
                  name: 'registration-form-edit',
                  params: { eventId: $route.params.eventId },
                }"
                link
                title="Modify Form"
              ></v-list-item>
              <v-list-item
                :to="{
                  name: 'ticket-edit',
                  params: { eventId: $route.params.eventId },
                }"
                link
                title="Modify Tickets"
              ></v-list-item>
              <v-list-item
                :to="{
                  name: 'badge-edit',
                  params: { eventId: $route.params.eventId },
                }"
                link
                title="Modify Badge"
              ></v-list-item>
              <v-list-item
                :to="{
                  name: 'exhibitor-visibility-edit',
                  params: { eventId: $route.params.eventId },
                }"
                link
                title="Modify Exhibitor Visibility"
              ></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="formTypeDialog" width="350">
    <v-card>
      <v-card-title>
        <span>Add Registration Form Type</span>
      </v-card-title>
      <v-card-text>
        <v-form
          ref="formTypeForm"
          v-model="isFormTypeFormValid"
          fast-fail
          @submit.prevent="handleSubmitFormType"
        >
          <v-text-field
            v-model="newFormType.name"
            :rules="[(v) => !!v || 'Form Type is required!']"
            class="mt-2"
            clearable
            density="compact"
            hide-details="auto"
            label="Form Type"
            variant="solo"
          ></v-text-field>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :density="mobile ? 'compact' : 'default'"
              color="primary"
              type="submit"
              variant="tonal"
              >Submit
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
