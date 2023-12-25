import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  settings: {},
};

export const mutations = {
  setSettings(state, payload) {
    state.settings = payload;
  },
  updateSettings(state, payload) {
    Object.assign(state.settings, { ...payload });
  },
};

export const actions = {
  setSettings({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/settings/getSettings")
        .then((response) => {
          commit("setSettings", response.data.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  saveSettings({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/settings/saveSettings", request)
        .then((response) => {
          commit("updateSettings", request);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
