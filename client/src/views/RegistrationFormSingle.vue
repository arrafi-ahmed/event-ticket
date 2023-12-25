<script setup>
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRaw,
  watch,
} from "vue";
import PageTitle from "@/components/PageTitle.vue";
import SummaryPrice from "@/components/SummaryPrice.vue";
import { useDisplay } from "vuetify";
import FormItems from "@/components/FormItems.vue";
import { getCountryList, getCurrencySymbol } from "@/others/util";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "vuetify-sonner";
import { checkStripeStatus, submitStripePayment } from "@/others/payment";
import Paypal from "@/components/Paypal.vue";

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
const settings = computed(() => store.state.settings.settings);

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
        : item.fieldName.toLowerCase() === "phone"
        ? getCountryList("all")
        : undefined,
  }))
);
const getOverAllIndex = (quantities, parentIndex, childIndex) => {
  let totalPreviousIterations = 0;
  for (let i = 0; i < parentIndex; i++) {
    if (quantities[i].ticketType.toLowerCase() !== "extras")
      totalPreviousIterations += Number(quantities[i]?.quantity);
  }
  return totalPreviousIterations + childIndex;
};

const allStandardAnswers = ref([]);
let quantities = reactive([]);

const currency = computed(() => tickets.value[0]?.currency);
const subtotal = computed(() => {
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
  return Number(amountTotal);
});
const tax = computed(() =>
  Number(subtotal.value * (event.value.taxPercentage / 100)).toFixed(2)
);
const total = computed(() => Number(subtotal.value) + Number(tax.value));
const sum = computed(() => {
  return quantities.reduce((total, item) => {
    if (item.ticketType.toLowerCase() !== "extras") {
      let quantity = Number(item.quantity);
      return total + (isNaN(quantity) ? 0 : quantity);
    }
    return total;
  }, 0);
});

//step 1
const submitForm1 = ref(null);
const isSubmitForm1Valid = ref(true);

