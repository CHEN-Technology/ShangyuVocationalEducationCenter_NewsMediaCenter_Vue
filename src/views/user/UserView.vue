<script setup lang="ts">
	import { ref, onMounted } from "vue";
	import { useRoute } from "vue-router";
	// import { getUserById } from "@/api/user";
	import { Button } from "@/components/ui/button";
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
	} from "@/components/ui/card";
	// import UserAvatar from "@/components/user/UserAvatar.vue";

	interface User {
		id: string;
		username: string;
		avatar: string;
		identity: number;
		registerTime: string;
		lastLoginTime: string;
	}

	interface PaginatedUsers {
		data: User[];
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}

	const route = useRoute();
	const userId = ref<string>(route.params.id as string);
	const user = ref<any>(null);
	const isLoading = ref<boolean>(false);

	const getUserById = async (id: string): Promise<User> => {
		const response = await axios.get(`${API_BASE_URL}/users/${id}`);
		return response.data;
	};

	const getUsers = async (
		page: number = 1,
		limit: number = 10,
		search?: string,
		identity?: number
	): Promise<PaginatedUsers> => {
		const response = await axios.get(`${API_BASE_URL}/users`, {
			params: { page, limit, search, identity },
		});
		return response.data;
	};

	const updateUser = async (id: string, data: Partial<User>) => {
		const response = await axios.put(`${API_BASE_URL}/users/update`, {
			id,
			...data,
		});
		return response.data;
	};

	const resetPassword = async (id: string) => {
		const response = await axios.patch(`${API_BASE_URL}/users/resetPassword`, {
			id,
		});
		return response.data;
	};

	onMounted(async () => {
		isLoading.value = true;
		try {
			user.value = await getUserById(userId.value);
		} catch (error) {
			console.error("Failed to fetch user:", error);
		} finally {
			isLoading.value = false;
		}
	});
</script>

<template>
	<div class="container mx-auto px-4 py-8">
		<div v-if="isLoading">Loading...</div>

		<div v-else-if="user" class="space-y-6">
			<Card>
				<CardHeader class="flex flex-row items-center justify-between">
					<CardTitle>个人信息</CardTitle>
					<Button variant="outline">编辑资料</Button>
				</CardHeader>
				<CardContent class="flex items-center gap-6">
					<UserAvatar :user="user" size="lg" />

					<div class="space-y-2">
						<h2 class="text-2xl font-bold">{{ user.username }}</h2>
						<p class="text-gray-500">
							<span
								>注册时间:
								{{ new Date(user.registerTime).toLocaleDateString() }}</span
							>
							<span class="mx-2">|</span>
							<span
								>最后登录:
								{{ new Date(user.lastLoginTime).toLocaleString() }}</span
							>
						</p>
						<div class="flex gap-2">
							<Button variant="outline" size="sm">关注</Button>
							<Button variant="outline" size="sm">私信</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>统计数据</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="flex justify-between">
								<span>上传视频</span>
								<span class="font-bold">42</span>
							</div>
							<div class="flex justify-between">
								<span>获赞数</span>
								<span class="font-bold">1,234</span>
							</div>
							<div class="flex justify-between">
								<span>粉丝数</span>
								<span class="font-bold">567</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card class="md:col-span-2">
					<CardHeader>
						<CardTitle>最近上传</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
							<!-- 视频缩略图列表 -->
							<div
								v-for="i in 6"
								:key="i"
								class="aspect-video bg-gray-200 rounded"
							></div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>

		<div v-else class="text-center py-12">
			<p class="text-gray-500">用户不存在</p>
		</div>
	</div>
</template>
