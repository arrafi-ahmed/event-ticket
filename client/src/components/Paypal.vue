<script setup>
import { loadScript } from "@paypal/paypal-js";
import { onBeforeMount, ref } from "vue";
import { toast } from "vuetify-sonner";
import {useStore} from "vuex";

const store = useStore()
const { amount, currency, clientId } = defineProps([
  "amount",
  "currency",
  "clientId",
]);
const emit = defineEmits(["post-approval"]);
const paid = ref(false);

onBeforeMount(() => {
  store.commit("setProgress", true);
  loadScript({
    "client-id": clientId,
    currency: currency,
    "disable-funding": ["paylater", "venmo", "card"],
  })
    .then((paypal) => {
      paypal
        .Buttons({
          createOrder: createOrder,
          onApprove: onApprove,
        })
        .render("#paypal-button-container");
    })
    .finally(() => store.commit("setProgress", false));
});

const createOrder = (data, actions) => {
  return actions.order.create({
    purchase_units: [
      {
        amount: {
          value: amount,
          currency_code: currency,
        },
      },
    ],
  });
};

const onApprove = (data, actions) => {
  return actions.order.capture().then(() => {
    paid.value = true;
    let msg = "Payment succeeded!";
    toast(msg, {
      cardProps: { color: "success" },
      action: {
        label: "Close",
        buttonProps: {
          color: "white",
        },
        onClick() {},
      },
    });
    emit("post-approval");
  });
};
</script>

<template>
  <v-row v-if="!paid" align="center" class="pa-5" justify="center">
    <v-col cols="auto">
      <div id="paypal-button-container"></div>
    </v-col>
  </v-row>
  <!--  <div v-else id="confirmation">Order complete!</div>-->
</template>

<style>
#paypal-button-container {
  max-width: 250px;
}
</style>
