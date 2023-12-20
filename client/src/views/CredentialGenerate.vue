<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { toast } from "vuetify-sonner";

const store = useStore();
const route = useRoute();

const eventId = computed(() => route.params.eventId);
const checkinStuffs = computed(() => store.state.appUser.checkinStuffs);
const exhibitors = computed(() => store.state.appUser.exhibitors);
const forms = computed(() => store.state.registrationForm.forms);
const users = computed(() => store.state.users.users);

const accordion = ref(["checkin"]);
const checkinDialog = ref(false);
const exhibitorDialog = ref(false);

const form = ref(null);
const isFormValid = ref(true);

const userInit = {
  username: null,
  password: null,
  eventId: null,
  userId: null,
  type: null,
};
const user = reactive({ ...userInit });
const selectedFormId = ref(null);

const openCheckinDialog = () => {
  checkinDialog.value = !checkinDialog.value;
};

const openExhibitorDialog = async () => {
  await store.dispatch("registrationForm/setForms", route.params.eventId);
  exhibitorDialog.value = !exhibitorDialog.value;
};
const handleSubmitCredential = async (type) => {
  await form.value.validate();
  if (!isFormValid.value) return;

  user.type = type;
  user.eventId = route.params.eventId;
  store.dispatch("appUser/saveAppUser", user).then((result) => {
    type == "exhibitor"
      ? (exhibitorDialog.value = !exhibitorDialog.value)
      : (checkinDialog.value = !checkinDialog.value);
    Object.assign(user, { ...userInit });
  });
};

// used in exhibitor dialog -> v-select
const formatExhibitorTitle = (item) =>
  `${item.firstname} ${item.surname} - ${item.email} - ${item.organization}`;

const copyToClipboard = async (item) => {
  await navigator.clipboard.writeText(
    `Username: ${item.username}, Password: ${item.password}`
  );
  toast("Copied to clipboard!", {
    cardProps: { color: "info" },
    action: {
      label: "Close",
      buttonProps: {
        color: "white",
      },
      onClick() {},
    },
  });
};

