import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  promos: [],
  promo: {},
};

export const mutations = {
  setPromos(state, payload) {
    state.promos = payload;
  },
  setPromo(state, payload) {
    state.promo = payload;
  },
  addPromo(state, payload) {
    state.promos.unshift(payload);
  },
};

export const actions = {
  setPromos({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/promo/getPromos", { params: { formId: request } })
        .then((response) => {
          commit("setPromos", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setPromo({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/promo/getPromo", { params: { promoId: request } })
        .then((response) => {
          commit("setPromo", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setPromoByCodeNFormId({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/promo/getPromoByCodeNFormId", {
          params: { code: request.code, formId: request.formId },
        })
        .then((response) => {
          commit("setPromo", response.data?.payload);
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  savePromo({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/promo/save", { payload: request })
        .then((response) => {
          commit("addPromo", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
