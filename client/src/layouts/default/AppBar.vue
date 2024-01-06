<script setup>
import Logo from "@/components/Logo.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { computed, onMounted, ref } from "vue";
import { getEventLogoUrl, getToLink } from "@/others/util";
import { useDisplay } from "vuetify";
import UserAvatar from "@/components/UserAvatar.vue";

const store = useStore();
const { mobile } = useDisplay();
const router = useRouter();
const route = useRoute();

const isSignedin = computed(() => store.getters["user/isSignedin"]);
const isAdmin = computed(() => store.getters["user/isAdmin"]);
const currentUser = computed(() => store.getters["user/getCurrentUser"]);

const drawer = ref(false);

const getUsername = computed(() => currentUser.value.username);
const getGreetings = computed(() => {
  const hour = new Date().getHours();
  return `Good ${hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}!`;
});

const events_init = computed(() => store.state.event.events);
const events = computed(() => {
  return events_init.value.map((event) => ({
    title: event.name,
    link: "true",
    to: { name: "event-single", params: { eventId: event.id } },
  }));
});
const event = computed(() => store.state.event.event);

const items = computed(() => {
  return [{ title: "Home", to: { name: "home" } }, ...events.value];
});

// const calcAppBarHeight = computed(() => (isSignedin.value ? 64 : 150));
const calcAppBarBg = computed(() =>
  !isSignedin.value && route.name === "registration-form-single"
    ? getEventLogoUrl(event.value.banner)
    : undefined
);

onMounted(() => {
  console.log(8, isAdmin.value);
  if (isAdmin.value) store.dispatch("event/setEvents");
  if (!isSignedin.value && route.name === "registration-form-single")
    store.dispatch("event/setEvent", route.params.eventId);
});
</script>

<template>
  <v-app-bar
    v-if="isSignedin"
    :order="1"
    class="px-2 px-md-5 border-b-sm d-print-none"
    color="white"
    flat
    scroll-behavior="fade-image"
    scroll-threshold="80"
    :absolute="!isSignedin"
    :dense="isSignedin"
    :extended="!isSignedin"
    :extension-height="150"
    :image="calcAppBarBg"
  >
    <v-btn :size="mobile ? 'default' : 'large'" icon v-bind="props">
      <user-avatar
        :imgSrc="currentUser.image"
        @click-avatar="drawer = !drawer"
      ></user-avatar>
    </v-btn>
    <v-row justify="center">
      <logo custom-class="clickable" @click="router.push({ name: 'signin' })" />
      <!--      <v-img-->
      <!--        v-else-->
      <!--        :aspect-ratio="1.5"-->
      <!--        :src="getEventLogoUrl(event.banner)"-->
      <!--      ></v-img>-->
    </v-row>
  </v-app-bar>
  <v-navigation-drawer
    v-if="isSignedin"
    v-model="drawer"
    :width="300"
    location="start"
    temporary
  >
    <v-list>
      <v-list-item>
        <div class="d-flex justify-start align-center">
          <user-avatar
            :imgSrc="currentUser.image"
            @click-avatar="drawer = !drawer"
          ></user-avatar>
          <div class="ml-3">
            <small>
              {{ getGreetings }}
            </small>
            <div>
              {{ getUsername }}
            </div>
          </div>
        </div>
      </v-list-item>
      <v-divider class="mt-2 mb-2"></v-divider>
      <v-list-item
        v-if="isAdmin"
        v-for="(item, index) in items"
        :key="index"
        :to="getToLink(item)"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
      <v-divider v-if="isAdmin" class="mt-2 mb-2"></v-divider>
      <v-list-item
        v-if="isAdmin"
        :to="{ name: 'settings' }"
        title="Settings"
      ></v-list-item>
    </v-list>
    <template v-slot:append>
      <div class="ma-5">
        <v-btn :to="{ name: 'signout' }" block color="primary">Signout</v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped></style>
