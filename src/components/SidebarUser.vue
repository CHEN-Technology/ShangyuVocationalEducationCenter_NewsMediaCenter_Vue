<template>
	<SidebarMenu>
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<SidebarMenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
					>
						<Avatar class="h-8 w-8 rounded-lg" />
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{{
								userInfo.username
							}}</span>
						</div>
						<ChevronsUpDown class="ml-auto size-4" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
					align="end"
					:side-offset="4"
				>
					<DropdownMenuGroup>
						<DropdownMenuItem
							v-for="item in filteredAvatarMenu"
							:key="item._id"
							@click="router.push(item.link)"
							class="cursor-pointer"
						>
							<div class="flex flex-row gap-2 items-center">
								<component :is="icon(item.icon)" />
								{{ item.title }}
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem @click="handleLogout" class="cursor-pointer">
							<div class="flex flex-row gap-2 items-center">
								<component :is="icon('LogOut')" />
								退出登录
							</div>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import Avatar from "@/components/Avatar.vue";
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuTrigger,
	} from "@/components/ui/dropdown-menu";
	import {
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
	} from "@/components/ui/sidebar";
	import { ChevronsUpDown } from "lucide-vue-next";
	import { storeToRefs } from "pinia";
	import { useUserStore } from "@/stores/User";
	import { useSystemDataStore } from "@/stores/SystemData";
	import router from "@/router";

	const systemDataStore = useSystemDataStore();
	const userStore = useUserStore();

	const { systemData } = storeToRefs(systemDataStore);
	const { icon } = systemDataStore;
	const { userInfo } = storeToRefs(userStore);

	const filteredAvatarMenu = computed(() => {
		return systemData.value?.avatarMenuAll || [];
	});

	function handleLogout() {
		userStore.logout();
	}
</script>
