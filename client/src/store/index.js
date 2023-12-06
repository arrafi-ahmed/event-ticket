import { createStore } from "vuex";
import * as user from "./modules/user";
import * as event from "./modules/event";
import * as registrationForm from "./modules/registrationForm";
import * as badgeDesign from "./modules/badgeDesign";
import * as ticket from "./modules/ticket";
import * as purchase from "./modules/purchase";
import * as users from "./modules/users";

const store = createStore({
  modules: {
    user,
    event,
    registrationForm,
    badgeDesign,
    ticket,
    purchase,
    users,
  },
  state: () => ({
    progress: null,
  }),
  mutations: {
    setProgress(state, payload) {
      state.progress = payload;
    },
  },
  actions: {},
});

export default store;
