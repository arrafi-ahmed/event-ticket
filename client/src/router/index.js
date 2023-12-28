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
const EventEdit = () => import("@/views/EventEdit.vue");
const RegistrationFormAdd = () => import("@/views/RegistrationFormAdd.vue");
const RegistrationFormEdit = () => import("@/views/RegistrationFormEdit.vue");
const RegistrationFormSingle = () =>
  import("@/views/RegistrationFormSingle.vue");
const BadgeCreate = () => import("@/views/BadgeCreate.vue");
const BadgeEdit = () => import("@/views/BadgeEdit.vue");
const TicketAdd = () => import("@/views/TicketAdd.vue");
const TicketEdit = () => import("@/views/TicketEdit.vue");
const Users = () => import("@/views/Users.vue");
const Invoice = () => import("@/views/Invoice.vue");
const CredentialGenerate = () => import("@/views/CredentialGenerate.vue");
const DashboardCheckinStaff = () => import("@/views/DashboardCheckinStaff.vue");
const DashboardExhibitor = () => import("@/views/DashboardExhibitor.vue");
const ExhibitorVisibilityAdd = () =>
  import("@/views/ExhibitorVisibilityAdd.vue");
const ExhibitorVisibilityEdit = () =>
  import("@/views/ExhibitorVisibilityEdit.vue");
const Settings = () => import("@/views/Settings.vue");

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
          requiresAdmin: true,
          title: "Home",
        },
      },
      {
        path: "event-add",
        name: "event-add",
        component: EventAdd,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
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
          requiresAdmin: true,
          title: "Event",
        },
      },
      {
        path: "event/:eventId/edit",
        name: "event-edit",
        component: EventEdit,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Edit Event",
        },
      },
      {
        path: "event/:eventId/registration-form/add",
        name: "registration-form-add",
        component: RegistrationFormAdd,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Add Registration Form",
        },
      },
      {
        path: "event/:eventId/registration-form/edit",
        name: "registration-form-edit",
        component: RegistrationFormEdit,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Edit Registration Form",
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
          requiresAdmin: true,
          title: "Create Badge",
        },
      },
      {
        path: "event/:eventId/badge/edit",
        name: "badge-edit",
        component: BadgeEdit,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Edit Badge",
        },
      },
      {
        path: "event/:eventId/ticket/add",
        name: "ticket-add",
        component: TicketAdd,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Add Ticket",
        },
      },
      {
        path: "event/:eventId/ticket/edit",
        name: "ticket-edit",
        component: TicketEdit,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Edit Ticket",
        },
      },
      {
        path: "event/:eventId/credential-generate",
        name: "credential-generate",
        component: CredentialGenerate,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Credential Generate",
        },
      },
      {
        path: "event/:eventId/exhibitor-visibility/add",
        name: "exhibitor-visibility-add",
        component: ExhibitorVisibilityAdd,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Add Exhibitor Visibility",
        },
      },
      {
        path: "event/:eventId/exhibitor-visibility/edit",
        name: "exhibitor-visibility-edit",
        component: ExhibitorVisibilityEdit,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Edit Exhibitor Visibility",
        },
      },
      {
        path: "event/:eventId/form/:formId/users",
        name: "users",
        component: Users,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "View Attendees",
        },
      },
      {
        path: "dashboard/checkin-staff",
        name: "dashboard-checkin-staff",
        component: DashboardCheckinStaff,
        meta: {
          requiresAuth: true,
          title: "Home - Checkin",
        },
      },
      {
        path: "dashboard/exhibitor",
        name: "dashboard-exhibitor",
        component: DashboardExhibitor,
        meta: {
          requiresAuth: true,
          title: "Home - Exhibitor",
        },
      },
      {
        path: "settings",
        name: "settings",
        component: Settings,
        meta: {
          requiresAuth: true,
          title: "Settings",
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
