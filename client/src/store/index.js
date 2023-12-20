import { createStore } from "vuex";
import * as user from "./modules/user";
import * as event from "./modules/event";
import * as registrationForm from "./modules/registrationForm";
import * as badgeDesign from "./modules/badgeDesign";
import * as ticket from "./modules/ticket";
import * as purchase from "./modules/purchase";
import * as appUser from "./modules/appUser";
import * as users from "./modules/users";
import * as invoice from "./modules/invoice";

const store = createStore({
  modules: {
    user,
    appUser,
    event,
    registrationForm,
    badgeDesign,
    ticket,
    purchase,
    users,
    invoice,
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
