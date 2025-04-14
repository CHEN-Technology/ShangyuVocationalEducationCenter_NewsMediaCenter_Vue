<template>
	<Sidebar>
		<SidebarContent class="border-t">
			<SidebarGroup>
				<SidebarGroupLabel>菜单</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem
							v-for="item in systemData?.AdminMenuAll"
							:key="item.title"
						>
							<SidebarMenuButton
								@click="router.push(item.link)"
								class="cursor-pointer"
								:is-active="isActive(item.link)"
							>
								<component :is="icon(item.icon)" />
								<span>{{ item.title }}</span>

								<SidebarMenuSub>
									<SidebarMenuSubItem v-for="subItem in item.subTab">
										<SidebarMenuSubButton asChild>
											<div
												@click="router.push(subItem.link)"
												class="cursor-pointer"
												:class="{ active: isActive(subItem.link) }"
											>
												<component :is="icon(subItem.icon)" />
												<span>{{ subItem.title }}</span>
											</div>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								</SidebarMenuSub>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
	</Sidebar>
</template>

<script setup lang="ts">
	import {
		Sidebar,
		SidebarContent,
		SidebarGroup,
		SidebarGroupContent,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		SidebarMenuSub,
		SidebarMenuSubItem,
		SidebarMenuSubButton,
	} from "@/components/ui/sidebar";
	import { useRouter, useRoute } from "vue-router";
	import { useSystemDataStore } from "@/stores/SystemData";
	import { storeToRefs } from "pinia";

	const router = useRouter();
	const route = useRoute();
	const systemDataStore = useSystemDataStore();

	const { systemData } = storeToRefs(systemDataStore);
	const { icon } = systemDataStore;

	const isActive = (link: string) => {
		const path = route.path.split("/").pop();

		if (path == link.split("/").pop()) {
			return true;
		}
	};
</script>