onMounted(() => {
  store.dispatch("appUser/setAppUser", eventId.value);
});
watch(
  () => selectedFormId.value,
  (newItem, oldItem) => store.dispatch("users/getExhibitorsByFormId", newItem)
);
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title justify="space-between" title="Credentials">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.back()"
          ></v-btn>
        </page-title>
      </v-col>
    </v-row>

    <v-row>
      <v-expansion-panels v-model="accordion">
        <v-expansion-panel value="checkin">
          <v-expansion-panel-title>Check-In Staffs</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row class="mb-1" justify="end">
              <v-col cols="auto">
                <v-btn
                  color="primary"
                  variant="tonal"
                  @click="openCheckinDialog"
                >
                  Generate Credential
                </v-btn>
              </v-col>
            </v-row>
            <v-table
              v-if="checkinStuffs?.length > 0"
              density="comfortable"
              hover
            >
              <thead>
                <tr>
                  <th class="text-start">Username</th>
                  <th class="text-center">Password</th>
                  <th class="text-end"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in checkinStuffs" :key="'c-' + index">
                  <td>{{ item.username }}</td>
                  <td class="text-center">{{ item.password }}</td>
                  <td class="text-end">
                    <v-btn
                      icon="mdi-content-copy"
                      size="small"
                      variant="text"
                      @click="copyToClipboard(item)"
                    ></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <v-alert v-else border="start" closable density="compact"
              >No Data available!
            </v-alert>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel value="exhibitor">
          <v-expansion-panel-title>Exhibitors</v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row class="mb-1" justify="end">
              <v-col cols="auto">
                <v-btn
                  color="primary"
                  variant="tonal"
                  @click="openExhibitorDialog"
                >
                  Generate Credential
                </v-btn>
              </v-col>
            </v-row>
            <v-table v-if="exhibitors?.length > 0" density="comfortable" hover>
              <thead>
                <tr>
                  <th class="text-start">Username</th>
                  <th class="text-center">Password</th>
                  <th class="text-end"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in exhibitors" :key="'e-' + index">
                  <td>{{ item.username }}</td>
                  <td class="text-center">{{ item.password }}</td>
                  <td class="text-end">
                    <v-btn
                      icon="mdi-content-copy"
                      size="small"
                      variant="text"
                      @click="copyToClipboard(item)"
                    ></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <v-alert v-else border="start" closable density="compact"
              >No Data available!
            </v-alert>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
  </v-container>

  <v-dialog v-model="checkinDialog" width="500">
    <v-card>
      <v-card-title> Generate Credential - Check-In Staff</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid" fast-fail>
          <v-text-field
            v-model="user.username"
            :rules="[(v) => !!v || 'Username is required!']"
            class="mt-2"
            clearable
            density="compact"
            hide-details="auto"
            label="Username"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="tonal"
          @click="handleSubmitCredential('checkin')"
          >Generate
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="exhibitorDialog" width="700">
    <v-card>
      <v-card-title> Generate Credential - Exhibitor</v-card-title>
      <v-card-text>
        <!--        <v-row v-if="users.length > 0">-->
        <!--          <v-col>-->
        <!--            <small-->
        <!--              ><i>(Click on the user to autofill the User ID field)</i></small-->
        <!--            >-->
        <!--            <v-table density="comfortable" hover>-->
        <!--              <thead>-->
        <!--                <tr>-->
        <!--                  <th class="text-start">User ID</th>-->
        <!--                  <th class="text-start">Name</th>-->
        <!--                  <th class="text-start">Email</th>-->
        <!--                  <th class="text-start">Job Title</th>-->
        <!--                  <th class="text-start">Organization</th>-->
        <!--                </tr>-->
        <!--              </thead>-->
        <!--              <tbody>-->
        <!--                <tr-->
        <!--                  v-for="(item, index) in users"-->
        <!--                  :key="'u-' + index"-->
        <!--                  class="clickable"-->
        <!--                  @click="user.userId = item.id"-->
        <!--                >-->
        <!--                  <td>{{ item.id }}</td>-->
        <!--                  <td>{{ item.firstname }} {{ item.surname }}</td>-->
        <!--                  <td>{{ item.email }}</td>-->
        <!--                  <td>{{ item.jobTitle }}</td>-->
        <!--                  <td>{{ item.organization }}</td>-->
        <!--                </tr>-->
        <!--              </tbody>-->
        <!--            </v-table>-->
        <!--          </v-col>-->
        <!--        </v-row>-->
        <!--        <v-alert v-else border="start" closable density="compact" class="mt-1"-->
        <!--          >No Data available!-->
        <!--        </v-alert>-->

        <v-form ref="form" v-model="isFormValid" fast-fail>
          <v-select
            v-model="selectedFormId"
            :items="forms"
            :rules="[(v) => !!v || 'Exhibitor Form is required!']"
            class="my-2"
            density="comfortable"
            hide-details="auto"
            item-title="name"
            item-value="rfId"
            label="Select Exhibitor Form"
          ></v-select>
          <small class="ps-1"
            ><i>Exhibitor format = Name - Email - Organization</i></small
          >
          <v-select
            v-model="user.userId"
            :item-title="formatExhibitorTitle"
            :items="users"
            :rules="[(v) => !!v || 'Exhibitor is required!']"
            density="comfortable"
            hide-details="auto"
            item-value="id"
            label="Select Exhibitor"
          ></v-select>
          <v-text-field
            v-model="user.username"
            :rules="[(v) => !!v || 'Username is required!']"
            class="mt-2"
            clearable
            density="compact"
            hide-details="auto"
            label="Username"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          type="submit"
          variant="tonal"
          @click="handleSubmitCredential('exhibitor')"
          >Generate
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
