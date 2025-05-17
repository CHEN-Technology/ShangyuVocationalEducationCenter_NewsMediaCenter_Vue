<template>
	<div class="container mx-auto px-4 py-6">
		<section :class="{ 'mb-5': isSticky }">
			<div
				class="fixed top-14.5 left-0 right-0 z-50 shadow-md py-2 px-4 transition-all duration-300 ease-in-out"
				:class="{
					'translate-y-0 opacity-100 backdrop-blur supports-[backdrop-filter]:bg-background/60 ':
						isSticky,
					'-translate-y-5 opacity-0 pointer-events-none bg-transparent':
						!isSticky,
				}"
			>
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

		<section class="mb-5">
			<div class="flex flex-wrap gap-2 max-h-52 overflow-hidden bg-background">
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
					:opts="{ align: 'center', loop: true, dragFree: false }"
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
					ref="carouselRef"
					@init-api="onSlideChange"
				>
					<CarouselContent>
						<CarouselItem v-for="(item, index) in featuredVideos" :key="index">
							<div class="relative aspect-video">
								<img
									:src="formatPath(item.cover)"
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
											<Button
												@click="routerTransition(`/video/${item._id}`)"
												class="bg-white text-black hover:text-white dark:hover:bg-black cursor-pointer"
											>
												<Play class="mr-2 h-4 w-4" />
												立即观看
											</Button>
										</div>
									</div>
								</div>
							</div>
						</CarouselItem>
					</CarouselContent>
					<CarouselPrevious class="left-4 cursor-pointer" />
					<CarouselNext class="right-4 cursor-pointer" />
					<CarouselIndicators
						:total-slides="featuredVideos.length"
						:current-index="currentIndex"
						@change="goToSlide"
						class="absolute bottom-8 right-10"
					/>
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
						class="flex gap-3 cursor-pointer group"
						@mouseenter="handleVideoHover(video)"
						@mouseleave="stopVideoPreview(video._id)"
						@click="routerBlank(`/video/${video._id}`)"
					>
						<div
							class="relative aspect-video w-1/2 rounded-md overflow-hidden group"
						>
							<!-- 封面图片 -->
							<img
								v-if="!hoveredVideo || hoveredVideo._id !== video._id"
								:src="formatPath(video.cover)"
								class="absolute inset-0 w-full h-full object-cover z-0"
							/>
							<!-- 视频预览 -->
							<video
								v-if="hoveredVideo && hoveredVideo._id === video._id"
								:id="`video-preview-${video._id}`"
								class="absolute inset-0 w-full h-full object-cover z-0"
								muted
								playsinline
								@timeupdate="updateProgress(video._id, $event)"
							></video>

							<!-- 渐变遮罩层（铺满容器，底部渐变） -->
							<div
								class="absolute inset-x-0 bottom-0 h-1/3 z-10 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300 group-hover:opacity-0"
							></div>

							<!-- 时间显示容器（定位在遮罩层内） -->
							<div
								class="absolute bottom-1 right-1 z-20 text-white text-sm px-2 py-1 rounded-sm font-mono tracking-tighter"
							>
								{{
									hoveredVideo?._id === video._id
										? `${currentProgress[video._id] || "00:00"}/${formatDuration(video.duration)}`
										: formatDuration(video.duration)
								}}
							</div>
						</div>
						<div class="w-1/2 flex flex-col justify-evenly">
							<h3
								class="font-medium line-clamp-2 text-sm hover:text-muted-foreground"
							>
								{{ video.title }}
							</h3>
							<div class="flex justify-between gap-x-2 text-xs">
								<p class="text-xs text-muted-foreground">
									{{ video.author || "未知作者" }} ·
									{{ formatDate(video.uploadDate) }}
								</p>
								<p class="text-xs text-muted-foreground">
									{{ formatNumber(video.hits || 0) }}次观看
								</p>
							</div>
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
				class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
			>
				<div
					v-for="video in recommendedVideos"
					:key="video._id"
					class="cursor-pointer"
					@mouseenter="handleVideoHover(video)"
					@mouseleave="stopVideoPreview(video._id)"
					@click="routerBlank(`/video/${video._id}`)"
				>
					<div class="relative aspect-video rounded-md overflow-hidden group">
						<!-- 封面图片 -->
						<img
							v-if="!hoveredVideo || hoveredVideo._id !== video._id"
							:src="formatPath(video.cover)"
							class="absolute inset-0 w-full h-full object-cover z-0"
						/>
						<!-- 视频预览 -->
						<video
							v-if="hoveredVideo && hoveredVideo._id === video._id"
							:id="`video-preview-${video._id}`"
							class="absolute inset-0 w-full h-full object-cover z-0"
							muted
							playsinline
							@timeupdate="updateProgress(video._id, $event)"
						></video>

						<!-- 渐变遮罩层（铺满容器，底部渐变） -->
						<div
							class="absolute inset-x-0 bottom-0 h-1/3 z-10 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300 group-hover:opacity-0"
						></div>

						<!-- 时间显示容器（定位在遮罩层内） -->
						<div
							class="absolute bottom-1 right-1 z-20 text-white text-sm px-2 py-1 rounded-sm font-mono tracking-tighter"
						>
							{{
								hoveredVideo?._id === video._id
									? `${currentProgress[video._id] || "00:00"}/${formatDuration(video.duration)}`
									: formatDuration(video.duration)
							}}
						</div>
					</div>
					<div class="mt-4">
						<h3 class="font-medium line-clamp-2 text-sm h-10">
							{{ video.title }}
						</h3>
						<div
							class="mt-2 flex justify-between text-sm text-muted-foreground"
						>
							<p class="text-xs text-muted-foreground mt-1">
								{{ video.author || "未知作者" }} ·
								{{ formatDate(video.uploadDate) }}
							</p>
							<p class="text-xs text-muted-foreground">
								{{ formatNumber(video.hits || 0) }}次观看
							</p>
						</div>
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

			<div
				class="flex justify-center mt-8 h-10 text-muted-foreground"
				v-if="!hasMore"
			>
				看官，没有更多了~
			</div>
		</section>
	</div>
