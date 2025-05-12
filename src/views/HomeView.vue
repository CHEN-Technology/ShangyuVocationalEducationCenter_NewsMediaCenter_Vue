<template>
	<div class="container mx-auto px-4 py-6">
		<section class="mb-5">
			<div class="flex flex-wrap gap-2 max-h-52 overflow-hidden">
				<Button
					v-for="(category, index) in visibleCategories"
					:key="category._id"
					variant="ghost"
					@click="routerTransition(`/video/category/${category.value}`)"
					class="whitespace-nowrap cursor-pointer w-1/13"
				>
					{{ category.name }}
				</Button>

				<DropdownMenu v-if="hiddenCategories.length > 0">
					<DropdownMenuTrigger as-child>
						<Button variant="ghost" class="whitespace-nowrap cursor-pointer">
							更多
							<ChevronDown class="ml-1 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuGroup>
							<DropdownMenuItem
								v-for="category in hiddenCategories"
								:key="category._id"
								@click="routerTransition(`/video/category/${category.value}`)"
								class="cursor-pointer"
							>
								{{ category.name }}
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</section>

		<section class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
			<div class="lg:col-span-2">
				<Carousel
					v-if="!loading"
					class="rounded-xl overflow-hidden"
					:opts="{ align: 'center', loop: true }"
					:plugins="[
						Autoplay({
							delay: 5000,
							stopOnMouseEnter: true,
							stopOnInteraction: false,
						}),
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
						<CarouselItem v-for="(item, index) in featuredVideos" :key="index">
							<div class="relative aspect-video">
								<img
									:src="formattedPath(item.cover)"
									:alt="item.title"
									class="w-full h-full object-cover"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-8"
								>
									<div class="max-w-2xl">
										<h2 class="text-3xl font-bold text-white mb-2 line-clamp-1">
											{{ item.title }}
										</h2>
										<p class="text-gray-300 mb-4 line-clamp-2">
											{{ item.description }}
										</p>
										<div class="flex space-x-4">
											<Button @click="routerTransition(`/video/${item._id}`)">
												<Play class="mr-2 h-4 w-4" />
												立即观看
											</Button>
										</div>
									</div>
								</div>
							</div>
						</CarouselItem>
					</CarouselContent>
					<CarouselPrevious class="left-4" />
					<CarouselNext class="right-4" />
				</Carousel>

				<div v-else class="aspect-video rounded-xl overflow-hidden">
					<Skeleton class="w-full h-full" />
				</div>
			</div>

			<div class="lg:col-span-1">
				<div v-if="!loading" class="space-y-4">
					<div
						v-for="video in topVideos"
						:key="video._id"
						class="flex gap-3 cursor-pointer"
						@click="routerTransition(`/video/${video._id}`)"
					>
						<div class="relative aspect-video w-1/2 rounded-md overflow-hidden">
							<img
								:src="formattedPath(video.cover)"
								:alt="video.title"
								class="w-full h-full object-cover"
							/>
							<div
								class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded"
							>
								{{ formatDuration(video.duration as number) }}
							</div>
						</div>
						<div class="w-1/2">
							<h3 class="font-medium line-clamp-2 text-sm">
								{{ video.title }}
							</h3>
							<p class="text-xs text-muted-foreground mt-1">
								{{ video.author || "未知作者" }}
							</p>
							<p class="text-xs text-muted-foreground">
								{{ formatNumber(video.hits || 0) }}次观看
							</p>
						</div>
					</div>

					<!-- 骨架屏填充（当视频不足4个时） -->
					<template v-if="topVideos.length < 4">
						<div
							v-for="i in 4 - topVideos.length"
							:key="`skeleton-top-${i}`"
							class="flex gap-3"
						>
							<Skeleton class="aspect-video w-1/2 rounded-md" />
							<div class="w-1/2 space-y-2">
								<Skeleton class="h-4 w-full" />
								<Skeleton class="h-3 w-3/4" />
								<Skeleton class="h-3 w-1/2" />
							</div>
						</div>
					</template>
				</div>
				<div v-else class="space-y-4">
					<div v-for="i in 4" :key="i" class="flex gap-3">
						<Skeleton class="aspect-video w-1/2 rounded-md" />
						<div class="w-1/2 space-y-2">
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-3 w-3/4" />
							<Skeleton class="h-3 w-1/2" />
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 3. 下部无限推荐视频（瀑布流） -->
		<section>
			<div
				v-if="!loading"
				class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
			>
				<div
					v-for="video in recommendedVideos"
					:key="video._id"
					class="cursor-pointer"
					@click="routerTransition(`/video/${video._id}`)"
				>
					<div class="relative aspect-video rounded-md overflow-hidden">
						<img
							:src="formattedPath(video.cover)"
							:alt="video.title"
							class="w-full h-full object-cover"
						/>
						<div
							class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded"
						>
							{{ formatDuration(video.duration as number) }}
						</div>
					</div>
					<div class="mt-4">
						<h3 class="font-medium line-clamp-2 text-sm h-10">
							{{ video.title }}
						</h3>
						<p class="text-xs text-muted-foreground mt-1">
							{{ video.author || "未知作者" }}
						</p>
						<p class="text-xs text-muted-foreground">
							{{ formatNumber(video.hits || 0) }}次观看
						</p>
					</div>
				</div>

				<!-- 骨架屏填充（当视频不足时） -->
				<template v-if="recommendedVideos.length < 10">
					<div
						v-for="i in 10 - recommendedVideos.length"
						:key="`skeleton-${i}`"
						class="space-y-2"
					>
						<Skeleton class="aspect-video rounded-md" />
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-3 w-3/4" />
					</div>
				</template>
			</div>
			<div
				v-else
				class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
			>
				<div v-for="i in 10" :key="i" class="space-y-2">
					<Skeleton class="aspect-video rounded-md" />
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-3 w-3/4" />
				</div>
			</div>
			<!-- 加载更多按钮 -->
			<div class="flex justify-center mt-8">
				<Button
					variant="outline"
					@click="loadMoreRecommendedVideos"
					:disabled="loadingMore"
				>
					<span v-if="!loadingMore">加载更多</span>
					<span v-else>加载中...</span>
				</Button>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted, watch, onUnmounted } from "vue";
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselNext,
		CarouselPrevious,
	} from "@/components/ui/carousel";
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuGroup,
		DropdownMenuItem,
		DropdownMenuTrigger,
	} from "@/components/ui/dropdown-menu";
	import { Play, ChevronDown } from "lucide-vue-next";
	import { Skeleton } from "@/components/ui/skeleton";
	import { Button } from "@/components/ui/button";
	import axios from "axios";
	import { useRouter } from "vue-router";
	import Autoplay from "embla-carousel-autoplay";
	import ClassNames from "embla-carousel-class-names";

	interface Video {
		_id: string;
		title: string;
		description: string;
		cover: string;
		uploadDate: string;
		status: string;
		hits?: number;
		duration?: number;
		size: number;
		author?: string;
	}

	interface Category {
		_id: string;
		name: string;
		value: string;
		order: number;
	}

	const router = useRouter();

	const loading = ref(true);
	const loadingMore = ref(false);
	const featuredVideos = ref<Video[]>([]);
	const categories = ref<Category[]>([]);
	const topVideos = ref<Video[]>([]);
	const recommendedVideos = ref<Video[]>([]);
	const currentPage = ref(1);
	const hasMore = ref(true);

	const visibleCategories = ref<Category[]>([]);
	const hiddenCategories = ref<Category[]>([]);

	const handleScroll = () => {
		// 如果正在加载或没有更多数据，则不处理
		if (loadingMore.value || !hasMore.value) return;

		const scrollTop =
			document.documentElement.scrollTop || document.body.scrollTop;
		const scrollHeight =
			document.documentElement.scrollHeight || document.body.scrollHeight;
		const clientHeight =
			document.documentElement.clientHeight || document.body.clientHeight;

		// 当滚动到距离底部200px时加载更多
		if (scrollTop + clientHeight >= scrollHeight - 200) {
			loadMoreRecommendedVideos();
		}
	};

	// 防抖函数
	const debounce = (fn: Function, delay: number) => {
		let timer: number;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => fn(...args), delay);
		};
	};

	const debouncedScroll = debounce(handleScroll, 200);

	watch(
		categories,
		(newCategories) => {
			const maxVisible = 24; // 最多显示24个（2行×12个）
			if (newCategories.length <= maxVisible) {
				visibleCategories.value = newCategories;
				hiddenCategories.value = [];
			} else {
				// 显示23个分类 + 1个"更多"按钮
				visibleCategories.value = newCategories.slice(0, maxVisible - 1);
				hiddenCategories.value = newCategories.slice(maxVisible - 1);
			}
		},
		{ immediate: true }
	);

	function formattedPath(path: string) {
		return `${import.meta.env.VITE_APP_URL}/${path.replace(/\\/g, "/")}`;
	}

	const formatNumber = (num: number) => {
		return num >= 10000 ? `${(num / 10000).toFixed(1)}万` : num;
	};

	const formatDuration = (duration: number) => {
		if (!duration || duration <= 0) return "00:00";

		const minutes = Math.floor(duration / 60);
		const seconds = Math.floor(duration % 60);

		// 使用padStart确保两位数显示
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	};

	const fetchData = async () => {
		loading.value = true;
		try {
			// 1. 获取分类
			const categoriesResponse = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video/categories`
			);
			if (categoriesResponse.data.success) {
				categories.value = categoriesResponse.data.data.sort(
					(a: Category, b: Category) => a.order - b.order
				);
			}

			// 2. 获取轮播图数据
			const featuredResponse = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video?limit=5`
			);
			if (featuredResponse.data.success) {
				featuredVideos.value = featuredResponse.data.data;
			}

			// 3. 获取热门视频（按hits降序）
			const topVideosResponse = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video?sort=-hits&limit=4`
			);
			if (topVideosResponse.data.success) {
				topVideos.value = topVideosResponse.data.data;
			}

			// 4. 获取推荐视频（随机或按算法推荐）
			const recommendedResponse = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video?page=1&limit=10`
			);
			if (recommendedResponse.data.success) {
				recommendedVideos.value = recommendedResponse.data.data;
			}
		} catch (error) {
			console.error("获取数据失败:", error);
		} finally {
			loading.value = false;
		}
	};

	const loadMoreRecommendedVideos = async () => {
		if (loadingMore.value || !hasMore.value) return;

		loadingMore.value = true;
		currentPage.value += 1;
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video?page=${currentPage.value}&limit=10`
			);
			if (response.data.success) {
				// 如果返回的数据为空或少于limit，说明没有更多数据了
				if (response.data.data.length === 0 || response.data.data.length < 10) {
					hasMore.value = false;
				}
				recommendedVideos.value = [
					...recommendedVideos.value,
					...response.data.data,
				];
			}
		} catch (error) {
			console.error("加载更多失败:", error);
		} finally {
			loadingMore.value = false;
		}
	};

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

	onMounted(() => {
		fetchData();
		window.addEventListener("scroll", debouncedScroll);
	});

	onUnmounted(() => {
		window.removeEventListener("scroll", debouncedScroll);
	});
</script>

<style scoped>
	.container {
		max-width: 1400px;
	}
</style>
