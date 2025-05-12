<template>
	<div class="grid">
		<div class="relative w-full max-w-4xl mx-auto">
			<!-- 视频播放器区域 -->
			<div class="relative aspect-video bg-black rounded-lg overflow-hidden">
				<VideoPlayer
					v-if="currentVideoUrl"
					:videoUrl="currentVideoUrl"
					@error="errorHandler"
					class="w-full h-full"
				/>
			</div>

			<!-- 编码切换区域 -->
			<div class="mt-4">
				<div class="relative">
					<button
						@click="toggleMenu"
						class="inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
					>
						<span>切换编码 (当前: {{ currentTranscode }})</span>
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
							class="transition-transform duration-200"
							:class="{ 'rotate-180': showMenu }"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>

					<Transition name="fade">
						<ul
							v-if="showMenu"
							class="absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
						>
							<li
								v-for="item in videoList"
								:key="item._id"
								@click="selectTranscode(item)"
								class="cursor-pointer px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
								:class="{
									'bg-accent text-accent-foreground':
										currentTranscode === item.transcode,
								}"
							>
								{{ item.transcode }}
							</li>
						</ul>
					</Transition>
				</div>
			</div>

			<!-- 状态信息 -->
			<div
				v-if="loading"
				class="mt-4 text-center text-sm text-muted-foreground"
			>
				<div class="flex items-center justify-center gap-2">
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
						class="animate-spin"
					>
						<path d="M21 12a9 9 0 1 1-6.219-8.56" />
					</svg>
					加载中...
				</div>
			</div>
			<div v-if="error" class="mt-4 text-center text-sm text-destructive">
				<div class="flex items-center justify-center gap-2">
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
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
					{{ error }}
				</div>
			</div>
		</div>
		<div class="mt-4 w-100"></div>
	</div>
</template>

<script setup>
	import { ref, computed, onMounted } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import VideoPlayer from "../components/VideoPlayer.vue";

	const route = useRoute();
	const router = useRouter();

	// 响应式状态
	const showMenu = ref(false);
	const currentTranscode = ref("");
	const loading = ref(false);
	const error = ref("");
	const videoList = ref([]);
	const isError = ref(false);

	// 计算当前视频URL
	const currentVideoUrl = computed(() => {
		const selected = videoList.value.find(
			(item) => item.transcode === currentTranscode.value
		);
		if (!selected) return "";

		const formattedPath = selected.path.replace(/\\/g, "/");
		return `${import.meta.env.VITE_APP_URL}/${formattedPath}`;
	});

	// 错误处理
	const errorHandler = (err) => {
		isError.value = true;
		error.value = err.message || "视频播放失败";
		console.error("视频播放错误:", err);
	};

	// 切换菜单显示
	const toggleMenu = () => {
		showMenu.value = !showMenu.value;
	};

	// 选择编码
	const selectTranscode = (item) => {
		currentTranscode.value = item.transcode;
		showMenu.value = false;
		isError.value = false;
		error.value = "";
	};

	// 获取视频数据
	const fetchVideoData = async () => {
		try {
			loading.value = true;
			error.value = "";
			const videoId = route.params.id;

			if (!videoId) {
				router.push("/nofound-video");
				return;
			}

			const response = await fetch(
				`${import.meta.env.VITE_APP_URL}/video/${videoId}`
			);

			if (response.status === 404) {
				router.push("/nofound-video");
				return;
			}

			const data = await response.json();

			if (!data.filePath || !data.filePath.length) {
				router.push("/nofound-video");
				return;
			}

			videoList.value = data.filePath;

			if (videoList.value.length) {
				currentTranscode.value = videoList.value[0].transcode;

				// 检查第一个视频流是否可用
				const firstVideoUrl = computed(() => {
					const formattedPath = videoList.value[0].path.replace(/\\/g, "/");
					return `${import.meta.env.VITE_APP_URL}/${formattedPath}`;
				}).value;

				try {
					const streamCheck = await fetch(firstVideoUrl, { method: "HEAD" });
					if (!streamCheck.ok) {
						router.push("/nofound-video");
						return;
					}
				} catch (err) {
					console.error("视频流检查失败:", err);
					router.push("/nofound-video");
					return;
				}
			}
		} catch (err) {
			error.value = err.message || "获取视频数据时出错";
			console.error("获取视频数据失败:", err);
			router.push("/nofound-video");
		} finally {
			loading.value = false;
		}
	};

	onMounted(() => {
		fetchVideoData();
	});
</script>

<style scoped>
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.2s ease, transform 0.2s ease;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
		transform: translateY(-10px);
	}
</style>
