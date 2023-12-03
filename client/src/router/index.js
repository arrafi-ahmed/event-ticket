import { createRouter, createWebHistory } from "vue-router";
import Default from "@/layouts/default/Default.vue";
import NotFound from "@/views/NotFound.vue";
import Signout from "@/views/Signout.vue";
import Signin from "@/views/Signin.vue";
import Register from "@/views/Register.vue";
import Home from "@/views/Home.vue";
import EventAdd from "@/views/EventAdd.vue";
import EventSingle from "@/views/EventSingle.vue";
import RegistrationFormAdd from "@/views/RegistrationFormAdd.vue";
import RegistrationFormSingle from "@/views/RegistrationFormSingle.vue";
import BadgeCreate from "@/views/BadgeCreate.vue";
import TicketAdd from "@/views/TicketAdd.vue";
import Users from "@/views/Users.vue";

const routes = [
  {
    path: "/",
    component: Default,
    children: [
      {
        path: "signin",
        name: "signin",
        component: Signin,
        meta: {
          requiresNoAuth: true,
          title: "Signin",
        },
      },
      {
        path: "signout",
        name: "signout",
        component: Signout,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "register",
        name: "register",
        component: Register,
        meta: {
          requiresNoAuth: true,
          title: "Register",
        },
      },
      {
        path: "home",
        name: "home",
        component: Home,
        meta: {
          requiresAuth: true,
          title: "Home",
        },
      },
      {
        path: "event-add",
        name: "event-add",
        component: EventAdd,
        meta: {
          requiresAuth: true,
          title: "Add Event",
        },
      },
      {
        path: "event/:eventId",
        name: "event-single",
        component: EventSingle,
        meta: {
          requiresAuth: true,
          title: "Event",
        },
      },
      {
        path: "event/:eventId/registration-form/add",
        name: "registration-form-add",
        component: RegistrationFormAdd,
        meta: {
          requiresAuth: true,
          title: "Add Registration Form",
        },
      },
      {
        path: "event/:eventId/registration-form/:formId",
        name: "registration-form-single",
        component: RegistrationFormSingle,
        meta: {
          title: "Registration Form",
        },
      },
      {
        path: "event/:eventId/badge/create",
        name: "badge-create",
        component: BadgeCreate,
        meta: {
          requiresAuth: true,
          title: "Create  Badge",
        },
      },
      {
        path: "event/:eventId/ticket/add",
        name: "ticket-add",
        component: TicketAdd,
        meta: {
          requiresAuth: true,
          title: "Add Ticket",
        },
      },
      {
        path: "users/:formId",
        name: "users",
        component: Users,
        meta: {
          requiresAuth: true,
          title: "View Attendees",
        },
      },
    ],
  },
  {
    path: "",
    redirect: { name: "home" },
  },
  {
    path: "/not-found/:status?/:message?",
    name: "notFound",
    component: NotFound,
    props: (route) => ({
      status: route.params.status || 404,
      message: route.params.message || "Looks like you're lost!",
    }),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/:catchAll(.*)",
    redirect: {
      name: "notFound",
      params: { status: 404, message: "Looks like you're lost!" },
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
