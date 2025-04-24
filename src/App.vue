<template>
	<template class="flex flex-row justify-center align-middle w-screen h-screen">
		<Nav />
		<main class="w-full h-full flex justify-center align-middle">
			<RouterView />
		</main>
	</template>
</template>

<script setup lang="ts">
	import Nav from "./components/Nav.vue";
	import { RouterView } from "vue-router";

	document.documentElement.style.overflowX = "hidden";
</script>

<style scoped></style>

