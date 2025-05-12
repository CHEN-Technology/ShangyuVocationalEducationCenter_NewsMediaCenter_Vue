<template>
	<div class="container mx-auto py-8 px-4">
		<!-- 标题和上传按钮 -->
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-2xl font-bold">视频管理</h1>
			<div class="flex gap-3">
				<Button @click="openUploadDialog" class="cursor-pointer">
					<Upload class="h-4 w-4 mr-2" />
					上传视频
				</Button>
			</div>
		</div>

		<!-- 筛选和分页控制 -->
		<div
			class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
		>
			<div class="relative w-full md:w-1/2">
				<Search
					class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
				/>
				<Input
					v-model="searchQuery"
					placeholder="搜索视频标题..."
					class="pl-10 w-full"
				/>
			</div>

			<div class="flex items-center gap-4 w-full md:w-auto">
				<Select v-model="selectedCategory" @update:modelValue="fetchVideos">
					<SelectTrigger class="w-[150px] cursor-pointer">
						<SelectValue placeholder="选择分类筛选" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all" class="cursor-pointer">全部分类</SelectItem>
						<SelectItem
							v-for="category in categories"
							:key="category.value"
							:value="category.value"
							class="cursor-pointer"
						>
							{{ category.label }}
						</SelectItem>
					</SelectContent>
				</Select>
				<Select v-model="pageSize" @update:modelValue="handlePageSizeChange">
					<SelectTrigger class="w-[120px] cursor-pointer">
						<SelectValue placeholder="每页条数" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem :value="5" class="cursor-pointer">5条/页</SelectItem>
						<SelectItem :value="10" class="cursor-pointer">10条/页</SelectItem>
						<SelectItem :value="20" class="cursor-pointer">20条/页</SelectItem>
						<SelectItem :value="50" class="cursor-pointer">50条/页</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>

		<!-- 批量操作区域 -->
		<div v-if="selectedVideos.length > 0" class="mb-4 p-3 bg-accent rounded-lg">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium">
						已选择 {{ selectedVideos.length }} 个视频
					</span>
					<Button
						variant="ghost"
						size="sm"
						@click="clearSelection"
						class="cursor-pointer hover:bg-accent-foreground/10 text-muted-foreground"
					>
						<X class="h-4 w-4 mr-1" />
						清除选择
					</Button>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button variant="outline" class="cursor-pointer">
							批量操作
							<ChevronDownIcon class="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem
							@click="openBatchEditCategoryDialog"
							class="cursor-pointer"
						>
							<FolderEdit class="mr-2 h-4 w-4" />
							修改分类
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							@click="batchDeleteSelected"
							class="text-red-600 cursor-pointer"
						>
							<Trash2 class="mr-2 h-4 w-4" />
							删除选中
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>

		<!-- 视频列表表格 -->
		<Card>
			<CardHeader>
				<CardTitle>视频列表</CardTitle>
				<CardDescription>管理您的视频内容</CardDescription>
			</CardHeader>
			<CardContent>
				<Table v-if="videos.length > 0">
					<TableHeader>
						<TableRow>
							<TableHead class="w-[50px]">
								<Checkbox
									v-model="allSelected"
									:indeterminate="isIndeterminate"
									class="cursor-pointer"
								/>
							</TableHead>
							<TableHead class="w-[100px]">封面</TableHead>
							<TableHead>标题</TableHead>
							<TableHead>分类</TableHead>
							<TableHead>上传日期</TableHead>
							<TableHead>状态</TableHead>
							<TableHead class="text-right">操作</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow v-for="video in videos" :key="video._id">
							<TableCell>
								<Checkbox
									:model-value="isVideoSelected(video._id)"
									@update:model-value="toggleVideoSelection(video._id)"
									class="cursor-pointer"
								/>
							</TableCell>
							<TableCell>
								<Tooltip>
									<TooltipTrigger as-child>
										<div
											class="w-16 h-9 rounded overflow-hidden cursor-pointer"
											@click="openVideo(video._id)"
										>
											<img
												:src="getCoverUrl(video.cover)"
												:alt="video.title"
												class="w-full h-full object-cover"
											/>
										</div>
									</TooltipTrigger>
									<TooltipContent>点击跳转视频详情页</TooltipContent>
								</Tooltip>
							</TableCell>
							<TableCell
								class="w-[200px] min-w-[200px] max-w-[300px] overflow-hidden"
							>
								<!-- 标题 -->
								<Tooltip>
									<TooltipTrigger as-child>
										<p class="font-medium truncate">{{ video.title }}</p>
									</TooltipTrigger>
									<TooltipContent>
										<p>{{ video.title }}</p>
									</TooltipContent>
								</Tooltip>

								<!-- 描述 -->
								<p class="text-xs text-muted-foreground truncate">
									{{ video.description || "无描述" }}
								</p>
							</TableCell>
							<TableCell>
								<Badge variant="outline">
									{{ getCategoryName(video.category) }}
								</Badge>
							</TableCell>
							<TableCell>
								{{ formatDate(video.uploadDate) }}
							</TableCell>
							<TableCell>
								<Badge
									:variant="video.status === 'normal' ? 'default' : 'secondary'"
								>
									{{ video.status === "normal" ? "正常" : "转码中" }}
								</Badge>
							</TableCell>
							<TableCell class="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger as-child>
										<Button variant="ghost" class="h-8 w-8 p-0 cursor-pointer">
											<MoreHorizontalIcon class="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											@click="openEditDialog(video)"
											class="cursor-pointer"
										>
											<Pencil class="mr-2 h-4 w-4" />
											<span>编辑</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											@click="openDeleteDialog(video)"
											class="text-red-600 cursor-pointer"
										>
											<Trash2 class="mr-2 h-4 w-4" />
											<span>删除</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>

				<div v-else class="flex flex-col items-center justify-center py-12">
					<FolderOpenIcon class="h-12 w-12 text-gray-400 mb-4" />
					<p class="text-gray-500">暂无视频数据</p>
				</div>

				<!-- 分页控制 -->
				<div
					v-if="videos.length > 0"
					class="flex items-center justify-between px-2 py-4"
				>
					<div class="text-sm text-muted-foreground">
						显示第 {{ (currentPage - 1) * pageSize + 1 }} 到
						{{ Math.min(currentPage * pageSize, totalVideos) }} 条，共
						{{ totalVideos }} 条
					</div>
					<div class="flex items-center space-x-1">
						<Pagination
							:totalPages="totalPages"
							:currentPage="currentPage"
							:function="handlePageChange"
						/>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- 上传视频对话框 -->
		<Dialog v-model:open="isUploadDialogOpen">
			<DialogScrollContent class="max-w-4xl">
				<DialogHeader>
					<DialogTitle>上传视频</DialogTitle>
					<DialogDescription>上传您的视频文件并填写相关信息</DialogDescription>
				</DialogHeader>
				<UploadComponent @upload-success="handleUploadSuccess" />
			</DialogScrollContent>
		</Dialog>

		<!-- 编辑视频对话框 -->
		<Dialog v-model:open="isEditDialogOpen">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>编辑视频信息</DialogTitle>
					<DialogDescription>修改视频的基本信息和分类</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="title" class="text-right">视频标题</Label>
						<Input
							id="title"
							v-model="editForm.title"
							class="col-span-3"
							placeholder="请输入视频标题"
							maxlength="30"
						/>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="category" class="text-right">视频分类</Label>
						<Select v-model="editForm.category">
							<SelectTrigger class="col-span-3 cursor-pointer">
								<SelectValue placeholder="选择视频分类" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									v-for="category in categories"
									:key="category.value"
									:value="category.value"
									class="cursor-pointer"
								>
									{{ category.label }}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div class="grid grid-cols-4 items-start gap-4">
						<Label for="description" class="text-right pt-2">视频描述</Label>
						<Textarea
							id="description"
							v-model="editForm.description"
							class="col-span-3"
							placeholder="请输入视频描述"
							maxlength="100"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						@click="isEditDialogOpen = false"
						class="cursor-pointer"
						>取消</Button
					>
					<Button type="submit" @click="submitEditForm" class="cursor-pointer"
						>保存更改</Button
					>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		<!-- 删除确认对话框 -->
		<Dialog v-model:open="isDeleteDialogOpen">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>确认删除</DialogTitle>
					<DialogDescription>
						您确定要删除视频 "{{ currentVideo?.title }}" 吗？此操作不可撤销。
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" @click="isDeleteDialogOpen = false"
						>取消</Button
					>
					<Button variant="destructive" @click="confirmDelete">确认删除</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		<!-- 批量删除确认对话框 -->
		<Dialog v-model:open="isBatchConfirmDialogOpen">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>确认批量删除</DialogTitle>
					<DialogDescription>
						您确定要删除选中的
						{{ selectedVideos.length }} 个视频吗？此操作不可撤销。
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" @click="isBatchConfirmDialogOpen = false"
						>取消</Button
					>
					<Button variant="destructive" @click="confirmBatchDelete"
						>确认删除</Button
					>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		<!-- 批量修改分类对话框 -->
		<Dialog v-model:open="isBatchEditCategoryDialogOpen">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>批量修改分类</DialogTitle>
					<DialogDescription>
						您将为 {{ selectedVideos.length }} 个视频修改分类
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="batch-category" class="text-right">新分类</Label>
						<Select v-model="batchEditCategory">
							<SelectTrigger class="col-span-3 cursor-pointer">
								<SelectValue placeholder="选择新的视频分类" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									v-for="category in categories"
									:key="category.value"
									:value="category.value"
									class="cursor-pointer"
								>
									{{ category.label }}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						@click="isBatchEditCategoryDialogOpen = false"
					>
						取消
					</Button>
					<Button type="submit" @click="confirmBatchEditCategory">
						确认修改
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		<Toaster position="top-center" richColors />
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted, watch } from "vue";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "@/components/ui/card";
	import { Button } from "@/components/ui/button";
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from "@/components/ui/table";
	import { Checkbox } from "@/components/ui/checkbox";
	import { Badge } from "@/components/ui/badge";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue,
	} from "@/components/ui/select";
	import { Textarea } from "@/components/ui/textarea";
	import {
		Dialog,
		DialogContent,
		DialogScrollContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
	} from "@/components/ui/dialog";
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger,
	} from "@/components/ui/dropdown-menu";
	import {
		Tooltip,
		TooltipContent,
		TooltipTrigger,
	} from "@/components/ui/tooltip";
	import {
		ChevronDownIcon,
		Eye,
		FolderOpenIcon,
		MoreHorizontalIcon,
		Pencil,
		Trash2,
		Upload,
		X,
		Search,
		FolderEdit,
	} from "lucide-vue-next";
	import { toast, Toaster } from "vue-sonner";
	import axios from "axios";
	import UploadComponent from "@/components/Upload.vue";
	import router from "@/router";
	import Pagination from "@/components/Pagination.vue";

	interface Video {
		_id: string;
		title: string;
		description?: string;
		category: string;
		cover: string;
		filePath: Array<{
			transcode: string;
			path: string;
		}>;
		uploadDate: string;
		status: "normal" | "transcoding";
	}

	interface Category {
		value: string;
		label: string;
	}

	// 状态管理
	const videos = ref<Video[]>([]);
	const categories = ref<Category[]>([]);
	const selectedVideos = ref<string[]>([]);
	const currentVideo = ref<Video | null>(null);
	const isUploadDialogOpen = ref(false);
	const isEditDialogOpen = ref(false);
	const isDeleteDialogOpen = ref(false);
	const isBatchConfirmDialogOpen = ref(false);
	const isBatchEditCategoryDialogOpen = ref(false);
	const batchEditCategory = ref("");

	// 分页相关
	const currentPage = ref(1);
	const pageSize = ref(10);
	const totalVideos = ref(0);
	const searchQuery = ref("");
	const selectedCategory = ref("all");

	// 编辑表单
	const editForm = ref({
		_id: "",
		title: "",
		description: "",
		category: "",
	});

	const openVideo = (videoId: string) => {
		window.open(router.resolve(`/video/${videoId}`).href);
	};

	// 计算属性
	const allSelected = computed({
		get: () =>
			videos.value.length > 0 &&
			selectedVideos.value.length === videos.value.length,
		set: (value) => {
			selectedVideos.value = value ? videos.value.map((v) => v._id) : [];
		},
	});

	const isIndeterminate = computed(() => {
		return selectedVideos.value.length > 0 && !allSelected.value;
	});

	const totalPages = computed(() =>
		Math.ceil(totalVideos.value / pageSize.value)
	);

	const openBatchEditCategoryDialog = () => {
		if (selectedVideos.value.length === 0) {
			toast.warning("提示", {
				description: "请至少选择一个视频",
			});
			return;
		}
		isBatchEditCategoryDialogOpen.value = true;
	};

	const confirmBatchEditCategory = async () => {
		if (!batchEditCategory.value) {
			toast.warning("提示", {
				description: "请选择分类",
			});
			return;
		}

		try {
			// 创建所有修改请求的Promise数组
			const updatePromises = selectedVideos.value.map((videoId) =>
				axios.put(`${import.meta.env.VITE_APP_URL}/video/${videoId}`, {
					category: batchEditCategory.value,
				})
			);

			// 显示加载状态
			const toastId = toast.loading(
				`正在批量修改 ${selectedVideos.value.length} 个视频的分类...`
			);

			// 并行执行所有修改请求
			const results = await Promise.allSettled(updatePromises);

			// 检查结果
			const failedUpdates = results.filter(
				(result) => result.status === "rejected" || !result.value.data.success
			);

			if (failedUpdates.length > 0) {
				toast.error("部分修改失败", {
					description: `成功修改 ${
						results.length - failedUpdates.length
					} 个，失败 ${failedUpdates.length} 个`,
					id: toastId,
				});
			} else {
				toast.success("成功", {
					description: `已批量修改 ${selectedVideos.value.length} 个视频的分类`,
					id: toastId,
				});
			}

			// 关闭对话框并重置状态
			isBatchEditCategoryDialogOpen.value = false;
			batchEditCategory.value = "";
			selectedVideos.value = [];

			// 刷新视频列表
			fetchVideos();
		} catch (error: any) {
			toast.error("错误", {
				description: error.message || "批量修改分类过程中出错",
			});
		}
	};

	// 方法
	const isVideoSelected = (id: string) => selectedVideos.value.includes(id);

	const toggleVideoSelection = (id: string) => {
		const index = selectedVideos.value.indexOf(id);
		if (index === -1) {
			selectedVideos.value.push(id);
		} else {
			selectedVideos.value.splice(index, 1);
		}
	};

	const clearSelection = () => {
		selectedVideos.value = [];
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const getCoverUrl = (coverPath: string) => {
		if (!coverPath) return "";
		// 根据后端API返回的路径格式调整
		return `${import.meta.env.VITE_APP_URL}/${coverPath.replace(/\\/g, "/")}`;
	};

	const getCategoryName = (categoryValue: string) => {
		const category = categories.value.find((c) => c.value === categoryValue);
		return category ? category.label : categoryValue;
	};

	// 添加防抖函数
	const debounce = (fn: Function, delay: number) => {
		let timer: number;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => fn(...args), delay);
		};
	};

	// 添加对 searchQuery 的 watch
	watch(
		searchQuery,
		debounce(() => {
			currentPage.value = 1; // 搜索时重置到第一页
			fetchVideos();
		}, 500) // 500ms 防抖延迟
	);

	// 获取视频列表
	const fetchVideos = async () => {
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video`,
				{
					params: {
						page: currentPage.value,
						limit: pageSize.value,
						category:
							selectedCategory.value === "all"
								? undefined
								: selectedCategory.value,
						search: searchQuery.value || undefined,
					},
				}
			);

			if (response.data.success) {
				videos.value = response.data.data;
				totalVideos.value = response.data.total;
			} else {
				throw new Error(response.data.message || "获取视频列表失败");
			}
		} catch (error: any) {
			toast.error("错误", {
				description: error.message || "获取视频列表失败",
			});
		}
	};

	// 获取分类列表
	const fetchCategories = async () => {
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video/categories`
			);
			if (response.data.success) {
				categories.value = response.data.data.map((item: any) => ({
					value: item.name || "默认分类",
					label: item.name || "默认分类",
				}));
			} else {
				throw new Error(response.data.message || "获取分类失败");
			}
		} catch (error: any) {
			toast.error("错误", {
				description: error.message || "获取分类失败",
			});
		}
	};

	// 分页处理
	const handlePageChange = (page: number) => {
		currentPage.value = page;
		fetchVideos();
	};

	const handlePageSizeChange = () => {
		currentPage.value = 1;
		fetchVideos();
	};

	// 上传相关
	const openUploadDialog = () => {
		isUploadDialogOpen.value = true;
	};

	const handleUploadSuccess = () => {
		setTimeout(() => {
			isUploadDialogOpen.value = false;
			fetchVideos();
		}, 2000);
	};

	// 编辑相关
	const openEditDialog = (video: Video) => {
		currentVideo.value = video;
		editForm.value = {
			_id: video._id,
			title: video.title,
			description: video.description || "",
			category: video.category,
		};
		isEditDialogOpen.value = true;
	};

	const submitEditForm = async () => {
		try {
			const response = await axios.put(
				`${import.meta.env.VITE_APP_URL}/video/${editForm.value._id}`,
				editForm.value
			);

			if (response.data.success) {
				toast.success("成功", {
					description: "视频信息更新成功",
				});
				isEditDialogOpen.value = false;
				fetchVideos();
			} else {
				throw new Error(response.data.message || "更新视频信息失败");
			}
		} catch (error: any) {
			toast.error("错误", {
				description: error.message || "更新视频信息失败",
			});
		}
	};

	// 删除相关
	const openDeleteDialog = (video: Video) => {
		currentVideo.value = video;
		isDeleteDialogOpen.value = true;
	};

	const confirmDelete = async () => {
		if (!currentVideo.value) return;

		try {
			const response = await axios.delete(
				`${import.meta.env.VITE_APP_URL}/video/${currentVideo.value._id}`
			);

			if (response.data.success) {
				toast.success("成功", {
					description: "视频已删除",
				});
				isDeleteDialogOpen.value = false;

				// 如果删除的是当前页的最后一条数据且不是第一页，则返回上一页
				if (videos.value.length === 1 && currentPage.value > 1) {
					currentPage.value -= 1;
				}

				fetchVideos();
			} else {
				throw new Error(response.data.message || "删除视频失败");
			}
		} catch (error: any) {
			toast.error("错误", {
				description: error.message || "删除视频失败",
			});
		}
	};

	// 批量删除
	const batchDeleteSelected = () => {
		if (selectedVideos.value.length === 0) {
			toast.warning("提示", {
				description: "请至少选择一个视频",
			});
			return;
		}
		isBatchConfirmDialogOpen.value = true;
	};

	const confirmBatchDelete = async () => {
		try {
			// 创建所有删除请求的Promise数组
			const deletePromises = selectedVideos.value.map((id) =>
				axios.delete(`${import.meta.env.VITE_APP_URL}/video/${id}`)
			);

			// 并行执行所有删除请求
			const results = await Promise.allSettled(deletePromises);

			// 检查结果
			const failedDeletes = results.filter(
				(result) => result.status === "rejected" || !result.value.data.success
			);

			if (failedDeletes.length > 0) {
				throw new Error(`有 ${failedDeletes.length} 个视频删除失败`);
			}

			toast.success("成功", {
				description: `已删除 ${selectedVideos.value.length} 个视频`,
			});

			isBatchConfirmDialogOpen.value = false;
			selectedVideos.value = [];

			// 如果删除的是当前页的所有数据且不是第一页，则返回上一页
			if (
				videos.value.length === selectedVideos.value.length &&
				currentPage.value > 1
			) {
				currentPage.value -= 1;
			}

			fetchVideos();
		} catch (error: any) {
			toast.error("错误", {
				description: error.message || "批量删除过程中出错",
			});
		}
	};

	// 初始化
	onMounted(() => {
		fetchVideos();
		fetchCategories();
	});
</script>

<style scoped>
	.container {
		max-width: 1200px;
	}
</style>
