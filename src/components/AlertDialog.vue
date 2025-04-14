<template>
	<AlertDialog :open="config.isOpen">
		<!-- <AlertDialogTrigger>Open</AlertDialogTrigger> -->
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{{ config.title }}</AlertDialogTitle>
				<AlertDialogDescription>
					{{ config.description }}
				</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel v-show="config.isShowCancel">取消</AlertDialogCancel>
				<AlertDialogAction @click="sendData(isClick)">确认</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</template>

<script setup lang="ts">
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger,
	} from "@/components/ui/alert-dialog";
	import { ref } from "vue";

	const props = defineProps(["config", "sendData"]);
	const isClick = ref(false);
</script>
