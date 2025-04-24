<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="ghost" class="cursor-pointer">
				<Icon
					icon="radix-icons:moon"
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Icon
					icon="radix-icons:sun"
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">切换主题</span>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuItem @click="mode = 'light'" class="cursor-pointer">
				明亮
			</DropdownMenuItem>
			<DropdownMenuItem @click="mode = 'dark'" class="cursor-pointer">
				暗黑
			</DropdownMenuItem>
			<DropdownMenuItem @click="mode = 'auto'" class="cursor-pointer">
				跟随系统
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>

<script setup lang="ts">
	import { Button } from "@/components/ui/button";
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger,
	} from "@/components/ui/dropdown-menu";
	import { Icon } from "@iconify/vue";
	import { useColorMode } from "@vueuse/core";

	// Pass { disableTransition: false } to enable transitions
	const mode = useColorMode();
</script>
