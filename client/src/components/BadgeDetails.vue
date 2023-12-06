<script setup>
const { badgeData, id, index } = defineProps(["badgeData", "id", "index"]);
</script>

<template>
  <span v-if="id == 1" class="text-h4"
    >{{ badgeData?.firstname || "John" }}
  </span>
  <span v-if="id == 2" class="text-h4"
    >&nbsp;{{ badgeData?.surname || "Doe" }}</span
  >

  <div v-if="id == 3" class="font-weight-medium" style="font-size: 1.2rem">
    {{ badgeData?.jobTitle || "General Director" }}
  </div>
  <div v-if="id == 4" class="font-weight-medium" style="font-size: 1.2rem">
    {{ badgeData?.organization || "ABC Ltd" }}
  </div>
  <div v-if="id == 5" class="font-weight-medium" style="font-size: 1.2rem">
    {{ badgeData?.country || "United Kingdom" }}
  </div>
  <div v-if="id == 6" class="font-weight-medium" style="font-size: 1.2rem">
    {{ badgeData?.phone || "+94549859845" }}
  </div>
  <div v-if="id == 7" class="font-weight-medium" style="font-size: 1.2rem">
    {{ badgeData?.email || "doe@email.com" }}
  </div>
</template>

<style scoped></style>
