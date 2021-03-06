import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/User.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'


Vue.use(Router)

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        {
            path: '/home',
            component: Home,
            // redirect: '/home',
            children: [{
                    path: '/welcome',
                    component: Welcome
                },
                {
                    path: '/users',
                    component: Users
                },
                {
                    path: '/rights',
                    component: Rights
                },
                {
                    path: '/roles',
                    component: Roles
                },
                {
                    path: '/categories',
                    component: Cate
                }
            ]
        }
    ]
})

// const router = new VueRouter({
//    
//     routes
// })

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    if (to.path === '/login')
        return next();
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) {
        // token为空即为登录状态
        return next('/login');
    } else {
        next();
    }
})
export default router