<script setup>
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import PageTitle from "@/components/PageTitle.vue";
import { useDisplay } from "vuetify";
import FormItems from "@/components/FormItems.vue";
import { getCountryList, getCurrencySymbol } from "@/util";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "vuetify-sonner";

const { mobile } = useDisplay();
const route = useRoute();
const router = useRouter();
const store = useStore();

const isSignedin = computed(() => store.getters["user/isSignedin"]);
const event = computed(() => store.state.event.event);
const form = computed(() => store.state.registrationForm.formWQuestion);
const fields = computed(() => store.state.registrationForm.fields);
const tickets = computed(() => store.state.ticket.tickets);
const clientSecret = computed(() => store.state.purchase.clientSecret);

const currStep = ref(1);
const steps = ref(["Ticket", "Registration", "T&C", "Payment"]);
const acceptTerms = ref(false);

const formattedFields = computed(() =>
  fields.value.map((item) => ({
    ...item,
    text: item.fieldName,
    typeId: item.type,
    options:
      item.fieldName.toLowerCase() === "country"
        ? getCountryList("name")
        : undefined,
  }))
);
const getOverAllIndex = (quantities, parentIndex, childIndex) => {
  let totalPreviousIterations = 0;
  for (let i = 0; i < parentIndex; i++) {
    totalPreviousIterations += Number(quantities[i]?.quantity);
  }
  return totalPreviousIterations + childIndex;
};

const allStandardAnswers = ref([]);
let quantities = reactive([]);

const amountSum = computed(() => {
  let amountTotal = 0;
  quantities.forEach((parentItem) => {
    const foundTicket = tickets.value.find(
      (childItem) => parentItem.ticketId == childItem.id
    );
    amountTotal +=
      (foundTicket.earlyBirdPrice
        ? foundTicket.earlyBirdPrice
        : foundTicket.price) * parentItem.quantity;
  });
  return amountTotal;
});

//step 1
const submitForm1 = ref(null);
const isSubmitForm1Valid = ref(true);
const handleSubmitStep1 = async () => {
  let sum = quantities.reduce((total, item) => {
    let quantity = Number(item.quantity);
    return total + (isNaN(quantity) ? 0 : quantity);
  }, 0);

  quantities = quantities.filter((item) => Number(item.quantity) !== 0);

  allStandardAnswers.value = Array(sum).fill(null);
  await submitForm1.value[0].validate();
  if (sum === 0) isSubmitForm1Valid.value = false;
  if (!isSubmitForm1Valid.value) return;

  currStep.value++;

  // If total amount is 0, skip payment
  if (!amountSum.value) return;

  // Fetch the client secret from your server.
  await store.dispatch("purchase/setClientSecret", {
    amount: Number(amountSum.value),
    currency: tickets.value[0]?.currency.toLowerCase(),
  });
};
const standardAnswers = ref([]);
const handleUpdateStandardAnswers = ({
  newVal,
  overAllIndex,
  quantityIndex,
}) => {
  standardAnswers.value = [...newVal, quantities[quantityIndex].ticketId];
  allStandardAnswers.value[overAllIndex] = standardAnswers.value;
};

const additionalAnswers = ref([]);
const handleUpdateAdditionalAnswers = (value) => {
  additionalAnswers.value = value;
};

//step 2
const submitForm2 = ref(null);
const isSubmitForm2Valid = ref(true);
const handleSubmitStep2 = async () => {
  await submitForm2.value[0].validate();
  if (!isSubmitForm2Valid.value) return;

  //check duplicate email registration
  const areRegisteredUsersExist = await store.dispatch(
    "registrationForm/areRegisteredUsersExist",
    {
      allStandardAnswers: allStandardAnswers.value,
      formId: route.params.formId,
    }
  );
  if (areRegisteredUsersExist) {
    toast("Email already registered!", {
      cardProps: { color: "error" },
      action: {
        label: "Close",
        buttonProps: {
          color: "white",
        },
        onClick() {},
      },
    });
    return;
  }

  currStep.value++;
};

//stripe payment
let stripe = null; // Declare a variable to store the Stripe instance
let elements = null;
const paymentTab = ref(amountSum.value ? "stripe" : "none");
const cardElement = ref(null);

