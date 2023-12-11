<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import PageTitle from "@/components/PageTitle.vue";
import { formatDateTime, getCurrencySymbol } from "@/others/util";
import FormAnswer from "@/components/FormAnswer.vue";

const store = useStore();
const route = useRoute();

const users = computed(() => store.state.users.users);
const surveyInit = reactive({});
let survey = reactive({});
let attendee = reactive({});
const dialog = ref(false);
const accordion = ref(["details"]);

const openDialog = (userId) => {
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
  console.log(2, attendee);

  dialog.value = !dialog.value;
};

const updateUser = (userId) => {
  const user = users.value.find((item) => item.uId == userId);
  if (user.paymentStatus == attendee.paymentStatus)
    delete attendee.paymentStatus;
  store
    .dispatch("users/updateUser", attendee)
    .then(() => {
      const targetInvoiceId = attendee.pId;
      let updatingUsers = users.value.filter(
        (item) => item.pId == targetInvoiceId
      );

      updatingUsers.forEach((item) => {
        item.paymentStatus = attendee.paymentStatus;
        store.commit("users/updateUser", item);
      });
    })
    .finally(() => {
      dialog.value = !dialog.value;
    });
};

const deleteUser = (userId, registrationId) => {
  store.dispatch("users/deleteUser", { userId, registrationId }).finally(() => {
    dialog.value = !dialog.value;
  });
};

onMounted(() => {
  store.dispatch("users/setUsers", route.params.formId);
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
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
              <th class="text-start">Email</th>
              <th class="text-start">Ticket</th>
              <th class="text-start">Payment Method</th>
              <th class="text-start">Status</th>
              <th class="text-start">Amount</th>
              <th class="text-start">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in users"
              :key="'u-' + index"
              class="clickable"
              @click="openDialog(item.uId)"
            >
              <td>{{ item.pId }}</td>
              <td>{{ item.firstname }} {{ item.surname }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.ticketName }}</td>
              <td class="text-capitalize">{{ item.paymentMethod }}</td>
              <td class="text-capitalize">{{ item.paymentStatus }}</td>
              <td>
                {{ getCurrencySymbol(item.ticketCurrency, "symbol") }}
                {{ item.totalAmount }}
              </td>
              <td>{{ formatDateTime(item.createdAt) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-alert v-else border="start" closable density="compact"
      >No Users found!
    </v-alert>
  </v-container>

  <v-dialog v-model="dialog" width="600">
    <v-card>
      <v-card-text>
        <v-expansion-panels v-model="accordion" multiple>
          <v-expansion-panel value="details">
            <v-expansion-panel-title>Attendee Details</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-table density="comfortable">
                <tbody>
                  <tr>
                    <td class="rowTitle">Invoice ID</td>
                    <td>{{ attendee.pId }}</td>
                  </tr>
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
                        class="text-capitalize"
                        v-model="attendee.paymentStatus"
                        :items="['Pending', 'Succeeded']"
                        density="compact"
                        hide-details="auto"
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
                  :items="survey.questions"
                  :answers="survey.answers"
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

<style scoped>
.rowTitle {
  width: 152px;
}
</style>
