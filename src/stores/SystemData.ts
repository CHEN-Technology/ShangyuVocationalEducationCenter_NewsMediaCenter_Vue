import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import {
	Home,
	Users,
	Video,
	MessageCircle,
	Settings,
	User,
	Star,
	LayoutDashboard,
	LogOut,
} from "lucide-vue-next";

interface SystemData {
	titleAll: [
		{
			_id: string;
			title: string;
			subTitle: string;
			link: string;
		}
	];
	navMenu: [
		{
			_id: string;
			title: string;
			link: string;
			order: number;
		}
	];
	avatarMenuAll: [
		{
			_id: string;
			title: string;
			link: string;
			order: number;
			icon: string;
		}
	];
	AdminMenuAll: [
		{
			_id: string;
			title: string;
			link: string;
			order: number;
			icon: string;
			subTab: [
				{
					_id: string;
					title: string;
					link: string;
					order: number;
					icon: string;
				}
			];
		}
	];
}

export const useSystemDataStore = defineStore("systemData", () => {
	const systemData = ref<SystemData | null>(null); // 存储 API 返回的数据（响应式）
	const isLoading = ref(false); // 加载状态
	const error = ref<Error>(); // 错误信息

	// 异步获取系统数据
	const fetchSystemData = async () => {
		isLoading.value = true;
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_APP_URL}/system`
			);
			systemData.value = response.data; // 更新响应式数据
			return response.data;
		} catch (err) {
			error.value = err as Error;
			console.error("获取系统数据失败:", err);
			throw err; // 可选择抛出错误供外部处理
		} finally {
			isLoading.value = false;
		}
	};

	fetchSystemData();

	const icons: Record<string, any> = {
		Home,
		Users,
		Video,
		MessageCircle,
		Settings,
		User,
		Star,
		LayoutDashboard,
		LogOut,
	};

	const icon = function (iconName: string) {
		return icons[iconName];
	};

	return { systemData, icon };
});
