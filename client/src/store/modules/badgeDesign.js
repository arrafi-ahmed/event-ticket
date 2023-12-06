import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  badgeDesigns: [],
  badgeDesign: {},
};

export const mutations = {
  setBadgeDesigns(state, payload) {
    state.badgeDesigns = payload;
  },
  setBadgeDesign(state, payload) {
    state.badgeDesign = payload;
  },
  addBadgeDesign(state, payload) {
    state.badgeDesigns.unshift(payload);
  },
};

export const actions = {
  setBadgeDesigns({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/badgeDesign/getAllBadgeDesigns", {
          params: { eventId: request },
        })
        .then((response) => {
          commit("setBadgeDesigns", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setBadgeDesign({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/badgeDesign/getBadgeDesignWVisibility", {
          params: {
            badgeDesignId: request.badgeDesignId,
          },
        })
        .then((response) => {
          commit("setBadgeDesign", response.data?.payload);
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  addBadgeDesign({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/badgeDesign/saveBadgeDesign", { payload: request })
        .then((response) => {
          commit("addBadgeDesign", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
