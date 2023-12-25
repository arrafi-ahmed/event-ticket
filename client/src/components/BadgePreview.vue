<script setup>
import { getApiPublicImgUrl } from "@/others/util";
import BadgeDetails from "@/components/BadgeDetails.vue";
import { computed, onMounted } from "vue";
import QRCodeVue3 from "qrcode-vue3";

const { cardTitle, badge, event } = defineProps([
  "cardTitle",
  "badge",
  "event",
]);

const sortedFieldIdFront = computed(() => {
  return [...badge.fieldIdFront].sort();
});

const sortedFieldIdRear = computed(() => {
  return [...badge.fieldIdRear].sort();
});

const qrCode = computed(() =>
  JSON.stringify({ id: badge.bId, qrUuid: badge.qrUuid })
);

const qrOptions = {
  type: "square",
  color: "#000",
};

onMounted(() => {});
</script>

<template>
  <div class="badge-wrapper mx-auto">
    <div class="badge">
      <div v-if="cardTitle" class="pa-2">
        <b>{{ cardTitle }}</b>
      </div>
      <div class="fill-height d-flex">
        <!--        front-->
        <div class="text-center border d-flex flex-column w-50">
          <div class="d-flex justify-center" style="height: 60px">
            <div v-if="event.logoLeft" class="w-50">
              <div class="text-caption" style="height: 18px">
                <i>{{ badge.textTopLeft }}</i>
              </div>
              <v-img
                :aspect-ratio="2"
                :eager="true"
                :src="getApiPublicImgUrl(event.logoLeft, 'event-logo')"
              ></v-img>
              <div class="text-caption" style="height: 18px">
                <i>{{ badge.textBottomLeft }}</i>
              </div>
            </div>
            <div v-if="event.logoRight" class="w-50">
              <div class="text-caption" style="height: 18px">
                <i>{{ badge.textTopRight }}</i>
              </div>
              <v-img
                :aspect-ratio="2"
                :eager="true"
                :src="getApiPublicImgUrl(event.logoRight, 'event-logo')"
              ></v-img>
              <div class="text-caption" style="height: 18px">
                <i>{{ badge.textBottomRight }}</i>
              </div>
            </div>
          </div>
          <div class="my-auto d-flex justify-center align-center">
            <div>
              <template v-for="(id, index) in sortedFieldIdFront" :key="index">
                <badge-details
                  :id="id"
                  :badge-data="badge"
                  :index="index"
                ></badge-details>
              </template>
            </div>
          </div>

          <div
            :style="{
              'background-color': badge.colorScheme,
              height: '70px',
            }"
            class="d-flex justify-center align-center"
          >
            <div>
              <h1 style="color: white">{{ badge.title }}</h1>
            </div>
          </div>
        </div>

        <!--          rear-->
        <div class="text-center border d-flex flex-column w-50">
          <div class="d-flex justify-center" style="height: 60px">
            <div v-if="event.logoLeft" class="w-50">
              <div class="text-caption" style="height: 18px">
                <i>{{ badge.textTopLeft }}</i>
              </div>
              <v-img
                :aspect-ratio="2"
                :eager="true"
                :src="getApiPublicImgUrl(event.logoLeft, 'event-logo')"
              ></v-img>
              <div class="text-caption" style="height: 18px">
                <i>{{ badge.textBottomLeft }}</i>
              </div>
            </div>
            <div v-if="event.logoRight" class="w-50">
              <div class="text-caption" style="height: 18px">
                <i>{{ badge.textTopRight }}</i>
              </div>
              <v-img
                :aspect-ratio="2"
                :eager="true"
                :src="getApiPublicImgUrl(event.logoRight, 'event-logo')"
              ></v-img>
              <div class="text-caption" style="height: 18px">
                <i>{{ badge.textBottomRight }}</i>
              </div>
            </div>
          </div>
          <div class="my-auto d-flex justify-center">
            <div>
              <div v-if="badge.fieldIdRear.length == 0">
                <QRCodeVue3
                  :cornersSquareOptions="qrOptions"
                  :dotsOptions="qrOptions"
                  :height="125"
                  :value="qrCode"
                  :width="125"
                />
              </div>
              <template v-for="(id, index) in sortedFieldIdRear" :key="index">
                <QRCodeVue3
                  v-if="index === 0"
                  :cornersSquareOptions="qrOptions"
                  :dotsOptions="qrOptions"
                  :height="125"
                  :value="qrCode"
                  :width="125"
                />
                <badge-details
                  :id="id"
                  :badge-data="badge"
                  :index="index"
                ></badge-details>
              </template>
            </div>
          </div>
          <div
            :style="{
              'background-color': badge.colorScheme,
              height: '70px',
            }"
            class="d-flex justify-center align-center"
          >
            <div>
              <h1 style="color: white">{{ badge.title }}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/*
*/
.badge-wrapper {
  width: 210mm;
  height: auto;
}

.badge {
  margin: 21mm 10mm 7mm 10mm;
  width: 190mm;
  height: 120mm;
  background: #fff;
}
</style>
