<template>
	<SidebarHeader>
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" as-child class="flex justify-center">
					<div
						class="text-xl font-bold text-center cursor-pointer"
						@click="router.push('/')"
					>
						<div class="tracking-widest">
							{{ systemData?.titleAll[0].subTitle }}
						</div>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarHeader>
</template>

<script setup lang="ts">
	import {
		SidebarHeader,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
	} from "@/components/ui/sidebar";
	import { useRouter } from "vue-router";
	import { useSystemDataStore } from "@/stores/SystemData";
	import { storeToRefs } from "pinia";

	const router = useRouter();
	const systemDataStore = useSystemDataStore();

	const { systemData } = storeToRefs(systemDataStore);
</script>

<style scoped></style>
