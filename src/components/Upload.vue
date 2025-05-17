<template>
	<div class="space-y-3">
		<Label class="text-base">1. 视频信息</Label>
		<div class="space-y-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="videoTitle" class="text-right">视频标题</Label>
				<div class="col-span-3 space-y-1">
					<Input
						id="videoTitle"
						v-model="uploadForm.title"
						placeholder="请输入视频标题"
						:class="{ 'border-destructive': errors.title }"
						maxlength="30"
					/>
					<p v-if="errors.title" class="text-xs text-destructive">
						{{ errors.title }}
					</p>
				</div>
			</div>

			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="videoCategory" class="text-right">视频分类</Label>
				<div class="col-span-3">
					<Select v-model="uploadForm.category">
						<SelectTrigger class="cursor-pointer">
							<SelectValue placeholder="请选择视频分类" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem
									v-for="category in categories"
									:key="category.value"
									:value="category.value"
									class="cursor-pointer"
								>
									{{ category.label }}
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div class="grid grid-cols-4 items-start gap-4">
				<Label for="videoDesc" class="text-right pt-2">视频简介</Label>
				<div class="col-span-3 space-y-1">
					<Textarea
						id="videoDesc"
						v-model="uploadForm.description"
						placeholder="请输入视频简介"
						:class="{ 'border-destructive': errors.description }"
						maxlength="100"
					/>
					<div class="flex justify-between">
						<p v-if="errors.description" class="text-xs text-destructive">
							{{ errors.description }}
						</p>
						<p class="text-xs text-muted-foreground">
							{{ uploadForm.description.length }}/100
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
	<Separator class="my-4" />
	<div class="space-y-3">
		<Label class="text-base">2. 上传视频</Label>
		<div
			class="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary hover:bg-accent/50"
			@dragover.prevent="dragOver = true"
			@dragleave="dragOver = false"
			@drop.prevent="handleDrop"
			:class="{ 'border-primary bg-accent/30': dragOver }"
		>
			<Input
				id="video"
				type="file"
				accept="video/*"
				@change="fileChange"
				class="hidden"
			/>
			<Label
				for="video"
				class="cursor-pointer flex flex-col items-center justify-center space-y-3"
			>
				<Upload class="w-10 h-10 text-muted-foreground" />
				<div>
					<p class="text-sm font-medium">
						<span class="text-primary">点击上传</span> 或拖拽文件到此处
					</p>
					<div class="text-xs text-muted-foreground mt-1">
						支持 MP4, MOV, AVI 等格式 ( 支持 H.264/HEVC/AV1 主流编码 )
					</div>
				</div>
			</Label>
		</div>
	</div>

	<div v-if="selectedFile" class="bg-accent/30 rounded-lg p-4 space-y-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<FileVideo class="w-5 h-5 text-muted-foreground" />
				<Tooltip>
					<TooltipTrigger as-child>
						<p class="text-sm font-medium truncate max-w-[400px]">
							{{ selectedFile.name }}
						</p>
					</TooltipTrigger>
					<TooltipContent>
						<p>{{ selectedFile.name }}</p>
					</TooltipContent>
				</Tooltip>
			</div>
			<Badge variant="outline" class="text-xs"> {{ fileSizeMB }} MB </Badge>
		</div>

		<div class="space-y-4">
			<div v-if="prechecking" class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">预检中...</span>
					<span class="font-medium">{{ precheckProgressPercent }}%</span>
				</div>
				<Progress :model-value="precheckProgressPercent" />
			</div>

			<div v-if="uploading" class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">上传中...</span>
					<span class="font-medium">{{ totalProgressPercent }}%</span>
				</div>
				<Progress :model-value="totalProgressPercent" />
				<p class="text-xs text-muted-foreground text-right">
					并发上传: {{ concurrentUploads }}/{{ CONCURRENT_LIMIT }}
				</p>
			</div>

			<div v-if="merging" class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">合并文件...</span>
					<span class="font-medium">{{ mergeProgress }}%</span>
				</div>
				<Progress :model-value="mergeProgress" />
			</div>

			<div
				v-if="progressInfo.percent === 100"
				class="flex items-center justify-center p-2 bg-success/10 rounded-md"
			>
				<CheckCircle2 class="w-5 h-5 text-success mr-2" />
				<span class="text-sm font-medium text-success">上传成功!</span>
			</div>
		</div>
	</div>

	<div class="flex gap-3 pt-2">
		<Button
			@click.prevent="handleUpload"
			:disabled="
				!selectedFile || uploading || merging || !extractingFramesComplete
			"
			class="flex-1 cursor-pointer"
		>
			<Loader2
				class="w-4 h-4 mr-2 animate-spin"
				v-show="calculating || uploading || merging"
			/>
			{{ calculating || uploading || merging ? "处理中..." : "开始上传" }}
		</Button>
		<Button
			variant="outline"
			@click.prevent="handleCancel"
			class="flex-1 cursor-pointer"
			v-show="uploading"
			:disabled="merging"
		>
			<X class="w-4 h-4 mr-2 cursor-pointer" />
			取消
		</Button>
	</div>

	<Separator class="my-4" />
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<Label class="text-base">3. 选择视频封面</Label>
			<Button
				variant="ghost"
				size="sm"
				@click="refreshFrames"
				class="cursor-pointer"
			>
				<RefreshCw class="w-4 h-4 mr-1" />
				重新提取
			</Button>
			<ToggleGroup
				v-model="useAutoFrames"
				type="single"
				class="border rounded-md"
			>
				<ToggleGroupItem value="true" class="px-3 py-1 text-sm">
					自动截取
				</ToggleGroupItem>
				<ToggleGroupItem value="false" class="px-3 py-1 text-sm">
					上传封面
				</ToggleGroupItem>
			</ToggleGroup>
		</div>

		<div v-if="useAutoFrames == 'true' && selectedFile" class="space-y-4">
			<div class="bg-accent/30 rounded-lg p-4">
				<div class="relative aspect-video w-full">
					<img
						v-if="selectedFrameIndex !== null"
						:src="frames[selectedFrameIndex]?.url"
						class="w-full h-full object-contain rounded-lg"
					/>
					<div v-else class="flex items-center justify-center h-full">
						<p class="text-muted-foreground">请从下方选择封面</p>
					</div>
					<div class="absolute bottom-3 right-3">
						<Badge variant="secondary" class="text-sm font-mono">
							{{
								selectedFrameIndex !== null
									? (selectedFrameIndex * frameInterval).toFixed(1) + "s"
									: ""
							}}
						</Badge>
					</div>
				</div>
			</div>

			<div class="bg-accent/30 rounded-lg p-2" v-if="frames.length > 0">
				<Carousel class="w-full" :opts="{ align: 'start', dragFree: true }">
					<CarouselContent class="-ml-1">
						<CarouselItem
							v-for="(frame, index) in frames"
							:key="index"
							class="basis-1/3 sm:basis-1/4 pl-1"
						>
							<div
								class="relative aspect-video cursor-pointer"
								@click="selectFrame(index)"
							>
								<img
									:src="frame.url"
									class="w-full h-full object-cover rounded border-2 transition-all"
									:class="{
										'border-primary': selectedFrameIndex === index,
										'border-transparent hover:border-border':
											selectedFrameIndex !== index,
									}"
								/>
								<div
									v-if="selectedFrameIndex === index"
									class="absolute inset-0 bg-primary/10 rounded pointer-events-none"
								/>
								<div class="absolute bottom-1 right-1">
									<Badge
										variant="secondary"
										class="text-xs font-mono px-1 py-0"
									>
										{{ (index * frameInterval).toFixed(1) }}s
									</Badge>
								</div>
							</div>
						</CarouselItem>
					</CarouselContent>
					<CarouselPrevious class="left-2 cursor-pointer" />
					<CarouselNext class="right-2 cursor-pointer" />
				</Carousel>
			</div>
			<div v-if="extractingFrames" class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">正在提取视频帧...</span>
					<span class="font-medium">{{ frameExtractionProgress }}%</span>
				</div>
				<Progress :model-value="frameExtractionProgress" />
			</div>

			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						@click="extractMoreFrames"
						:disabled="extractingFrames || frames.length == 0"
						class="cursor-pointer"
						v-if="frames.length < maxFrames"
					>
						<Plus class="w-4 h-4 mr-1" />
						提取更多帧
					</Button>
					<Button variant="ghost" size="sm" v-if="frames.length >= maxFrames"
						>已达到限制的最多帧</Button
					>
					<Button
						variant="ghost"
						size="sm"
						@click="clearFrames"
						class="cursor-pointer"
						:disabled="extractingFrames || frames.length == 0"
					>
						<Trash2 class="w-4 h-4 mr-1" />
						清除所有
					</Button>
				</div>
				<p class="text-sm text-muted-foreground">
					已选择:
					{{
						selectedFrameIndex !== null
							? (selectedFrameIndex * frameInterval).toFixed(1) + "s"
							: "无"
					}}
				</p>
			</div>
		</div>

		<div v-if="!selectedFile" class="bg-accent/30 rounded-lg p-8 text-center">
			<p class="text-sm text-muted-foreground">请先上传视频以选择封面</p>
		</div>

		<div v-if="isEdge" class="mt-4 p-4 bg-warning/20 rounded-lg">
			<p class="text-sm text-warning-foreground flex items-center gap-2">
				<Info class="w-4 h-4" />
				<span>Edge用户上传HEVC编码的视频请确保已安装扩展并重启浏览器</span>
			</p>
		</div>

		<!-- 上传封面图片的区域 -->
		<div v-if="useAutoFrames === 'false'" class="space-y-4">
			<div
				class="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary hover:bg-accent/50"
				@dragover.prevent="coverDragOver = true"
				@dragleave="coverDragOver = false"
				@drop.prevent="handleCoverDrop"
				:class="{ 'border-primary bg-accent/30': coverDragOver }"
			>
				<Input
					id="cover"
					type="file"
					accept="image/*"
					@change="coverFileChange"
					class="hidden"
				/>
				<Label
					for="cover"
					class="cursor-pointer flex flex-col items-center justify-center space-y-3"
				>
					<Upload class="w-10 h-10 text-muted-foreground" />
					<div>
						<p class="text-sm font-medium">
							<span class="text-primary">点击上传</span> 或拖拽图片到此处
						</p>
						<div class="text-xs text-muted-foreground mt-1">
							支持 JPG, PNG 等格式 (建议尺寸: 1280×720)
						</div>
					</div>
				</Label>
			</div>

			<!-- 显示已上传的封面 -->
			<div v-if="customCoverFile" class="bg-accent/30 rounded-lg p-4">
				<div class="relative aspect-video w-full">
					<img
						:src="customCoverUrl"
						class="w-full h-full object-contain rounded-lg"
					/>
				</div>
				<div class="flex justify-end mt-2">
					<Button
						variant="ghost"
						size="sm"
						@click="removeCustomCover"
						class="text-destructive"
					>
						<Trash2 class="w-4 h-4 mr-1" />
						移除封面
					</Button>
				</div>
			</div>
		</div>

		<div v-if="!selectedFile" class="bg-accent/30 rounded-lg p-8 text-center">
			<p class="text-sm text-muted-foreground">请先上传视频</p>
		</div>
	</div>
	<Toaster position="top-center" richColors />
