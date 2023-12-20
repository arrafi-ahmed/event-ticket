<script setup>
import { defineEmits, defineProps, onMounted, reactive, ref } from "vue";

const { item, index } = defineProps(["item", "index", "quantityIndex", "type"]);

const emit = defineEmits(["updatePhone"]);

// phone input
const selectedCountry = reactive({
  flag: null,
  name: null,
  code: null,
  dialCode: null,
});

const formatItem5Title = ({ flag, code, name, dialCode }) => {
  return (flag ? flag : code) + " " + name + " " + dialCode;
};
const code = ref(null);
const phone = ref(null);

const formatPhoneInput = (index) => {
  const formattedPhone = `${selectedCountry.dialCode}${phone.value}`;
  emit("updatePhone", { formattedPhone, index });
};

const formatSelectedDialCode = (selectedCode) => {
  const { flag, code, name, dialCode } = item.options.find(
    (item) => item.code == selectedCode
  );
  Object.assign(selectedCountry, {
    ...selectedCountry,
    flag,
    code,
    name,
    dialCode,
  });
};
// set initial selection to uk
onMounted(() => {
  const ukOption = item.options.find((option) => option.code === "GB");
  if (ukOption) {
    code.value = ukOption.code;
    formatSelectedDialCode(code.value);
  }
});
</script>

<template>
  <v-row no-gutters>
    <v-col cols="auto">
      <v-select
        v-model="code"
        :item-title="formatItem5Title"
        item-value="code"
        :items="item.options"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        density="compact"
        hide-details="auto"
        @update:modelValue="formatSelectedDialCode"
      >
        <template v-slot:selection="{ item }">
          {{ selectedCountry.flag }} {{ selectedCountry.dialCode }}
        </template>
      </v-select>
    </v-col>
    <v-col class="flex-grow-1" cols="auto">
      <v-text-field
        v-model="phone"
        :label="item.text"
        :rules="[(v) => !!v || !item.required || 'required']"
        class="mt-2 mt-md-4"
        density="compact"
        hide-details="auto"
        @update:modelValue="formatPhoneInput(index)"
      >
        <template v-slot:label>
          <span>{{ item.text }}</span>
          <span v-if="item.required" style="color: red">*</span>
        </template>
      </v-text-field>
    </v-col>
  </v-row>
</template>

<style scoped></style>