//step 3
const handleSubmitStep3 = async () => {
  currStep.value++;

  // If total amount is 0, skip payment
  if (!amountSum.value) return;

  store.commit("setProgress", true);

  const appearance = {
    theme: "stripe",
  };

  // Pass the appearance object to the Elements instance
  elements = stripe.elements({
    clientSecret: clientSecret.value,
    appearance,
  });

  const paymentElement = elements.create("payment");
  await nextTick(() => {
    paymentElement.mount(cardElement.value[0]);
  });

  paymentElement.on("ready", () => {
    store.commit("setProgress", false);
  });
};

//before step 4
const submitStripePayment = async () => {
  if (!stripe) return;

  const { error } = await stripe.confirmPayment({
    elements,
    redirect: "if_required",
  });

  if (error) {
    let msg = "";
    if (error.type === "card_error" || error.type === "validation_error") {
      msg = error.message;
    } else {
      msg = "An unexpected error occurred.";
    }
    toast(msg, {
      cardProps: { color: "error" },
      action: {
        label: "Close",
        buttonProps: {
          color: "white",
        },
        onClick() {},
      },
    });
  }
};

async function checkStripeStatus() {
  if (!clientSecret.value) return;

  const { paymentIntent } = await stripe.retrievePaymentIntent(
    clientSecret.value
  );

  let msg = "";
  let color = "";
  switch (paymentIntent.status) {
    case "succeeded":
      msg = "Payment succeeded!";
      color = "success";
      break;
    case "processing":
      msg = "Your payment is processing.";
      color = "info";
      break;
    case "requires_payment_method":
      msg = "Your payment was not successful, please try again.";
      color = "error";
      break;
    default:
      msg = "Something went wrong.";
      color = "error";
      break;
  }

  toast(msg, {
    cardProps: { color },
    action: {
      label: "Close",
      buttonProps: {
        color: "white",
      },
      onClick() {},
    },
  });
  return paymentIntent.status;
}

//step 4
const handleSubmitStepLast = async () => {
  store.commit("setProgress", true);

  let paymentStatus = "succeeded";
  // If total amount is 0, skip payment
  if (amountSum.value) {
    await submitStripePayment();
    paymentStatus = await checkStripeStatus();
  }

  let qustionIds = [];
  if (form.value.questions.length > 0 && form.value.questions[0]) {
    qustionIds = form.value.questions.map((item) => item.id);
  }
  store
    .dispatch("registrationForm/submitUserForm", {
      registrationForm: {
        formId: route.params.formId,
        allStandardAnswers: allStandardAnswers.value,
        qustionIds,
        additionalAnswers: additionalAnswers.value,
      },
      purchase: {
        paymentMethod: paymentTab.value,
        paymentStatus: paymentStatus,
        totalAmount: Number(amountSum.value), //TODO: fix total amount
        ticketId: quantities.map((item) => item.ticketId),
      },
    })
    .then((result) => {
      currStep.value++;
      router.push({ name: "home" });
    })
    .catch((err) => {
      console.log(1, err);
    })
    .finally(() => {
      store.commit("setProgress", false);
    });
};

const disable = computed(() => {
  return currStep.value === 1
    ? "prev"
    : currStep.value === steps.value
    ? "next"
    : undefined;
});

const isPaymentBtnDisabled = computed(() => {
  if (!stripe) return true;
  return false;
});

