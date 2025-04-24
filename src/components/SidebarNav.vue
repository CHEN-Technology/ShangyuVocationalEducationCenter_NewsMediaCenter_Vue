<template>
	<SidebarGroup>
		<SidebarGroupLabel>菜单</SidebarGroupLabel>
		<SidebarMenu>
			<Collapsible
				v-for="item in systemData?.AdminMenuAll"
				:key="item.title"
				as-child
				:default-open="true"
				class="group/collapsible"
			>
				<SidebarMenuItem>
					<SidebarMenuButton
						@click="router.push(item.link)"
						class="cursor-pointer"
						:is-active="isActive(item.link)"
						:tooltip="item.title"
						v-if="!item.subTab.length"
					>
						<component :is="icon(item.icon)" v-if="icon(item.icon)" />
						<span>{{ item.title }}</span>
					</SidebarMenuButton>
					<CollapsibleTrigger
						as-child
						class="group/collapsible-trigger mt-1 mb-1"
					>
						<SidebarMenuButton
							@click="router.push(item.link)"
							class="cursor-pointer"
							:is-active="isActive(item.link)"
							:tooltip="item.title"
							v-if="item.subTab.length"
						>
							<component :is="icon(item.icon)" v-if="icon(item.icon)" />
							<span>{{ item.title }}</span>
							<ChevronRight
								class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
							/>
						</SidebarMenuButton>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub>
							<SidebarMenuSubItem
								v-for="subItem in item.subTab"
								:key="subItem.title"
								class="mt-1"
							>
								<SidebarMenuSubButton
									as-child
									:is-active="isActive(subItem.link)"
								>
									<div
										@click="router.push(subItem.link)"
										class="cursor-pointer w-full"
										:class="{ active: isActive(subItem.link) }"
									>
										<component :is="icon(subItem.icon)" />
										<span>{{ subItem.title }}</span>
									</div>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		</SidebarMenu>
	</SidebarGroup>
</template>

<script setup lang="ts">
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		SidebarMenuSub,
		SidebarMenuSubItem,
		SidebarMenuSubButton,
	} from "@/components/ui/sidebar";
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger,
	} from "@/components/ui/collapsible";
	import { ChevronRight } from "lucide-vue-next";
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

<style scoped></style>
