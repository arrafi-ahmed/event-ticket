<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive, ref } from "vue";
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

const ticket = reactive({
  name: null,
  stockInit: null,
  stockCurr: null,
  price: null,
  currency: null,
  ticketType: null,
});
const earlyBird = reactive({
  startDate: null,
  endDate: null,
  earlyBirdPrice: null,
  ticketId: null,
});

const form = ref(null);
const isFormValid = ref(true);
const isEarlyBird = ref(false);

const handleAddTicket = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  ticket.eventId = event.value.id;
  ticket.registrationFormId = ticket.registrationForm;
  delete ticket.registrationForm;

  store.dispatch("ticket/addTicket", { ticket, earlyBird }).then((result) => {
    router.push({
      name: "event-single",
      params: { eventId: ticket.eventId },
    });
  });
};

onMounted(async () => {
  if (route.params.eventId) {
    await Promise.all([
      store.dispatch("event/setEvent", route.params.eventId),
      store.dispatch("registrationForm/setForms", route.params.eventId),
    ]);
  }
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title title="Add Ticket">
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
          @submit.prevent="handleAddTicket"
        >
          <v-row>
            <v-col>
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
                v-model="ticket.registrationForm"
                :items="forms"
                :rules="[(v) => !!v || 'Form is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                item-title="name"
                item-value="rfId"
                label="Form"
              ></v-select>
              <v-text-field
                v-model="ticket.name"
                :rules="[(v) => !!v || 'Name is required!']"
                class="mt-2 mt-md-4"
                clearable
                density="comfortable"
                hide-details="auto"
                label="Name"
              ></v-text-field>
              <v-select
                v-model="ticket.ticketType"
                :items="['Standard', 'Free', 'Extras']"
                :rules="[(v) => !!v || 'Ticket type is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Ticket type"
              ></v-select>
              <v-text-field
                v-if="ticket.ticketType !== 'Free'"
                v-model="ticket.price"
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
                v-model="ticket.currency"
                :items="['USD', 'GBP', 'EUR']"
                :rules="[(v) => !!v || 'Currency is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Currency"
                type="number"
              ></v-select>
              <v-text-field
                v-model="ticket.stockInit"
                :rules="[(v) => !!v || 'Initial stock is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Initial stock"
                type="number"
              ></v-text-field>

              <!--              early bird-->
              <v-switch
                v-if="ticket.ticketType !== 'Free'"
                v-model="isEarlyBird"
                :label="`Apply Early Bird price? ${isEarlyBird ? 'Yes' : 'No'}`"
                class="mt-2 mt-md-4"
                hide-details
                inset
              ></v-switch>
              <v-card
                v-if="isEarlyBird && ticket.ticketType !== 'Free'"
                class="border rounded-sm pa-2"
              >
                <v-card-text>
                  <date-picker
                    v-model="earlyBird.startDate"
                    color="primary"
                    custom-class="mt-2 mt-md-4"
                    label="Early Bird Start Date"
                  ></date-picker>
                  <date-picker
                    v-model="earlyBird.endDate"
                    color="primary"
                    custom-class="mt-2 mt-md-4"
                    label="Early Bird End Date"
                  ></date-picker>
                  <v-text-field
                    v-model="earlyBird.earlyBirdPrice"
                    :rules="[(v) => !!v || 'Price is required!']"
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
                >Add
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
