<script setup>
import { getApiPublicImgUrl, getClientPublicImgUrl } from "@/util";
import BadgeDetails from "@/components/BadgeDetails.vue";

const { cardTitle, badgeData, badgeVisibility, event } = defineProps([
  "cardTitle",
  "badgeData",
  "badgeVisibility",
  "event",
]);
</script>

<template>
  <v-card>
    <v-card-title>
      <span>{{ cardTitle }}</span>
    </v-card-title>
    <v-card-text>
      <v-row align="stretch">
        <!--        front-->
        <v-col
          class="mt-4 text-center border d-flex flex-column pt-0"
          cols="12"
          md="6"
        >
          <v-row class="mx-n3" justify="center" no-gutters>
            <v-col v-if="event.logoLeft" class="pa-0" cols="6">
              <small class="text-caption">{{ badgeData.textTopLeft }}</small>
              <v-img
                :aspect-ratio="2"
                :src="getApiPublicImgUrl(event.logoLeft, 'event-logo')"
              ></v-img>
              <small class="text-caption">{{ badgeData.textBottomLeft }}</small>
            </v-col>
            <v-col v-if="event.logoRight" class="pa-0" cols="6">
              <small class="text-caption">{{ badgeData.textTopRight }}</small>
              <v-img
                :aspect-ratio="2"
                :src="getApiPublicImgUrl(event.logoRight, 'event-logo')"
              ></v-img>
              <small class="text-caption">{{
                badgeData.textBottomRight
              }}</small>
            </v-col>
          </v-row>
          <v-row class="pb-5" justify="center">
            <v-col cols="auto">
              <template
                v-for="(id, index) in badgeVisibility.fieldIdFront.sort()"
                :key="index"
              >
                <badge-details
                  :id="id"
                  :badge-data="badgeData"
                  :index="index"
                ></badge-details>
              </template>
            </v-col>
          </v-row>

          <v-row
            :style="{
              'background-color': badgeData.colorScheme,
              'max-height': '72px',
            }"
            class="mt-auto"
            justify="center"
          >
            <v-col cols="auto">
              <h1 style="color: white">{{ badgeData.title }}</h1>
            </v-col>
          </v-row>
        </v-col>

        <!--          rear-->
        <v-col
          class="mt-4 text-center border d-flex flex-column pt-0"
          cols="12"
          md="6"
        >
          <v-row class="mx-n3" justify="center" no-gutters>
            <v-col v-if="event.logoLeft" class="pa-0" cols="6">
              <small class="text-caption">{{ badgeData.textTopLeft }}</small>
              <v-img
                :aspect-ratio="2"
                :src="getApiPublicImgUrl(event.logoLeft, 'event-logo')"
              ></v-img>
              <small class="text-caption">{{ badgeData.textBottomLeft }}</small>
            </v-col>
            <v-col v-if="event.logoRight" class="pa-0" cols="6">
              <small class="text-caption">{{ badgeData.textTopRight }}</small>
              <v-img
                :aspect-ratio="2"
                :src="getApiPublicImgUrl(event.logoRight, 'event-logo')"
              ></v-img>
              <small class="text-caption">{{
                badgeData.textBottomRight
              }}</small>
            </v-col>
          </v-row>
          <v-row class="pb-5" justify="center">
            <v-col cols="auto">
              <div v-if="badgeVisibility.fieldIdRear.length == 0">
                <v-img
                  :aspect-ratio="1"
                  :src="getClientPublicImgUrl('qr.png')"
                  width="150"
                ></v-img>
              </div>
              <template
                v-for="(id, index) in badgeVisibility.fieldIdRear.sort()"
                :key="index"
              >
                <v-img
                  v-if="index === 0"
                  :aspect-ratio="1"
                  :src="getClientPublicImgUrl('qr.png')"
                  :width="150"
                ></v-img>
                <badge-details
                  :id="id"
                  :data="badgeData"
                  :index="index"
                ></badge-details>
              </template>
            </v-col>
          </v-row>
          <v-row
            :style="{
              'background-color': badgeData.colorScheme,
              'max-height': '72px',
            }"
            class="mt-auto"
            justify="center"
          >
            <v-col cols="auto">
              <h1 style="color: white">{{ badgeData.title }}</h1>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>