const handleSubmitStep1 = async () => {
  quantities = quantities.filter((item) => Number(item.quantity) !== 0);

  allStandardAnswers.value = Array(sum.value).fill(null);
  await submitForm1.value[0].validate();
  if (sum.value === 0) isSubmitForm1Valid.value = false;
  if (!isSubmitForm1Valid.value) return;

  currStep.value++;

  // If total amount is 0, skip payment
  if (!total.value) return;

  // Fetch the client secret from your server. --stripe
  await store.dispatch("purchase/setClientSecret", {
    amount: Number(total.value),
    currency: currency.value.toLowerCase(),
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
const handleUpdateAdditionalAnswers = ({ newVal }) => {
  additionalAnswers.value = newVal;
};

//step 2
const formFillerOptions = computed(() => {
  return allStandardAnswers.value.map((item) => item?.[6]);
});
const formFiller = ref(null);

watch(formFillerOptions, (newOptions) => {
  if (!formFiller.value || !newOptions.includes(formFiller.value)) {
    formFiller.value = newOptions[0];
  }
});

const isEmailDuplicated = () => {
  const emails = allStandardAnswers.value.map((item) => item?.[6]);
  const uniqueEmails = new Set(emails);
  return emails.length !== uniqueEmails.size;
};

const submitForm2 = ref(null);
const isSubmitForm2Valid = ref(true);
const handleSubmitStep2 = async () => {
  await submitForm2.value[0].validate();
  if (!isSubmitForm2Valid.value) return;

  //check duplicate email registration
  const isEmailDuplicatedFound = isEmailDuplicated();
  const areRegisteredUsersExist = await store.dispatch(
    "registrationForm/areRegisteredUsersExist",
    {
      allStandardAnswers: allStandardAnswers.value.filter((item) => item),
      formId: route.params.formId,
    }
  );

  if (isEmailDuplicatedFound || areRegisteredUsersExist) {
    toast("Duplicate Email found!", {
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
let stripe = null;
let elements = null;
const paymentTab = ref(total.value ? "stripe" : "none");
const cardElement = ref(null);

//step 3
const handleSubmitStep3 = async () => {
  currStep.value++;

  // If total amount is 0, skip payment
  if (!total.value) return;

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

//step 4
const handleSubmitStepLast = async () => {
  store.commit("setProgress", true);

  let paymentStatus = "pending";
  // If method is stripe & total amount is not 0, continue stripe
  if (paymentTab.value === "stripe" && total.value) {
    await submitStripePayment(elements, stripe);
    paymentStatus = await checkStripeStatus(clientSecret, stripe);
  } else if (paymentTab.value === "paypal") {
    paymentStatus = "succeeded"; //called inside paypal onApproval
  }

  if (!total.value) paymentStatus = "succeeded";

  let questionIds = [];
  if (form.value.questions.length > 0 && form.value.questions[0]) {
    questionIds = form.value.questions.map((item) => item.id);
  }
  store
    .dispatch("registrationForm/submitUserForm", {
      registrationForm: {
        formId: route.params.formId,
        allStandardAnswers: allStandardAnswers.value.filter((item) => item),
        questionIds,
        additionalAnswers: additionalAnswers.value,
        formFillerEmail: formFiller.value,
      },
      purchase: {
        paymentMethod: paymentTab.value,
        paymentStatus,
        totalAmount: Number(total.value),
        tax: tax.value,
      },
      tickets: toRaw(quantities),
      eventId: route.params.eventId,
      currency: currency.value,
      emailBodyForm: form.value.emailBody,
    })
    .then((result) => {
      currStep.value++;
      store.commit("invoice/setInvoice", result.data.payload);
      return router.push({ name: "invoice" });
    })
    .finally(() => {
      store.commit("setProgress", false);
    });
};

const isPaymentBtnDisabled = computed(() => {
  if (!stripe) return true;
  return false;
});

const isTicketTypeExtras = (ticketId) => {
  const foundTicket = tickets.value.find((item) => item.id == ticketId);
  return foundTicket.ticketType.toLowerCase() === "extras";
};

onMounted(async () => {
  await Promise.all([
    store.dispatch("event/setEvent", route.params.eventId),
    store.dispatch("registrationForm/setFields"),
    store.dispatch("registrationForm/setFormWQuestion", route.params.formId),
    store.dispatch("ticket/setTicketsWEarlyBirdActivated", route.params.formId),
    store.dispatch("settings/setSettings"),
  ]);

  Object.assign(
    quantities,
    tickets.value.map(({ id, ticketType, price, name, emailBody }) => ({
      ticketId: id,
      ticketPrice: price,
      ticketType: ticketType.toLowerCase(),
      name,
      quantity: 0,
      emailBodyTicket: emailBody,
    }))
  );
  // Initialize the Stripe instance
  stripe = await loadStripe(settings.value.stripePublic);
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
                <!--          tickets step-->
                <v-card v-if="index === 0">
                  <v-form
                    v-if="tickets.length > 0"
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

                    <summary-price
                      v-if="tickets[0]"
                      :currency="currency"
                      :subtotal="subtotal"
                      :tax="tax"
                      :taxPercentage="event.taxPercentage"
                      :total="total"
                    />

                    <v-row class="mt-2" justify="end">
                      <v-col cols="auto">
                        <v-btn
                          :density="mobile ? 'compact' : 'default'"
                          :disabled="sum < 1"
                          color="primary"
                          type="submit"
                          >Continue
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-form>
                  <v-alert v-else border="start" closable density="compact"
                    >No items found!
                  </v-alert>
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
                        v-if="!isTicketTypeExtras(parentItem.ticketId)"
                        :key="'c-' + childIndex"
                      >
                        <v-divider
                          v-if="parentIndex > 0 || childIndex > 0"
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

                    <div
                      v-if="
                        form.questions &&
                        form.questions.length > 0 &&
                        form.questions[0]
                      "
                    >
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

                    <!--                      form filler-->
                    <v-divider :thickness="2" class="my-5 my-md-10"></v-divider>
                    <h3>Form Filler:</h3>
                    <v-select
                      v-model="formFiller"
                      :items="formFillerOptions"
                      :rules="[(v) => !!v || 'required']"
                      class="mt-2 mt-md-4"
                      density="compact"
                      hide-details="auto"
                    >
                      <template v-slot:label>
                        <span>Select the form filler</span>
                        <span style="color: red">*</span>
                      </template>
                    </v-select>

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
                    <p class="text-pre-wrap pt-2">
                      <span v-if="form.terms">
                        {{ form.terms }}
                      </span>
                      <span v-else> Not available for this form. </span>
                    </p>
                  </div>
                  <v-checkbox
                    v-if="form.terms"
                    v-model="acceptTerms"
                    label="I accept Registration Terms & Condition of the event."
                  ></v-checkbox>
                  <v-row justify="end">
                    <v-col cols="auto">
                      <v-btn
                        :density="mobile ? 'compact' : 'default'"
                        :disabled="form.terms ? !acceptTerms : false"
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
                  <template v-if="total">
                    <h3 class="pb-5">Order Summary</h3>
                    <v-table density="compact">
                      <thead>
                        <tr>
                          <th class="text-start">Ticket Name</th>
                          <th class="text-center">
                            <span class="me-3">Price</span>
                          </th>
                          <th class="text-center">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(item, index) in quantities"
                          :key="'t-' + index"
                        >
                          <td>
                            {{ item.name }}
                          </td>
                          <td class="w-25 text-center">
                            {{ item.ticketPrice }}
                          </td>
                          <td class="w-25 text-center">
                            {{ item.quantity }}
                          </td>
                        </tr>
                      </tbody>
                    </v-table>

                    <summary-price
                      v-if="tickets[0]"
                      :currency="currency"
                      :subtotal="subtotal"
                      :tax="tax"
                      :taxPercentage="event.taxPercentage"
                      :total="total"
                    />

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

                      <v-window-item value="paypal">
                        <Paypal
                          :amount="Number(total)"
                          :client-id="settings.paypalClientId"
                          :currency="currency.toUpperCase()"
                          @post-approval="handleSubmitStepLast"
                        />
                      </v-window-item>

                      <v-window-item value="bank">
                        <div class="pa-5">
                          <div>
                            <span class="font-weight-bold">Notes: </span
                            ><span class="text-pre-wrap">{{
                              settings.invoiceNotes
                            }}</span>
                            <span
                              >Bank Transfer paying in
                              {{ settings.invoiceCurrency }}</span
                            >
                          </div>
                          <div>
                            <span class="font-weight-bold">Bank: </span
                            ><span>{{ settings.bank }}</span>
                          </div>
                          <div>
                            <span class="font-weight-bold">Account Name: </span
                            ><span>{{ settings.accountName }}</span>
                          </div>
                          <div>
                            <span class="font-weight-bold">IBAN: </span
                            ><span>{{ settings.iban }}</span>
                          </div>
                          <div>
                            <span class="font-weight-bold">SWIFT/BIC: </span
                            ><span>{{ settings.swift }}</span>
                          </div>
                          <div>DOWNLOAD YOUR INVOICE AT THE TOP</div>
                        </div>
                      </v-window-item>
                    </v-window>
                  </template>
                  <template v-else> Payment not required</template>

                  <v-row v-if="paymentTab !== 'paypal'" justify="end">
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
