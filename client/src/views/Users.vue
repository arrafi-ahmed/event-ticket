<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import PageTitle from "@/components/PageTitle.vue";

const store = useStore();
const route = useRoute();

const users = computed(() => store.state.users.users);

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
        <v-table density="comfortable">
          <thead>
            <tr>
              <th class="text-start">ID</th>
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
              class="clickable link"
            >
              <td>{{ item.uId }}</td>
              <td>{{ item.firstname }} {{ item.surname }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.ticketName }}</td>
              <td class="text-capitalize">{{ item.paymentMethod }}</td>
              <td class="text-capitalize">{{ item.paymentStatus }}</td>
              <td>{{ item.totalAmount }}</td>
              <td>{{ item.createdAt }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-alert v-else border="start" closable density="compact"
      >No Users found!
    </v-alert>
  </v-container>
</template>

<style scoped></style>
