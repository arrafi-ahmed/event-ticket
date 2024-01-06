<script setup>
import { getApiPublicImgUrl } from "@/others/util";
import BadgeDetails from "@/components/BadgeDetails.vue";
import { computed, ref } from "vue";
import QRCodeVue3 from "qrcode-vue3";

const { cardTitle, badge, event } = defineProps([
  "cardTitle",
  "badge",
  "event",
]);
const sortedFieldIdFront = computed(() => {
  if (Array.isArray(badge?.fieldIdFront)) {
    return [...badge.fieldIdFront].sort();
  } else {
    return [];
  }
});

const sortedFieldIdRear = computed(() => {
  if (Array.isArray(badge?.fieldIdRear)) {
    return [...badge.fieldIdRear].sort();
  } else {
    return [];
  }
});

const qrCode = computed(() => {
  return JSON.stringify({ id: badge?.bId, qrUuid: badge?.qrUuid });
});

const qrOptions = {
  type: "square",
  color: "#000",
};

const logoLeft = ref(null);
const logoRight = ref(null);

const logoHeight = 60;
const logoLeftOriginalRatio = ref(0);
const logoRightOriginalRatio = ref(0);
const logoLeftWidth = computed(() => logoLeftOriginalRatio.value * logoHeight);
const logoRightWidth = computed(
  () => logoRightOriginalRatio.value * logoHeight
);

const onLoadLogoLeft = () => {
  const { naturalHeight, naturalWidth } = logoLeft.value.image;
  logoLeftOriginalRatio.value = naturalWidth / naturalHeight;
};

const onLoadLogoRight = () => {
  const { naturalHeight, naturalWidth } = logoRight.value.image;
  logoRightOriginalRatio.value = naturalWidth / naturalHeight;
};
</script>

<template>
  <div class="badge mx-auto">
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
              class="mx-auto my-auto"
              ref="logoLeft"
              :width="logoLeftWidth"
              :eager="true"
              :src="getApiPublicImgUrl(event.logoLeft, 'event-logo')"
              @load="onLoadLogoLeft"
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
              class="mx-auto my-auto"
              ref="logoRight"
              :width="logoRightWidth"
              :eager="true"
              :src="getApiPublicImgUrl(event.logoRight, 'event-logo')"
              @load="onLoadLogoRight"
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
              class="mx-auto my-auto"
              ref="logoLeft"
              :width="logoLeftWidth"
              :eager="true"
              :src="getApiPublicImgUrl(event.logoLeft, 'event-logo')"
              @load="onLoadLogoLeft"
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
              class="mx-auto my-auto"
              ref="logoRight"
              :width="logoRightWidth"
              :eager="true"
              :src="getApiPublicImgUrl(event.logoRight, 'event-logo')"
              @load="onLoadLogoRight"
            ></v-img>
            <div class="text-caption" style="height: 18px">
              <i>{{ badge.textBottomRight }}</i>
            </div>
          </div>
        </div>
        <div class="my-auto d-flex justify-center">
          <div>
            <div v-if="badge.fieldIdRear?.length == 0">
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
</template>

<style>
.badge {
  width: 190mm;
  height: 120mm;
  background: #fff;
  page-break-before: auto;
  page-break-after: auto;
}

* {
  -webkit-print-color-adjust: exact !important; /* Chrome, Safari */
  color-adjust: exact !important; /* Firefox */
}
</style>
