<script setup lang="ts">
	import { Button } from "@/components/ui/button";

	import {
		Pagination,
		PaginationEllipsis,
		PaginationFirst,
		PaginationLast,
		PaginationContent,
		PaginationItem,
		PaginationNext,
		PaginationPrevious,
	} from "@/components/ui/pagination";

	const props = defineProps({
		totalPages: {
			type: Number,
			required: true,
		},
		currentPage: {
			type: Number,
			required: true,
			default: 1,
		},
		function: {
			type: Function,
			required: true,
		},
	});
</script>

<template>
	<Pagination
		v-slot="{ page }"
		:items-per-page="1"
		:total="props.totalPages"
		:sibling-count="1"
		show-edges
		:default-page="currentPage"
	>
		<PaginationContent v-slot="{ items }" class="flex items-center gap-1">
			<PaginationFirst />
			<PaginationPrevious />

			<template v-for="(item, index) in items">
				<PaginationItem
					v-if="item.type === 'page'"
					:key="index"
					:value="item.value"
					as-child
				>
					<Button
						class="w-9 h-9 p-0"
						:variant="item.value === page ? 'default' : 'outline'"
						@click="props.function(item.value)"
					>
						{{ item.value }}
					</Button>
				</PaginationItem>
				<PaginationEllipsis v-else :key="item.type" :index="index" />
			</template>

			<PaginationNext />
			<PaginationLast />
		</PaginationContent>
	</Pagination>
</template>
