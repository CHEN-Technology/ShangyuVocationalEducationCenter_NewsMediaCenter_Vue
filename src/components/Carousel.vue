<template>
	<Carousel
		class="w-full max-w-xl absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2"
		:opts="{ align: 'center', loop: true }"
		:plugins="[
			Autoplay({
				delay: 5000,
				stopOnMouseEnter: true,
				stopOnInteraction: false,
			}),
			// Fade(),
			ClassNames({
				snapped: 'is-snapped',
				inView: 'is-in-view',
				draggable: 'is-draggable',
				dragging: 'is-dragging',
				loop: 'is-loop',
			}),
		]"
	>
		<CarouselContent>
			<CarouselItem
				v-for="(item, index) in imgList"
				:key="index"
				class="basis-1/2"
			>
				<Card>
					<CardContent
						class="flex items-center justify-center text-4xl font-semibold pt-5 pb-5"
						><img :src="item.src" alt="" srcset=""
					/></CardContent>
				</Card>
			</CarouselItem>
		</CarouselContent>
		<CarouselPrevious />
		<CarouselNext />
	</Carousel>
</template>

<script setup lang="ts">
	import { Card, CardContent } from "@/components/ui/card";
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselNext,
		CarouselPrevious,
	} from "@/components/ui/carousel";
	import Autoplay from "embla-carousel-autoplay";
	import Fade from "embla-carousel-fade";
	import ClassNames from "embla-carousel-class-names";

	const imgList = [
		{
			id: 1,
			src: "/images/carousel/1.jpg",
		},
		{
			id: 2,
			src: "/images/carousel/2.jpg",
		},
		{
			id: 3,
			src: "/images/carousel/3.jpg",
		},
		{
			id: 4,
			src: "/images/carousel/4.jpg",
		},
		{
			id: 5,
			src: "/images/carousel/4.jpg",
		},
	];
</script>

<style scoped>
	.is-in-view {
		opacity: 0.16;
		transition: opacity 0.2s ease-in-out;
	}

	.is-snapped {
		opacity: 1;
	}
</style>
