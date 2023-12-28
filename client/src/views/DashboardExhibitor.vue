<script setup>
import { getEventLogoUrl } from "@/others/util";
import PageTitle from "@/components/PageTitle.vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import FormAnswer from "@/components/FormAnswer.vue";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
const store = useStore();

const currentUser = computed(() => store.getters["user/getCurrentUser"]);
const event = computed(() => store.state.event.event);
const user = computed(() => store.state.badge.userScannedByExhibitor);

const qrScannerDialog = ref(false);

const handleScan = async ([decodedString]) => {
  qrScannerDialog.value = !qrScannerDialog.value;
  store.commit("badge/resetUserScannedByExhibitor");
  await store.dispatch("badge/setUserScannedByExhibitor", {
    qrCodeData: decodedString.rawValue,
    eventId: event.value.id,
  });
};

const onError = (err) => {
  console.error(89, err);
};

onMounted(() => {
  store.commit("badge/resetUserScannedByExhibitor");
  store.dispatch("event/setEventByAppUserId", currentUser.value.id);
  // await store.dispatch("badge/setUserScannedByExhibitor", {
  //   qrCodeData: JSON.stringify({
  //     id: 1,
  //     qrUuid: "7a3960ee-6d92-4f8a-9ead-ea59b4d187fb",
  //   }),
  //   eventId: 2,
  // });
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title
          :title="event.name"
          :justify="mobile ? 'space-around' : 'space-between'"
        >
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

            <v-btn
              class="ml-5"
              color="primary"
              size="large"
              variant="tonal"
              @click="qrScannerDialog = !qrScannerDialog"
            >
              Scan
            </v-btn>
          </v-row>
        </page-title>
      </v-col>
    </v-row>

    <v-row v-if="user && user.standards">
      <v-col>
        <v-card>
          <v-card-title>Attendee Information</v-card-title>
          <v-card-text>
            <v-table density="compact">
              <tbody>
                <tr v-if="user.standards.firstname">
                  <td class="rowTitle">Firstname</td>
                  <td>
                    {{ user.standards.firstname }}
                  </td>
                </tr>
                <tr v-if="user.standards.surname">
                  <td class="rowTitle">Surname</td>
                  <td>
                    {{ user.standards.surname }}
                  </td>
                </tr>
                <tr v-if="user.standards.email">
                  <td class="rowTitle">Email</td>
                  <td>
                    {{ user.standards.email }}
                  </td>
                </tr>
                <tr v-if="user.standards.phone">
                  <td class="rowTitle">Phone</td>
                  <td>
                    {{ user.standards.phone }}
                  </td>
                </tr>
                <tr v-if="user.standards.jobTitle">
                  <td class="rowTitle">Job Title</td>
                  <td>
                    {{ user.standards.jobTitle }}
                  </td>
                </tr>
                <tr v-if="user.standards.organization">
                  <td class="rowTitle">Organization</td>
                  <td>
                    {{ user.standards.organization }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="user && user.questions?.length > 0">
      <v-col>
        <v-card>
          <v-card-title>Survey Answers</v-card-title>
          <v-card-text>
            <form-answer :answers="user.answers" :items="user.questions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="qrScannerDialog" :max-width="500" persistent>
    <v-card>
      <v-card-title>Scan QR Code</v-card-title>
      <v-card-text>
        <qrcode-stream @detect="handleScan" @error="onError"></qrcode-stream>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="tonal"
          @click="qrScannerDialog = !qrScannerDialog"
          >Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
