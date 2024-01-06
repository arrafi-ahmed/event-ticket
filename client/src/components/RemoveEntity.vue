<script setup>
import { useDisplay } from "vuetify";
import { ref } from "vue";

const { mobile } = useDisplay();
const dialog = ref(false);
const { id, text, color, variant, btnVariant } = defineProps({
  id: {},
  text: {},
  color: {},
  variant: { default: "btn" },
  btnVariant: { default: "tonal" },
});
const emit = defineEmits(["removeEntity"]);

const remove = () => {
  if (id) {
    emit("removeEntity", id);
  } else {
    emit("removeEntity");
  }
  dialog.value = false;
};
</script>

<template>
  <v-list-item
    v-if="variant === 'list-item'"
    density="compact"
    link
    :base-color="color"
    :title="text"
    @click.stop="dialog = !dialog"
  ></v-list-item>
  <template v-else-if="variant === 'btn'">
    <v-btn
      v-if="mobile && text"
      class="text-capitalize"
      :variant="btnVariant"
      :color="color"
      density="default"
      size="small"
      @click.stop="dialog = !dialog"
    >
      {{ text }}
    </v-btn>
    <v-btn
      class="text-capitalize"
      v-if="mobile && !text"
      :variant="btnVariant"
      :color="color"
      density="compact"
      icon="mdi-close"
      size="small"
      @click.stop="dialog = !dialog"
    >
    </v-btn>
    <v-btn
      class="text-capitalize"
      v-if="!mobile"
      :variant="btnVariant"
      :color="color"
      density="default"
      @click.stop="dialog = !dialog"
      >{{ text || "Remove" }}
    </v-btn>
  </template>

  <v-dialog v-model="dialog" width="400">
    <v-card>
      <v-card-title>
        <span>{{ text || "Remove" }}</span>
      </v-card-title>
      <v-card-text> Confirm delete?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :density="mobile ? 'comfortable' : 'default'"
          color="primary"
          @click="remove"
          >Yes
        </v-btn>
        <v-btn
          :density="mobile ? 'comfortable' : 'default'"
          color="primary"
          @click="dialog = !dialog"
          >No
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
