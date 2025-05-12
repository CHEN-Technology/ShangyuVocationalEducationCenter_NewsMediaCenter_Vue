<template>
	<Nav
		v-if="!isAdminRoute"
		class="top-0 sticky z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	/>
	<main class="w-full h-fit flex justify-center align-middle">
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

