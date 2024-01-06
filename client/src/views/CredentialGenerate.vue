<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { toast } from "vuetify-sonner";
import RemoveEntity from "@/components/RemoveEntity.vue";

const store = useStore();
const route = useRoute();

const eventId = computed(() => route.params.eventId);
const checkinStuffs = computed(() => store.state.appUser.checkinStuffs);
const exhibitors = computed(() => store.state.appUser.exhibitors);
const forms = computed(() => store.state.registrationForm.forms);
const users = computed(() => store.state.users.users);

const accordion = ref(["exhibitor"]);
const addCheckinDialog = ref(false);
const addExhibitorDialog = ref(false);
const editDialog = ref(false);
const isEditDialogCheckin = ref(false);

const form = ref(null);
const isFormValid = ref(true);

const userInit = {
  id: null,
  username: null,
  password: null,
  eventId: null,
  userId: null,
  type: null,
};
const user = reactive({ ...userInit });
const selectedFormId = ref(null);

const openAddCheckinDialog = () => {
  Object.assign(user, { ...userInit });
  addCheckinDialog.value = !addCheckinDialog.value;
};
const openEditDialog = (selectedUser, type) => {
  if (type === "checkin") {
    isEditDialogCheckin.value = true;
  } else if (type === "exhibitor") {
    isEditDialogCheckin.value = false;
  }
  //set only the properties of userInit object
  selectedUser = Object.assign(
    {},
    ...Object.keys(userInit).map((key) =>
      key in selectedUser ? { [key]: selectedUser[key] } : {}
    ),
    { id: selectedUser.aId }
  );
  console.log(35, user);
  Object.assign(user, { ...selectedUser });
  editDialog.value = !editDialog.value;
};
const openAddExhibitorDialog = async () => {
  Object.assign(user, { ...userInit });
  await store.dispatch("registrationForm/setForms", route.params.eventId);
  addExhibitorDialog.value = !addExhibitorDialog.value;
};
const handleSubmitCredential = async (type) => {
  await form.value.validate();
  if (!isFormValid.value) return;

  user.type = type;
  user.eventId = route.params.eventId;

  let additionalExhibitorData = {};
  if (type == "exhibitor") {
    additionalExhibitorData = users.value.find(
      (item) => item.id == user.userId
    );
  }
  console.log(36, user);
  await store
    .dispatch("appUser/saveAppUser", { user, additionalExhibitorData })
    .then((result) => {
      if ((type == "exhibitor" || type == "checkin") && user.id) {
        editDialog.value = !editDialog.value;
      } else if (type == "exhibitor" && !user.id) {
        addExhibitorDialog.value = !addExhibitorDialog.value;
      } else if (type == "checkin" && !user.id) {
        addCheckinDialog.value = !addCheckinDialog.value;
      }
      Object.assign(user, { ...userInit });
    });
};
const deleteAppUser = (id, type) => {
  store.dispatch("appUser/remove", { id, type });
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
        <v-expansion-panel value="exhibitor">
          <v-expansion-panel-title>
            <span>Exhibitors</span>
            <v-spacer></v-spacer>
            <v-btn
              class="me-5"
              color="primary"
              variant="tonal"
              @click.stop="openAddExhibitorDialog"
            >
              Generate Credential
            </v-btn>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-table v-if="exhibitors?.length > 0" density="comfortable" hover>
              <thead>
                <tr>
                  <th class="text-start">Username</th>
                  <th class="text-center">Password</th>
                  <th class="text-center">Name</th>
                  <th class="text-center">Organization</th>
                  <th class="text-end"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in exhibitors" :key="'e-' + index">
                  <td>{{ item.username }}</td>
                  <td class="text-center">{{ item.password }}</td>
                  <td class="text-center">
                    {{ item.firstname }} {{ item.surname }}
                  </td>
                  <td class="text-center">{{ item.organization }}</td>
                  <td class="text-end">
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
                          title="Copy"
                          @click="copyToClipboard(item)"
                        ></v-list-item>
                        <v-list-item
                          density="compact"
                          link
                          title="Edit"
                          @click="openEditDialog(item, 'exhibitor')"
                        ></v-list-item>
                        <remove-entity
                          btn-variant="flat"
                          color="error"
                          text="Delete"
                          variant="list-item"
                          @remove-entity="deleteAppUser(item.aId, 'exhibitor')"
                        ></remove-entity>
                      </v-list>
                    </v-menu>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <v-alert v-else border="start" closable density="compact"
              >No Data available!
            </v-alert>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel value="checkin">
          <v-expansion-panel-title>
            <span>Check-In Staffs</span>
            <v-spacer></v-spacer>
            <v-btn
              class="me-5"
              color="primary"
              variant="tonal"
              @click.stop="openAddCheckinDialog"
            >
              Generate Credential
            </v-btn>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
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
                          title="Copy"
                          @click="copyToClipboard(item)"
                        ></v-list-item>
                        <v-list-item
                          density="compact"
                          link
                          title="Edit"
                          @click="openEditDialog(item, 'checkin')"
                        ></v-list-item>
                        <remove-entity
                          btn-variant="flat"
                          color="error"
                          text="Delete"
                          variant="list-item"
                          @remove-entity="deleteAppUser(item.aId, 'checkin')"
                        ></remove-entity>
                        <!--                          @click="openEditDialog(item)"-->
                      </v-list>
                    </v-menu>
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

  <v-dialog v-model="addCheckinDialog" width="500">
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

  <v-dialog v-model="editDialog" width="500">
    <v-card>
      <v-card-title>
        Edit Credential -
        {{ isEditDialogCheckin ? "Check-In Staff" : "Exhibitor" }}
      </v-card-title>
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
          <v-text-field
            v-model="user.password"
            :rules="[(v) => !!v || 'Password is required!']"
            class="mt-2"
            clearable
            density="compact"
            hide-details="auto"
            label="Password"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="tonal"
          @click="
            handleSubmitCredential(
              isEditDialogCheckin ? 'checkin' : 'exhibitor'
            )
          "
          >Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="addExhibitorDialog" width="700">
    <v-card>
      <v-card-title> Generate Credential - Exhibitor</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid" fast-fail>
          <v-select
            v-model="selectedFormId"
            :items="forms"
            :rules="[(v) => !!v || 'Exhibitor Form is required!']"
            class="mb-2 mb-md-4"
            density="comfortable"
            hide-details="auto"
            item-title="name"
            item-value="rfId"
            label="Select Exhibitor Form"
          ></v-select>

          <small class="ps-2"
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
            :rules="[
              (v) => !!v || 'Username is required!',
              (v) =>
                /^[a-zA-Z0-9]*$/.test(v) ||
                'Username must only contain letters and numbers!',
            ]"
            class="mt-2 mt-md-4"
            clearable
            density="compact"
            hide-details="auto"
            label="Username"
          >
          </v-text-field>
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
