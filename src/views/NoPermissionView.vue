<template>
	<div
		class="min-h-screen bg-background flex flex-col items-center justify-center p-4"
	>
		<Card class="w-full max-w-md">
			<CardHeader class="text-center">
				<div class="flex justify-center mb-6">
					<component :is="Ban" color="red" size="32" />
				</div>

				<CardTitle class="text-2xl">访问受限</CardTitle>
				<CardDescription class="text-base mt-2">
					您没有权限访问此页面或执行此操作
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-3">
				<Button @click="goBack" class="w-full gap-2 cursor-pointer">
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
						<path d="m12 19-7-7 7-7" />
						<path d="M19 12H5" />
					</svg>
					返回上一页
				</Button>

				<Button @click="goHome" variant="outline" class="w-full cursor-pointer">
					返回首页
				</Button>
			</CardContent>

			<CardFooter class="flex flex-col items-center pt-6 border-t">
				<p class="text-sm text-muted-foreground">需要帮助？请联系管理员</p>
				<a
					:href="`mailto:${adminEmail}`"
					class="text-sm font-medium hover:underline mt-1"
				>
					{{ adminEmail }}
				</a>
			</CardFooter>
		</Card>
	</div>
</template>

<script setup>
	import { useRouter } from "vue-router";
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter,
	} from "@/components/ui/card";
	import { Button } from "@/components/ui/button";
	import { Ban } from "lucide-vue-next";

	const router = useRouter();

	const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

	const goBack = () => {
		router.go(-1);
	};

	const goHome = () => {
		router.push("/");
	};
</script>
