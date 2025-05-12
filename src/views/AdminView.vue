<template>
	<SidebarProvider class="h-fit" ref="sidebarProvider">
		<AppSidebar />
		<SidebarInset>
			<header
				class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 w-full border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50"
			>
				<div class="flex items-center gap-4 h-4 z-50">
					<SidebarTrigger class="ml-4 cursor-pointer" />
					<Separator orientation="vertical" class="mr-2 h-4" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem v-for="(item, index) in breadcrumbs" :key="index">
								<template v-if="index === breadcrumbs.length - 1">
									<BreadcrumbPage>{{ item.title }}</BreadcrumbPage>
								</template>
								<template v-else>
									<BreadcrumbLink
										@click="routerTransition(item.path)"
										class="cursor-pointer"
									>
										{{ item.title }}
									</BreadcrumbLink>
								</template>
								<BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<RouterView />
		</SidebarInset>
	</SidebarProvider>
</template>

<script setup lang="ts">
	import { ref, watch } from "vue";
	import {
		SidebarProvider,
		SidebarTrigger,
		SidebarInset,
	} from "@/components/ui/sidebar";
	import {
		Breadcrumb,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbList,
		BreadcrumbPage,
		BreadcrumbSeparator,
	} from "@/components/ui/breadcrumb";
	import AppSidebar from "@/components/AppSidebar.vue";
	import { Separator } from "@/components/ui/separator";
	import { RouterView, useRouter, useRoute } from "vue-router";

	interface BreadcrumbItem {
		title: string;
		path: string;
	}

	const route = useRoute();
	const router = useRouter();
	const breadcrumbs = ref<BreadcrumbItem[]>([]);

	const updateBreadcrumbs = () => {
		const matchedRoutes = route.matched.filter(
			(record) => record.meta?.breadcrumb
		);
		breadcrumbs.value = matchedRoutes.map((record) => ({
			title: record.meta.breadcrumb as string,
			path: record.path,
		}));
	};

	// 初始更新
	updateBreadcrumbs();

	// 监听路由变化
	watch(() => route.path, updateBreadcrumbs);

	function routerTransition(url: string) {
		if (!url) return;

		// 检查浏览器是否支持 View Transitions API
		if (!document.startViewTransition) {
			router.push(url);
			return;
		}

		document.startViewTransition(() => {
			router.push(url);
		});
	}
</script>

<style scoped></style>
