<template>
	<HoverCard>
		<HoverCardTrigger><slot name="avatar"></slot></HoverCardTrigger>
		<HoverCardContent>
			<slot name="avatarMenu"></slot>
		</HoverCardContent>
	</HoverCard>
</template>

<script setup lang="ts">
	import {
		HoverCard,
		HoverCardContent,
		HoverCardTrigger,
	} from "@/components/ui/hover-card";
</script>
