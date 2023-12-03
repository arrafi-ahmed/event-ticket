import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  clientSecret: null,
};

export const mutations = {
  setClientSecret(state, payload) {
    state.clientSecret = payload;
  },
};

export const actions = {
  setClientSecret({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/purchase/createPaymentIntent", { payload: request })
        .then((response) => {
          commit("setClientSecret", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
