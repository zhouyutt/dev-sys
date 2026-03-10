import { dive } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/dive",
  name: "Dive",
  component: Layout,
  redirect: "/dive/dashboard",
  meta: {
    icon: "ep:sailing",
    title: { zh: "Uncle Chang", en: "Uncle Chang" },
    rank: dive
  },
  children: [
    {
      path: "/dive/dashboard",
      name: "DiveDashboard",
      component: () => import("@/views/dive-erp/dashboard/index.vue"),
      meta: {
        icon: "ep:data-line",
        title: { zh: "仪表盘", en: "Dashboard" },
        rank: 1
      }
    },
    {
      path: "/dive/rooms",
      name: "DiveRooms",
      component: () => import("@/views/dive-erp/rooms/index.vue"),
      meta: {
        icon: "ep:house",
        title: { zh: "房间管理", en: "Room Management" },
        rank: 2
      }
    },
    {
      path: "/dive/students",
      name: "DiveStudents",
      component: () => import("@/views/dive-erp/students/index.vue"),
      meta: {
        icon: "ep:user",
        title: { zh: "客人管理", en: "Guest Management" },
        rank: 3
      }
    },
    {
      path: "/dive/trips",
      name: "DiveTrips",
      component: () => import("@/views/dive-erp/trips/index.vue"),
      meta: {
        icon: "ri:route-line",
        title: { zh: "行程管理", en: "Trip Management" },
        rank: 4
      }
    },
    {
      path: "/dive/staff",
      name: "DiveStaff",
      component: () => import("@/views/dive-erp/staff/index.vue"),
      meta: {
        icon: "ep:user-filled",
        title: { zh: "员工管理", en: "Staff Management" },
        rank: 5
      }
    },
    {
      path: "/dive/boats",
      name: "DiveBoats",
      component: () => import("@/views/dive-erp/boats/index.vue"),
      meta: {
        icon: "ep:ship",
        title: { zh: "船只管理", en: "Boat Management" },
        rank: 6
      }
    },
    {
      path: "/dive/enroll-preview",
      name: "DiveEnrollPreview",
      component: () => import("@/views/dive-erp/enroll/index.vue"),
      meta: {
        icon: "ep:document",
        title: { zh: "报名表", en: "Enrollment Form" },
        rank: 7
      }
    }
  ]
} satisfies RouteConfigsTable;
