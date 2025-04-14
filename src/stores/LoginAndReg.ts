import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { useUserStore } from "./User";

export const useLoginAndRegStore = defineStore("loginAndReg", () => {
	const config = ref({
		isOpen: false,
		title: "",
		description: "",
		isShowCancel: false,
		isClick: false,
	});

	const userStore = useUserStore();
	const { loadUserInfo } = userStore;
	const isRegister = ref(false);

	function onSubmit(values: Record<string, any>, isLogin: boolean) {
		let identity = 2;

		switch (values.identity) {
			case "管理员":
				identity = 0;
				break;
			case "教师":
				identity = 1;
				break;
			case "学生":
				identity = 2;
				break;
			default:
				identity = 2;
				break;
		}

		if (isLogin) {
			axios
				.post(`${import.meta.env.VITE_APP_URL}/login`, {
					identity: identity,
					username: values.username,
					password: values.password,
				})
				.then((res) => {
					config.value.title = res.data.status;
					config.value.description = res.data.message;
					config.value.isOpen = true;
					loadUserInfo();
				})
				.catch((err) => {
					config.value.title = err.response.data.error;
					config.value.description = err.code;
					config.value.isOpen = true;
				});
		} else {
			axios
				.post(`${import.meta.env.VITE_APP_URL}/register`, {
					identity: identity,
					username: values.username,
					password: values.password,
				})
				.then((res) => {
					config.value.title = res.data.status;
					config.value.description = res.data.message;
					config.value.isOpen = true;
					if (res.data.status === "success") {
						isRegister.value = true;
					}
				})
				.catch((err) => {
					config.value.title = err.data.status;
					config.value.description = err.data.message;
					config.value.isOpen = true;
				});
		}
	}

	function sendData() {
		config.value.isOpen = false;
		config.value.isClick = true;
	}

	return {
		config,
		onSubmit,
		sendData,
		isRegister,
	};
});
