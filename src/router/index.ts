import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/User";

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
					redirect: "/admin/video/cate",
					children: [
						{
							path: "cate",
							component: () => import("@/views/admin/video/VideoCateView.vue"),
							meta: {
								breadcrumb: "分类管理",
							},
						},
						{
							path: "list",
							component: () => import("@/views/admin/video/VideoListView.vue"),
							meta: {
								breadcrumb: "视频管理",
							},
						},
					],
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
			component: () => import("@/views/NoPermissionView.vue"),
		},
		{
			path: "/nofound-video",
			name: "nofound-video",
			component: () => import("@/views/VideoNotFoundView.vue"),
		},
		{
			path: "/video/:id",
			name: "video",
			component: () => import("@/views/VideoView.vue"),
		},
	],
});

// 创建路由守卫的独立函数
const setupRouterGuard = () => {
	router.beforeEach(async (to, from, next) => {
		const userStore = useUserStore();

		// 公共页面直接放行
		if (!to.meta.requiresAuth) {
			return next();
		}

		try {
			// 如果用户信息未加载，尝试加载
			if (!userStore.userInfo.identity) {
				await userStore.loadUserInfo();
			}

			// 检查登录状态
			if (!userStore.isLogin) {
				return next({ path: "/login", query: { redirect: to.fullPath } });
			}

			// 检查管理员权限
			if (
				to.meta.requiresAdmin &&
				![0, 1].includes(userStore.userInfo.identity as number)
			) {
				return next("/no-permission");
			}

			// 所有检查通过，放行
			next();
		} catch (error) {
			console.error("路由守卫错误:", error);
			next({ path: "/login", query: { redirect: to.fullPath } });
		}
	});
};

setupRouterGuard();

export default router;

