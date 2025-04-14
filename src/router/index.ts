import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/User";
import { watchEffect } from "vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: () => import("../views/HomeView.vue"),
		},
		{
			path: "/about",
			name: "about",
			component: () => import("../views/AboutView.vue"),
		},
		{
			path: "/login",
			name: "login",
			component: () => import("../views/LoginView.vue"),
		},
		{
			path: "/register",
			name: "register",
			component: () => import("../views/RegisterView.vue"),
		},
		{
			path: "/admin",
			component: () => import("../views/AdminView.vue"),
			meta: { requiresAuth: true, requiresAdmin: true }, // 添加路由元信息
			children: [
				{
					path: "",
					component: () => import("@/views/admin/DashboardView.vue"),
					meta: {
						breadcrumb: "Dashboard",
					},
				},
				{
					path: "users",
					component: () => import("@/views/admin/UsersView.vue"),
					meta: {
						breadcrumb: "用户管理",
					},
				},
				{
					path: "video",
					component: () => import("@/views/admin/VideoView.vue"),
					meta: {
						breadcrumb: "视频管理",
					},
				},
				{
					path: "comment",
					component: () => import("@/views/admin/CommentView.vue"),
					meta: {
						breadcrumb: "评论管理",
					},
				},
				{
					path: "setting",
					component: () => import("@/views/admin/SettingView.vue"),
					meta: {
						breadcrumb: "系统设置",
					},
				},
			],
		},
		// 添加一个无权限页面路由
		{
			path: "/no-permission",
			name: "no-permission",
			component: () => import("../views/NoPermissionView.vue"),
		},
	],
});

// 创建路由守卫的独立函数
const setupRouterGuard = () => {
	router.beforeEach((to, from, next) => {
		const userStore = useUserStore();

		// 公共页面直接放行
		if (!to.meta.requiresAuth) {
			return next();
		}

		// 定义 stopWatcher，初始化为空函数防止报错
		let stopWatcher: () => void = () => {};

		// 赋值 watchEffect 的清理函数
		stopWatcher = watchEffect(async () => {
			if (userStore.isLoading) return; // 如果正在加载，跳过

			try {
				// 如果用户信息未加载，尝试加载
				if (!userStore.userInfo.identity) {
					await userStore.loadUserInfo();
				}

				// 检查登录状态
				if (!userStore.isLogin) {
					stopWatcher(); // 停止监听
					next({ path: "/login", query: { redirect: to.fullPath } });
					return;
				}

				// 检查管理员权限
				if (
					to.meta.requiresAdmin &&
					![0, 1].includes(userStore.userInfo.identity as number)
				) {
					stopWatcher(); // 停止监听
					next("/no-permission");
					return;
				}

				// 所有检查通过，放行
				stopWatcher(); // 停止监听
				next();
			} catch (error) {
				console.error("路由守卫错误:", error);
				stopWatcher(); // 停止监听
				next({ path: "/login", query: { redirect: to.fullPath } });
			}
		});
	});
};

setupRouterGuard();

export default router;

