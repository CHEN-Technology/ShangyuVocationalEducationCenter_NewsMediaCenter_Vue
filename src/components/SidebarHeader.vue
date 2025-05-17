<template>
	<SidebarHeader>
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" as-child class="flex justify-center">
					<div
						class="text-xl font-bold text-center cursor-pointer"
						@click="routerTransition('/')"
					>
						<div class="tracking-widest">
							{{
								systemData?.system[0].title.subTitle
									? systemData?.system[0].title.subTitle
									: systemData?.system[0].title.title
							}}
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

	function routerTransition(url: string) {
		if (!url) return;
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
