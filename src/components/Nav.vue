<template>
	<header class="border-b-2 w-full fixed top-0">
		<template
			class="flex justify-between items-center max-w-[80dvw] h-[80px] ml-auto mr-auto"
		>
			<div
				class="text-2xl font-bold text-center cursor-pointer"
				@click="router.push('/')"
			>
				<div class="text-xl" v-if="systemData?.system[0].title.title">
					{{ systemData?.system[0].title.title }}
				</div>
				<div
					class="tracking-widest"
					v-if="systemData?.system[0].title.subTitle"
				>
					{{ systemData?.system[0].title.subTitle }}
				</div>
			</div>
			<NavigationMenu class="justify-self-start mr-auto ml-10" />
			<template class="flex gap-4">
				<Button
					@click="router.push('/login')"
					class="cursor-pointer"
					v-if="!userStore.isLogin"
					>登录</Button
				>
				<HoverCard>
					<template v-slot:avatar>
						<Avatar
							class="cursor-pointer"
							@click="router.push('/profile')"
							v-if="userStore.isLogin"
						/>
					</template>
					<template v-slot:avatarMenu>
						<div
							class="px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground cursor-pointer h-10 flex flex-row justify-between leading-7"
							@click="router.push(item.link)"
							v-for="item in filteredAvatarMenu"
							:key="item._id"
						>
							<div class="flex flex-row gap-2 items-center">
								<component :is="icon(item.icon)" />
								{{ item.title }}
							</div>
							<div>&gt;</div>
						</div>
						<div
							class="px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground cursor-pointer h-10 flex flex-row justify-between leading-7"
							@click="routerTransition(controlMenu.link)"
							v-if="userInfo.identity == 0 || userInfo.identity == 1"
						>
							<div class="flex flex-row gap-2 items-center">
								<component :is="icon(controlMenu.icon)" />
								{{ controlMenu.title }}
							</div>
							<div>&gt;</div>
						</div>
						<div
							class="px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground cursor-pointer h-10 flex flex-row justify-between leading-7"
							@click="handleLogout"
						>
							<div class="flex flex-row gap-2 items-center">
								<component :is="icon(exitMenu.icon)" />
								{{ exitMenu.title }}
							</div>
							<div>&gt;</div>
						</div>
					</template>
				</HoverCard>
				<ModeToggle />
			</template>
		</template>
	</header>
</template>

<script setup lang="ts">
	import ModeToggle from "@/components/ModeToggle.vue";
	import NavigationMenu from "@/components/NavigationMenu.vue";
	import Avatar from "@/components/Avatar.vue";
	import router from "@/router";
	import { Button } from "@/components/ui/button";
	import { useSystemDataStore } from "@/stores/SystemData";
	import { useUserStore } from "@/stores/User";
	import HoverCard from "@/components/HoverCard.vue";
	import { storeToRefs } from "pinia";
	import { ref, watch, computed } from "vue";

	const systemDataStore = useSystemDataStore();
	const userStore = useUserStore();

	const { systemData } = storeToRefs(systemDataStore);
	const { icon } = systemDataStore;
	const { userInfo } = storeToRefs(userStore);
	const controlMenu = ref({
		icon: "",
		title: "",
		link: "",
	});
	const exitMenu = ref({
		icon: "",
		title: "",
	});

	const filteredAvatarMenu = computed(() => {
		if (!systemData.value?.avatarMenuAll?.length) return [];
		return systemData.value.avatarMenuAll.slice(0, -2); // 排除最后两项
	});

	// 监听 systemData 变化，但不修改原数组
	watch(
		systemData,
		(newData) => {
			if (!newData?.avatarMenuAll?.length) return;

			// 使用 slice 获取最后两项，不修改原数组
			const menuItems = newData.avatarMenuAll;
			if (menuItems.length >= 2) {
				exitMenu.value = menuItems[menuItems.length - 1] || exitMenu.value;
				controlMenu.value =
					menuItems[menuItems.length - 2] || controlMenu.value;
			}
		},
		{ immediate: true }
	);

	function handleLogout() {
		userStore.logout();
	}

	function routerTransition(url: string) {
		if (!url) return;

		// 检查浏览器是否支持 View Transitions API
		if (!document.startViewTransition) {
			router.push(url);
			return;
		}

		document.startViewTransition(() => {
			router.push(url);
		});
	}
</script>

<style scoped></style>

