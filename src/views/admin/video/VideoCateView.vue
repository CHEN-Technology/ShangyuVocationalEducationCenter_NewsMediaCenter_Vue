<template>
	<div class="container mx-auto py-8 px-4">
		<!-- 标题和添加按钮 -->
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-2xl font-bold">视频分类管理</h1>
			<Button @click="openAddDialog" class="cursor-pointer">
				<PlusIcon class="h-4 w-4 mr-2" />
				添加分类
			</Button>
		</div>

		<div
			class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
		>
			<div class="relative w-full md:w-1/2">
				<Search
					class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
				/>
				<Input
					placeholder="搜索视频分类..."
					class="pl-10 w-full"
					v-model="searchQuery"
				/>
			</div>
			<div class="flex items-center gap-4 w-full md:w-auto">
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
		<div
			v-if="selectedCategories.length > 0"
			class="mb-4 p-3 bg-accent rounded-lg"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium">
						已选择 {{ selectedCategories.length }} 个视频
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
							@click="batchEnableSelected"
							class="cursor-pointer"
						>
							<CheckCircleIcon class="mr-2 h-4 w-4" />
							启用选中
						</DropdownMenuItem>
						<DropdownMenuItem
							@click="batchDisableSelected"
							class="cursor-pointer"
						>
							<XCircleIcon class="mr-2 h-4 w-4" />
							禁用选中
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

		<Card>
			<CardHeader>
				<CardTitle>分类列表</CardTitle>
				<CardDescription>管理您的视频分类信息</CardDescription>
			</CardHeader>
			<CardContent>
				<Table v-if="categories.length > 0">
					<TableHeader>
						<TableRow>
							<TableHead class="w-[50px]">
								<Checkbox
									v-model="allSelected"
									:indeterminate="isIndeterminate"
									:disabled="isProcessing"
									class="cursor-pointer"
								/>
							</TableHead>
							<TableHead class="w-[100px]">ID</TableHead>
							<TableHead>分类名称</TableHead>
							<TableHead>分类路由</TableHead>
							<TableHead>创建时间</TableHead>
							<TableHead>排序</TableHead>
							<TableHead>状态</TableHead>
							<TableHead class="text-right">操作</TableHead>
						</TableRow>
					</TableHeader>
					<draggable
						v-model="categories"
						tag="tbody"
						item-key="_id"
						@end="onDragEnd"
						handle=".drag-handle"
					>
						<template #item="{ element: category }">
							<TableRow>
								<TableCell>
									<Checkbox
										:model-value="isCategorySelected(category._id)"
										@update:model-value="toggleCategorySelection(category._id)"
										class="cursor-pointer"
									/>
								</TableCell>
								<TableCell class="font-medium">{{ category._id }}</TableCell>
								<TableCell>{{ category.name }}</TableCell>
								<TableCell>{{ category.value }}</TableCell>
								<TableCell>{{ formatDate(category.createdAt) }}</TableCell>
								<TableCell>
									<div class="flex items-center">
										<span class="mr-2">{{ category.order }}</span>
										<GripVerticalIcon
											class="h-4 w-4 text-gray-400 drag-handle cursor-move"
										/>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										:variant="
											category.status === true ? 'default' : 'destructive'
										"
										@click="toggleStatus(category)"
										class="cursor-pointer"
									>
										{{ category.status === true ? "启用" : "禁用" }}
									</Badge>
								</TableCell>
								<TableCell class="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger as-child>
											<Button
												variant="ghost"
												class="h-8 w-8 p-0 cursor-pointer"
											>
												<MoreHorizontalIcon class="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												@click="openEditDialog(category)"
												class="cursor-pointer"
											>
												<Pencil class="mr-2 h-4 w-4" />
												<span>编辑</span>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												@click="openDeleteDialog(category)"
												class="text-red-600 cursor-pointer"
											>
												<Trash2 class="mr-2 h-4 w-4" />
												<span>删除</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						</template>
					</draggable>
				</Table>
				<div v-else class="flex flex-col items-center justify-center py-12">
					<FolderOpenIcon class="h-12 w-12 text-gray-400 mb-4" />
					<p class="text-gray-500">暂无分类数据</p>
				</div>
				<div
					v-if="categories.length > 0"
					class="flex items-center justify-between px-2 py-4"
				>
					<div class="text-sm text-muted-foreground">
						显示第 {{ (currentPage - 1) * pageSize + 1 }} 到
						{{ Math.min(currentPage * pageSize, totalCategories) }} 条， 共
						{{ totalCategories }} 条
					</div>
					<div class="flex items-center space-x-2">
						<Pagination
							:totalPages="totalPages"
							:currentPage="currentPage"
							:function="handlePageChange"
						/>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- 添加/编辑分类对话框 -->
		<Dialog v-model:open="isDialogOpen">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{{ isEditing ? "编辑分类" : "添加分类" }}</DialogTitle>
					<DialogDescription>
						{{ isEditing ? "修改分类信息" : "创建一个新的视频分类" }}
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="name" class="text-right">分类名称</Label>
						<Input
							id="name"
							v-model="form.name"
							class="col-span-3"
							placeholder="请输入分类名称"
							maxlength="4"
						/>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="path" class="text-right">分类路由</Label>
						<Input
							id="path"
							v-model="form.value"
							class="col-span-3"
							placeholder="请输入分类路由"
							maxlength="10"
						/>
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="status" class="text-right">状态</Label>
						<Select v-model="form.status">
							<SelectTrigger class="col-span-3 cursor-pointer">
								<SelectValue placeholder="选择状态" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem :value="1" class="cursor-pointer">启用</SelectItem>
								<SelectItem :value="0" class="cursor-pointer">禁用</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						@click="isDialogOpen = false"
						class="cursor-pointer"
						>取消</Button
					>
					<Button type="submit" @click="submitForm" class="cursor-pointer"
						>保存</Button
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
						您确定要删除分类 "{{ currentCategory?.name }}" 吗？此操作不可撤销。
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

		<!-- 批量操作确认对话框 -->
		<Dialog v-model:open="isBatchConfirmDialogOpen">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{{ batchActionTitle }}</DialogTitle>
					<DialogDescription>
						{{ batchActionDescription }}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						@click="isBatchConfirmDialogOpen = false"
						class="cursor-pointer"
						>取消</Button
					>
					<Button
						variant="default"
						@click="confirmBatchAction"
						class="cursor-pointer"
						>确认</Button
					>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
	<Toaster position="top-center" richColors />
