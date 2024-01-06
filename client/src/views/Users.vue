<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import PageTitle from "@/components/PageTitle.vue";
import {
  formatDateTime,
  getCurrencySymbol,
  padStr,
  printBadge,
} from "@/others/util";
import FormAnswer from "@/components/FormAnswer.vue";
import BadgePreview from "@/components/BadgePreview.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const users = computed(() => store.state.users.users);
const badge = computed(() => store.state.badge.badge);
const event = computed(() => store.state.event.event);

const surveyInit = reactive({});
let survey = reactive({});
const attendee = reactive({});
const accordion = ref(["details"]);

const userDetailsDialog = ref(false);
const openUserDetailsDialog = (userId) => {
  const user = users.value.find((item) => item.uId == userId);
  Object.assign(attendee, { ...attendee, ...user });
  if (userId == user.formFiller) {
    store
      .dispatch("registrationForm/setFormWAnswer", {
        formId: user.registrationFormId,
        formFiller: user.formFiller,
      })
      .then((result) => {
        if (result) Object.assign(survey, result);
      });
  } else {
    for (let prop in survey) {
      delete survey[prop];
    }
    Object.assign(survey, surveyInit);
  }
  userDetailsDialog.value = !userDetailsDialog.value;
};

const updateUser = (userId) => {
  const user = users.value.find((item) => item.uId == userId);
  if (user.paymentStatus == attendee.paymentStatus)
    delete attendee.paymentStatus;

  if (user.badgeStatus == attendee.badgeStatus) delete attendee.badgeStatus;

  store.dispatch("users/updateUser", attendee).finally(() => {
    userDetailsDialog.value = !userDetailsDialog.value;
  });
};

const deleteUser = (userId, registrationId) => {
  store.dispatch("users/deleteUser", { userId, registrationId }).finally(() => {
    userDetailsDialog.value = !userDetailsDialog.value;
  });
};
const badgeWrapper = ref(null);

const handleClickPrintBadge = async (badgeId) => {
  await Promise.all([
    store.dispatch("event/setEvent", route.params.eventId),
    store.dispatch("badge/print", { badgeId }),
  ])
    .then(() => {
      return printBadge(badgeWrapper.value?.children?.[0]);
    })
    .finally(() => {
      store.commit("badge/resetBadge");
    });
};

const handleClickPrintInvoice = async (purchaseId) => {
  await Promise.all([
    // store.dispatch("event/setEvent", route.params.eventId),
    store.dispatch("invoice/print", { purchaseId }),
  ])
    .then((result) => {
      router.push({ name: "invoice" });
      // return printBadge(badgeWrapper.value?.children?.[0]);
    })
    .finally(() => {
      store.commit("invoice/resetInvoice");
    });
};

const paymentItems = [
  { title: "Pending", value: "pending" },
  { title: "Succeeded", value: "succeeded" },
];

const checkinItems = [
  { title: "Checked-in", value: 1 },
  { title: "Not Checked-in", value: 0 },
];

