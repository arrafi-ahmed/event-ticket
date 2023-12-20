<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { formatDate, getEventLogoUrl } from "@/others/util";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();

const store = useStore();

const events_init = computed(() => store.state.event.events);

const events = computed(() => {
  return events_init.value.map((event) => ({
    prependAvatar: getEventLogoUrl(event.logoLeft),
    title: event.name,
    subtitle: `Date: ${formatDate(event.startDate)} - ${formatDate(
      event.endDate
    )} <br> Location: ${event.location}`,
    link: "true",
    to: { name: "event-single", params: { eventId: event.id } },
  }));
});

let dialog = ref(false);

onMounted(() => {
  store.dispatch("event/setEvents");
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title justify="space-between" title="All Events">
          <v-btn
            :to="{ name: 'event-add' }"
            color="primary"
            v-bind="props"
            variant="tonal"
            >Add Event
          </v-btn>
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
