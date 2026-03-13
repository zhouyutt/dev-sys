import { $t } from "@/plugins/i18n";
import { system } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/system",
  name: "System",
  component: Layout,
  redirect: "/system/user/index",
  meta: {
    icon: "ri:settings-3-line",
    title: "menus.pureSysManagement",
    rank: system
  },
  children: [
    {
      path: "/system/user/index",
      name: "SystemUser",
      component: () => import("@/views/system/user/index.vue"),
      meta: {
        icon: "ri:admin-line",
        title: "menus.pureUser"
      }
    },
    {
      path: "/system/role/index",
      name: "SystemRole",
      component: () => import("@/views/system/role/index.vue"),
      meta: {
        icon: "ri:admin-fill",
        title: "menus.pureRole"
      }
    },
    {
      path: "/system/menu/index",
      name: "SystemMenu",
      component: () => import("@/views/system/menu/index.vue"),
      meta: {
        icon: "ep:menu",
        title: "menus.pureSystemMenu"
      }
    },
    {
      path: "/system/dept/index",
      name: "SystemDept",
      component: () => import("@/views/system/dept/index.vue"),
      meta: {
        icon: "ri:git-branch-line",
        title: "menus.pureDept"
      }
    }
  ]
} satisfies RouteConfigsTable;
