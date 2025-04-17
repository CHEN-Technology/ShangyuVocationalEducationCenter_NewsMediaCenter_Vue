<template>
	<div class="grid w-full max-w-sm items-center gap-1.5" ref="fileRef">
		<Label for="video">Video</Label>
		<Input
			id="video"
			type="file"
			accept="video/*"
			@change="fileChange"
			class="cursor-pointer"
		/>
		<div class="text-sm text-muted-foreground" v-if="selectedFile">
			<p>File: {{ selectedFile?.name }}</p>
			<p>Size: {{ fileSizeMB }} MB</p>
			<div class="mt-2">
				<!-- 总上传进度 -->
				<div v-if="uploading">
					<p class="mb-1">上传进度: {{ totalProgressPercent }}%</p>
					<Progress :model-value="totalProgressPercent" />
					<p class="text-xs text-gray-500">
						并发上传数: {{ concurrentUploads }}
					</p>
				</div>

				<!-- 合并进度 -->
				<div v-if="merging" class="mt-2">
					<p class="mb-1">合并文件进度：{{ mergeProgress }}%</p>
					<Progress :model-value="mergeProgress" />
				</div>
			</div>
			<div
				class="text-sm text-muted-foreground"
				v-if="progressInfo.percent === 100"
			>
				<p>上传成功</p>
			</div>
		</div>
		<Button
			@click.prevent="handleUpload"
			:disabled="!selectedFile"
			class="cursor-pointer"
		>
			<Loader2 class="w-4 h-4 mr-2 animate-spin" v-show="calculating" />
			上传
		</Button>
		<Button
			variant="destructive"
			@click.prevent="handleCancel"
			class="cursor-pointer"
			v-show="uploading"
		>
			取消上传
		</Button>
	</div>
	<Toaster position="top-center" richColors />
</template>

<script setup lang="ts">
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { Button } from "@/components/ui/button";
	import { Progress } from "@/components/ui/progress";
	import { toast, Toaster } from "vue-sonner";
	import { Loader2 } from "lucide-vue-next";
	import { ref, computed, toRefs, reactive } from "vue";
	import axiosInstance from "@/utils/http";
	import getFilename from "@/utils/getFilename";
	import createChunks from "@/utils/createChunks";
	import axios, { type CancelTokenSource } from "axios";
	import pLimit from "p-limit";

	interface ProgressInfo {
		[key: string]: number;
	}

	interface State {
		calculating: boolean;
		progressInfo: ProgressInfo;
		uploading: boolean;
		merging: boolean;
		mergeProgress: number;
		uploadComplete: boolean;
		totalChunks: number;
		concurrentUploads: number;
	}

	interface VerifyResponse {
		success: boolean;
		needUpload: boolean;
		uploadedChunks: [
			{
				chunkFilename: string;
				size: number;
			}
		];
	}

	const selectedFile = ref<File | null>(null);
	// 设置最大并发数
	const CONCURRENT_LIMIT = 3;
	const concurrentUploads = ref(0);

	function fileChange(event: Event) {
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
				state.progressInfo = {};
				state.mergeProgress = 0;
				concurrentUploads.value = 0;
			} catch (error) {
				console.error("读取文件失败:", error);
				toast.error("读取文件失败，请检查文件权限或尝试重新选择");
			}
		}
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
	});

	const {
		progressInfo,
		calculating,
		uploading,
		merging,
		mergeProgress,
		uploadComplete,
		totalChunks,
	} = toRefs(state);

	// 取消请求的 token 数组
	const cancelTokens: CancelTokenSource[] = [];
	// 取消所有请求
	const handleCancel = () => {
		cancelTokens.forEach((cancelToken) => {
			cancelToken.cancel();
		});
		concurrentUploads.value = 0;
	};

	const handleUpload = async () => {
		if (selectedFile.value) {
			state.uploadComplete = false;
			state.calculating = true;

			try {
				const filename = await getFilename(selectedFile.value);
				state.calculating = false;

				const response: VerifyResponse = await axiosInstance.get(
					`${import.meta.env.VITE_APP_URL}/video/verify/${filename}`
				);

				if (!response.needUpload) {
					toast.success(`${selectedFile.value?.name}秒传成功`);
					return;
				}

				const CHUNK_SIZE = 1024 * 1024 * 100; // 100MB
				const chunks = createChunks(selectedFile.value, CHUNK_SIZE, filename);
				state.totalChunks = chunks.length;
				state.uploading = true;

				// 创建并发限制器
				const limit = pLimit(CONCURRENT_LIMIT);

				const requests = chunks.map((chunkInfo) => {
					return limit(async () => {
						concurrentUploads.value = limit.activeCount + limit.pendingCount;

						const cancelToken = axios.CancelToken.source();
						cancelTokens.push(cancelToken);

						// 查找是否有上传过的切片
						const uploadedChunk = response.uploadedChunks.find(
							(item) => item.chunkFilename === chunkInfo.chunkFilename
						);

						// 初始化要上传的切片和位置
						let chunk = chunkInfo.chunk;
						let start = 0;
						// 总大小，用于计算进度
						const totalSize = chunk.size;
						if (uploadedChunk) {
							// 如果已经上传过了，切除掉已经上传的部分
							chunk = chunk.slice(uploadedChunk.size);
							// 从已经上传的位置开始
							start = uploadedChunk.size;
						}

						// 切除之后，如果剩下还有切片大小就继续上传，没有就说明整个都上传过了，不用再上传这个
						if (chunk.size > 0) {
							// 初始进度
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

				// 使用EventSource接收合并进度
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
						toast.success(`${selectedFile.value?.name}上传成功`);
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

	const fileSizeMB = computed(() => {
		if (!selectedFile.value) return 0;
		return (selectedFile.value.size / (1024 * 1024)).toFixed(2);
	});

	const totalProgressPercent = computed(() => {
		if (totalChunks.value === 0) return 0;

		// 计算所有分片的总进度
		const totalUploaded = Object.values(progressInfo.value).reduce(
			(acc, cur) => acc + cur,
			0
		);
		return Math.round(totalUploaded / totalChunks.value);
	});
</script>

<style scoped></style>
