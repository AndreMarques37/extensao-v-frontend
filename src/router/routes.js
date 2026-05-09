const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },

  {path: '/agendamento',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/AgendamentoPage.vue') }],
  },

  {path: '/indexpage',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

 {path: '/dashboard',
  component: () => import('layouts/MainLayout.vue'),
  children: [{ path: '', component: () => import('pages/dashboard.vue') }],
 },
]
export default routes
