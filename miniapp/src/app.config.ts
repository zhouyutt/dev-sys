export default defineAppConfig({
  pages: [
    "pages/login/index",
    "pages/guest/home/index",
    "pages/guest/profile/index",
    "pages/guest/trips/index",
    "pages/guest/room/index",
    "pages/guest/notifications/index",
    "pages/staff/home/index",
    "pages/owner/dashboard/index"
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#ffffff",
    navigationBarTitleText: "Uncle Chang",
    navigationBarTextStyle: "black"
  }
});
