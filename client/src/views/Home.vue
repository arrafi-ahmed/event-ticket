<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { formatDate, getEventLogoUrl } from "@/others/util";
import { useDate, useDisplay } from "vuetify";

const { mobile } = useDisplay();

const store = useStore();
const date = useDate();

const events_init = computed(() => store.state.event.events);

const events = computed(() => {
  return events_init.value.map((event) => ({
    prependAvatar: getEventLogoUrl(event.logoLeft),
    title: event.name,
    subtitle: `Date: ${formatDate(event.date?.slice(0, 10))} <br> Location: ${
      event.location
    }`,
    link: "true",
    to: { name: "event-single", params: { eventId: event.id } },
  }));
});

let dialog = ref(false);
const newFormType = ref(null);

const form = ref(null);
const isFormValid = ref(true);

const handleSubmitFormType = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  store
    .dispatch("registrationForm/addFormType", newFormType.value)
    .then((res) => {
      dialog.value = !dialog.value;
    })
    .catch((err) => console.log(err));
};

onMounted(() => {
  Promise.all([
    store.dispatch("event/setEvents"),
    store.dispatch("registrationForm/setFormTypes"),
  ]);
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title justify="space-between" title="All Events">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn color="primary" variant="tonal" v-bind="props"> Add</v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                density="compact"
                link
                title="Form Type"
                @click="dialog = true"
              ></v-list-item>
              <v-list-item
                :to="{ name: 'event-add' }"
                density="compact"
                link
                title="Event"
              ></v-list-item>
            </v-list>
          </v-menu>
        </page-title>
        <v-list
          v-if="events.length > 0"
          :items="events"
          item-props
          lines="three"
        >
          <template v-slot:prepend="{ item }">
            <v-avatar>
              <v-img :src="item.prependAvatar" />
            </v-avatar>
          </template>
          <template v-slot:subtitle="{ subtitle }">
            <div v-html="subtitle"></div>
          </template>
        </v-list>
        <v-alert v-else border="start" closable density="compact"
          >No items found!
        </v-alert>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="dialog" width="350">
    <v-card>
      <v-card-title>
        <span>Add Registration Form Type</span>
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          v-model="isFormValid"
          fast-fail
          @submit.prevent="handleSubmitFormType"
        >
          <v-text-field
            v-model="newFormType"
            :rules="[(v) => !!v || 'Form Type is required!']"
            class="mt-2"
            clearable
            density="compact"
            hide-details="auto"
            label="Form Type"
            variant="solo"
          ></v-text-field>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :density="mobile ? 'compact' : 'default'"
              color="primary"
              variant="tonal"
              type="submit"
              >Submit
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-avatar {
  border-radius: 0;
}

.v-avatar.v-avatar--density-default {
  width: calc(var(--v-avatar-height) + 80px);
  height: calc(var(--v-avatar-height) + 20px);
}
</style>
