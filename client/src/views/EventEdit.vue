<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import {
  currencyItems,
  getEventLogoUrl,
  isValidImage,
  toLocalISOString,
} from "@/others/util";
import { useDisplay } from "vuetify";
import DatePicker from "@/components/DatePicker.vue";

const { mobile } = useDisplay();
const router = useRouter();
const route = useRoute();
const store = useStore();

const event = computed(() => store.state.event.event);

const newEventInit = {
  id: null,
  name: null,
  startDate: null,
  endDate: null,
  location: null,
  taxPercentage: null,
  taxWording: null,
  logos: [null, null],
  banner: null,
  bankDetailsCurrencies: [],
};
const newEvent = reactive({ ...newEventInit });

const form = ref(null);
const isFormValid = ref(true);

const handleEventLogo = (index, files) => {
  newEvent.logos[index] = files[0];
};

const handleEventBanner = (files) => {
  newEvent.banner = files[0];
  console.log(9, files[0]);
};

const handleAddEvent = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  const formData = new FormData();
  formData.append("id", newEvent.id);
  formData.append("name", newEvent.name);
  formData.append(
    "startDate",
    toLocalISOString(newEvent.startDate).slice(0, 10)
  );
  formData.append("endDate", toLocalISOString(newEvent.endDate).slice(0, 10));
  formData.append("location", newEvent.location);
  formData.append("taxPercentage", newEvent.taxPercentage);
  formData.append("taxWording", newEvent.taxWording);
  formData.append("bankDetailsCurrencies", newEvent.bankDetailsCurrencies);
  newEvent.logos.forEach((item, index) => {
    formData.append("files", item);
    newEvent.logos[index] = item?.name;
  });
  formData.append("logos", JSON.stringify(newEvent.logos));

  if (newEvent.banner) {
    formData.append("files", newEvent.banner);
  }

  store.dispatch("event/addEvent", formData).then((result) => {
    Object.assign(newEvent, { ...newEventInit, logos: [null, null] });
    router.push({
      name: "home",
    });
  });
};

