<template>
	<div class="container py-8">
		<!-- Category Header -->
		<div class="mb-8">
			<div class="flex items-center gap-4 mb-2">
				<Button
					variant="ghost"
					size="icon"
					@click="routerTransitionTo(-1)"
					class="mr-2 cursor-pointer"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M15 18l-6-6 6-6" />
					</svg>
				</Button>
				<h1 class="text-3xl font-bold tracking-tight">
					{{ category?.name || "Loading..." }}
				</h1>
				<p class="text-muted-foreground mt-2">{{ pagination.total }} 个视频</p>
			</div>
		</div>

		<!-- Videos Grid -->
		<div
			v-if="loading && videos.length === 0"
			class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
		>
			<div v-for="i in pagination.limit" :key="i" class="space-y-4">
				<Skeleton class="h-48 w-full rounded-lg" />
				<Skeleton class="h-4 w-3/4" />
				<Skeleton class="h-4 w-1/2" />
			</div>
		</div>

		<div
			v-else-if="videos.length > 0"
			class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
		>
			<div
				v-for="video in videos"
				:key="video._id"
				class="flex gap-3 cursor-pointer group"
				@mouseenter="handleVideoHover(video)"
				@mouseleave="stopVideoPreview(video._id)"
				@click="routerBlank(`/video/${video._id}`)"
			>
				<Card class="h-full transition-all hover:shadow-lg w-full">
					<CardHeader class="p-0 relative">
						<div class="aspect-video overflow-hidden rounded-t-lg">
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
						<Badge
							v-if="video.status === 'processing'"
							variant="secondary"
							class="absolute top-2 left-2"
						>
							Processing
						</Badge>
					</CardHeader>
					<CardContent class="p-4">
						<CardTitle class="text-lg line-clamp-2 h-15">
							{{ video.title }}
						</CardTitle>
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
					</CardContent>
				</Card>
			</div>

			<!-- 加载更多时的骨架屏 -->
			<template v-if="loadingMore">
				<div v-for="i in 4" :key="`skeleton-${i}`" class="space-y-4">
					<Skeleton class="h-48 w-full rounded-lg" />
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-4 w-1/2" />
				</div>
			</template>
		</div>

		<div v-else class="flex flex-col items-center justify-center py-12">
			<div class="text-center space-y-2">
				<h2 class="text-2xl font-bold">没有找到视频</h2>
				<p class="text-muted-foreground">这里还没有视频</p>
				<Button variant="outline" class="mt-4" as-child>
					<RouterLink to="/">Go back home</RouterLink>
				</Button>
			</div>
		</div>

		<!-- 无限滚动提示 -->
		<div
			class="flex justify-center mt-8 h-10 text-muted-foreground"
			v-if="!hasMore && videos.length > 0"
		>
			看官，没有更多了~
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, watch, reactive, nextTick, onUnmounted } from "vue";
	import { useRoute } from "vue-router";
	import { Button } from "@/components/ui/button";
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
	} from "@/components/ui/card";
	import { Skeleton } from "@/components/ui/skeleton";
	import { Badge } from "@/components/ui/badge";
	import axios from "axios";
	import {
		formatPath,
		formatNumber,
		formatDuration,
		formatTime,
		formatDate,
	} from "@/utils/format";
	import shaka from "shaka-player";
	import { useRouter } from "vue-router";
	import debounce from "@/utils/debounce";

	const router = useRouter();
	const route = useRoute();

	const loading = ref(true);
	const loadingMore = ref(false);
	const category = ref(null);
	const videos = ref([]);
	const hasMore = ref(true);
	const pagination = reactive({
		page: 1,
		limit: 12,
		total: 0,
		totalPages: 1,
	});

	const hoveredVideo = ref();
	const currentProgress = reactive({});
	const shakaPlayers = ref({});

	// 初始化 Shaka Player
	const initShakaPlayer = async () => {
		shaka.polyfill.installAll();
	};

	// 更新播放进度
	const updateProgress = (videoId, event) => {
		const video = event.target;
		if (!video) return;
		currentProgress[videoId] = formatTime(video.currentTime);
	};

	// 处理鼠标悬停
	const handleVideoHover = async (video) => {
		hoveredVideo.value = video;
		await nextTick();

		const videoElement = document.getElementById(`video-preview-${video._id}`);
		if (!videoElement) return;

		const sourceUrl = getVideoSource(video);
		if (!sourceUrl) return;

		if (shakaPlayers.value[video._id]) {
			shakaPlayers.value[video._id].unload();
			shakaPlayers.value[video._id].detach();
		}

		const player = new shaka.Player();
		player.attach(videoElement);
		shakaPlayers.value[video._id] = player;

		try {
			await player.load(sourceUrl);
			videoElement.muted = true;
			setTimeout(() => {
				videoElement.play();
			}, 500);
		} catch (error) {
			console.error("Shaka Player 加载失败:", error);
		}
	};

	// 停止视频预览
	const stopVideoPreview = (videoId) => {
		const videoElement = document.getElementById(`video-preview-${videoId}`);
		if (videoElement) {
			videoElement.removeEventListener("timeupdate", (event) =>
				updateProgress(videoId, event)
			);
		}
		if (shakaPlayers.value[videoId]) {
			const player = shakaPlayers.value[videoId];
			player.unload();
			player.detach();
			delete shakaPlayers.value[videoId];
		}
		hoveredVideo.value = undefined;
	};

	// 获取视频源
	const getVideoSource = (video) => {
		const source = video.filePath.find((p) => p.transcode === "h264");
		if (!source) return "";
		return `${import.meta.env.VITE_APP_URL}/${source.path.replace(/\\/g, "/")}`;
	};

	// 获取分类信息
	const fetchCategory = async (value) => {
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video/categories?value=${value}`
			);

			const data = await response.data;
			if (data.success && data.data.length > 0) {
				category.value = data.data[0];
			}

			fetchVideos();
		} catch (error) {
			console.error("Failed to fetch category:", error);
		}
	};

	// 获取视频列表
	const fetchVideos = async (reset = false) => {
		if (loadingMore.value) return;

		try {
			loadingMore.value = !reset;
			loading.value = reset;

			if (reset) {
				videos.value = [];
				pagination.page = 1;
				hasMore.value = true;
			}

			const response = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video?category=${category.value?.name}&page=${pagination.page}&limit=${pagination.limit}&status=normal`
			);

			const data = await response.data;

			if (data.success) {
				if (reset) {
					videos.value = data.data;
				} else {
					videos.value = [...videos.value, ...data.data];
				}

				pagination.total = data.total;
				pagination.totalPages = data.totalPages;
				hasMore.value = data.data.length >= pagination.limit;
			}
		} catch (error) {
			console.error("Failed to fetch videos:", error);
		} finally {
			loading.value = false;
			loadingMore.value = false;
		}
	};

	// 加载更多视频
	const loadMoreVideos = async () => {
		if (!hasMore.value || loadingMore.value) return;
		pagination.page += 1;
		await fetchVideos();
	};

	// 滚动事件处理
	const handleScroll = debounce(() => {
		const scrollPos = window.scrollY || document.documentElement.scrollTop;
		const scrollHeight = document.documentElement.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;

		if (
			scrollPos + clientHeight >= scrollHeight &&
			!loadingMore.value &&
			hasMore.value
		) {
			loadMoreVideos();
		}
	}, 200);

	// 设置SSE连接
	const setupSSE = () => {
		const eventSource = new EventSource(
			`${import.meta.env.VITE_APP_URL}/video/updates`
		);

		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === "videos" || data.type === "categories") {
					fetchVideos(true);
				}
			} catch (error) {
				console.error("Error parsing SSE data:", error);
			}
		};

		eventSource.onerror = (error) => {
			console.error("SSE error:", error);
			setTimeout(setupSSE, 5000);
		};

		onUnmounted(() => {
			eventSource.close();
		});
	};

	onMounted(() => {
		window.scrollTo(0, 0);
		fetchCategory(route.params.value);
		setupSSE();
		initShakaPlayer();
		window.addEventListener("scroll", handleScroll);
	});

	onUnmounted(() => {
		window.removeEventListener("scroll", handleScroll);
	});

	watch(
		() => route.params.value,
		(newValue) => {
			if (newValue) {
				fetchCategory(newValue);
			}
		}
	);

	function routerTransitionTo(url) {
		if (!url) return;
		if (!document.startViewTransition) {
			router.go(url);
			return;
		}
		document.startViewTransition(() => {
			router.go(url);
		});
	}

	function routerBlank(url) {
		window.open(url, "_blank");
	}
</script>
