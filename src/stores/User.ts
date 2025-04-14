import { defineStore } from "pinia";
import { onMounted, ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

export const useUserStore = defineStore("user", () => {
	const userInfo = ref<{ identity?: number } & Record<string, any>>({});
	const isLogin = ref(false);
	const isLoading = ref(false);
	const router = useRouter();

	const clearUserState = () => {
		isLogin.value = false;
		userInfo.value = {};
	};

	const loadUserInfo = async () => {
		try {
			isLoading.value = true;
			const res = await axios.get(`${import.meta.env.VITE_APP_URL}/profile`);
			userInfo.value = res.data;
			isLogin.value = true;
			return res.data; // 返回用户信息，方便路由守卫使用
		} catch (error: any) {
			console.error("Error:", {
				status: error.response?.status,
				message: error.response?.data?.error || error.message,
			});

			if (error.response?.status === 401) {
				clearUserState();
			}
			throw error; // 抛出错误，方便路由守卫捕获
		} finally {
			isLoading.value = false;
		}
	};

	const logout = async () => {
		isLoading.value = true;
		try {
			await axios.post(`${import.meta.env.VITE_APP_URL}/logout`);
			clearUserState();
			router.push("/login");
		} catch (error: any) {
			console.error("注销错误:", error);
			clearUserState();
			router.push("/login");
		} finally {
			isLoading.value = false;
		}
	};

	onMounted(() => {
		loadUserInfo();
	});

	return {
		userInfo,
		loadUserInfo,
		isLogin,
		logout,
		isLoading,
		clearUserState,
	};
});
