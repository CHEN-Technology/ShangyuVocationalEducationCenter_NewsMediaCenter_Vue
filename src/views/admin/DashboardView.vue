<template>
	<div class="main">
		<div class="grid grid-cols-4 gap-4 p-8">
			<!-- 视频总数卡片 -->
			<Card>
				<CardHeader>
					<CardTitle>视频总数</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-4xl font-bold">{{ videoCount }}</div>
					<p class="text-sm text-muted-foreground">
						{{ videoIncrease }}
					</p>
				</CardContent>
			</Card>

			<!-- 今日播放量卡片 -->
			<Card>
				<CardHeader>
					<CardTitle>今日播放量</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-4xl font-bold">235,678</div>
					<p class="text-sm text-muted-foreground">较昨日增加15.3%</p>
				</CardContent>
			</Card>

			<!-- 用户活跃度卡片 -->
			<Card>
				<CardHeader>
					<CardTitle>活跃用户</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-4xl font-bold">45,231</div>
					<p class="text-sm text-muted-foreground">较上周增加18.2%</p>
				</CardContent>
			</Card>

			<!-- 总收入卡片 -->
			<Card>
				<CardHeader>
					<CardTitle>总收入</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-4xl font-bold">$45,231.89</div>
					<p class="text-sm text-muted-foreground">较上月增加180.1%</p>
				</CardContent>
			</Card>

			<!-- 视频数据图表 -->
			<div class="col-span-3">
				<Card>
					<CardHeader>
						<CardTitle>视频播放趋势</CardTitle>
					</CardHeader>
					<CardContent> </CardContent>
				</Card>
			</div>

			<!-- 最近上传视频列表 -->
			<div class="col-span-1">
				<Card>
					<CardHeader>
						<CardTitle>最近上传</CardTitle>
					</CardHeader>
					<CardContent> </CardContent>
				</Card>
			</div>
		</div>
	</div>
	<Toaster position="top-center" richColors />
</template>

<script setup lang="ts">
	import { ref } from "vue";

	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
	} from "@/components/ui/card";
	import axios from "axios";
	import { toast, Toaster } from "vue-sonner";
	import { number } from "zod";

	const videoCount = ref(0);
	const videoIncrease = ref("");

	axios
		.get(`${import.meta.env.VITE_APP_URL}/video`)
		.then((res) => {
			if (res.data.success) {
				videoCount.value = res.data.total;
			}
		})
		.catch((err) => {
			toast.error("获取视频总数失败", {
				description: err.message,
			});
		});

	axios.get(`${import.meta.env.VITE_APP_URL}/system`).then((res) => {
		if (res.data.success) {
			if (
				videoCount.value - res.data.system[0].monthlyVideoStats[0].count ==
				0
			) {
				videoIncrease.value = "较上月增加 0 %";
			} else if (res.data.system[0].monthlyVideoStats[0].count == 0) {
				videoIncrease.value = "未来拥有无限的可能哦~";
			} else {
				videoIncrease.value = `较上月增加 ${(
					((Number(videoCount.value) -
						res.data.system[0].monthlyVideoStats[0].count) /
						res.data.system[0].monthlyVideoStats[0].count) *
					0.1
				).toFixed(2)} %`;
			}

			console.log(videoIncrease.value);
		}
	});
</script>

<style scoped></style>
