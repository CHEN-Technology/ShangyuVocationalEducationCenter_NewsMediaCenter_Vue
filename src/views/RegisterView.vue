<template>
	<div class="flex flex-col items-center gap-10 w-[30dvw] justify-center">
		<div class="text-3xl font-bold">注册</div>
		<AutoForm
			class="w-2/3 space-y-6 flex flex-col"
			:schema="schemaReg"
			:field-config="{
				username: {
					label: '用户名',
					inputProps: {
						placeholder: '请输入用户名',
					},
				},
				password: {
					label: '密码',
					inputProps: {
						type: 'password',
						placeholder: '请输入密码',
					},
				},
			}"
			@submit="loginAndRegStore.onSubmit(form.values, false)"
			:form="form"
		>
			<Button type="submit" class="cursor-pointer"> 注册 </Button>
		</AutoForm>
		<AlertDialog
			:config="loginAndRegStore.config"
			:sendData="loginAndRegStore.sendData"
		/>
	</div>
</template>

<script setup lang="ts">
	import { AutoForm } from "@/components/ui/auto-form";
	import { Button } from "@/components/ui/button";
	import AlertDialog from "@/components/AlertDialog.vue";
	import { useLoginAndRegStore } from "@/stores/LoginAndReg";
	import { toTypedSchema } from "@vee-validate/zod";
	import { useForm } from "vee-validate";
	import * as z from "zod";
	import { useRouter } from "vue-router";
	import { watchEffect } from "vue";
	import { storeToRefs } from "pinia";

	const router = useRouter();

	const loginAndRegStore = useLoginAndRegStore();

	const { isRegister } = storeToRefs(loginAndRegStore);

	const schemaReg = z.object({
		identity: z.enum(["学生", "教师"]).describe("身份").default("学生"),
		username: z
			.string({
				required_error: "用户名是必填项",
			})
			.min(2, {
				message: "用户名必须至少 2 个字符。",
			}),
		password: z
			.string({
				required_error: "密码是必填项",
			})
			.min(6, {
				message: "密码必须至少 6 个字符。",
			}),
	});

	const form = useForm({
		validationSchema: toTypedSchema(schemaReg),
	});

	watchEffect(() => {
		if (loginAndRegStore.config.isClick && isRegister.value) {
			router.push("/login");
			loginAndRegStore.config.isClick = false;
		}

		if (!isRegister.value) {
			if (loginAndRegStore.config.isClick) {
				loginAndRegStore.config.isClick = false;
				loginAndRegStore.config.isOpen = false;
				loginAndRegStore.config.description = "";
				loginAndRegStore.config.title = "";
			}
		}
	});
</script>
