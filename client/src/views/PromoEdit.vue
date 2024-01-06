<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
const route = useRoute();
const router = useRouter();
const store = useStore();

const event = computed(() => store.state.event.event);
const forms = computed(() => store.state.registrationForm.forms);
const promos = computed(() => store.state.promo.promos);
const promo = computed(() => store.state.promo.promo);

const newPromo = reactive({
  id: null,
  code: null,
  discountType: null,
  discountValue: null,
  stockCurr: null,
});

const discountTypeItems = [
  { title: "Fixed Amount", value: 0 },
  { title: "Percentage", value: 1 },
];
const form = ref(null);
const isFormValid = ref(true);

const submittingForm = ref(false);

const handleSaveTicket = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  submittingForm.value = true;

  newPromo.id = newPromo.promo;
  newPromo.registrationFormId = newPromo.registrationForm;
  delete newPromo.promo;
  delete newPromo.registrationForm;

  store
    .dispatch("promo/savePromo", {
      promo: newPromo,
    })
    .then((result) => {
      router.push({
        name: "event-single",
        params: { eventId: event.value.id },
      });
    })
    .finally(() => (submittingForm.value = false));
};

onMounted(async () => {
  if (route.params.eventId) {
    await Promise.all([
      store.dispatch("event/setEvent", route.params.eventId),
      store.dispatch("registrationForm/setForms", route.params.eventId),
    ]);
  }
});

watch(
  () => event.value,
  (newVal, oldVal) => {
    if (oldVal && !submittingForm.value)
      store.dispatch("registrationForm/setForms", newVal.id);
  }
);

let updatingRegistrationForm = ref(false);
watch(
  () => newPromo.registrationForm,
  (newVal, oldVal) => {
    updatingRegistrationForm.value = true;

    if (!submittingForm.value) {
      store.dispatch("promo/setPromos", newVal);
    }
    updatingRegistrationForm.value = false;
  }
);

watch(
  () => newPromo.promo,
  (newVal, oldVal) => {
    if (!updatingRegistrationForm.value && !submittingForm.value) {
      store.dispatch("promo/setPromo", newVal).then(() => {
        Object.assign(newPromo, { ...promo.value });
      });
    }
  }
);
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title title="Edit Promo Code">
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
          @submit.prevent="handleSaveTicket"
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
                v-model="newPromo.registrationForm"
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
                v-model="newPromo.promo"
                :items="promos"
                :rules="[(v) => !!v || 'Promo is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                item-title="code"
                item-value="id"
                label="Promo"
              ></v-select>
              <v-text-field
                v-model="newPromo.code"
                :rules="[(v) => !!v || 'Name is required!']"
                class="mt-2 mt-md-4"
                clearable
                density="comfortable"
                hide-details="auto"
                label="Code"
              ></v-text-field>
              <v-select
                v-model="newPromo.discountType"
                :items="discountTypeItems"
                :rules="[(v) => v != null || 'Discount type is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                item-title="title"
                item-value="value"
                label="Discount type"
              ></v-select>
              <v-text-field
                v-model="newPromo.discountValue"
                :rules="[(v) => !!v || 'Value is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Discount Value"
                type="number"
              ></v-text-field>
              <v-text-field
                v-model="newPromo.stockCurr"
                :rules="[(v) => !!v || 'Stock is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Stock"
                type="number"
              ></v-text-field>
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
