<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { reactive, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { isValidImage } from "@/others/util";
import { useDisplay } from "vuetify";
import DatePicker from "@/components/DatePicker.vue";

const { mobile } = useDisplay();
const router = useRouter();
const store = useStore();

const newEventInit = {
  name: null,
  startDate: new Date(),
  endDate: new Date(),
  location: null,
  taxPercentage: null,
  logos: [null, null],
};
const newEvent = reactive({ ...newEventInit });

const form = ref(null);
const isFormValid = ref(true);

const handleEventLogo = (index, files) => {
  newEvent.logos[index] = files[0];
};

const handleAddEvent = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  const formData = new FormData();
  formData.append("name", newEvent.name);
  formData.append("startDate", newEvent.startDate);
  formData.append("endDate", newEvent.endDate);
  formData.append("location", newEvent.location);
  formData.append("taxPercentage", newEvent.taxPercentage);
  newEvent.logos.forEach((item, index) => {
    formData.append("files", item);
    newEvent.logos[index] = item?.name;
  });
  formData.append("logos", JSON.stringify(newEvent.logos));

  store.dispatch("event/addEvent", formData).then((result) => {
    // newEvent = {...newEvent, ...newEventInit}
    Object.assign(newEvent, { ...newEventInit, logos: [null, null] });
    router.push({
      name: "home",
    });
  });
};
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title title="Add Event">
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
            color="primary"
            custom-class="mt-2 mt-md-4"
            label="Start Date"
          ></date-picker>

          <date-picker
            v-model="newEvent.endDate"
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

          <v-file-input
            :rules="[
              (v) =>
                (Array.isArray(v) ? v : [v]).every((file) =>
                  isValidImage(file)
                ) || 'Only jpg/jpeg/png allowed!',
            ]"
            accept="image/*"
            class="mt-2 mt-md-4"
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

          <v-file-input
            :rules="[
              (v) =>
                (Array.isArray(v) ? v : [v]).every((file) =>
                  isValidImage(file)
                ) || 'Only jpg/jpeg/png allowed!',
            ]"
            accept="image/*"
            class="mt-2 mt-md-4"
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

          <div class="d-flex align-center mt-3 mt-md-4">
            <v-spacer></v-spacer>
            <v-btn
              :density="mobile ? 'comfortable' : 'default'"
              color="primary"
              type="submit"
              variant="tonal"
              >Add
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
