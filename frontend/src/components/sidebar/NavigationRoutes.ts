export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'Students',
      displayName: 'Student Management',
      meta: {
        icon: 'group',
      },
    },
    {
      name: 'Rooms',
      displayName: 'Room Management',
      meta: {
        icon: 'hotel',
      },
    },
    {
      name: 'Trips',
      displayName: 'Trip Management',
      meta: {
        icon: 'sailing',
      },
    },
  ] as INavigationRoute[],
}
