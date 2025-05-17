<template>
	<Nav
		v-if="!isAdminRoute"
		class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	/>
	<main class="w-full flex justify-center align-middle min-h-[80vh]">
		<RouterView />
	</main>
</template>

<script setup lang="ts">
	import Nav from "./components/Nav.vue";
	import { RouterView, useRoute } from "vue-router";
	import { ref, watch } from "vue";

	document.documentElement.style.overflowX = "hidden";

	const route = useRoute();
	const isAdminRoute = ref(false);

	// 检查当前路由是否是/admin或子路由
	const checkAdminRoute = () => {
		isAdminRoute.value = route.path.startsWith("/admin");
	};

	// 初始检查
	checkAdminRoute();

	// 监听路由变化
	watch(() => route.path, checkAdminRoute);
</script>

<style scoped></style>

