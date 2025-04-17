<template>
	<div class="container mx-auto py-8 px-4">
		<!-- 标题和添加按钮 -->
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-2xl font-bold">用户管理</h1>
			<Button @click="openAddDialog" class="cursor-pointer">添加用户</Button>
		</div>

		<!-- 搜索和筛选区域 -->
		<div
			class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
		>
			<div class="relative w-full md:w-1/2">
				<Search
					class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
				/>
				<Input
					placeholder="搜索用户名..."
					class="pl-10 w-full"
					v-model="searchQuery"
					@keyup.enter="handleSearch"
				/>
			</div>
			<div class="flex items-center gap-4 w-full md:w-auto">
				<Select v-model="filterIdentity" @update:modelValue="fetchUsers">
					<SelectTrigger class="w-[150px]">
						<SelectValue placeholder="所有身份" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem :value="null">所有身份</SelectItem>
						<SelectItem :value="1">教师</SelectItem>
						<SelectItem :value="2">学生</SelectItem>
					</SelectContent>
				</Select>
				<Select v-model="pageSize" @update:modelValue="handlePageSizeChange">
					<SelectTrigger class="w-[120px]">
						<SelectValue placeholder="每页条数" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem :value="5">5条/页</SelectItem>
						<SelectItem :value="10">10条/页</SelectItem>
						<SelectItem :value="20">20条/页</SelectItem>
						<SelectItem :value="50">50条/页</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>

		<!-- 错误提示 -->
		<div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded">
			{{ error }}
		</div>

		<!-- 加载状态 -->
		<div v-if="loading" class="text-center py-8">加载中...</div>

		<!-- 用户表格 -->
		<div v-else>
			<div class="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead class="w-[100px]">ID</TableHead>
							<TableHead>用户名</TableHead>
							<TableHead>身份</TableHead>
							<TableHead>注册时间</TableHead>
							<TableHead>最后登录</TableHead>
							<TableHead class="text-right">操作</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow v-for="user in users" :key="user.id">
							<TableCell class="font-medium">{{ user.id }}</TableCell>
							<TableCell>{{ user.username }}</TableCell>
							<TableCell>
								<Badge :variant="getIdentityBadgeVariant(user.identity)">
									{{ getIdentityText(user.identity) }}
								</Badge>
							</TableCell>
							<TableCell>{{ formatDate(user.registerTime) }}</TableCell>
							<TableCell>{{ formatDate(user.lastLoginTime) }}</TableCell>
							<TableCell class="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger as-child>
										<Button variant="ghost" class="h-8 w-8 p-0 cursor-pointer">
											<MoreHorizontal class="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											@click="openEditDialog(user)"
											class="cursor-pointer"
										>
											<Pencil class="mr-2 h-4 w-4" />
											<span>编辑信息</span>
										</DropdownMenuItem>
										<DropdownMenuItem
											@click="openResetPasswordDialog(user.id)"
											class="cursor-pointer"
										>
											<Key class="mr-2 h-4 w-4" />
											<span>重置密码</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											@click="openDeleteDialog(user.id)"
											class="cursor-pointer"
										>
											<Trash2 class="mr-2 h-4 w-4" />
											<span class="text-red-600">删除用户</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<!-- 分页控制 -->
			<div class="flex items-center justify-between px-2 mt-4">
				<div class="text-sm text-muted-foreground">
					显示 {{ (currentPage - 1) * pageSize + 1 }} 到
					{{ Math.min(currentPage * pageSize, totalUsers) }} 条，共
					{{ totalUsers }} 条
				</div>
				<div class="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						@click="goToPage(1)"
						:disabled="currentPage === 1"
						class="cursor-pointer"
					>
						首页
					</Button>
					<Button
						variant="outline"
						size="sm"
						@click="prevPage"
						:disabled="currentPage === 1"
						class="cursor-pointer"
					>
						上一页
					</Button>
					<Button
						variant="outline"
						size="sm"
						@click="nextPage"
						:disabled="currentPage * pageSize >= totalUsers"
						class="cursor-pointer"
					>
						下一页
					</Button>
					<Button
						variant="outline"
						size="sm"
						@click="goToPage(totalPages)"
						:disabled="currentPage === totalPages"
						class="cursor-pointer"
					>
						末页
					</Button>
				</div>
			</div>
		</div>

		<!-- 添加/编辑用户对话框 -->
		<Dialog v-model:open="isDialogOpen">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{{
						currentUserId ? "编辑用户" : "添加用户"
					}}</DialogTitle>
					<DialogDescription>
						{{ currentUserId ? "修改用户信息" : "填写新用户信息" }}
					</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="username" class="text-right">用户名</Label>
						<Input id="username" v-model="form.username" class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="identity" class="text-right">身份</Label>
						<Select v-model="form.identity">
							<SelectTrigger class="col-span-3">
								<SelectValue placeholder="选择身份" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem :value="1">教师</SelectItem>
								<SelectItem :value="2">学生</SelectItem>
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
					<Button type="submit" @click="handleSubmit" class="cursor-pointer"
						>保存</Button
					>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		<!-- 重置密码对话框 -->
		<Dialog v-model:open="isResetPasswordDialogOpen">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>重置密码</DialogTitle>
					<DialogDescription>
						确定要将用户 "{{ selectedUserName }}" 的密码重置为 "123456" 吗？
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						@click="isResetPasswordDialogOpen = false"
						class="cursor-pointer"
					>
						取消
					</Button>
					<Button
						variant="destructive"
						@click="handleResetPassword"
						class="cursor-pointer"
					>
						确认重置
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>

		<!-- 删除确认对话框 -->
		<Dialog v-model:open="isDeleteDialogOpen">
			<DialogContent>
				<DialogHeader>
					<DialogTitle>确认删除</DialogTitle>
					<DialogDescription>
						确定要删除用户 "{{ selectedUserName }}" 吗？此操作不可撤销。
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						@click="isDeleteDialogOpen = false"
						class="cursor-pointer"
					>
						取消
					</Button>
					<Button
						variant="destructive"
						@click="handleDelete"
						class="cursor-pointer"
					>
						确认删除
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
	<Toaster position="top-center" richColors />
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted, computed, watch } from "vue";
	import { debounce } from "lodash-es";
	import { toast, Toaster } from "vue-sonner";
	import axios from "axios";
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { Badge } from "@/components/ui/badge";
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
	} from "@/components/ui/table";
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
	} from "@/components/ui/dialog";
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger,
		DropdownMenuSeparator,
	} from "@/components/ui/dropdown-menu";
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue,
	} from "@/components/ui/select";
	import { MoreHorizontal, Pencil, Trash2, Key, Search } from "lucide-vue-next";

	// 用户类型定义
	interface User {
		id: string;
		_id: string;
		username: string;
		identity: number;
		avatar: string;
		registerTime: string;
		lastLoginTime: string;
	}

	// 状态管理
	const users = ref<User[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);
	const searchQuery = ref("");
	const filterIdentity = ref<number | null>(null);
	const currentPage = ref(1);
	const pageSize = ref(10);
	const totalUsers = ref(0);
	const selectedUserName = ref("");

	// 表单状态
	const form = reactive({
		username: "",
		identity: 1,
		password: "123456", // 默认密码
	});

	// 对话框状态
	const isDialogOpen = ref(false);
	const currentUserId = ref<string | null>(null);
	const isDeleteDialogOpen = ref(false);
	const isResetPasswordDialogOpen = ref(false);

	// 计算属性
	const totalPages = computed(() =>
		Math.ceil(totalUsers.value / pageSize.value)
	);

	// 获取用户列表
	const fetchUsers = async () => {
		loading.value = true;
		error.value = null;
		try {
			const params = {
				page: currentPage.value,
				pageSize: pageSize.value,
				search: searchQuery.value,
				identity: filterIdentity.value,
				excludeIdentity: 0, // 添加这个参数排除管理员
			};

			const response = await axios.get(
				`${import.meta.env.VITE_APP_URL}/users`,
				{ params }
			);

			// 前端也可以再过滤一次确保
			users.value = (response.data.data || response.data).filter(
				(user: User) => user.identity !== 0
			);
			totalUsers.value = response.data.total || response.data.length;
		} catch (err) {
			error.value = "获取用户列表失败";
			console.error(err);
		} finally {
			loading.value = false;
		}
	};

	// 初始化加载
	onMounted(() => {
		fetchUsers();
	});

	// 搜索处理
	const handleSearch = () => {
		currentPage.value = 1;
		fetchUsers();
	};

	// 分页控制
	const nextPage = () => {
		if (currentPage.value < totalPages.value) {
			currentPage.value++;
			fetchUsers();
		}
	};

	const prevPage = () => {
		if (currentPage.value > 1) {
			currentPage.value--;
			fetchUsers();
		}
	};

	const goToPage = (page: number) => {
		currentPage.value = page;
		fetchUsers();
	};

	const handlePageSizeChange = () => {
		currentPage.value = 1;
		fetchUsers();
	};

	// 打开添加用户对话框
	const openAddDialog = () => {
		currentUserId.value = null;
		form.username = "";
		form.identity = 1;
		form.password = "123456";
		isDialogOpen.value = true;
	};

	// 打开编辑用户对话框
	const openEditDialog = (user: User) => {
		currentUserId.value = user.id;
		form.username = user.username;
		form.identity = user.identity;
		selectedUserName.value = user.username;
		isDialogOpen.value = true;
	};

	// 打开重置密码对话框
	const openResetPasswordDialog = (userId: string) => {
		const user = users.value.find((u) => u.id === userId);
		if (user) {
			currentUserId.value = userId;
			selectedUserName.value = user.username;
			isResetPasswordDialogOpen.value = true;
		}
	};

	// 处理重置密码
	const handleResetPassword = async () => {
		if (!currentUserId.value) return;

		try {
			await axios.patch(`${import.meta.env.VITE_APP_URL}/users/resetPassword`, {
				id: currentUserId.value,
			});
			toast.success(`用户 "${selectedUserName.value}" 的密码已重置为 123456`);
			await invalidateUserToken(currentUserId.value);
			isResetPasswordDialogOpen.value = false;
			fetchUsers();
		} catch (err) {
			toast.error("重置密码失败");
			console.error(err);
		}
	};

	// 提交表单 (添加/编辑)
	const handleSubmit = async () => {
		if (!form.username) {
			toast.error("请填写用户名");
			return;
		}

		try {
			if (currentUserId.value) {
				// 更新用户
				await axios.put(`${import.meta.env.VITE_APP_URL}/users/update`, {
					...form,
					id: currentUserId.value,
				});
				toast.success("用户信息已更新");
				await invalidateUserToken(currentUserId.value);
			} else {
				// 添加用户
				if (!form.password) {
					toast.error("请设置密码");
					return;
				}
				await axios.post(`${import.meta.env.VITE_APP_URL}/users/add`, form);
				toast.success("用户已添加，默认密码为123456，请及时修改密码");
			}

			// 刷新用户列表
			await fetchUsers();
			isDialogOpen.value = false;
		} catch (err: any) {
			const errorMsg = err.response?.data?.message || "操作失败";
			toast.error(errorMsg);
			console.error(err);
		}
	};

	// 打开删除确认对话框
	const openDeleteDialog = (userId: string) => {
		const user = users.value.find((u) => u.id === userId);
		if (user) {
			currentUserId.value = userId;
			selectedUserName.value = user.username;
			isDeleteDialogOpen.value = true;
		}
	};

	// 删除用户
	const handleDelete = async () => {
		if (!currentUserId.value) return;

		try {
			await axios.delete(`${import.meta.env.VITE_APP_URL}/users/delete`, {
				data: { id: currentUserId.value },
			});
			toast.success(`用户 "${selectedUserName.value}" 已删除`);
			isDeleteDialogOpen.value = false;

			// 如果删除的是当前页的最后一条记录且不是第一页，则返回上一页
			if (users.value.length === 1 && currentPage.value > 1) {
				currentPage.value--;
			}

			// 刷新用户列表
			await fetchUsers();
		} catch (err) {
			toast.error("删除用户失败");
			console.error(err);
		}
	};

	// 将身份标识转换为可读文本
	const getIdentityText = (identity: number) => {
		switch (identity) {
			case 0:
				return "管理员";
			case 1:
				return "教师";
			case 2:
				return "学生";
			default:
				return "未知身份";
		}
	};

	// 获取身份对应的Badge样式
	const getIdentityBadgeVariant = (identity: number) => {
		switch (identity) {
			case 0:
				return "destructive";
			case 1:
				return "default";
			case 2:
				return "secondary";
			default:
				return "outline";
		}
	};

	// 格式化日期
	const formatDate = (dateString: string) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	const invalidateUserToken = async (userId: string) => {
		try {
			await axios.post(
				`${import.meta.env.VITE_APP_URL}/auth/invalidate-token`,
				{
					userId,
				}
			);
		} catch (err) {
			console.error("使令牌失效失败:", err);
			// 可以选择不显示错误，因为主要操作已经成功
		}
	};

	const debouncedSearch = debounce(() => {
		handleSearch();
	}, 500); // 500毫秒延迟

	// 监听 searchQuery 的变化
	watch(searchQuery, () => {
		debouncedSearch();
	});
</script>
