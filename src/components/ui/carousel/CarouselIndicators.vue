<!-- CarouselIndicators.vue -->
<script setup lang="ts">
	const props = defineProps<{
		totalSlides: number;
		currentIndex: number;
	}>();

	const emit = defineEmits(["change"]);

	function goTo(index: number) {
		emit("change", index);
	}
</script>

<template>
	<div class="flex gap-2 justify-center mt-4">
		<!-- <button
			v-for="(_, index) in totalSlides"
			:key="index"
			@click="goTo(index)"
			class="w-3 h-3 rounded-full transition-colors"
			:class="{
				'bg-primary': index === currentIndex,
				'bg-muted': index !== currentIndex,
			}"
			aria-label="Go to slide"
		/> -->
		<button
			v-for="(_, index) in totalSlides"
			:key="index"
			@click="goTo(index)"
			class="w-3 h-3 rounded-full transition-colors cursor-pointer"
			:class="{
				'dark:bg-primary bg-muted': index === currentIndex,
				'dark:bg-neutral-600 bg-neutral-600': index !== currentIndex,
			}"
			aria-label="Go to slide"
		/>
	</div>
</template>
