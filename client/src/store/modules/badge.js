import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  badge: {},
};

export const mutations = {
  setBadge(state, payload) {
    state.badge = payload;
  },
  resetBadge(state) {
    state.badge = {};
  },
};

export const actions = {
  checkin({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/badge/checkin", {
          params: { userId: request.userId, purchaseId: request.purchaseId },
        })
        .then((response) => {
          commit("setBadge", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  scanBadge({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/badge/scanBadge", {
          params: { qrCodeData: request.qrCodeData, eventId: request.eventId },
        })
        .then((response) => {
          commit("setBadge", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
