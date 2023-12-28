<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import { getEventLogoUrl } from "@/others/util";
import PageTitle from "@/components/PageTitle.vue";
import BadgePreview from "@/components/BadgePreview.vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { useDisplay } from "vuetify";

const store = useStore();
const { mobile } = useDisplay();
const currentUser = computed(() => store.getters["user/getCurrentUser"]);
const event = computed(() => store.state.event.event);
const users = computed(() => store.state.users.users);
const badge = computed(() => store.state.badge.badge);

const form = ref(null);
const isFormValid = ref(true);
const searchingName = ref(null);

const onError = (err) => {
  console.error(89, err);
};
const handleSeachUser = async () => {
  await form.value.validate();
  if (!isFormValid.value) return;

  await store.dispatch("users/setUsersByNameNEventId", {
    name: searchingName.value,
    eventId: event.value.id,
  });
};
const qrScannerDialog = ref(false);

const handleScan = async ([decodedString]) => {
  qrScannerDialog.value = !qrScannerDialog.value;
  store.commit("badge/resetBadge");
  await store.dispatch("badge/scanBadge", {
    qrCodeData: decodedString.rawValue,
    eventId: event.value.id,
  });
  setTimeout(function () {
    window.print();
  }, 500);
};

const handleCheckin = async (userId, purchaseId) => {
  store.commit("badge/resetBadge");
  await store.dispatch("badge/checkin", { userId, purchaseId });
  // await nextTick();
  setTimeout(function () {
    window.print();
  }, 500);
};
const user = reactive({});

const userDetailsDialog = ref(false);

const openUserDetailsDialog = (userId) => {
  const foundUser = users.value.find((item) => item.uId == userId);
  Object.assign(user, { ...user, ...foundUser });
  userDetailsDialog.value = !userDetailsDialog.value;
};

const updateUser = (userId) => {
  const foundUser = users.value.find((item) => item.uId == userId);
  if (user.paymentStatus == foundUser.paymentStatus) return;
  store.dispatch("users/updatePaymentStatus", user).finally(() => {
    userDetailsDialog.value = !userDetailsDialog.value;
  });
};

onMounted(() => {
  store.commit("badge/resetBadge");
  store.commit("users/resetUsers");
  store.dispatch("event/setEventByAppUserId", currentUser.value.id);
});
</script>

<template>
  <v-container class="d-print-none">
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

    <v-row>
      <v-col>
        <v-form
          ref="form"
          v-model="isFormValid"
          @submit.prevent="handleSeachUser"
        >
          <v-text-field
            v-model="searchingName"
            :rules="[(v) => !!v || 'Name is required']"
            append-inner-icon="mdi-magnify"
            density="compact"
            hide-details="auto"
            label="Search by name"
            single-line
            @click:append-inner="handleSeachUser"
          ></v-text-field>
        </v-form>
      </v-col>
    </v-row>

    <v-row v-if="users.length > 0">
      <v-col>
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-start">Name</th>
              <th class="text-start">Email</th>
              <th class="text-start">Organization</th>
              <th class="text-start">Payment Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in users"
              :key="'u-' + index"
              class="clickable"
              @click="openUserDetailsDialog(item.uId)"
            >
              <td>{{ item.firstname }} {{ item.surname }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.organization }}</td>
              <td class="text-capitalize">
                <v-chip
                  v-if="item.paymentStatus"
                  :color="
                    item.paymentStatus.toLowerCase() === 'succeeded'
                      ? 'success'
                      : 'yellow'
                  "
                  variant="flat"
                  >{{ item.paymentStatus }}
                </v-chip>
              </td>
              <td>
                <v-btn
                  color="primary"
                  variant="tonal"
                  @click.stop="handleCheckin(item.uId, item.pId)"
                  >Checkin
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-alert v-else border="start" class="mt-2" closable density="compact"
      >No users to show!
    </v-alert>
  </v-container>

  <div v-if="badge.id" class="d-none d-print-block">
    <badge-preview :badge="badge" :event="event"></badge-preview>
  </div>

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

  <v-dialog v-model="userDetailsDialog" width="600">
    <v-card density="compact">
      <v-card-title>Attendee Details</v-card-title>
      <v-card-text>
        <v-table density="compact">
          <tbody>
            <tr>
              <td class="rowTitle">Name</td>
              <td>{{ user.firstname }} {{ user.surname }}</td>
            </tr>
            <tr>
              <td class="rowTitle">Email</td>
              <td class="rowTitle">{{ user.email }}</td>
            </tr>
            <tr>
              <td class="rowTitle">Payment Status</td>
              <td class="text-capitalize">
                <v-select
                  v-model="user.paymentStatus"
                  :items="['Pending', 'Succeeded']"
                  class="text-capitalize"
                  density="compact"
                  hide-details="auto"
                ></v-select>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="tonal" @click="updateUser(user.uId)"
          >Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style></style>