</template>

<script setup lang="ts">
	import { ref, onMounted, computed, watch } from "vue";
	import draggable from "vuedraggable";
	import { Button } from "@/components/ui/button";
	import { Checkbox } from "@/components/ui/checkbox";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "@/components/ui/card";
	import {
		Table,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from "@/components/ui/table";
	import { Badge } from "@/components/ui/badge";
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
	} from "@/components/ui/dialog";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue,
	} from "@/components/ui/select";
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger,
	} from "@/components/ui/dropdown-menu";
	import {
		FolderOpenIcon,
		GripVerticalIcon,
		PlusIcon,
		MoreHorizontalIcon,
		Pencil,
		Trash2,
		X,
		ChevronDownIcon,
		CheckCircleIcon,
		XCircleIcon,
		Search,
	} from "lucide-vue-next";
	import { toast, Toaster } from "vue-sonner";
	import axios from "axios";
	import Pagination from "@/components/Pagination.vue";

	interface VideoCategory {
		_id: string;
		name: string;
		value: string;
		status: boolean;
		createdAt: string;
		order?: number;
	}

	// 状态管理
	const categories = ref<VideoCategory[]>([]);
	const isDialogOpen = ref(false);
	const isDeleteDialogOpen = ref(false);
	const isBatchConfirmDialogOpen = ref(false);
	const isEditing = ref(false);
	const currentCategory = ref<VideoCategory | null>(null);
	const selectedCategories = ref<string[]>([]);
	const isProcessing = ref(false);
	const currentBatchAction = ref<"enable" | "disable" | "delete">("delete");
	const batchActionTitle = ref("");
	const batchActionDescription = ref("");
	const currentPage = ref(1);
	const pageSize = ref(10);
	const totalCategories = ref(0);
	const totalPages = computed(() =>
		Math.ceil(totalCategories.value / pageSize.value)
	);
	const searchQuery = ref("");

	const allSelected = computed({
		get: () => {
			if (categories.value.length === 0) return false;
			const selectedSet = new Set(selectedCategories.value);
			return categories.value.every((cat) => selectedSet.has(cat._id));
		},
		set: (value) => {
			selectedCategories.value = value
				? categories.value.map((c) => c._id)
				: [];
		},
	});

	const clearSelection = () => {
		selectedCategories.value = [];
	};

	const isIndeterminate = computed(() => {
		return selectedCategories.value.length > 0 && !allSelected.value;
	});

	const isCategorySelected = (id: string) => {
		return selectedCategories.value.includes(id);
	};

	// 表单数据
	const form = ref({
		name: "",
		value: "",
		status: 1,
	});

	// 初始化加载数据
	onMounted(() => {
		fetchCategories();
	});

	// 获取分类列表
	const fetchCategories = async () => {
		try {
			const params = {
				page: currentPage.value,
				limit: pageSize.value,
				search: searchQuery.value,
			};
			const response = await axios.get(
				`${import.meta.env.VITE_APP_URL}/video/categories`,
				{
					params,
				}
			);
			const data = await response.data;
			if (data.success) {
				categories.value = data.data.map(
					(item: VideoCategory, index: number) => ({
						...item,
						order: item.order !== undefined ? item.order : index + 1,
					})
				);
				totalCategories.value = data.total;
			} else {
				throw new Error(data.message || "获取分类失败");
			}
		} catch (error: any) {
			toast.error("错误", {
				description: error.message,
			});
		}
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
			fetchCategories();
		}, 500) // 500ms 防抖延迟
	);

	const handlePageChange = (page: number) => {
		currentPage.value = page;
		fetchCategories();
	};

	const handlePageSizeChange = () => {
		currentPage.value = 1;
		fetchCategories();
	};

	// 拖拽排序处理
	const onDragEnd = async () => {
		const orderedIds = categories.value.map((item) => item._id);

		try {
			const response = await axios.put(
				`${import.meta.env.VITE_APP_URL}/video/categories/order`,
				{
					orderedIds,
				}
			);

			if (response.data.success) {
				await fetchCategories();
			}
		} catch (error) {
			console.error("更新排序失败:", error);
			await fetchCategories();
		}
	};

	// 打开添加对话框
	const openAddDialog = () => {
		isEditing.value = false;
		form.value = { name: "", value: "", status: 1 };
		isDialogOpen.value = true;
	};

	// 打开编辑对话框
	const openEditDialog = (category: VideoCategory) => {
		isEditing.value = true;
		currentCategory.value = category;
		form.value = {
			name: category.name,
			value: category.value,
			status: category.status ? 1 : 0,
		};
		isDialogOpen.value = true;
	};

	// 提交表单
	const submitForm = async () => {
		if (!form.value.name.trim()) {
			toast.error("错误", {
				description: "分类名称不能为空",
			});
			return;
		}
		if (!form.value.value.trim()) {
			toast.error("错误", {
				description: "分类路由不能为空",
			});
			return;
		}

		try {
			if (isEditing.value && currentCategory.value) {
				// 更新分类
				const response = await fetch(
					`${import.meta.env.VITE_APP_URL}/video/categories/${
						currentCategory.value._id
					}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(form.value),
					}
				);

				const data = await response.json();
				if (!data.success) {
					throw new Error(data.message || "更新分类失败");
				}

				toast.success("成功", {
					description: "分类更新成功",
				});
			} else {
				// 添加分类
				const response = await fetch(
					`${import.meta.env.VITE_APP_URL}/video/categories`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							...form.value,
							order: categories.value.length + 1,
						}),
					}
				);

				const data = await response.json();
				if (!data.success) {
					throw new Error(data.message || "添加分类失败");
				}

				toast.success("成功", {
					description: "分类添加成功",
				});
			}

			await fetchCategories();
			isDialogOpen.value = false;
		} catch (error: any) {
			toast.error("错误", {
				description: error.message,
			});
		}
	};

	// 打开删除对话框
	const openDeleteDialog = (category: VideoCategory) => {
		currentCategory.value = category;
		isDeleteDialogOpen.value = true;
	};

	// 确认删除
	const confirmDelete = async () => {
		if (!currentCategory.value) return;

		try {
			const response = await fetch(
				`${import.meta.env.VITE_APP_URL}/video/categories/${
					currentCategory.value._id
				}`,
				{
					method: "DELETE",
				}
			);

			const data = await response.json();
			if (!data.success) {
				throw new Error(data.message || "删除分类失败");
			}

			toast.success("成功", {
				description: "分类已删除",
			});

			await fetchCategories();
			isDeleteDialogOpen.value = false;
			currentCategory.value = null;
		} catch (error: any) {
			toast.error("错误", {
				description: error.message,
			});
		}
	};

	// 单个分类的选择切换
	const toggleCategorySelection = (id: string) => {
		const newSelected = [...selectedCategories.value];
		const index = newSelected.indexOf(id);

		if (index === -1) {
			newSelected.push(id);
		} else {
			newSelected.splice(index, 1);
		}

		selectedCategories.value = newSelected;
	};

	// 批量启用选中的分类
	const batchEnableSelected = () => {
		if (selectedCategories.value.length === 0) {
			toast.warning("提示", {
				description: "请至少选择一个分类",
			});
			return;
		}
		currentBatchAction.value = "enable";
		batchActionTitle.value = "确认启用";
		batchActionDescription.value = `您确定要启用选中的 ${selectedCategories.value.length} 个分类吗？`;
		isBatchConfirmDialogOpen.value = true;
	};

	// 批量禁用选中的分类
	const batchDisableSelected = () => {
		if (selectedCategories.value.length === 0) {
			toast.warning("提示", {
				description: "请至少选择一个分类",
			});
			return;
		}
		currentBatchAction.value = "disable";
		batchActionTitle.value = "确认禁用";
		batchActionDescription.value = `您确定要禁用选中的 ${selectedCategories.value.length} 个分类吗？`;
		isBatchConfirmDialogOpen.value = true;
	};

	// 批量删除选中的分类
	const batchDeleteSelected = () => {
		if (selectedCategories.value.length === 0) {
			toast.warning("提示", {
				description: "请至少选择一个分类",
			});
			return;
		}
		currentBatchAction.value = "delete";
		batchActionTitle.value = "确认删除";
		batchActionDescription.value = `您确定要删除选中的 ${selectedCategories.value.length} 个分类吗？此操作不可撤销。`;
		isBatchConfirmDialogOpen.value = true;
	};

	// 确认批量操作
	const confirmBatchAction = async () => {
		if (selectedCategories.value.length === 0) return;

		isProcessing.value = true;
		isBatchConfirmDialogOpen.value = false;

		try {
			let successCount = 0;
			let errorCount = 0;

			for (const id of selectedCategories.value) {
				try {
					let response;

					if (currentBatchAction.value === "delete") {
						response = await fetch(
							`${import.meta.env.VITE_APP_URL}/video/categories/${id}`,
							{ method: "DELETE" }
						);
					} else {
						response = await fetch(
							`${import.meta.env.VITE_APP_URL}/video/categories/${id}`,
							{
								method: "PUT",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									status: currentBatchAction.value === "enable",
								}),
							}
						);
					}

					const data = await response.json();
					if (data.success) {
						successCount++;
					} else {
						errorCount++;
					}
				} catch {
					errorCount++;
				}
			}

			let message = "";
			if (successCount > 0) {
				message = `成功${getActionVerb()} ${successCount} 个分类`;
			}
			if (errorCount > 0) {
				message += `${message ? "，" : ""}${errorCount} 个分类操作失败`;
			}

			if (message) {
				toast.success("操作完成", {
					description: message,
				});
			}

			// 重置选择状态并刷新列表
			selectedCategories.value = [];
			await fetchCategories();
		} catch (error: any) {
			toast.error("错误", {
				description: error.message || "批量操作过程中出错",
			});
		} finally {
			isProcessing.value = false;
		}
	};

	// 获取操作动词
	const getActionVerb = () => {
		switch (currentBatchAction.value) {
			case "enable":
				return "启用";
			case "disable":
				return "禁用";
			case "delete":
				return "删除";
			default:
				return "操作";
		}
	};

	// 切换状态
	const toggleStatus = async (category: VideoCategory) => {
		try {
			const newStatus = !category.status;
			const response = await fetch(
				`${import.meta.env.VITE_APP_URL}/video/categories/${category._id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status: newStatus }),
				}
			);

			const data = await response.json();
			if (!data.success) {
				throw new Error(data.message || "更新状态失败");
			}

			toast.success("成功", {
				description: `分类已${newStatus ? "启用" : "禁用"}`,
			});

			await fetchCategories();
		} catch (error: any) {
			toast.error("错误", {
				description: error.message,
			});
		}
	};

	// 格式化日期
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};
</script>

<style scoped>
	.container {
		max-width: 1200px;
	}

	.drag-handle {
		cursor: move;
	}

	.sortable-ghost {
		opacity: 0.5;
	}

	tbody tr {
		display: table-row;
	}
</style>
