import { createStore } from "vuex";
import * as user from "./modules/user";
import * as event from "./modules/event";
import * as registrationForm from "./modules/registrationForm";
import * as badgeDesign from "./modules/badgeDesign";
import * as badge from "./modules/badge";
import * as ticket from "./modules/ticket";
import * as promo from "./modules/promo";
import * as purchase from "./modules/purchase";
import * as appUser from "./modules/appUser";
import * as users from "./modules/users";
import * as report from "./modules/report";
import * as settings from "./modules/settings";

const store = createStore({
  modules: {
    user,
    appUser,
    event,
    registrationForm,
    badge,
    badgeDesign,
    ticket,
    promo,
    purchase,
    users,
    report,
    settings,
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
