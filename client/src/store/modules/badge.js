import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  badges: [],
  badge: {},
};

export const mutations = {
  setBadges(state, payload) {
    state.badges = payload;
  },
  setBadge(state, payload) {
    state.badge = payload;
  },
  addBadge(state, payload) {
    state.badges.unshift(payload);
  },
};

export const actions = {
  setBadges({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/badge/getAllBadges", { params: { eventId: request } })
        .then((response) => {
          commit("setBadges", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setBadge({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/badge/getBadge", {
          params: {
            badgeId: request.badgeId,
            registrationFormId: request.registrationFormId,
          },
        })
        .then((response) => {
          commit("setBadge", response.data?.payload);
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  addBadge({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/badge/save", { payload: request })
        .then((response) => {
          commit("addBadge", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