store.commit("users/resetUsers");
onMounted(() => {
  store.dispatch("users/setUsers", route.params.formId);
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <div v-if="event.name" class="pb-2">Event: {{ event.name }}</div>
        <page-title justify="space-between" title="Attendee List">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.back()"
          ></v-btn>
        </page-title>
      </v-col>
    </v-row>

    <v-row v-if="users.length > 0">
      <v-col>
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-start">Invoice</th>
              <th class="text-start">Name</th>
              <th class="text-start">Organization</th>
              <th class="text-start">Ticket</th>
              <th class="text-start">Payment Method</th>
              <th class="text-start">Amount</th>
              <th class="text-start">Payment Status</th>
              <th class="text-start">Check-in Status</th>
              <th class="text-start">Date</th>
              <th class="text-start"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in users"
              :key="'u-' + index"
              class="clickable"
              @click="openUserDetailsDialog(item.uId)"
            >
              <td>{{ padStr(item.pId, 8) }}</td>
              <td>{{ item.firstname }} {{ item.surname }}</td>
              <td>{{ item.organization }}</td>
              <td>{{ item.ticketName }}</td>
              <td class="text-capitalize">{{ item.paymentMethod }}</td>
              <td>
                {{ getCurrencySymbol(item.ticketCurrency, "symbol") }}
                {{ item.totalAmount }}
              </td>
              <td class="text-capitalize">
                <v-chip
                  :color="
                    item.paymentStatus?.toLowerCase() === 'succeeded'
                      ? 'success'
                      : 'yellow'
                  "
                  variant="flat"
                  >{{ item.paymentStatus }}
                </v-chip>
              </td>
              <td class="text-capitalize">
                <v-chip
                  :color="item.badgeStatus == 1 ? 'success' : 'yellow'"
                  variant="flat"
                  >{{ item.badgeStatus == 1 ? "Checked-in" : "Not Checked-in" }}
                </v-chip>
              </td>
              <td>
                <span>{{ formatDateTime(item.createdAt) }}</span>
              </td>
              <td>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      size="small"
                      v-bind="props"
                      variant="text"
                    >
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item
                      density="compact"
                      link
                      title="Print Badge"
                      @click="handleClickPrintBadge(item.bId)"
                    ></v-list-item>
                    <v-list-item
                      density="compact"
                      link
                      title="Print Invoice"
                      @click="handleClickPrintInvoice(item.pId)"
                    ></v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-alert v-else border="start" closable density="compact"
      >No Users found!
    </v-alert>
  </v-container>

  <div v-if="badge.id" ref="badgeWrapper" class="d-print-block">
    <badge-preview :badge="badge" :event="event"></badge-preview>
  </div>

  <v-dialog v-model="userDetailsDialog" width="600">
    <v-card density="compact">
      <v-card-text>
        <v-expansion-panels v-model="accordion" multiple>
          <v-expansion-panel value="details">
            <v-expansion-panel-title
              >Attendee Details [Invoice #{{ padStr(attendee.pId, 8) }}]
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-table density="compact">
                <tbody>
                  <tr>
                    <td class="rowTitle">Firstname</td>
                    <td>
                      <v-text-field
                        v-model="attendee.firstname"
                        density="compact"
                        hide-details="auto"
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td class="rowTitle">Surname</td>
                    <td>
                      <v-text-field
                        v-model="attendee.surname"
                        density="compact"
                        hide-details="auto"
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td class="rowTitle">Email</td>
                    <td>
                      <v-text-field
                        v-model="attendee.email"
                        density="compact"
                        hide-details="auto"
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td class="rowTitle">Phone</td>
                    <td>
                      <v-text-field
                        v-model="attendee.phone"
                        density="compact"
                        hide-details="auto"
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td class="rowTitle">Job Title</td>
                    <td>
                      <v-text-field
                        v-model="attendee.jobTitle"
                        density="compact"
                        hide-details="auto"
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td class="rowTitle">Organization</td>
                    <td>
                      <v-text-field
                        v-model="attendee.organization"
                        density="compact"
                        hide-details="auto"
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td class="rowTitle">Payment Status</td>
                    <td class="text-capitalize">
                      <v-select
                        v-model="attendee.paymentStatus"
                        :items="paymentItems"
                        class="text-capitalize"
                        density="compact"
                        hide-details="auto"
                        item-title="title"
                        item-value="value"
                      ></v-select>
                    </td>
                  </tr>
                  <tr>
                    <td class="rowTitle">Checkin Status</td>
                    <td class="text-capitalize">
                      <v-select
                        v-model="attendee.badgeStatus"
                        :items="checkinItems"
                        class="text-capitalize"
                        density="compact"
                        hide-details="auto"
                        item-title="title"
                        item-value="value"
                      ></v-select>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel value="survey">
            <v-expansion-panel-title>Survey Answers</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="survey && survey.questions?.length > 0">
                <!--                {{ survey }}-->
                <form-answer
                  :answers="survey.answers"
                  :items="survey.questions"
                />
              </div>
              <v-alert v-else border="start" closable density="compact"
                >No Data available!
              </v-alert>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="error"
          variant="tonal"
          @click="deleteUser(attendee.uId, attendee.registrationId)"
          >Delete
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="tonal" @click="updateUser(attendee.uId)"
          >Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style>
.rowTitle {
  width: 152px;
}
</style>
