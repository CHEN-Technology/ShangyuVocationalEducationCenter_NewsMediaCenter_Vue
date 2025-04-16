import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_APP_URL,
});

axiosInstance.interceptors.response.use(
	(response) => {
		if (response.data && response.data.success) {
			return response.data;
		}
	},
	(error) => {
		console.log("error: ", error);
		return Promise.reject(error);
	}
);

export default axiosInstance;
