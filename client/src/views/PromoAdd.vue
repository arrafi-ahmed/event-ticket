<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
const route = useRoute();
const router = useRouter();
const store = useStore();

const event = computed(() => store.state.event.event);
const forms = computed(() => store.state.registrationForm.forms);

const promo = reactive({
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

  promo.registrationFormId = promo.registrationForm;
  delete promo.registrationForm;

  store
    .dispatch("promo/savePromo", {
      promo,
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
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title title="Add Promo Code">
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
                v-model="promo.registrationForm"
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
                v-model="promo.code"
                :rules="[(v) => !!v || 'Name is required!']"
                class="mt-2 mt-md-4"
                clearable
                density="comfortable"
                hide-details="auto"
                label="Promo Code"
              ></v-text-field>
              <v-select
                v-model="promo.discountType"
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
                v-model="promo.discountValue"
                :rules="[(v) => !!v || 'Value is required!']"
                class="mt-2 mt-md-4"
                density="comfortable"
                hide-details="auto"
                label="Discount Value"
                type="number"
              ></v-text-field>
              <v-text-field
                v-model="promo.stockCurr"
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
