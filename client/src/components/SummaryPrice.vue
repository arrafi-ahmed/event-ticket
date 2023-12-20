<script setup>
import { getCurrencySymbol } from "@/others/util";

const { currency, subtotal, taxPercentage, tax, total } = defineProps([
  "currency",
  "subtotal",
  "taxPercentage",
  "tax",
  "total",
]);
</script>

<template>
  <v-row align="center" class="mt-2 mt-md-4" justify="end" no-gutters>
    <v-col cols="auto">
      <span>Sub Total: </span>
    </v-col>
    <v-col class="ml-2" cols="auto">
      <v-chip
        :prepend-icon="getCurrencySymbol(currency, 'icon')"
        class="chip-currency"
        size="large"
      >
        <span class="chip-currency-font">{{ subtotal }}</span>
      </v-chip>
    </v-col>
  </v-row>

  <v-row align="center" class="mt-2" justify="end" no-gutters>
    <v-col cols="auto">
      <span>Tax: ({{ taxPercentage }}%)</span>
    </v-col>
    <v-col class="ml-2" cols="auto">
      <v-chip
        :prepend-icon="getCurrencySymbol(currency, 'icon')"
        class="chip-currency"
        size="large"
      >
        <span class="chip-currency-font">{{ tax }}</span>
      </v-chip>
    </v-col>
  </v-row>

  <v-row align="center" class="mt-2" justify="end" no-gutters>
    <v-col cols="auto">
      <span class="text-h6">Total: </span>
    </v-col>
    <v-col class="ml-2" cols="auto">
      <v-chip
        :prepend-icon="getCurrencySymbol(currency, 'icon')"
        class="chip-currency"
        size="x-large"
      >
        <span class="chip-currency-font">{{ total }}</span>
      </v-chip>
    </v-col>
  </v-row>
</template>

<style scoped></style>