</template>

<script setup lang="ts">
	import {
		Loader2,
		Upload,
		FileVideo,
		CheckCircle2,
		X,
		RefreshCw,
		Plus,
		Trash2,
		Info,
		Download,
	} from "lucide-vue-next";
	import { Button } from "@/components/ui/button";
	import { Separator } from "@/components/ui/separator";
	import { Label } from "@/components/ui/label";
	import { Badge } from "@/components/ui/badge";
	import {
		Tooltip,
		TooltipContent,
		TooltipTrigger,
	} from "@/components/ui/tooltip";
	import { Progress } from "@/components/ui/progress";

	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselPrevious,
		CarouselNext,
	} from "@/components/ui/carousel";
	import { Input } from "@/components/ui/input";
	import {
		Select,
		SelectTrigger,
		SelectValue,
		SelectContent,
		SelectGroup,
		SelectItem,
	} from "@/components/ui/select";
	import { toast, Toaster } from "vue-sonner";
	import { Textarea } from "@/components/ui/textarea";
	import { ref, computed, reactive, toRefs, onMounted } from "vue";
	import axiosInstance from "@/utils/http";
	import getFilename from "@/utils/getFilename";
	import createChunks from "@/utils/createChunks";
	import axios, { type CancelTokenSource } from "axios";
	import pLimit from "p-limit";
	import { captureFrame } from "@/utils/captureFrame";
	import { useUserStore } from "@/stores/User";
	import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

	interface Frame {
		url: string;
		blob: Blob;
		time: number;
	}

	interface VerifyResponse {
		success: boolean;
		needUpload: boolean;
		uploadedChunks: [
			{
				chunkFilename: string;
				size: number;
			},
		];
	}

	interface Category {
		value: string;
		label: string;
	}

	const userStore = useUserStore();

	const dragOver = ref(false);
	const selectedFile = ref<File | null>(null);
	const frames = ref<Frame[]>([]);
	const selectedFrameIndex = ref<number | null>(null);
	const extractingFrames = ref(false);
	const frameInterval = 2; // 每2秒提取一帧
	const maxFrames = 20; // 最多提取20帧
	const extractingFramesComplete = ref(false);
	const frameExtractionProgress = ref(0);
	const totalFramesToExtract = ref(0);
	const useAutoFrames = ref("true"); // 默认使用自动截取
	const coverDragOver = ref(false);
	const customCoverFile = ref<File | null>(null);
	const customCoverUrl = ref("");

	// 视频分类选项
	const categories: Category[] = [];

	const isEdge = ref(false);
	const appxUrl = `${
		import.meta.env.VITE_APP_URL
	}/public/plugins/Microsoft.HEVCVideoExtension_2.3.8.0_neutral_~_8wekyb3d8bbwe.AppxBundle`;

	// 增强型浏览器检测
	const checkBrowser = () => {
		const ua = navigator.userAgent;
		isEdge.value = ua.includes("Edg/") || ua.includes("Edge/");
	};

	// 触发下载
	const downloadAppx = () => {
		const link = document.createElement("a");
		link.href = appxUrl;
		link.download = "RequiredRuntime.appx";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// 初始化检测
	onMounted(() => {
		checkBrowser();
		if (isEdge.value) {
			toast.warning("Edge浏览器需安装HEVC视频扩展才能正常上传HEVC编码的视频", {
				action: {
					label: "下载安装包",
					onClick: downloadAppx,
				},
				description: "下载.appx文件安装后重启浏览器 ( 如果已安装请忽略 )",
				duration: 10000,
			});
		}
	});

	const emit = defineEmits(["upload-success"]);

	// 上传成功时
	const onUploadSuccess = () => {
		emit("upload-success"); // 传递响应数据
	};

	axios.get(`${import.meta.env.VITE_APP_URL}/video/categories`).then((res) => {
		if (res.data.success) {
			res.data.data.forEach((item: any) => {
				categories.push({
					value: item.name,
					label: item.name,
				});
			});
		} else {
			toast.error("获取视频分类失败");
		}
	});

	// 表单数据
	const uploadForm = reactive({
		title: "",
		category: "",
		description: "",
	});

	// 表单错误信息
	const errors = reactive({
		title: "",
		description: "",
	});

	// 表单验证
	const validateForm = () => {
		let isValid = true;

		// 验证视频标题
		if (!uploadForm.title.trim()) {
			errors.title = "请输入视频标题";
			isValid = false;
		} else if (uploadForm.title.length > 30) {
			errors.title = "视频标题不能超过30个字符";
			isValid = false;
		} else {
			errors.title = "";
		}

		// 验证视频简介
		if (uploadForm.description.length > 100) {
			errors.description = "视频简介不能超过100个字符";
			isValid = false;
		} else {
			errors.description = "";
		}

		return isValid;
	};

	// 提取视频帧
	const extractVideoFrames = async (file: File, count: number = 10) => {
		extractingFrames.value = true;
		extractingFramesComplete.value = false;
		frameExtractionProgress.value = 0;
		totalFramesToExtract.value = Math.min(count, maxFrames);

		try {
			const duration = await getVideoDuration(file);
			const interval = Math.max(duration / totalFramesToExtract.value, 1);

			const newFrames = [];
			for (let i = 0; i < totalFramesToExtract.value; i++) {
				const time = i * interval;
				const frame = (await captureFrame(file, time)) as Frame;
				if (frame) {
					newFrames.push({
						url: frame.url,
						blob: frame.blob,
						time,
					});
					// 更新进度
					frameExtractionProgress.value = Math.round(
						((i + 1) / totalFramesToExtract.value) * 100
					);
				}
			}

			frames.value = newFrames;
			if (frames.value.length > 0) {
				selectedFrameIndex.value = 0;
			}
		} catch (error) {
			toast.error("提取视频帧失败");
			console.error("提取视频帧失败:", error);
		} finally {
			extractingFrames.value = false;
			extractingFramesComplete.value = true;
			frameExtractionProgress.value = 0;
			totalFramesToExtract.value = 0;
		}
	};

	// 获取视频时长
	const getVideoDuration = (file: File): Promise<number> => {
		return new Promise((resolve) => {
			const video = document.createElement("video");
			video.src = URL.createObjectURL(file);
			video.onloadedmetadata = () => {
				resolve(video.duration);
				URL.revokeObjectURL(video.src);
			};
		});
	};

	// 选择帧
	const selectFrame = (index: number) => {
		selectedFrameIndex.value = index;
	};

	// 刷新帧
	const refreshFrames = async () => {
		clearFrames();
		if (selectedFile.value) {
			await extractVideoFrames(selectedFile.value);
		}
	};

	// 提取更多帧
	const extractMoreFrames = async () => {
		if (selectedFile.value && frames.value.length < maxFrames) {
			extractingFrames.value = true;
			extractingFramesComplete.value = false;
			try {
				const duration = await getVideoDuration(selectedFile.value);
				const currentCount = frames.value.length;
				const newCount = Math.min(currentCount + 10, maxFrames);
				totalFramesToExtract.value = newCount - currentCount;
				frameExtractionProgress.value = 0;

				const newFrames = [...frames.value];
				for (let i = currentCount; i < newCount; i++) {
					const time = i * frameInterval;
					if (time < duration) {
						const frame = (await captureFrame(
							selectedFile.value,
							time
						)) as Frame;
						if (frame) {
							newFrames.push({
								url: frame.url,
								blob: frame.blob,
								time,
							});
							frameExtractionProgress.value = Math.round(
								((i - currentCount + 1) / totalFramesToExtract.value) * 100
							);
						}
					}
				}

				frames.value = newFrames;
			} catch (error) {
				toast.error("提取更多帧失败");
				console.error("提取更多帧失败:", error);
			} finally {
				extractingFrames.value = false;
				extractingFramesComplete.value = true;
			}
		}
	};

	// 清除所有帧
	const clearFrames = () => {
		frames.value = [];
		selectedFrameIndex.value = null;
	};

	// 文件变化处理
	async function fileChange(event: Event) {
		const target = event.target as HTMLInputElement;

		if (target.files && target.files.length > 0) {
			try {
				const file = target.files[0];

				// 检查文件是否可读
				if (file.size === 0) {
					toast.error("文件为空或不可读");
					return;
				}

				selectedFile.value = file;
				// 重置状态
				state.uploading = false;
				state.merging = false;
				state.uploadComplete = false;
				state.prechecking = false;
				state.progressInfo = {};
				state.mergeProgress = 0;
				state.precheckProgress = 0;
				concurrentUploads.value = 0;
				selectedFrameIndex.value = null;

				clearFrames();

				// 提取视频帧
				await extractVideoFrames(file);
			} catch (error) {
				console.error("读取文件失败:", error);
				toast.error("读取文件失败，请检查文件权限或尝试重新选择");
			}
		}
	}

	// 拖拽处理
	function handleDrop(event: DragEvent) {
		dragOver.value = false;
		if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
			const inputEvent = {
				target: { files: event.dataTransfer.files },
			} as unknown as Event;
			fileChange(inputEvent);
		}
	}

	// 处理封面文件上传
	const coverFileChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			handleCoverFile(target.files[0]);
		}
	};

	// 处理封面拖放
	const handleCoverDrop = (event: DragEvent) => {
		coverDragOver.value = false;
		if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
			handleCoverFile(event.dataTransfer.files[0]);
		}
	};

	// 处理封面文件
	const handleCoverFile = (file: File) => {
		if (!file.type.startsWith("image/")) {
			toast.error("请上传有效的图片文件");
			return;
		}

		customCoverFile.value = file;
		customCoverUrl.value = URL.createObjectURL(file);
	};

	// 移除自定义封面
	const removeCustomCover = () => {
		customCoverFile.value = null;
		customCoverUrl.value = "";
	};

	// 上传相关状态和逻辑
	interface State {
		calculating: boolean;
		progressInfo: Record<string, number>;
		uploading: boolean;
		merging: boolean;
		mergeProgress: number;
		uploadComplete: boolean;
		totalChunks: number;
		concurrentUploads: number;
		precheckProgress: number;
		prechecking: boolean;
	}

	const state: State = reactive({
		calculating: false,
		progressInfo: {},
		uploading: false,
		merging: false,
		mergeProgress: 0,
		uploadComplete: false,
		totalChunks: 0,
		concurrentUploads: 0,
		precheckProgress: 0,
		prechecking: false,
	});

	const {
		progressInfo,
		calculating,
		uploading,
		merging,
		mergeProgress,
		uploadComplete,
		totalChunks,
		prechecking,
	} = toRefs(state);

	const CONCURRENT_LIMIT = 3;
	const concurrentUploads = ref(0);
	const cancelTokens: CancelTokenSource[] = [];

	const fileSizeMB = computed(() => {
		if (!selectedFile.value) return 0;
		return (selectedFile.value.size / (1024 * 1024)).toFixed(2);
	});

	const totalProgressPercent = computed(() => {
		if (totalChunks.value === 0) return 0;
		const totalUploaded = Object.values(progressInfo.value).reduce(
			(acc, cur) => acc + cur,
			0
		);
		return Math.round(totalUploaded / totalChunks.value);
	});

	const precheckProgressPercent = computed(() => {
		return Math.round(state.precheckProgress * 100);
	});

	const handleCancel = () => {
		cancelTokens.forEach((cancelToken) => {
			cancelToken.cancel();
		});
		concurrentUploads.value = 0;
	};

	const handleUpload = async () => {
		if (!validateForm()) {
			return;
		}
		if (selectedFile.value) {
			state.uploadComplete = false;
			state.calculating = true;
			state.prechecking = true;

			try {
				const filename = await getFilename(selectedFile.value, (progress) => {
					state.precheckProgress = progress;
				});
				state.calculating = false;
				state.prechecking = false;

				const duration = await getVideoDuration(selectedFile.value);

				const response: VerifyResponse = await axiosInstance.get(
					`${import.meta.env.VITE_APP_URL}/video/verify/${filename}`
				);

				if (!response.needUpload) {
					toast.success(`${selectedFile.value?.name}该视频已存在，无需上传`);
					return;
				}

				if (!extractingFramesComplete.value) {
					return;
				}

				let coverBlob: Blob;
				if (useAutoFrames.value === "true") {
					// 使用自动截取的帧
					if (!selectedFrameIndex.value && selectedFrameIndex.value !== 0) {
						toast.error("请选择封面帧");
						return;
					}
					coverBlob = frames.value[selectedFrameIndex.value].blob;
				} else {
					// 使用自定义上传的封面
					if (!customCoverFile.value) {
						toast.error("请上传封面图片");
						return;
					}
					coverBlob = customCoverFile.value;
				}

				const coverFile = new File([coverBlob], "cover.png", {
					type: "image/png",
				});

				const formData = new FormData();
				formData.append("title", uploadForm.title);
				formData.append("category", uploadForm.category);
				formData.append("description", uploadForm.description);
				formData.append("cover", coverFile);
				formData.append("filename", filename);
				formData.append("duration", duration.toString());
				formData.append("size", selectedFile.value.size.toString());
				formData.append("author", userStore.userInfo.username);

				const CHUNK_SIZE = 1024 * 1024 * 100; // 100MB
				const chunks = createChunks(selectedFile.value, CHUNK_SIZE, filename);

				state.totalChunks = chunks.length;
				state.uploading = true;

				const limit = pLimit(CONCURRENT_LIMIT);

				const requests = chunks.map((chunkInfo) => {
					return limit(async () => {
						concurrentUploads.value = limit.activeCount + limit.pendingCount;

						const cancelToken = axios.CancelToken.source();
						cancelTokens.push(cancelToken);

						const uploadedChunk = response.uploadedChunks?.find(
							(item: any) => item.chunkFilename === chunkInfo.chunkFilename
						);

						let chunk = chunkInfo.chunk;

						let start = 0;
						const totalSize = chunk.size;

						if (uploadedChunk) {
							chunk = chunk.slice(uploadedChunk.size);
							start = uploadedChunk.size;
						}

						if (chunk.size > 0) {
							progressInfo.value[chunkInfo.chunkFilename] = Math.round(
								(start * 100) / totalSize
							);

							try {
								await axiosInstance.post(
									`${import.meta.env.VITE_APP_URL}/video/upload/${filename}`,
									chunk,
									{
										headers: {
											"Content-Type": "application/octet-stream",
										},
										params: {
											chunkFilename: chunkInfo.chunkFilename,
											start,
										},
										onUploadProgress(progressEvent) {
											const total = progressEvent.total || 1;
											if (selectedFile.value) {
												progressInfo.value[chunkInfo.chunkFilename] =
													Math.round((progressEvent.loaded * 100) / total);
											}
										},
										cancelToken: cancelToken.token,
									}
								);
							} finally {
								concurrentUploads.value =
									limit.activeCount + limit.pendingCount;
							}
						} else {
							progressInfo.value[chunkInfo.chunkFilename] = 100;
						}
					});
				});

				await Promise.all(requests);

				state.uploading = false;
				state.merging = true;

				const eventSource = new EventSource(
					`${import.meta.env.VITE_APP_URL}/video/merge/${filename}`
				);

				eventSource.onmessage = (event) => {
					const data = JSON.parse(event.data);
					state.mergeProgress = data.progress;

					if (data.completed) {
						eventSource.close();
						state.merging = false;
						state.uploadComplete = true;

						axiosInstance
							.post(`${import.meta.env.VITE_APP_URL}/video/create`, formData, {
								headers: {
									"Content-Type": "multipart/form-data",
								},
							})
							.then((res: any) => {
								if (res.success) {
									toast.success(`${selectedFile.value?.name}上传成功`);
									onUploadSuccess();
								} else {
									toast.error("视频创建失败");
								}
							})
							.catch((error) => {
								console.error("提交视频信息失败:", error);
								toast.error("提交视频信息失败");
							});
					}
				};

				eventSource.onerror = () => {
					eventSource.close();
					state.merging = false;
					toast.error("合并文件时出错");
				};
			} catch (error) {
				console.log(error);

				if (axios.isCancel(error)) {
					toast.warning("上传已取消");
				} else {
					toast.error("上传失败");
				}
			} finally {
				state.calculating = false;
				state.uploading = false;
				concurrentUploads.value = 0;
			}
		}
	};
</script>

<style scoped>
	/* 轮播项样式 */
	.carousel-item {
		scroll-snap-align: start;
	}
</style>
