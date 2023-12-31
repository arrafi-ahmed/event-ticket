<script setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { formatDate, getCurrencySymbol, padStr } from "@/others/util";

const store = useStore();
const invoice = computed(() => store.state.purchase.invoice);
const settings = computed(() => store.state.settings.settings);
const currency = ref(null);

const printInvoice = () => {
  window.print();
};

onMounted(() => {
  currency.value = getCurrencySymbol(invoice.value.currency, "symbol");
});
</script>

<template>
  <v-container class="d-print-none">
    <v-row justify="end">
      <v-btn color="primary" variant="tonal" @click="$router.back()"
        >Go Back
      </v-btn>
      <v-btn class="ml-1" color="primary" variant="tonal" @click="printInvoice"
        >Print
      </v-btn>
    </v-row>
  </v-container>
  <div v-if="invoice" class="invoice-wrapper d-print-block">
    <header>
      <h1>Invoice</h1>
      <address>
        <p>
          <strong>{{ settings.companyName }}</strong>
        </p>
        <p>{{ settings.street }}</p>
        <p>{{ settings.town }}</p>
        <p>{{ settings.county }} {{ settings.zip }}</p>
        <p>{{ settings.country }}</p>
      </address>
      <span class="logo"> <v-img src="/img/logo.svg"></v-img></span>
    </header>
    <article>
      <address v-if="invoice?.user">
        <p><strong>Recipient</strong></p>
        <p>
          {{ invoice.user.organization }}<br />{{ invoice.user.firstname }}
          {{ invoice.user.surname }}
        </p>
      </address>

      <table v-if="invoice?.purchase" class="meta">
        <tr>
          <th><span>Invoice #</span></th>
          <td>
            <span>{{ padStr(invoice.purchase.id, 8) }}</span>
          </td>
        </tr>
        <tr>
          <th><span>Date</span></th>
          <td>
            <span>{{ formatDate(invoice.purchase.createdAt) }}</span>
          </td>
        </tr>
      </table>

      <div v-if="invoice?.event" class="event-title">
        <strong>Event: </strong>
        <span>{{ invoice.event.name }}</span>
      </div>

      <table
        v-if="invoice?.tickets && invoice?.tickets.length > 0"
        class="inventory"
      >
        <thead>
          <tr>
            <th><span>Item</span></th>
            <th><span>Rate</span></th>
            <th><span>Quantity</span></th>
            <th><span>Price</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ticket, index) in invoice.tickets" :key="index">
            <td>
              <span>{{ ticket.name }}</span>
            </td>
            <td>
              <span data-prefix>{{ currency }}</span
              ><span>{{ ticket.earlyBirdPrice || ticket.ticketPrice }}</span>
            </td>
            <td>
              <span>{{ ticket.quantity }}</span>
            </td>
            <td>
              <span data-prefix>{{ currency }}</span
              ><span>{{
                (ticket.earlyBirdPrice
                  ? ticket.earlyBirdPrice
                  : ticket.ticketPrice) * ticket.quantity
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="d-flex justify-end">
        <table v-if="invoice?.purchase" class="balance">
          <tr>
            <th>
              <span>SubTotal</span>
            </th>
            <td>
              <span data-prefix>{{ currency }}</span
              ><span>{{ invoice.purchase.subTotalAmount }}</span>
            </td>
          </tr>
          <tr v-if="invoice.promo?.discountAmount">
            <th>
              <span>Discount ({{ invoice.promo.discountText }})</span>
            </th>
            <td>
              <span data-prefix>{{ currency }}</span
              ><span>{{ invoice.promo.discountAmount }}</span>
            </td>
          </tr>
          <tr>
            <th>
              <span
                >{{ invoice.event.taxWording }} ({{
                  invoice.event.taxPercentage
                }}%)</span
              >
            </th>
            <td>
              <span data-prefix>{{ currency }}</span
              ><span>{{ invoice.purchase.tax }}</span>
            </td>
          </tr>
          <tr>
            <th><span>Total</span></th>
            <td>
              <span data-prefix>{{ currency }}</span
              ><span>{{ invoice.purchase.totalAmount }}</span>
            </td>
          </tr>
          <tr>
            <th><span>Amount Paid</span></th>
            <td>
              <span data-prefix>{{ currency }}</span
              ><span>{{
                invoice.purchase.paymentStatus == "succeeded"
                  ? invoice.purchase.totalAmount
                  : 0.0
              }}</span>
            </td>
          </tr>
          <tr>
            <th><span>Balance Due</span></th>
            <td>
              <span data-prefix>{{ currency }}</span
              ><span>{{
                invoice.purchase.paymentStatus != "succeeded"
                  ? invoice.purchase.totalAmount
                  : 0.0
              }}</span>
            </td>
          </tr>
        </table>
      </div>
    </article>

    <aside>
      <h1><span>Notes</span></h1>
      <div>
        <p class="text-pre-wrap my-2">{{ settings.invoiceNotes }}</p>
        <div class="d-flex justify-space-between mt-5">
          <template
            v-for="(item, index) in invoice.event.bankDetailsCurrencies"
            :key="index"
          >
            <div v-if="Number(item) === 0" class="">
              <div>Bank Transfer paying in USD:</div>
              <p class="text-pre-wrap">
                {{ settings.bankDetailsUsd }}
              </p>
            </div>
            <div v-else-if="Number(item) === 1" class="">
              <div>Bank Transfer paying in GBP:</div>
              <p class="text-pre-wrap">
                {{ settings.bankDetailsGbp }}
              </p>
            </div>
            <div v-else-if="Number(item) === 2" class="">
              <div>Bank Transfer paying in EUR:</div>
              <p class="text-pre-wrap">
                {{ settings.bankDetailsEur }}
              </p>
            </div>
          </template>
        </div>

        <p class="footer pt-15">
          {{ settings.invoiceFooter }}
        </p>
      </div>
    </aside>
  </div>
  <v-alert v-else border="start" class="ma-5" closable density="compact"
    >Invoice sent to your email!
  </v-alert>
</template>

<style scoped>
.invoice-wrapper {
  box-sizing: border-box;
  height: 11in !important;
  margin: 0 auto;
  overflow: hidden;
  width: 8.5in !important;
  background: #fff;
  border-radius: 1px;
  padding: 30px;
}

body,
html {
  padding: 0.5in;
}

header h1,
td,
th {
  border-radius: 0.25em;
}

article,
article address,
header,
header h1,
table.inventory,
table.meta {
  margin: 0 0 1em;
}

header span,
td,
th {
  position: relative;
}

span[] {
  display: inline-block;
}

.pt-15 {
  padding-top: 15px;
}

h1 {
  font: bold 100% sans-serif;
  letter-spacing: 0.5em;
  text-align: center;
  text-transform: uppercase;
}

table {
  font-size: 75%;
  table-layout: fixed;
  width: 100%;
  border-collapse: separate;
  border-spacing: 2px;
}

td,
th {
  border-width: 1px;
  padding: 0.5em;
  text-align: left;
  border-style: solid;
}

th {
  background: #eee;
  border-color: #bbb;
}

td {
  border-color: #ddd;
}

html {
  font: 16px/1 "Open Sans", sans-serif;
  overflow: auto;
  background: #999;
  cursor: default;
}

body {
  box-sizing: border-box;
  height: 11in;
  margin: 0 auto;
  overflow: hidden;
  width: 8.5in;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 1in -0.25in rgba(0, 0, 0, 0.5);
}

article:after,
header:after,
table.balance:after,
table.meta:after {
  clear: both;
  content: "";
  display: table;
}

header h1 {
  background: #000;
  color: #fff;
  padding: 0.5em 0;
}

header address {
  float: left;
  font-size: 75%;
  font-style: normal;
  line-height: 1.25;
  margin: 0 1em 1em 0;
}

header address p {
  margin: 0 0 0.25em;
}

header img,
header span {
  display: block;
  float: right;
}

header .logo {
  width: 150px;
  margin: 1em;
}

article h1 {
  clip: rect(0 0 0 0);
  text-align: left;
}

article address {
  float: left;
  line-height: 1.2rem !important;
}

.event-title {
  clear: both;
  font-size: 80%;
  padding-bottom: 6px;
}

.footer {
  clear: both;
}

.float-left {
  float: left;
}

.float-right {
  float: right;
}

table.balance,
table.meta {
  float: right;
  width: 36%;
}

table.meta th {
  width: 40%;
}

table.meta td {
  width: 60%;
}

table.inventory {
  clear: both;
  width: 100%;
}

table.inventory th {
  font-weight: 700;
  text-align: center;
}

table.inventory td:first-child {
  width: 26%;
}

table.inventory td:nth-child(2) {
  width: 38%;
}

table.inventory td:nth-child(3),
table.inventory td:nth-child(4),
table.inventory td:nth-child(5) {
  text-align: right;
  width: 12%;
}

table.balance td,
table.balance th {
  width: 50%;
}

table.balance td {
  text-align: right;
}

aside h1 {
  border: #999;
  border-width: 0 0 1px;
  border-bottom-style: solid;
}

aside p {
  line-height: 1rem;
  font-size: 0.8rem;
}

@media print {
  html {
    background: 0 0;
    padding: 0;
  }

  body {
    margin: 0;
    box-shadow: none;
    border: none;
  }

  .invoice-wrapper {
    /* Remove page breaks */
    page-break-before: auto;
    page-break-after: auto;
  }

  * {
    -webkit-print-color-adjust: exact !important; /* Chrome, Safari */
    color-adjust: exact !important; /* Firefox */
  }
}

@page {
  margin: 0;
  size: A4 portrait;
}
</style>
