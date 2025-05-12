<template>
	<div class="w-full h-full flex justify-center items-center">
		<div
			id="player"
			class="w-full h-auto relative"
			@contextmenu.prevent="showContextMenu"
		>
			<video crossorigin playsinline></video>

			<!-- 在 video 元素后添加统计信息面板 -->
			<div
				v-if="showStatsPanel"
				class="absolute left-2.5 top-2.5 bg-black/90 text-white rounded p-3 min-w-[300px] z-10 shadow-xl backdrop-blur-sm border border-white/10 animate-fade-in text-xs font-mono"
			>
				<div class="flex justify-between items-center mb-2">
					<span class="font-bold text-sm">实时视频统计</span>
					<span
						class="cursor-pointer text-lg leading-none"
						@click.stop="showStatsPanel = false"
						>×</span
					>
				</div>
				<div class="space-y-1 overflow-y-auto max-h-[70vh]">
					<div class="flex justify-between">
						<span class="text-gray-400">Mime Type:</span>
						<span class="text-white text-right">{{
							stats.mimeType || "N/A"
						}}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">Player Type:</span>
						<span class="text-white">{{ stats.playerType || "N/A" }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">Resolution:</span>
						<span class="text-white">{{ stats.resolution || "N/A" }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">Video DataRate:</span>
						<span class="text-white">{{ stats.videoBitrate || "N/A" }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">Audio DataRate:</span>
						<span class="text-white">{{ stats.audioBitrate || "N/A" }}</span>
					</div>
					<!-- <div class="flex justify-between">
						<span class="text-gray-400">Segments:</span>
						<span class="text-white">{{ stats.segments || "N/A" }}</span>
					</div> -->
					<div class="flex justify-between">
						<span class="text-gray-400">Dropped Frames:</span>
						<span class="text-white">{{ stats.droppedFrames || "N/A" }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">Video Host:</span>
						<span class="text-white break-all max-w-[180px] text-right">{{
							stats.videoHost || "N/A"
						}}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">Audio Host:</span>
						<span class="text-white break-all max-w-[180px] text-right">{{
							stats.audioHost || "N/A"
						}}</span>
					</div>
					<!-- <div class="flex justify-between">
						<span class="text-gray-400">Video Speed:</span>
						<span class="text-white">{{ stats.videoSpeed || "N/A" }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">Audio Speed:</span>
						<span class="text-white">{{ stats.audioSpeed || "N/A" }}</span>
					</div> -->
					<!-- <div class="flex justify-between">
						<span class="text-gray-400">Network Activity:</span>
						<span class="text-white">{{ stats.networkActivity || "N/A" }}</span>
					</div> -->
					<div class="flex justify-between">
						<span class="text-gray-400">Buffer Health:</span>
						<span class="text-white">{{ stats.bufferHealth || "N/A" }}</span>
					</div>
				</div>
			</div>

			<!-- 直播状态标签 -->
			<div
				v-if="isLive"
				class="absolute right-2.5 top-2.5 bg-red-600/70 text-white px-2 py-1 rounded flex items-center text-xs z-10"
			>
				<span class="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
				<span>直播中</span>
			</div>

			<!-- 实时画质选择按钮 -->
			<div
				class="absolute right-2.5 top-2.5 bg-black/70 text-white px-3 py-2 rounded flex items-center cursor-pointer z-10 text-sm transition-all hover:bg-black/90"
				@click.stop="toggleQualityMenu"
				ref="qualityButton"
				v-if="!isLive || qualityOptions.length > 1"
			>
				<span>{{ currentQualityLabel }}</span>
				<svg class="w-4 h-4 ml-1.5 fill-current" viewBox="0 0 24 24">
					<path d="M7 10l5 5 5-5z" />
				</svg>
			</div>

			<!-- 画质菜单 -->
			<div
				v-if="showQualityMenu"
				class="absolute right-2.5 top-12 z-50"
				ref="menuRef"
			>
				<div
					class="bg-black/90 rounded min-w-[120px] shadow-lg overflow-hidden animate-scale-in"
				>
					<div
						v-for="option in qualityOptions"
						:key="option.value"
						class="px-4 py-2.5 text-white flex justify-between cursor-pointer hover:bg-white/10 transition-colors"
						@click.stop="handleQualitySelect(option.value)"
					>
						<span>{{ option.name }}</span>
						<span
							v-if="activeQuality === option.value"
							class="text-blue-400 ml-2.5"
							>✓</span
						>
					</div>
				</div>
			</div>

			<!-- 右键菜单 -->
			<div
				v-if="contextMenuVisible"
				class="fixed bg-black/90 text-white rounded py-2 min-w-[250px] z-50 shadow-xl backdrop-blur-sm border border-white/10 animate-fade-in"
				:style="contextMenuStyle"
			>
				<div
					class="px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors"
					@click="toggleStatsPanel"
				>
					视频统计信息
				</div>
			</div>
		</div>
	</div>
	<Toaster position="top-center" richColors />
</template>

<script setup>
	import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
	import { onClickOutside } from "@vueuse/core";
	import "plyr/dist/plyr.css";
	import Plyr from "plyr";
	import shaka from "shaka-player/dist/shaka-player.ui.js";
	import mpegts from "mpegts.js";
	import { toast, Toaster } from "vue-sonner";

	const props = defineProps({
		videoUrl: {
			type: String,
			required: true,
			default: "",
		},
		isLive: {
			type: Boolean,
			default: false,
		},
	});

	const qualityOptions = ref([]);
	const showQualityMenu = ref(false);
	const activeQuality = ref(-1); // 默认自动
	const menuRef = ref(null);
	const qualityButton = ref(null);
	const playerType = ref(""); // 'dash' | 'mpegts' | 'native'
	const player = ref(null);
	const mpegtsPlayer = ref(null);
	const mediaInfo = ref({
		videoCodec: "",
		audioCodec: "",
		container: "",
		frameRate: "",
		bitrate: "",
	});
	const supportsHEVC = ref(false);
	const isError = ref(false);

	const contextMenuVisible = ref(false);
	const contextMenuStyle = ref({
		top: "0px",
		left: "0px",
	});

	const showStatsPanel = ref(false);
	const stats = ref({
		mimeType: "",
		playerType: "",
		resolution: "",
		videoBitrate: "",
		audioBitrate: "",
		segments: "",
		droppedFrames: "",
		videoHost: "",
		audioHost: "",
		videoSpeed: "",
		audioSpeed: "",
		networkActivity: "",
		bufferHealth: "",
	});

	const updateStats = () => {
		const videoElement = document.querySelector("video");
		if (!videoElement) return;

		// 获取视频播放质量信息
		const videoQuality = videoElement.getVideoPlaybackQuality?.();

		// 尝试从不同来源获取分辨率
		let width = 0;
		let height = 0;

		// 1. 首先尝试从视频元素本身获取
		if (videoElement.videoWidth) {
			width = videoElement.videoWidth;
			height = videoElement.videoHeight;
		}
		// 2. 如果不存在，尝试从videoQuality获取
		else if (videoQuality) {
			width = videoQuality.videoWidth;
			height = videoQuality.videoHeight;
		}
		// 3. 如果是Shaka Player，尝试从当前轨道获取
		else if (window.shakaInstance) {
			try {
				const tracks = window.shakaInstance.getVariantTracks();
				const activeTrack = tracks.find((t) => t.active);
				if (activeTrack) {
					width = activeTrack.width || 0;
					height = activeTrack.height || 0;
				}
			} catch (e) {
				console.error("获取Shaka分辨率出错:", e);
			}
		}

		// 解析URL获取主机信息
		let videoHost = "";
		let audioHost = "";

		try {
			const url = new URL(props.videoUrl);
			videoHost = audioHost = url.host;
		} catch (e) {
			videoHost = audioHost = "N/A";
		}

		let videoBitrate = "N/A";
		let audioBitrate = "N/A";

		let videoSpeed = "N/A";
		let audioSpeed = "N/A";

		// 根据播放器类型获取数据率
		switch (playerType.value) {
			case "dash":
				if (window.shakaInstance) {
					try {
						const tracks = window.shakaInstance.getVariantTracks();
						const shakaStats = window.shakaInstance.getStats();
						const bandwidthStats = shakaStats.streamBandwidthStats || {};
						const activeTrack = tracks.find((t) => t.active);

						if (activeTrack) {
							videoBitrate = `${Math.round(activeTrack.bandwidth / 1000)} Kbps`;
							// Shaka不直接提供音频带宽，可以估算（通常视频占70-80%）
							audioBitrate = `${Math.round(
								(activeTrack.bandwidth * 0.3) / 1000
							)} Kbps`;
						}

						// 计算视频和音频的下载速度（字节/秒）
						const totalDownloadSpeed = bandwidthStats.downloadSpeed || 0; // bits per second

						// 假设视频占70%带宽，音频占30%
						videoSpeed = formatSpeed(totalDownloadSpeed * 0.7);
						audioSpeed = formatSpeed(totalDownloadSpeed * 0.3);
					} catch (e) {
						console.error("获取Shaka带宽信息出错:", e);
					}
				}
				break;

			case "mpegts":
				if (mpegtsPlayer.value) {
					// MPEG-TS播放器通常有stats属性
					const stats = mpegtsPlayer.value.stats;
					if (stats) {
						// 计算最近1秒的带宽
						const duration = Math.min(1, videoElement.currentTime);
						if (duration > 0) {
							videoBitrate = `${Math.round(
								((stats.videoBytes / duration) * 8) / 1000
							)} Kbps`;
							audioBitrate = `${Math.round(
								((stats.audioBytes / duration) * 8) / 1000
							)} Kbps`;
						}
					}
				}
				break;

			case "native":
				// 原生播放器尝试使用标准API
				if (videoElement.videoBitsPerSecond) {
					videoBitrate = `${Math.round(
						videoElement.videoBitsPerSecond / 1000
					)} Kbps`;
				}

				if (videoElement.audioBitsPerSecond) {
					audioBitrate = `${Math.round(
						videoElement.audioBitsPerSecond / 1000
					)} Kbps`;
				}

				if (videoElement.buffered.length > 0) {
					try {
						const bufferedEnd = videoElement.buffered.end(
							videoElement.buffered.length - 1
						);
						const bufferedStart = videoElement.buffered.start(0);
						const bufferedTime = bufferedEnd - bufferedStart;
						const bufferedSize =
							bufferedTime * (videoElement.videoBitsPerSecond / 8); // 估算

						// 简单估算下载速度
						const speed = (bufferedSize / bufferedTime) * 8; // 转换为bps
						videoSpeed = formatSpeed(speed * 0.7); // 假设视频占70%
						audioSpeed = formatSpeed(speed * 0.3); // 假设音频占30%
					} catch (e) {
						console.error("获取原生播放器速度出错:", e);
					}
				}
				break;
		}

		// 更新统计信息
		stats.value = {
			mimeType: `${getVideoCodec(videoElement)} / ${getAudioCodec(
				videoElement
			)}`,
			playerType: playerType.value.toUpperCase(),
			resolution:
				width && height
					? `${width} x ${height}@${
							mediaInfo.value.frameRate ||
							videoElement.getVideoPlaybackQuality?.()?.framerate ||
							"N/A"
						}`
					: "N/A",
			videoBitrate: videoBitrate,
			audioBitrate: audioBitrate,
			segments: "N/A", // 需要根据播放器类型获取
			droppedFrames: videoQuality
				? `${videoQuality.droppedVideoFrames || 0} / ${
						videoQuality.totalVideoFrames || 0
					}`
				: "N/A",
			videoHost,
			audioHost,
			videoSpeed: "N/A", // 需要实时计算
			audioSpeed: "N/A", // 需要实时计算
			networkActivity: "0 KB", // 需要网络监控
			bufferHealth: videoElement.buffered.length
				? `${Math.round(
						videoElement.buffered.end(0) - videoElement.currentTime
					)}s`
				: "N/A",
		};

		// 如果是Shaka Player，获取更多信息
		if (window.shakaInstance) {
			try {
				const shakaStats = window.shakaInstance.getStats();
				const bandwidthStats = shakaStats.streamBandwidthStats || {};
				const tracks = window.shakaInstance.getVariantTracks();
				const activeTrack = tracks.find((t) => t.active);

				if (activeTrack) {
					stats.value.mimeType = `video/mp4;codecs="${
						activeTrack.videoCodec || "avc1"
					}", audio/mp4;codecs="${activeTrack.audioCodec || "mp4a.40.2"}"`;

					stats.value.segments =
						bandwidthStats.totalSegmentsDownloaded !== undefined
							? `${bandwidthStats.totalSegmentsDownloaded} / ${
									bandwidthStats.totalSegments || "N/A"
								}`
							: "N/A";
				}

				if (activeTrack) {
					videoBitrate = `${Math.round(activeTrack.bandwidth / 1000)} Kbps`;
					// Shaka不直接提供音频带宽，可以估算（通常视频占70-80%）
					audioBitrate = `${Math.round(
						(activeTrack.bandwidth * 0.3) / 1000
					)} Kbps`;
				}

				// 计算总下载字节数
				const totalBytesDownloaded = bandwidthStats.totalBytesDownloaded || 0;

				// 计算当前下载速度（基于最近1秒的数据）
				const downloadSpeed = bandwidthStats.downloadSpeed || 0;

				// 更新统计信息
				stats.value.networkActivity = `${formatBytes(
					totalBytesDownloaded
				)} (${formatSpeed(downloadSpeed)})`;
			} catch (e) {
				console.error("获取Shaka统计信息出错:", e);
				stats.value.segments = "N/A";
			}
		}

		// 如果是MPEG-TS Player
		if (mpegtsPlayer.value) {
			stats.value.segments = "Live Stream";
			const mpegtsStats = mpegtsPlayer.value.stats || {};

			// 计算总下载字节数（视频+音频）
			const totalBytes =
				(mpegtsStats.videoBytes || 0) + (mpegtsStats.audioBytes || 0);

			// 计算当前下载速度
			const duration = Math.min(1, videoElement.currentTime);
			const downloadSpeed = duration > 0 ? (totalBytes / duration) * 8 : 0; // 转换为bps

			stats.value.networkActivity = `${formatBytes(totalBytes)} (${formatSpeed(
				downloadSpeed
			)})`;
		}

		// 如果是原生播放器
		if (playerType.value === "native") {
			let totalBytesDownloaded = 0;

			videoElement.addEventListener("progress", () => {
				if (videoElement.buffered.length > 0) {
					// 估算已下载的数据量（不精确）
					const bufferedEnd = videoElement.buffered.end(
						videoElement.buffered.length - 1
					);
					const duration = videoElement.duration;

					if (duration > 0) {
						// 假设视频文件大小与时长成正比（不精确）
						const estimatedTotalBytes =
							videoElement.videoBytesPerSecond * duration;
						totalBytesDownloaded =
							estimatedTotalBytes * (bufferedEnd / duration);

						// 更新统计信息
						stats.value.networkActivity = formatBytes(totalBytesDownloaded);
					}
				}
			});
		}
	};

	function formatBytes(bytes) {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	}

	// 辅助函数：格式化速度
	function formatSpeed(bitsPerSecond) {
		if (bitsPerSecond === 0) return "0 Kbps";
		const k = 1000;
		const sizes = ["bps", "Kbps", "Mbps", "Gbps"];
		const i = Math.floor(Math.log(bitsPerSecond) / Math.log(k));
		return (
			parseFloat((bitsPerSecond / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
		);
	}

	// 添加定时更新统计信息
	let statsInterval = null;

	onMounted(() => {
		statsInterval = setInterval(updateStats, 1000); // 每秒更新一次
	});

	onBeforeUnmount(() => {
		if (statsInterval) clearInterval(statsInterval);
	});

	// 修改右键菜单点击处理
	const toggleStatsPanel = () => {
		showStatsPanel.value = !showStatsPanel.value;
		contextMenuVisible.value = false;
		updateStats(); // 点击时立即更新一次
	};

	const showContextMenu = (event) => {
		contextMenuStyle.value = {
			top: `${event.clientY}px`,
			left: `${event.clientX}px`,
		};
		contextMenuVisible.value = true;

		const closeMenu = () => {
			contextMenuVisible.value = false;
			document.removeEventListener("click", closeMenu);
		};

		document.addEventListener("click", closeMenu);
	};

	const checkHEVCSupport = () => {
		try {
			const video = document.createElement("video");
			const mimeType = 'video/mp4; codecs="hev1.1.6.L93.B0"';
			supportsHEVC.value = video.canPlayType(mimeType) === "probably";
		} catch (e) {
			supportsHEVC.value = false;
		}
	};

	const updateMediaInfo = async (videoElement) => {
		if (!videoElement) return;

		try {
			// 重置信息
			mediaInfo.value = {
				videoCodec: "未知",
				audioCodec: "未知",
				container: "未知",
				frameRate: "未知",
				bitrate: "未知",
			};

			// 根据播放器类型获取信息
			switch (playerType.value) {
				case "dash":
					if (window.shakaInstance) {
						const tracks = window.shakaInstance.getVariantTracks();
						if (tracks.length > 0) {
							const track = tracks[0];
							const isHEVC = track.videoCodec?.includes("hev") || false;
							mediaInfo.value = {
								videoCodec: isHEVC ? "H.265/HEVC" : track.videoCodec || "未知",
								audioCodec: track.audioCodec || "未知",
								container: "DASH",
								frameRate: track.frameRate
									? `${track.frameRate.toFixed(2)}fps`
									: "未知",
								bitrate: track.bandwidth || "未知",
								isHEVC,
							};
						}
					}
					break;

				case "mpegts":
					mediaInfo.value = {
						videoCodec: "H.264",
						audioCodec: "AAC",
						container: detectMpegtsType(props.videoUrl).toUpperCase(),
						frameRate: "动态",
						bitrate: "动态",
					};
					break;

				case "native":
					await new Promise((resolve) => {
						if (videoElement.readyState >= 1) {
							resolve();
						} else {
							const onLoaded = () => {
								videoElement.removeEventListener("loadedmetadata", onLoaded);
								resolve();
							};
							videoElement.addEventListener("loadedmetadata", onLoaded);
						}
					});

					const quality = videoElement.getVideoPlaybackQuality?.();
					mediaInfo.value = {
						videoCodec: getVideoCodec(videoElement),
						audioCodec: getAudioCodec(videoElement),
						container: getFileExtension(props.videoUrl),
						frameRate: quality
							? `${(
									quality.totalVideoFrames / quality.totalVideoFrames
								).toFixed(2)}fps`
							: "未知",
						bitrate: videoElement.videoBitsPerSecond || "未知",
					};
					break;
			}
		} catch (error) {
			console.error("获取媒体信息失败:", error);
			toast.error("获取媒体信息失败");
			isError.value = true;
			emit("error", isError.value);
		}
	};

	// 辅助函数
	const getFileExtension = (url) => {
		const ext = url.split(".").pop().split("?")[0].toUpperCase();
		return ext === "MPD" ? "DASH" : ext;
	};

	const getVideoCodec = (videoElement) => {
		try {
			const canPlay = (codec) =>
				videoElement.canPlayType(`video/mp4; codecs="${codec}"`);

			if (canPlay("avc1.42E01E")) return "H.264";
			if (canPlay("vp9")) return "VP9";
			if (canPlay("av01.0.05M.08")) return "AV1";
			if (canPlay("hev1.1.6.L93.B0")) return "H.265/HEVC";

			return "未知";
		} catch {
			return "未知";
		}
	};

	const getAudioCodec = (videoElement) => {
		try {
			const canPlay = (codec) =>
				videoElement.canPlayType(`audio/mp4; codecs="${codec}"`);

			if (canPlay("mp4a.40.2")) return "AAC";
			if (canPlay("opus")) return "Opus";
			if (canPlay("vorbis")) return "Vorbis";

			return "未知";
		} catch {
			return "未知";
		}
	};

	const currentQualityLabel = computed(() => {
		const option = qualityOptions.value.find(
			(o) => o.value === activeQuality.value
		);
		return option ? option.name : "自动";
	});

	const toggleQualityMenu = () => {
		showQualityMenu.value = !showQualityMenu.value;
	};

	onClickOutside(menuRef, (event) => {
		if (!qualityButton.value?.contains(event.target)) {
			showQualityMenu.value = false;
		}
	});

	const handleQualitySelect = (value) => {
		activeQuality.value = value;

		if (playerType.value === "dash") {
			const shakaInstance = window.shakaInstance;
			if (!shakaInstance) return;

			try {
				if (value === -1) {
					// 自动选择
					shakaInstance.configure({
						abr: {
							enabled: true,
							defaultBandwidthEstimate: 500,
							bandwidthUpgradeTarget: 0.5,
							bandwidthDowngradeTarget: 0.6,
							restrictions: {
								minHeight: 0,
								maxHeight: Infinity,
							},
							switchInterval: 2,
						},
						streaming: {
							bufferingGoal: props.isLive ? 10 : 5, // 直播流需要更大的缓冲
							rebufferingGoal: 1,
							bufferBehind: props.isLive ? 30 : 20, // 直播流需要更大的向后缓冲
						},
					});
				} else {
					// 手动选择特定质量
					const tracks = shakaInstance.getVariantTracks();
					const selectedTrack = tracks[value];
					if (selectedTrack) {
						shakaInstance.configure({ abr: { enabled: false } });
						shakaInstance.selectVariantTrack(selectedTrack, true);
					}
				}
			} catch (error) {
				console.error("切换画质时出错:", error);
				toast.error("切换画质出错了！");
				isError.value = true;
				emit("error", isError.value);
			}
		}

		showQualityMenu.value = false;
	};

	const detectPlayerType = (url) => {
		const extension = url.split(".").pop().toLowerCase();
		if (extension === "mpd") return "dash";
		if (["flv", "m3u8", "ts", "m2ts"].includes(extension)) return "mpegts";
		if (["mp4", "webm", "mov"].includes(extension)) {
			// 如果是MP4且明确是HEVC且浏览器支持
			if (url.includes("hevc") && supportsHEVC.value) {
				return "native";
			}
			return "native";
		}
		return props.isLive ? "mpegts" : "native";
	};

	const initDashPlayer = async (videoElement) => {
		if (!shaka.Player.isBrowserSupported()) {
			console.error("浏览器不支持 Shaka Player");
			isError.value = true;
			emit("error", isError.value);
			return;
		}

		shaka.polyfill.installAll();
		const shakaInstance = new shaka.Player();
		window.shakaInstance = shakaInstance;

		// 添加HEVC支持配置
		shakaInstance.configure({
			streaming: {
				bufferingGoal: props.isLive ? 10 : 5,
				rebufferingGoal: 1,
				bufferBehind: props.isLive ? 30 : 20,
			},
			manifest: {
				dash: {
					ignoreMinBufferTime: true,
					ignoreSuggestedPresentationDelay: true,
				},
			},
		});

		try {
			await shakaInstance.attach(videoElement);
			await shakaInstance.load(props.videoUrl);

			// 获取轨道时识别HEVC编码
			const tracks = await new Promise((resolve) => {
				const checkTracks = () => {
					const tracks = shakaInstance.getVariantTracks();
					if (tracks.length > 0) resolve(tracks);
					else setTimeout(checkTracks, 100);
				};
				checkTracks();
			});

			qualityOptions.value = [
				{
					name: "自动",
					value: -1,
					height: 0,
					bandwidth: 0,
				},
				...tracks
					.map((track, index) => {
						let codecInfo = "";
						if (track.videoCodec && track.videoCodec.includes("hev")) {
							codecInfo = " (HEVC)";
						}

						return {
							name: track.height
								? `${track.height}p${codecInfo}`
								: `${Math.round(track.bandwidth / 1000)}kbps${codecInfo}`,
							value: index,
							height: track.height || 0,
							bandwidth: track.bandwidth,
						};
					})
					.filter((opt) => opt.bandwidth > 0)
					.sort((a, b) => b.height - a.height),
			];
		} catch (error) {
			console.error("Shaka 加载错误:", error);
			toast.error("播放器出错了哦~");
			isError.value = true;
			emit("error", isError.value);
		}
	};

	const initMpegtsPlayer = (videoElement) => {
		if (!mpegts.isSupported()) {
			console.error("浏览器不支持 MPEG-TS Player");
			toast.error("浏览器不支持 MPEG-TS Player");
			isError.value = true;
			emit("error", isError.value);
			return;
		}

		mpegtsPlayer.value = mpegts.createPlayer({
			type: detectMpegtsType(props.videoUrl),
			url: props.videoUrl,
			isLive: props.isLive,
			lazyLoad: true,
			lazyLoadMaxDuration: 3 * 60,
			enableWorker: true,
			// 添加直播追帧配置
			liveSync: true, // 开启直播同步
			liveSyncMaxLatency: 1.2, // 最大延迟3秒
			liveSyncTargetLatency: 0.8, // 追帧目标延迟0.8秒
			liveSyncPlaybackRate: 1.2, // 追帧时的播放速率
			enableStashBuffer: true, // 启用缓冲区
			stashInitialSize: 1, // 初始缓冲区大小(秒)
		});

		mpegtsPlayer.value.attachMediaElement(videoElement);
		mpegtsPlayer.value.load();

		// 直播流通常没有多码率切换功能
		qualityOptions.value = props.isLive
			? []
			: [
					{
						name: "自动",
						value: -1,
						height: 0,
						bandwidth: 0,
					},
				];
		updateMediaInfo(videoElement);
	};

	const initNativePlayer = (videoElement) => {
		// 检测是否是HEVC
		const isHEVC =
			props.videoUrl.includes("hevc") ||
			props.videoUrl.includes("h265") ||
			props.videoUrl.toLowerCase().includes("hevc");

		if (isHEVC && !supportsHEVC.value) {
			console.warn("当前浏览器不支持HEVC解码，将尝试使用MSE解码");
			// 尝试使用MSE解码
			return initMpegtsPlayer(videoElement);
		}

		videoElement.src = props.videoUrl;

		qualityOptions.value = [
			{
				name: "自动",
				value: -1,
				height: 0,
				bandwidth: 0,
			},
		];

		// 更新媒体信息时特别标注HEVC
		updateMediaInfo(videoElement);
	};

	const detectMpegtsType = (url) => {
		const extension = url.split(".").pop().toLowerCase();
		if (extension === "flv") return "flv";
		if (extension === "m3u8") return "mse";
		if (["ts", "m2ts"].includes(extension)) return "mpegts";
		return "flv"; // 默认
	};

	const initPlyr = (videoElement) => {
		const options = {
			controls: [
				"play-large",
				"play",
				"current-time",
				"duration",
				"progress",
				"mute",
				"volume",
				"captions",
				"settings",
				"pip",
				"airplay",
				"fullscreen",
			],
			tooltips: { controls: true, seek: true },
			autoplay: true,
			captions: { active: true, language: "auto", update: false },
			settings: props.isLive ? [] : ["captions", "quality", "speed", "loop"], // 直播隐藏不相关设置
			fullscreen: {
				enabled: true,
				fallback: true,
				iosNative: false,
				container: null,
			},
			speed: props.isLive
				? { selected: 1, options: [1] }
				: { selected: 1, options: [0.5, 0.75, 1, 1.5, 1.75, 2] }, // 直播禁用变速
			quality: {
				default: 0,
				options: [],
				forced: true,
				onChange: (quality) => handleQualityChange(quality),
			},
			loop: { active: false },
			i18n: {
				restart: "重播",
				rewind: "快退 {seektime}s",
				play: "播放",
				pause: "暂停",
				fastForward: "快进 {seektime}s",
				seek: "Seek",
				seekLabel: "{currentTime} of {duration}",
				played: "已播放",
				buffered: "已缓冲",
				currentTime: "当前时间",
				duration: "总时间",
				volume: "音量",
				mute: "静音",
				unmute: "取消静音",
				enableCaptions: "启用截图",
				disableCaptions: "禁用截图",
				download: "下载",
				enterFullscreen: "进入全屏",
				exitFullscreen: "退出全屏",
				frameTitle: "Player for {title}",
				captions: "截图",
				settings: "设置",
				pip: "画中画",
				menuBack: "返回上级菜单",
				speed: "倍速",
				normal: "正常",
				quality: "画质",
				loop: "循环",
				start: "起始",
				end: "结束",
				all: "全部",
				reset: "重置",
				disabled: "禁用",
				enabled: "启用",
				advertisement: "Ad",
				qualityBadge: {
					2160: "4K",
					1440: "HD",
					1080: "HD",
					720: "HD",
					576: "SD",
					480: "SD",
				},
			},
		};

		player.value = new Plyr(videoElement, options);
		window.player = player.value;
	};

	const destroyPlayers = () => {
		if (mpegtsPlayer.value) {
			mpegtsPlayer.value.destroy();
			mpegtsPlayer.value = null;
		}

		if (window.shakaInstance) {
			window.shakaInstance.destroy();
			window.shakaInstance = null;
		}

		if (player.value) {
			player.value.destroy();
			player.value = null;
		}
	};

	onMounted(async () => {
		checkHEVCSupport();
		playerType.value = detectPlayerType(props.videoUrl);
		const videoElement = document.querySelector("video");

		initPlyr(videoElement);

		if (playerType.value === "dash") {
			await initDashPlayer(videoElement);
		} else if (playerType.value === "mpegts") {
			initMpegtsPlayer(videoElement);
		} else {
			initNativePlayer(videoElement);
		}

		videoElement.addEventListener("loadedmetadata", () =>
			updateMediaInfo(videoElement)
		);
	});

	watch(
		() => props.videoUrl,
		(newUrl) => {
			destroyPlayers();
			playerType.value = detectPlayerType(newUrl);
			const videoElement = document.querySelector("video");

			initPlyr(videoElement);

			if (playerType.value === "dash") {
				initDashPlayer(videoElement);
			} else if (playerType.value === "mpegts") {
				initMpegtsPlayer(videoElement);
			} else {
				initNativePlayer(videoElement);
			}

			videoElement.addEventListener("loadedmetadata", () =>
				updateMediaInfo(videoElement)
			);
		}
	);

	watch(
		() => props.isLive,
		(newVal) => {
			// 当直播状态变化时重新初始化播放器
			destroyPlayers();
			playerType.value = detectPlayerType(props.videoUrl);
			const videoElement = document.querySelector("video");

			initPlyr(videoElement);

			if (playerType.value === "dash") {
				initDashPlayer(videoElement);
			} else if (playerType.value === "mpegts") {
				initMpegtsPlayer(videoElement);
			} else {
				initNativePlayer(videoElement);
			}
		}
	);

	// 清理资源
	onBeforeUnmount(() => {
		destroyPlayers();
	});

	// 暴露 isError 给父组件
	defineExpose({
		isError,
	});

	// 定义 emits
	const emit = defineEmits(["error"]);
</script>

<style>
	/* Add custom animations that aren't available in Tailwind by default */
	@keyframes scaleIn {
		from {
			transform: scale(0.9);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-scale-in {
		animation: scaleIn 0.2s ease-out;
	}

	.animate-fade-in {
		animation: fadeIn 0.15s ease-out;
	}
</style>
