<script setup>
import { VSonner } from "vuetify-sonner";
import ProgressLoader from "@/components/ProgressLoader.vue";

import { watch } from "vue";
import { useRoute } from "vue-router";
import { appName } from "@/others/util";

const route = useRoute();

watch(route, (to) => {
  document.title =
    (to.meta.title && to.meta.title + " | " + appName) || appName;
});
</script>
<template>
  <progress-loader />
  <v-sonner :visible-toasts="9" expand position="bottom-left" />
  <router-view />
</template>
<style>
@import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@100;300;400;500;700;900&display=swap");

html,
body,
.v-application {
  font-family: "Source Sans 3", sans-serif !important;
}

.clickable {
  cursor: pointer;
}

.flex-sticky {
  position: sticky;
  align-self: flex-start;
  z-index: 999;
}

.div-sticky {
  position: sticky;
  height: auto;
  z-index: 999;
}
</style>
