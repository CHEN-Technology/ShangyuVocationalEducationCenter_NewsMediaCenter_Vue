<template>
	<NavigationMenu>
		<NavigationMenuList>
			<NavigationMenuItem v-for="item in systemData?.navMenu" :key="item._id">
				<NavigationMenuLink
					@click="router.push(item.link)"
					:class="navigationMenuTriggerStyle()"
					class="cursor-pointer bg-transparent"
				>
					{{ item.title }}
				</NavigationMenuLink>
			</NavigationMenuItem>
		</NavigationMenuList>
	</NavigationMenu>
</template>

<script setup lang="ts">
	import {
		NavigationMenu,
		NavigationMenuContent,
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuTrigger,
		navigationMenuTriggerStyle,
	} from "@/components/ui/navigation-menu";
	import { useSystemDataStore } from "@/stores/SystemData";
	import { useRouter } from "vue-router";
	import { storeToRefs } from "pinia";

	const router = useRouter();
	const systemDataStore = useSystemDataStore();

	const { systemData } = storeToRefs(systemDataStore);
</script>
