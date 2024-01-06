<script setup>
import Logo from "@/components/Logo.vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const router = useRouter();

const username = ref(null);
const password = ref(null);
const isAdmin = computed(() => store.getters["user/isAdmin"]);
const isChckinStaff = computed(() => store.getters["user/isChckinStaff"]);
const isExhibitor = computed(() => store.getters["user/isExhibitor"]);
const visible = ref(false);

const form = ref(null);
const isFormValid = ref(true);

const signinUser = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  store
    .dispatch("user/signin", {
      username: username.value,
      password: password.value,
    })
    .then((result) => {
      if (isAdmin.value) {
        router.push({
          name: "home",
        });
      } else if (isChckinStaff.value) {
        router.push({
          name: "dashboard-checkin-staff",
        });
      } else if (isExhibitor.value) {
        router.push({
          name: "dashboard-exhibitor",
        });
      }
    });
};
</script>

<template>
  <div>
    <v-card
      class="mx-auto px-12 py-8 my-12"
      elevation="8"
      max-width="400"
      rounded="lg"
    >
      <logo
        custom-class="clickable justify-center mb-10"
        @click="router.push({ name: 'signin' })"
      />

      <v-form
        ref="form"
        v-model="isFormValid"
        fast-fail
        @submit.prevent="signinUser"
      >
        <v-text-field
          v-model="username"
          :rules="[(v) => !!v || 'Username is required!']"
          density="compact"
          label="Username"
          placeholder="Email address"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
        ></v-text-field>

        <v-text-field
          v-model="password"
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[(v) => !!v || 'Password is required!']"
          :type="visible ? 'text' : 'password'"
          density="compact"
          label="Password"
          placeholder="Enter your password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="visible = !visible"
        ></v-text-field>

        <v-btn
          block
          class="mb-6"
          color="blue"
          size="large"
          type="submit"
          variant="tonal"
        >
          Sign In
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>
