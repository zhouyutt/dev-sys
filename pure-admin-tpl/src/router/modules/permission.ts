import { permission } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/permission",
  name: "Permission",
  component: Layout,
  redirect: "/permission/page/index",
  meta: {
    title: "menus.purePermission",
    icon: "ep:lollipop",
    rank: permission
  },
  children: [
    {
      path: "/permission/page/index",
      name: "PermissionPage",
      component: () => import("@/views/permission/page/index.vue"),
      meta: {
        title: "menus.purePermissionPage"
      }
    },
    {
      path: "/permission/button/router",
      name: "PermissionButtonRouter",
      component: () => import("@/views/permission/button/index.vue"),
      meta: {
        title: "menus.purePermissionButtonRouter"
      }
    },
    {
      path: "/permission/button/login",
      name: "PermissionButtonLogin",
      component: () => import("@/views/permission/button/perms.vue"),
      meta: {
        title: "menus.purePermissionButtonLogin"
      }
    }
  ]
} satisfies RouteConfigsTable;
