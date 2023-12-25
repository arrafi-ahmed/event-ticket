<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import DatePicker from "@/components/DatePicker.vue";

const { mobile } = useDisplay();
const route = useRoute();
const router = useRouter();
const store = useStore();

const event = computed(() => store.state.event.event);
const forms = computed(() => store.state.registrationForm.forms);
const tickets = computed(() => store.state.ticket.tickets);
const ticket = computed(() => store.state.ticket.ticket);

const newTicket = reactive({
  id: null,
  name: null,
  stockInit: null,
  stockCurr: null,
  price: null,
  currency: null,
  ticketType: null,
  emailBody: null,
});
const earlyBird = reactive({
  id: null,
  startDate: null,
  endDate: null,
  earlyBirdPrice: null,
  ticketId: null,
});

const form = ref(null);
const isFormValid = ref(true);

const isEarlyBird = computed(() => !!newTicket.eId);
const newIsEarlyBird = ref(false);

const submittingForm = ref(false);

const handleEditTicket = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  submittingForm.value = true;

  newTicket.eventId = event.value.id;
  newTicket.registrationFormId = newTicket.registrationForm;
  newTicket.id = newTicket.ticket;
  delete newTicket.registrationForm;
  delete newTicket.ticket;
  delete newTicket.eId;
  delete newTicket.startDate;
  delete newTicket.endDate;
  delete newTicket.earlyBirdPrice;
  delete newTicket.ticketId;

  store
    .dispatch("ticket/addTicket", {
      ticket: newTicket,
      earlyBird,
    })
    .then((result) => {
      // router.push({
      //   name: "event-single",
      //   params: { eventId: event.value.id },
      // });
    })
    .finally(() => (submittingForm.value = false));
};

onMounted(async () => {
  if (route.params.eventId) {
    await Promise.all([
      store.dispatch("event/setEvent", route.params.eventId),
      store.dispatch("registrationForm/setForms", route.params.eventId),
      // store.dispatch("registrationForm/setTickets", newTicket.registrationForm),
    ]);
  }
});

watch(
  () => event.value,
  (newVal, oldVal) => {
    console.log(10, newVal, oldVal);
    if (oldVal && !submittingForm.value)
      store.dispatch("registrationForm/setForms", newVal.id);
  }
);

let updatingRegistrationForm = ref(false);
watch(
  () => newTicket.registrationForm,
  (newVal, oldVal) => {
    console.log(11, newVal, oldVal);
    updatingRegistrationForm.value = true;

    if (!submittingForm.value) {
      store.dispatch("ticket/setTickets", newVal);
    }
    updatingRegistrationForm.value = false;
  }
);

watch(
  () => newTicket.ticket,
  (newVal, oldVal) => {
    console.log(12, newVal, oldVal);
    if (!updatingRegistrationForm.value && !submittingForm.value)
      store.dispatch("ticket/setTicket", newVal).then(() => {
        Object.assign(newTicket, { ...ticket.value });
        Object.assign(newIsEarlyBird, { ...isEarlyBird });
        if (ticket.value.eId)
          Object.assign(earlyBird, {
            id: ticket.value.eId,
            startDate: new Date(ticket.value.startDate),
            endDate: new Date(ticket.value.endDate),
            earlyBirdPrice: ticket.value.earlyBirdPrice,
            ticketId: ticket.value.ticketId,
          });
      });
  }
);
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title title="Edit Ticket">
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
          @submit.prevent="handleEditTicket"
        >
          <v-row>
            <v-col>
              <v-select
                v-model="event"
                :rules="[(v) => !!v || 'Event is required!']"
                disabled
                density="comfortable"
                hide-details="auto"
                item-title="name"
                item-value="id"
                label="Event"
              ></v-select>
              <v-select
                v-model="newTicket.registrationForm"
                :items="forms"
                :rules="[(v) => !!v || 'Form is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                item-title="name"
                item-value="rfId"
                label="Form"
              ></v-select>
              <v-select
                v-model="newTicket.ticket"
                :items="tickets"
                :rules="[(v) => !!v || 'Ticket is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                item-title="name"
                item-value="id"
                label="Ticket"
              ></v-select>
              <v-text-field
                v-model="newTicket.name"
                :rules="[(v) => !!v || 'Name is required!']"
                class="mt-2 mt-md-4"
                clearable
                density="comfortable"
                hide-details="auto"
                label="Name"
              ></v-text-field>
              <v-select
                v-model="newTicket.ticketType"
                :items="['Standard', 'Free', 'Extras']"
                :rules="[(v) => !!v || 'Ticket type is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Ticket type"
              ></v-select>
              <v-text-field
                v-if="newTicket.ticketType !== 'Free'"
                v-model="newTicket.price"
                :rules="[(v) => !!v || 'Price is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Price"
                type="number"
              ></v-text-field>
              <v-text-field
                v-else
                :model-value="0"
                class="mt-2 mt-md-4"
                density="comfortable"
                disabled
                hide-details="auto"
                label="Price"
                type="number"
              ></v-text-field>
              <v-select
                v-model="newTicket.currency"
                :items="['USD', 'GBP', 'EUR']"
                :rules="[(v) => !!v || 'Currency is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Currency"
                type="number"
              ></v-select>
              <v-text-field
                v-model="newTicket.stockInit"
                :rules="[(v) => !!v || 'Initial stock is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Initial stock"
                type="number"
              ></v-text-field>
              <v-textarea
                v-model="newTicket.emailBody"
                class="mt-2 mt-md-4 text-pre-wrap"
                clearable
                density="compact"
                hide-details="auto"
                label="Email Content for ticket"
              >
              </v-textarea>

              <!--              early bird-->
              <v-switch
                v-if="newTicket.ticketType !== 'Free'"
                v-model="isEarlyBird"
                :label="`Apply Early Bird price? ${isEarlyBird ? 'Yes' : 'No'}`"
                class="mt-2 mt-md-4"
                hide-details
                disabled
                inset
              ></v-switch>
              <v-card
                v-if="isEarlyBird && newTicket.ticketType !== 'Free'"
                class="border rounded-sm pa-2"
              >
                <v-card-text>
                  <date-picker
                    v-model="earlyBird.startDate"
                    :rules="[
                      (v) =>
                        (isEarlyBird && !!earlyBird.startDate) ||
                        'Start Date is required!',
                    ]"
                    color="primary"
                    custom-class="mt-2 mt-md-4"
                    label="Early Bird Start Date"
                  ></date-picker>
                  <date-picker
                    v-model="earlyBird.endDate"
                    :rules="[
                      (v) =>
                        (isEarlyBird && !!earlyBird.endDate) ||
                        'End Date is required!',
                    ]"
                    color="primary"
                    custom-class="mt-2 mt-md-4"
                    label="Early Bird End Date"
                  ></date-picker>
                  <v-text-field
                    v-model="earlyBird.earlyBirdPrice"
                    :rules="[
                      (v) => (isEarlyBird && !!v) || 'Price is required!',
                    ]"
                    class="mt-2 mt-md-4"
                    density="comfortable"
                    hide-details="auto"
                    label="Early Bird Price"
                    type="number"
                  ></v-text-field>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row justify="end">
            <v-col cols="auto">
              <v-btn
                :density="mobile ? 'comfortable' : 'default'"
                color="primary"
                type="submit"
                variant="tonal"
                >Save
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
