type Result = {
  code: number;
  message: string;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  // 当前项目的菜单和路由全部在前端静态配置（`src/router/modules`）中维护，
  // 这里直接返回空数组，避免去请求不存在的 `/get-async-routes` 接口导致 404。
  // 对于 pure-admin 而言，code 为 0 且 data 为空时，会仅使用静态路由，
  // 不影响正常登录与菜单展示。
  return Promise.resolve<Result>({
    code: 0,
    message: "ok",
    data: []
  });
};
