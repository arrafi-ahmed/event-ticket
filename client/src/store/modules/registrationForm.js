import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  formTypes: [],
  forms: [],
  form: {},
  formWQuestion: {},
  formWAnswer: {},
  fields: [],
};

export const mutations = {
  setFormTypes(state, payload) {
    state.formTypes = payload;
  },
  addFormType(state, payload) {
    state.formTypes.unshift(payload);
  },
  setFields(state, payload) {
    state.fields = payload;
  },
  setForms(state, payload) {
    state.forms = payload;
  },
  setForm(state, payload) {
    state.form = payload;
  },
  setFormWQuestion(state, payload) {
    state.formWQuestion = payload;
  },
  resetFormWQuestion(state) {
    state.formWQuestion = {};
  },
  setFormWAnswer(state, payload) {
    state.formWAnswer = payload;
  },
  addForm(state, payload) {
    state.forms.unshift(payload);
  },
};

export const actions = {
  setFields({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/registrationForm/getFields")
        .then((response) => {
          commit("setFields", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setFormTypes({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/registrationForm/getFormTypesByEventId", {
          params: { eventId: request },
        })
        .then((response) => {
          commit("setFormTypes", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  addFormType({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/registrationForm/saveFormType", { newFormType: request })
        .then((response) => {
          commit("addFormType", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setForms({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/registrationForm/getAllForms", {
          params: { eventId: request },
        })
        .then((response) => {
          commit("setForms", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setForm({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/registrationForm/getForm", {
          params: { formId: request },
        })
        .then((response) => {
          commit("setForm", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setFormWQuestion({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/registrationForm/getFormWQuestion", {
          params: { formId: request },
        })
        .then((response) => {
          commit("setFormWQuestion", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setFormWAnswer({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/registrationForm/getFormWAnswer", {
          params: { formId: request.formId, formFiller: request.formFiller },
        })
        .then((response) => {
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  addForm({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/registrationForm/saveForm", { payload: request })
        .then((response) => {
          commit("addForm", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  submitUserForm({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/registrationForm/submitUserForm", { payload: request })
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  areRegisteredUsersExist({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/registrationForm/areRegisteredUsersExist", {
          payload: request,
        })
        .then((response) => {
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
