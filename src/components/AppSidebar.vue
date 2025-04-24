<template>
	<Sidebar>
		<SidebarHeader />
		<SidebarContent class="border-t"><SidebarNav /></SidebarContent>
		<SidebarFooter>
			<SidebarUser />
		</SidebarFooter>
		<SidebarRail />
	</Sidebar>
</template>

<script setup lang="ts">
	import {
		Sidebar,
		SidebarContent,
		SidebarFooter,
		SidebarRail,
	} from "@/components/ui/sidebar";
	import SidebarHeader from "@/components/SidebarHeader.vue";
	import SidebarNav from "@/components/SidebarNav.vue";
	import SidebarUser from "@/components/SidebarUser.vue";
</script>
