<template>
	<header class="border-b-2 w-full fixed top-0">
		<template
			class="flex justify-between items-center max-w-[80dvw] min-h-[10dvh] ml-auto mr-auto"
		>
			<div
				class="text-2xl font-bold text-center cursor-pointer"
				@click="router.push('/')"
			>
				<div class="text-xl">{{ systemData?.titleAll[0].title }}</div>
				<div class="tracking-widest">
					{{ systemData?.titleAll[0].subTitle }}
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
							@click="router.push(controlMenu.link)"
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
	const getSystemData = ref();
	const controlMenu = ref();
	const exitMenu = ref();

	watch(systemData, (newData) => {
		getSystemData.value = newData;
		exitMenu.value = getSystemData.value?.avatarMenuAll.pop();
		controlMenu.value = getSystemData.value?.avatarMenuAll.pop();
	});

	const filteredAvatarMenu = computed(() => {
		return getSystemData.value?.avatarMenuAll || [];
	});

	function handleLogout() {
		userStore.logout();
	}
</script>

<style scoped></style>

