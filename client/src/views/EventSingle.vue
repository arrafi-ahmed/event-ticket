<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import PageTitle from "@/components/PageTitle.vue";
import { useDisplay } from "vuetify";
import BadgePreview from "@/components/BadgePreview.vue";
import { getEventLogoUrl } from "../others/util";

const { mobile } = useDisplay();

const route = useRoute();
const store = useStore();

const event = computed(() => store.state.event.event);
const forms = computed(() => store.state.registrationForm.forms);
const badgeDesigns = computed(() => store.state.badgeDesign.badgeDesigns);
const badgeDesign = computed(() => store.state.badgeDesign.badgeDesign);

const dialog = ref(false);

const openBadge = async (badgeDesignId) => {
  await store.dispatch("badgeDesign/setBadgeDesign", {
    badgeDesignId,
  });
  console.log("badgeDesign", badgeDesign.value);
  dialog.value = !dialog.value;
};

onMounted(async () => {
  await Promise.all([
    store.dispatch("event/setEvent", route.params.eventId),
    store.dispatch("registrationForm/setForms", route.params.eventId),
    store.dispatch("badgeDesign/setBadgeDesigns", route.params.eventId),
  ]);
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title :title="event.name" justify="space-between">
          <v-row align="center">
            <v-col v-if="event.logoLeft" cols="auto">
              <div>
                <small>Event Logo:</small>
              </div>
              <v-avatar rounded="sm" size="x-large">
                <v-img :src="getEventLogoUrl(event.logoLeft)" />
              </v-avatar>
            </v-col>
            <v-col v-if="event.logoRight" cols="auto">
              <div>
                <small>Sponsor Logo:</small>
              </div>
              <v-avatar rounded="sm" size="x-large">
                <v-img :src="getEventLogoUrl(event.logoRight)" />
              </v-avatar>
            </v-col>

            <v-divider class="mx-2" inset vertical></v-divider>

            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  class="ml-5"
                  color="primary"
                  variant="tonal"
                  v-bind="props"
                >
                  Add
                </v-btn>
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
          </v-row>
        </page-title>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6">
        <v-card density="compact">
          <v-card-title>
            <span>Forms:</span>
            <v-divider class="my-2"></v-divider>
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

      <v-col cols="12" sm="6">
        <v-card density="compact">
          <v-card-title>
            <span>Attendees:</span>
            <v-divider class="my-2"></v-divider>
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

      <v-col cols="12" sm="6">
        <v-card density="compact">
          <v-card-title>
            <span>Badges:</span>
            <v-divider class="my-2"></v-divider>
          </v-card-title>
          <v-card-text>
            <v-list v-if="badgeDesigns.length > 0" density="compact">
              <template v-for="(item, index) in badgeDesigns">
                <v-list-item
                  v-if="item"
                  :key="index"
                  :title="item?.title"
                  link
                  @click="openBadge(item.id)"
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
      :badge-data="badgeDesign.badgeData"
      :badge-visibility="badgeDesign.badgeVisibility"
      :event="event"
      card-title="Badge Design Preview"
    ></badge-preview>
  </v-dialog>
</template>

<style scoped></style>
