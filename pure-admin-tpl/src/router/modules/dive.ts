import { dive } from "@/router/enums";
import { $t } from "@/plugins/i18n";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/dive",
  name: "Dive",
  component: Layout,
  redirect: "/dive/dashboard",
  meta: {
    icon: "ep:sailing",
    title: $t("diveErp.menus.diveErp"),
    rank: dive
  },
  children: [
    {
      path: "/dive/dashboard",
      name: "DiveDashboard",
      component: () => import("@/views/dive-erp/dashboard/index.vue"),
      meta: {
        icon: "ep:data-line",
        title: $t("diveErp.menus.dashboard"),
        rank: 1
      }
    },
    {
      path: "/dive/rooms",
      name: "DiveRooms",
      component: () => import("@/views/dive-erp/rooms/index.vue"),
      meta: {
        icon: "ep:house",
        title: $t("diveErp.menus.roomManagement"),
        rank: 2
      }
    },
    {
      path: "/dive/students",
      name: "DiveStudents",
      component: () => import("@/views/dive-erp/students/index.vue"),
      meta: {
        icon: "ep:user",
        title: $t("diveErp.menus.guestManagement"),
        rank: 3
      }
    },
    {
      path: "/dive/trips",
      name: "DiveTrips",
      component: () => import("@/views/dive-erp/trips/index.vue"),
      meta: {
        icon: "ri:route-line",
        title: $t("diveErp.menus.tripManagement"),
        rank: 4
      }
    },
    {
      path: "/dive/boats",
      name: "DiveBoats",
      component: () => import("@/views/dive-erp/boats/index.vue"),
      meta: {
        icon: "ep:ship",
        title: $t("diveErp.menus.boatManagement"),
        rank: 5
      }
    },
    {
      path: "/dive/pricing",
      name: "DivePricing",
      component: () => import("@/views/dive-erp/pricing/index.vue"),
      meta: {
        icon: "ep:money",
        title: $t("diveErp.menus.pricingManagement"),
        rank: 6
      }
    },
    {
      path: "/dive/enroll-preview",
      name: "DiveEnrollPreview",
      component: () => import("@/views/dive-erp/enroll/index.vue"),
      meta: {
        icon: "ep:document",
        title: $t("diveErp.menus.enrollmentForm"),
        rank: 7
      }
    }
  ]
} satisfies RouteConfigsTable;
