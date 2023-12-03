<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import PageTitle from "@/components/PageTitle.vue";
import { useDisplay } from "vuetify";
import BadgePreview from "@/components/BadgePreview.vue";

const { mobile } = useDisplay();

const route = useRoute();
const store = useStore();

const event = computed(() => store.state.event.event);
const forms = computed(() => store.state.registrationForm.forms);
const badges = computed(() => store.state.badge.badges);
const badge = computed(() => store.state.badge.badge);

const dialog = ref(false);

const openBadge = async (badgeId, registrationFormId) => {
  await store.dispatch("badge/setBadge", { badgeId, registrationFormId });
  dialog.value = !dialog.value;
};

onMounted(async () => {
  await Promise.all([
    store.dispatch("event/setEvent", route.params.eventId),
    store.dispatch("registrationForm/setForms", route.params.eventId),
    store.dispatch("badge/setBadges", route.params.eventId),
  ]);
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title :title="event.name" justify="space-between">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn color="primary" v-bind="props"> Add</v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                :to="{
                  name: 'registration-form-add',
                }"
                density="compact"
                title="Form"
              ></v-list-item>
              <v-list-item
                :to="{
                  name: 'badge-create',
                  params: {
                    eventId: route.params.eventId,
                  },
                }"
                density="compact"
                title="Badge"
              ></v-list-item>
              <v-list-item
                :to="{
                  name: 'ticket-add',
                  params: {
                    eventId: route.params.eventId,
                  },
                }"
                density="compact"
                title="Ticket"
              ></v-list-item>
            </v-list>
          </v-menu>
        </page-title>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col col>
        <v-card density="compact">
          <v-card-title>
            <span>Forms:</span>
          </v-card-title>
          <v-card-text>
            <v-list v-if="forms.length > 0" density="compact">
              <template v-for="(item, index) in forms">
                <v-list-item
                  v-if="item"
                  :key="index"
                  :title="`${item?.name} Registration`"
                  :to="{
                    name: 'registration-form-single',
                    params: {
                      eventId: route.params.eventId,
                      formId: item.rfId,
                    },
                  }"
                ></v-list-item>
              </template>
            </v-list>
            <v-alert v-else border="start" closable density="compact"
              >No items found!
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col col>
        <v-card density="compact">
          <v-card-title>
            <span>Attendees:</span>
          </v-card-title>
          <v-card-text>
            <v-list v-if="forms.length > 0" density="compact">
              <template v-for="(item, index) in forms">
                <v-list-item
                  v-if="item"
                  :key="index"
                  :title="`${item?.name}`"
                  :to="{
                    name: 'users',
                    params: {
                      formId: item.rfId,
                    },
                  }"
                ></v-list-item>
              </template>
            </v-list>
            <v-alert v-else border="start" closable density="compact"
              >No items found!
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col col>
        <v-card density="compact">
          <v-card-title>
            <span>Badges:</span>
          </v-card-title>
          <v-card-text>
            <v-list v-if="badges.length > 0" density="compact">
              <template v-for="(item, index) in badges">
                <v-list-item
                  v-if="item"
                  :key="index"
                  :title="item?.title"
                  link
                  @click="openBadge(item.id, item.registrationFormId)"
                ></v-list-item>
              </template>
            </v-list>
            <v-alert v-else border="start" closable density="compact"
              >No items found!
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="dialog" width="700">
    <badge-preview
      :badge-data="badge.badgeData"
      :badge-visibility="badge.badgeVisibility"
      :event="event"
      card-title="Badge Design Preview"
    ></badge-preview>
  </v-dialog>
</template>

<style scoped></style>
