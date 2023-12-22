<script setup>
import { appName } from "@/others/util";
</script>
<template>
  <v-footer class="bg-grey-lighten-3 flex-grow-0 d-print-none">
    <v-row justify="center" no-gutters>
      <v-col class="text-center mt-md-1" cols="12">
        <small>
          &copy; {{ new Date().getFullYear() }} —
          <strong>{{ appName }}</strong> v1.0
        </small>
      </v-col>
    </v-row>
  </v-footer>
</template>
