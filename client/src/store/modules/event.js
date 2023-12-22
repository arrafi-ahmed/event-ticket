import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  events: [],
  event: {},
};

export const mutations = {
  setEvents(state, payload) {
    state.events = payload;
  },
  setEvent(state, payload) {
    state.event = payload;
  },
  addEvent(state, payload) {
    state.events.unshift(payload);
  },
};

export const actions = {
  setEvents({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/event/getAllEvents")
        .then((response) => {
          commit("setEvents", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setEvent({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/event/getEvent", { params: { eventId: request } })
        .then((response) => {
          commit("setEvent", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  addEvent({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/event/save", request)
        .then((response) => {
          commit("addEvent", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setEventByAppUserId({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/event/getEventByAppUserId", { params: { userId: request } })
        .then((response) => {
          commit("setEvent", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
