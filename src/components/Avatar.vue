<template>
	<Avatar class="w-10 h-10">
		<AvatarImage :src="String(userInfo.avatar)" alt="@unovue" />
		<AvatarFallback>{{ userInfo.username }}</AvatarFallback>
	</Avatar>
</template>

<script setup lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
	import { useUserStore } from "@/stores/User";
	import { ref, onMounted, watch } from "vue";

	type UserInfo = {
		avatar?: string;
		id?: string;
		username?: string;
		password?: string;
		identity?: number;
		lastLoginTime?: string;
		registerTime?: string;
	};

	const userStore = useUserStore();
	const userInfo = ref<UserInfo>({});

	// 加载用户信息的函数
	const loadUserInfo = async () => {
		await userStore.loadUserInfo();
		if (userStore.userInfo) {
			userInfo.value = userStore.userInfo as UserInfo;
			// console.log(userInfo.value);
		} else {
			console.log("userStore.userInfo is null");
		}
	};

	// 组件挂载时加载用户信息
	onMounted(loadUserInfo);

	// 监听 userStore.userInfo 的变化
	watch(
		() => userStore.userInfo,
		(newValue) => {
			if (newValue) {
				userInfo.value = newValue as UserInfo;
				// console.log("User info updated:", userInfo.value);
			}
		},
		{ deep: true }
	);
</script>
