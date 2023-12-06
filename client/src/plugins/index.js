/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from "./vuetify";
import router from "../router";
import store from "../store";
import $axios from "@/plugins/axios";
import {appear} from "@/directive/appear";
import {getQueryParam, removeQueryParams} from "@/others/util";
import {createI18n} from "vue-i18n";

const i18n = createI18n({
  locale: "en-GB", // set locale
  fallbackLocale: "en-GB", // set fallback locale
});

function handleApiQueryMsg() {
  //check if message came from server through query params
  const apiQueryMsg = getQueryParam("apiQueryMsg");

  if (apiQueryMsg) {
    const newUrl = removeQueryParams(window.location.href, ["apiQueryMsg"]);
    localStorage.setItem("apiQueryMsg", apiQueryMsg);
    window.location.href = newUrl;
  }
}

function handleAuthRoutes(to, isSignedin) {
  if (to.matched.some((record) => record.meta.requiresNoAuth) && isSignedin) {
    return { name: "home" };
  } else if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !isSignedin
  ) {
    return { name: "signin" };
  }
  return null;
}

export function registerPlugins(app) {
  router.beforeEach((to, from, next) => {
    const isSignedin = store.getters["user/isSignedin"];
    const redirectRoute = handleAuthRoutes(to, isSignedin);
    if (redirectRoute) {
      next(redirectRoute);
    }
    handleApiQueryMsg();
    next();
  });

  app.use(vuetify).use(router).use(store).use(i18n);
  app.directive("appear", appear);
  app.provide("$axios", $axios);
  window.$axios = $axios;
}