onMounted(() => {
  store.dispatch("event/setEvent", route.params.eventId).then(() => {
    Object.assign(newEvent, {
      ...event.value,
      startDate: new Date(event.value.startDate),
      endDate: new Date(event.value.endDate),
    });
  });
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title title="Edit Event">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.back()"
          ></v-btn>
        </page-title>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-form
          v-if="newEvent.id"
          ref="form"
          v-model="isFormValid"
          fast-fail
          @submit.prevent="handleAddEvent"
        >
          <v-text-field
            v-model="newEvent.name"
            :rules="[(v) => !!v || 'Name is required!']"
            class="mt-2 mt-md-4"
            clearable
            density="compact"
            hide-details="auto"
            label="Name"
            prepend-inner-icon="mdi-account"
            required
          ></v-text-field>

          <date-picker
            v-model="newEvent.startDate"
            :rules="[(v) => !!v || 'Start Date is required!']"
            color="primary"
            custom-class="mt-2 mt-md-4"
            label="Start Date"
          ></date-picker>

          <date-picker
            v-model="newEvent.endDate"
            :rules="[(v) => !!v || 'End Date is required!']"
            color="primary"
            custom-class="mt-2 mt-md-4"
            label="End Date"
          ></date-picker>

          <v-text-field
            v-model="newEvent.location"
            :rules="[(v) => !!v || 'Location is required!']"
            class="mt-2 mt-md-4"
            clearable
            density="compact"
            hide-details="auto"
            label="Location"
            prepend-inner-icon="mdi-map-marker"
            required
          ></v-text-field>

          <v-text-field
            v-model="newEvent.taxPercentage"
            :rules="[(v) => !!v || 'Tax Percentage is required!']"
            class="mt-2 mt-md-4"
            clearable
            density="compact"
            hide-details="auto"
            label="Tax Percentage"
            prepend-inner-icon="mdi-cash"
            type="Number"
          ></v-text-field>
          <v-text-field
            v-model="newEvent.taxWording"
            :rules="[(v) => !!v || 'Tax Wording is required!']"
            class="mt-2 mt-md-4"
            clearable
            density="compact"
            hide-details="auto"
            label="Tax Wording"
            prepend-inner-icon="mdi-cash"
          ></v-text-field>
          <v-select
            v-model="newEvent.bankDetailsCurrencies"
            :items="currencyItems"
            class="text-capitalize mt-2 mt-md-4"
            density="compact"
            hide-details="auto"
            item-title="title"
            item-value="value"
            label="Bank Details Currencies"
            multiple
            prepend-inner-icon="mdi-cash"
          ></v-select>
          <v-row align="center" no-gutters>
            <v-col class="mt-4" cols="auto">
              <v-img
                :aspect-ratio="1.4"
                :src="getEventLogoUrl(newEvent.logoLeft)"
                :width="70"
              ></v-img>
            </v-col>
            <v-col>
              <v-file-input
                :rules="[
                  (v) =>
                    (Array.isArray(v) ? v : [v]).every((file) =>
                      isValidImage(file)
                    ) || 'Only jpg/jpeg/png allowed!',
                ]"
                accept="image/*"
                class="mt-5 mt-md-4 ms-1"
                density="compact"
                hide-details="auto"
                label="Event logo"
                prepend-icon=""
                prepend-inner-icon="mdi-camera"
                show-size
                @update:modelValue="handleEventLogo(0, $event)"
              >
                <template v-slot:selection="{ fileNames }">
                  <template v-for="fileName in fileNames" :key="fileName">
                    <v-chip class="me-2" color="primary" label size="small">
                      {{ fileName }}
                    </v-chip>
                  </template>
                </template>
              </v-file-input>
            </v-col>
          </v-row>

          <v-row align="center" no-gutters>
            <v-col class="mt-4" cols="auto">
              <v-img
                :aspect-ratio="1.4"
                :src="getEventLogoUrl(newEvent.logoRight)"
                :width="70"
              ></v-img>
            </v-col>
            <v-col>
              <v-file-input
                :rules="[
                  (v) =>
                    (Array.isArray(v) ? v : [v]).every((file) =>
                      isValidImage(file)
                    ) || 'Only jpg/jpeg/png allowed!',
                ]"
                accept="image/*"
                class="mt-5 mt-md-4 ms-1"
                density="compact"
                hide-details="auto"
                label="Badge sponsor logo"
                prepend-icon=""
                prepend-inner-icon="mdi-camera"
                show-size
                @update:modelValue="handleEventLogo(1, $event)"
              >
                <template v-slot:selection="{ fileNames }">
                  <template v-for="fileName in fileNames" :key="fileName">
                    <v-chip class="me-2" color="primary" label size="small">
                      {{ fileName }}
                    </v-chip>
                  </template>
                </template>
              </v-file-input>
            </v-col>
          </v-row>

          <v-row align="center" no-gutters>
            <v-col class="mt-4" cols="auto">
              <v-img
                :aspect-ratio="1.4"
                :src="getEventLogoUrl(newEvent.banner)"
                :width="70"
              ></v-img>
            </v-col>
            <v-col>
              <v-file-input
                :rules="[
                  (v) =>
                    (Array.isArray(v) ? v : [v]).every((file) =>
                      isValidImage(file)
                    ) || 'Only jpg/jpeg/png allowed!',
                ]"
                accept="image/*"
                class="mt-5 mt-md-4 ms-1"
                density="compact"
                hide-details="auto"
                label="Banner"
                prepend-icon=""
                prepend-inner-icon="mdi-camera"
                show-size
                @update:modelValue="handleEventBanner"
              >
                <template v-slot:selection="{ fileNames }">
                  <template v-for="fileName in fileNames" :key="fileName">
                    <v-chip class="me-2" color="primary" label size="small">
                      {{ fileName }}
                    </v-chip>
                  </template>
                </template>
              </v-file-input>
            </v-col>
          </v-row>

          <div class="d-flex align-center mt-3 mt-md-4">
            <v-spacer></v-spacer>
            <v-btn
              :density="mobile ? 'comfortable' : 'default'"
              color="primary"
              type="submit"
              variant="tonal"
              >Save
            </v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-avatar {
  border-radius: 0;
}

.v-avatar.v-avatar--density-default {
  width: calc(var(--v-avatar-height) + 80px);
}
</style>
