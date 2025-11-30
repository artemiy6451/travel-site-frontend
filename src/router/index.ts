import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AdminPage from '@/views/AdminPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import AcessDenied from '@/views/AccessDenied.vue'
import ExcursionDetail from '@/views/ExcursionDetail.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { isAuthenticated, isSuperuser } from '@/utils/auth'
import About from '@/views/About.vue'
import ReviewView from '@/views/ReviewView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: AcessDenied,
    meta: { requiresAuth: true },
  },
  {
    path: '/excursion/:id',
    name: 'excursion-detail',
    component: ExcursionDetail,
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundView',
    component: NotFoundView,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/reviews',
    name: 'ReviewsView',
    component: ReviewView,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _, savedPosition) {
    // if (savedPosition) {
      // return savedPosition
    // }
    // if (to.hash) {
      // return {
        // el: to.hash,
        // behavior: 'smooth'
      // }
    // }
    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach((to, _, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else if (to.meta.requiresAdmin && !isSuperuser()) {
    next('/access-denied')
  } else if (to.path === '/login' && isAuthenticated()) {
    next('/admin')
  } else {
    next()
  }
})

export default router
