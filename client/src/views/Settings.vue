<script setup>
import PageTitle from "@/components/PageTitle.vue";
import { computed, onMounted, reactive } from "vue";
import { useStore } from "vuex";

const store = useStore();
const settings = computed(() => store.state.settings.settings);
const newSettings = reactive({});

const handleSubmitSettings = () => {
  store.dispatch("settings/saveSettings", newSettings);
};

onMounted(async () => {
  await store.dispatch("settings/setSettings");
  Object.assign(newSettings, { ...settings.value });
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <page-title justify="space-between" title="Settings">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.back()"
          ></v-btn>
        </page-title>
      </v-col>
    </v-row>

    <v-row class="mt-2 mt-md-4">
      <v-col>
        <h3 class="mb-2 mb-md-4">Address</h3>
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-start">Key</th>
              <th class="text-center">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Company Name</td>
              <td>
                <v-text-field
                  v-model="newSettings.companyName"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>Street</td>
              <td>
                <v-text-field
                  v-model="newSettings.street"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>Town</td>
              <td>
                <v-text-field
                  v-model="newSettings.town"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>County</td>
              <td>
                <v-text-field
                  v-model="newSettings.county"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>Zip</td>
              <td>
                <v-text-field
                  v-model="newSettings.zip"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>Country</td>
              <td>
                <v-text-field
                  v-model="newSettings.country"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>

    <v-row class="mt-2 mt-md-4">
      <v-col>
        <h3 class="mb-2 mb-md-4">Bank Details</h3>
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-start">Key</th>
              <th class="text-center">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bank</td>
              <td>
                <v-text-field
                  v-model="newSettings.bank"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>Account Name</td>
              <td>
                <v-text-field
                  v-model="newSettings.accountName"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>IBAN</td>
              <td>
                <v-text-field
                  v-model="newSettings.iban"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>Swift</td>
              <td>
                <v-text-field
                  v-model="newSettings.swift"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>

    <v-row class="mt-2 mt-md-4">
      <v-col>
        <h3 class="mb-2 mb-md-4">Invoice</h3>

        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-start">Key</th>
              <th class="text-center">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Invoice Paying Currency</td>
              <td>
                <v-text-field
                  v-model="newSettings.invoiceCurrency"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>Invoice Notes</td>
              <td>
                <v-textarea
                  v-model="newSettings.invoiceNotes"
                  class="text-pre-wrap"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                >
                </v-textarea>
              </td>
            </tr>
            <tr>
              <td>Invoice Footer</td>
              <td>
                <v-text-field
                  v-model="newSettings.invoiceFooter"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>

    <v-row class="mt-2 mt-md-4">
      <v-col>
        <h3 class="mb-2 mb-md-4">Payment</h3>

        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-start">Key</th>
              <th class="text-center">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Stripe public key</td>
              <td>
                <v-text-field
                  v-model="newSettings.stripePublic"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>Stripe secret key</td>
              <td>
                <v-text-field
                  v-model="newSettings.stripeSecret"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
            <tr>
              <td>PayPal client id</td>
              <td>
                <v-text-field
                  v-model="newSettings.paypalClientId"
                  density="compact"
                  hide-details="auto"
                  variant="outlined"
                ></v-text-field>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row justify="end">
      <v-col cols="auto">
        <v-btn color="primary" variant="tonal" @click="handleSubmitSettings"
          >Save
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
