import { createRouter, createWebHistory } from "vue-router";

const Default = () => import("@/layouts/default/Default.vue");
const Headerless = () => import("@/layouts/headerless/Headerless.vue");
const NotFound = () => import("@/views/NotFound.vue");
const Signout = () => import("@/views/Signout.vue");
const Signin = () => import("@/views/Signin.vue");
const Register = () => import("@/views/Register.vue");
const Home = () => import("@/views/Home.vue");
const EventAdd = () => import("@/views/EventAdd.vue");
const EventSingle = () => import("@/views/EventSingle.vue");
const RegistrationFormAdd = () => import("@/views/RegistrationFormAdd.vue");
const RegistrationFormSingle = () =>
  import("@/views/RegistrationFormSingle.vue");
const BadgeCreate = () => import("@/views/BadgeCreate.vue");
const TicketAdd = () => import("@/views/TicketAdd.vue");
const Users = () => import("@/views/Users.vue");
const Invoice = () => import("@/views/Invoice.vue");
const CredentialGenerate = () => import("@/views/CredentialGenerate.vue");

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
        path: "invoice",
        name: "invoice",
        component: Invoice,
        meta: {
          title: "Invoice",
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
        path: "event/:eventId/credential-generate",
        name: "credential-generate",
        component: CredentialGenerate,
        meta: {
          requiresAuth: true,
          title: "Credential Generate",
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
    path: "/invoice",
    component: Headerless,
    children: [
      {
        path: "invoice",
        name: "invoice",
        component: Invoice,
        meta: {
          title: "Invoice",
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
    name: "not-found",
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
      name: "not-found",
      params: { status: 404, message: "Looks like you're lost!" },
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
