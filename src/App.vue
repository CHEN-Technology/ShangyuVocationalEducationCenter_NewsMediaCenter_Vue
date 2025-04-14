<template>
	<template class="flex flex-row justify-center align-middle w-screen h-screen">
		<NavView class="w-full fixed" />
		<main class="w-full h-full flex justify-center align-middle">
			<RouterView />
		</main>
	</template>
</template>

<script setup lang="ts">
	import NavView from "./views/NavView.vue";
	import { RouterView } from "vue-router";
</script>

<style scoped></style>