</template>

<script setup>
	import { ref, onMounted, watch, onUnmounted, nextTick, reactive } from "vue";
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselNext,
		CarouselPrevious,
		CarouselIndicators,
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
	import shaka from "shaka-player";
	import {
		formatPath,
		formatNumber,
		formatDuration,
		formatTime,
		formatDate,
	} from "@/utils/format";
	import debounce from "@/utils/debounce";

	const router = useRouter();

	const loading = ref(true);
	const loadingMore = ref(false);
	const featuredVideos = ref([]);
	const categories = ref([]);
	const topVideos = ref([]);
	const recommendedVideos = ref([]);
	const currentPage = ref(1);
	const hasMore = ref(true);

	const visibleCategories = ref([]);
	const hiddenCategories = ref([]);
	const carouselRef = ref();

	const hoveredVideo = ref(null);

	const isSticky = ref(false);
	const transitioning = ref(false);
	const categoryOriginalTop = ref(0);

	// 存储各视频当前进度
	const currentProgress = reactive({});

	// 更新播放进度
	const updateProgress = (videoId, event) => {
		const video = event.target;
		if (!video) return;

		// 实时更新当前进度（格式：00:00）
		currentProgress[videoId] = formatTime(video.currentTime);
	};

	const shakaPlayers = ref({});

	const initShakaPlayer = async () => {
		// 确保 Shaka Player 已加载
		shaka.polyfill.installAll();
	};

	// 处理鼠标悬停
	const handleVideoHover = async (video) => {
		hoveredVideo.value = video;

		await nextTick(); // 等待 DOM 更新

		const videoElement = document.getElementById(`video-preview-${video._id}`);
		if (!videoElement) return;

		const sourceUrl = getVideoSource(video);
		if (!sourceUrl) return;

		// 如果已有播放器实例，先销毁
		if (shakaPlayers.value[video._id]) {
			shakaPlayers.value[video._id].unload();
			shakaPlayers.value[video._id].detach(); // 解除绑定
		}

		// ✅ 正确方式：先创建 Player，再 attach 到 video 元素
		const player = new shaka.Player(); // 不再传入 mediaElement
		player.attach(videoElement); // 使用 attach 绑定
		shakaPlayers.value[video._id] = player;

		try {
			// 加载 DASH 流
			await player.load(sourceUrl);
			videoElement.muted = true; // 静音
			setTimeout(() => {
				videoElement.play();
			}, 500); // 尝试播放
		} catch (error) {
			console.error("Shaka Player 加载失败:", error);
		}
	};

	// 停止视频预览
	const stopVideoPreview = (videoId) => {
		const videoElement = document.getElementById(`video-preview-${videoId}`);
		if (videoElement) {
			videoElement.removeEventListener("timeupdate", updateProgress);
		}
		if (shakaPlayers.value[videoId]) {
			const player = shakaPlayers.value[videoId];
			player.unload(); // 卸载流
			player.detach(); // 解除绑定（重要！）
			delete shakaPlayers.value[videoId]; // 移除引用
		}
		hoveredVideo.value = null;
	};

	// 获取视频源
	const getVideoSource = (video) => {
		// 找到 h264 编码的 DASH 流
		const source = video.filePath.find((p) => p.transcode === "h264");
		if (!source) return "";

		// 返回 MPD 文件的完整 URL
		return `${import.meta.env.VITE_APP_URL}/${source.path.replace(/\\/g, "/")}`;
	};

	// 跟踪当前活动索引
	const currentIndex = ref(0);

	// 当轮播图变化时更新索引
	function onSlideChange(api) {
		if (!api) {
			// console.error("carouselApi 未正确传递");
			return;
		}

		// 只在初始化时设置一次事件监听
		api.on("select", () => {
			currentIndex.value = api.selectedScrollSnap();
			// console.log("当前索引更新为:", currentIndex.value);
		});

		// 初始化时设置当前索引
		currentIndex.value = api.selectedScrollSnap();
	}

	// 处理指示器点击
	function goToSlide(index) {
		carouselRef.value?.scrollTo(index);
	}

	const handleScroll = () => {
		transitioning.value = true;

		const scrollPos = window.scrollY || document.documentElement.scrollTop;

		isSticky.value = scrollPos > categoryOriginalTop.value + 120;

		if (
			!loadingMore.value &&
			hasMore.value &&
			scrollPos + window.innerHeight >= document.documentElement.scrollHeight
		) {
			loadMoreRecommendedVideos();
		}

		// 过渡结束后重置状态
		setTimeout(() => {
			transitioning.value = false;
		}, 500);
	};

	const debouncedScroll = debounce(handleScroll, 0);

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

	const fetchData = async () => {
		loading.value = true;
		try {
			// 1. 获取分类
			const categoriesResponse = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video/categories`
			);
			if (categoriesResponse.data.success) {
				categories.value = categoriesResponse.data.data.sort(
					(a, b) => a.order - b.order
				);
			}

			// 2. 获取轮播图数据
			const featuredResponse = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video?sort=-hits&limit=5&status=normal`
			);

			// console.log("featuredResponse", featuredResponse);

			if (featuredResponse.data.success) {
				featuredVideos.value = featuredResponse.data.data;
			}

			// 3. 获取最新视频
			const topVideosResponse = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video/news?status=normal`
			);

			// console.log("topVideosResponse", topVideosResponse);

			if (topVideosResponse.data.success) {
				topVideos.value = topVideosResponse.data.data;
			}

			// 4. 获取推荐视频（初始加载）
			await loadRecommendedVideos();
		} catch (error) {
			console.error("获取数据失败:", error);
		} finally {
			loading.value = false;
		}
	};

	const loadRecommendedVideos = async (reset = false) => {
		if (loadingMore.value) return;

		try {
			loadingMore.value = true;

			// 如果是重置加载，清空当前列表并重置页码
			if (reset) {
				recommendedVideos.value = [];
				currentPage.value = 1;
				hasMore.value = true;
			}

			// 构建排除ID列表（排除featuredVideos和topVideos中的视频ID）
			const excludeIds = [
				...featuredVideos.value.map((v) => v._id),
				...topVideos.value.map((v) => v._id),
			].join(",");

			const response = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video/recommended`,
				{
					params: {
						page: currentPage.value,
						limit: 10,
						exclude: excludeIds,
						status: "normal",
					},
				}
			);

			if (response.data.success) {
				// 如果是第一页，直接替换数据
				if (currentPage.value === 1) {
					recommendedVideos.value = response.data.data;
				} else {
					// 否则追加数据
					recommendedVideos.value = [
						...recommendedVideos.value,
						...response.data.data,
					];
				}

				// 检查是否还有更多数据
				hasMore.value = response.data.data.length >= 10;
			}
		} catch (error) {
			console.error("加载推荐视频失败:", error);
		} finally {
			loadingMore.value = false;
		}
	};

	const loadMoreRecommendedVideos = async () => {
		if (!hasMore.value || loadingMore.value) return;

		currentPage.value += 1;
		await loadRecommendedVideos();
	};

	function routerTransition(url) {
		if (!url) return;
		if (!document.startViewTransition) {
			router.push(url);
			return;
		}
		document.startViewTransition(() => {
			router.push(url);
		});
	}

	function routerBlank(url) {
		window.open(url, "_blank");
	}

	// 添加SSE连接
	const setupSSE = () => {
		const eventSource = new EventSource(
			`${import.meta.env.VITE_APP_URL}/video/updates`
		);

		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				if (data.type === "videos" || data.type === "categories") {
					fetchData(); // 当收到更新通知时重新获取数据
				}
			} catch (error) {
				console.error("Error parsing SSE data:", error);
			}
		};

		eventSource.onerror = (error) => {
			console.error("SSE error:", error);
			// 尝试重新连接
			setTimeout(setupSSE, 5000);
		};

		// 在组件卸载时关闭连接
		onUnmounted(() => {
			eventSource.close();
		});
	};

	onMounted(() => {
		fetchData();
		window.addEventListener("scroll", debouncedScroll);
		setupSSE();

		initShakaPlayer;
	});

	onUnmounted(() => {
		window.removeEventListener("scroll", debouncedScroll);
		window.removeEventListener("scroll", handleScroll);
	});
</script>

<style scoped>
	.container {
		max-width: 1400px;
	}
</style>