onMounted(async () => {
  await Promise.all([
    store.dispatch("event/setEvent", route.params.eventId),
    store.dispatch("registrationForm/setFields"),
    store.dispatch("registrationForm/setFormWQuestion", route.params.formId),
    store.dispatch("ticket/setTickets", {
      eventId: route.params.eventId,
      registrationFormId: route.params.formId,
    }),
  ]);

  Object.assign(
    quantities,
    tickets.value.map((obj) => {
      return { ticketId: obj.id, name: obj.name, quantity: 0 };
    })
  );

  // Initialize the Stripe instance
  stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC);
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title :title="event.name" justify="space-between">
          <v-btn
            v-if="isSignedin"
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.back()"
          ></v-btn>
        </page-title>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <h3 class="pb-2 pb-md-4">{{ form.name }} Registration Form</h3>
        <v-stepper v-model="currStep" :mobile="mobile" alt-labels hide-actions>
          <template v-slot:default="{ prev, next }">
            <v-stepper-header>
              <template v-for="(item, index) in steps" :key="index">
                <v-stepper-item
                  :complete="currStep > index + 1"
                  :title="item"
                  :value="index + 1"
                ></v-stepper-item>

                <v-divider
                  v-if="index + 1 !== steps.length"
                  :key="'d-' + index + 1"
                ></v-divider>
              </template>
            </v-stepper-header>

            <v-stepper-window>
              <v-stepper-window-item
                v-for="(item, index) in steps"
                :key="'s-' + index"
                :value="index + 1"
              >
                <!--                {{ quantities }}<br /><br />{{ tickets }}<br /><br />{{-->
                <!--                  amountSum-->
                <!--                }}-->
                <!--                tickets step-->
                <v-card v-if="index === 0">
                  <v-form
                    ref="submitForm1"
                    v-model="isSubmitForm1Valid"
                    @submit.prevent="handleSubmitStep1"
                  >
                    <v-table density="comfortable">
                      <thead>
                        <tr>
                          <th class="text-start">Ticket Name</th>
                          <th class="text-end">
                            <span class="me-3">Price</span>
                          </th>
                          <th class="text-end">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(ticketItem, ticketIndex) in tickets"
                          :key="'t-' + ticketIndex"
                        >
                          <td>
                            {{ ticketItem.name }}
                            <v-chip
                              v-if="ticketItem.earlyBirdPrice"
                              class="ml-2"
                              color="green"
                              prepend-icon="mdi-sale"
                            >
                              Early Bird Price
                            </v-chip>
                            <v-chip
                              v-if="ticketItem.ticketType === 'Extras'"
                              class="ml-2"
                              color="primary"
                              prepend-icon="mdi-plus"
                            >
                              Extras
                            </v-chip>
                          </td>
                          <td class="w-25 text-end">
                            <span v-if="ticketItem.earlyBirdPrice">
                              <v-chip
                                :prepend-icon="
                                  getCurrencySymbol(ticketItem.currency, 'icon')
                                "
                                class="chip-currency"
                                color="error"
                                size="large"
                              >
                                <span
                                  class="text-decoration-line-through chip-currency-font"
                                  >{{ ticketItem.price }}</span
                                >
                              </v-chip>
                              <v-chip
                                :prepend-icon="
                                  getCurrencySymbol(ticketItem.currency, 'icon')
                                "
                                class="ml-2 chip-currency"
                                size="large"
                              >
                                <span class="chip-currency-font">{{
                                  ticketItem.earlyBirdPrice
                                }}</span>
                              </v-chip>
                            </span>

                            <v-chip
                              v-else
                              :prepend-icon="
                                getCurrencySymbol(ticketItem.currency, 'icon')
                              "
                              class="chip-currency"
                              size="large"
                            >
                              <span class="chip-currency-font">{{
                                ticketItem.price
                              }}</span>
                            </v-chip>
                          </td>
                          <td class="w-25">
                            <v-text-field
                              v-if="
                                quantities[ticketIndex] &&
                                quantities[ticketIndex].quantity !== undefined
                              "
                              v-model="quantities[ticketIndex].quantity"
                              :rules="[
                                (v) =>
                                  (v >= 0 && v <= ticketItem.stockCurr) ||
                                  'Invalid',
                              ]"
                              class="ml-auto"
                              density="comfortable"
                              hide-details="auto"
                              single-line
                              style="width: 75px !important"
                              type="number"
                              variant="outlined"
                            ></v-text-field>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>

                    <v-row align="center" class="mt-2" justify="end">
                      <v-col cols="auto">
                        <span class="text-h6">Total:</span>
                      </v-col>
                      <v-col cols="auto">
                        <v-chip
                          v-if="tickets[0]"
                          :prepend-icon="
                            getCurrencySymbol(tickets?.[0]?.currency, 'icon')
                          "
                          class="chip-currency"
                          size="x-large"
                        >
                          <span class="chip-currency-font">{{
                            amountSum
                          }}</span>
                        </v-chip>
                      </v-col>
                    </v-row>

                    <v-row class="mt-2" justify="end">
                      <v-col cols="auto">
                        <v-btn
                          :density="mobile ? 'compact' : 'default'"
                          color="primary"
                          type="submit"
                          >Continue
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card>

                <!--                registration step-->
                <v-card v-if="index === 1">
                  <v-form ref="submitForm2" v-model="isSubmitForm2Valid">
                    <template
                      v-for="(parentItem, parentIndex) in quantities"
                      :key="'p-' + parentIndex"
                    >
                      <template
                        v-for="(childItem, childIndex) in Number(
                          parentItem.quantity
                        )"
                        :key="'c-' + childIndex"
                      >
                        <v-divider
                          v-if="parentIndex > 0"
                          class="my-10"
                        ></v-divider>
                        <div>
                          <strong>Ticket: </strong>{{ parentItem.name }}
                        </div>

                        <form-items
                          v-if="formattedFields && formattedFields?.length > 0"
                          :items="formattedFields"
                          :overAllIndex="
                            getOverAllIndex(quantities, parentIndex, childIndex)
                          "
                          :quantityIndex="parentIndex"
                          @update="handleUpdateStandardAnswers"
                        />
                      </template>
                    </template>

                    <div v-if="form.questions && form.questions.length > 0">
                      <v-divider
                        :thickness="2"
                        class="my-5 my-md-10"
                      ></v-divider>
                      <h3>Survey Questions:</h3>
                      <form-items
                        :items="form.questions"
                        type="question"
                        @update="handleUpdateAdditionalAnswers"
                      />
                    </div>

                    <v-row justify="end">
                      <v-col cols="auto">
                        <v-btn
                          :density="mobile ? 'compact' : 'default'"
                          class="mt-2 mt-md-4"
                          color="primary"
                          @click.prevent="handleSubmitStep2"
                          >Continue
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card>

                <!--                terms step-->
                <v-card v-if="index === 2">
                  <div>
                    <h3>Registration Terms & Condition</h3>
                    <p class="text-pre-wrap">
                      {{ event.terms }}
                    </p>
                  </div>
                  <v-checkbox
                    v-model="acceptTerms"
                    label="I accept Registration Terms & Condition of the event."
                  ></v-checkbox>
                  <v-row justify="end">
                    <v-col cols="auto">
                      <v-btn
                        :density="mobile ? 'compact' : 'default'"
                        :disabled="!acceptTerms"
                        class="mt-2 mt-md-4"
                        color="primary"
                        type="submit"
                        @click.prevent="handleSubmitStep3"
                        >Continue
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>

                <!--                payment step-->
                <v-card v-if="index === 3">
                  <template v-if="amountSum">
                    <h3 class="pb-5">Payment Methods</h3>

                    <v-tabs v-model="paymentTab" bg-color="primary">
                      <v-tab value="stripe">Stripe</v-tab>
                      <v-tab value="paypal">Paypal</v-tab>
                      <v-tab value="bank">Bank</v-tab>
                    </v-tabs>

                    <v-window v-model="paymentTab">
                      <v-window-item value="stripe">
                        <div ref="cardElement" class="ma-5"></div>
                      </v-window-item>

                      <v-window-item value="paypal"> sdf</v-window-item>

                      <v-window-item value="bank"> bank</v-window-item>
                    </v-window>
                  </template>
                  <template v-else> Payment not required</template>

                  <v-row justify="end">
                    <v-col cols="auto">
                      <v-btn
                        :density="mobile ? 'compact' : 'default'"
                        :disabled="isPaymentBtnDisabled"
                        class="mt-2 mt-md-4"
                        color="primary"
                        @click.prevent="handleSubmitStepLast"
                        >Submit
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-stepper-window-item>
            </v-stepper-window>

            <!--              <v-stepper-actions-->
            <!--                :disable="disable"-->
            <!--                @click:next="handleSubmitStep1"-->
            <!--              ></v-stepper-actions>-->
          </template>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.chip-currency .v-icon--size-default {
  font-size: initial !important;
}

.chip-currency-font {
  font-size: 1.2rem;
}
</style>
