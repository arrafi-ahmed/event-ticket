import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  users: [],
};

export const mutations = {
  setUsers(state, payload) {
    state.users = payload;
  },
};

export const actions = {
  setUsers({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/users/getUsers", { params: { formId: request } })
        .then((response) => {
          commit("setUsers", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
