<template>
	<div class="flex flex-col items-center gap-10 w-[30dvw] justify-center">
		<div class="text-3xl font-bold">登录</div>
		<AutoForm
			class="w-2/3 space-y-6 flex flex-col"
			:schema="schemaLogin"
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
			@submit="loginAndRegStore.onSubmit(form.values, true)"
			:form="form"
		>
			<Button type="submit" class="cursor-pointer"> 登录 </Button>
		</AutoForm>
		<div>
			还没有账号？<span
				@click="router.push('/register')"
				class="text-gray-500 hover:text-white cursor-pointer"
			>
				去注册></span
			>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { AutoForm } from "@/components/ui/auto-form";
	import { Button } from "@/components/ui/button";
	import { useLoginAndRegStore } from "@/stores/LoginAndReg";
	import { toTypedSchema } from "@vee-validate/zod";
	import { useForm } from "vee-validate";
	import * as z from "zod";
	import { useRouter } from "vue-router";
	import { watchEffect } from "vue";
	import { storeToRefs } from "pinia";
	import { useUserStore } from "@/stores/User";

	const router = useRouter();
	const loginAndRegStore = useLoginAndRegStore();
	const userStore = useUserStore();

	const { isLogin } = storeToRefs(userStore);

	const schemaLogin = z.object({
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
		validationSchema: toTypedSchema(schemaLogin),
	});

	watchEffect(() => {
		if (isLogin.value) {
			router.push("/");
		}
	});
</script>
