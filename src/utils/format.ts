export function formatPath(path: string) {
	return `${import.meta.env.VITE_APP_URL}/${path.replace(/\\/g, "/")}`;
}

export function formatNumber(num: number) {
	return num >= 10000 ? `${(num / 10000).toFixed(1)}万` : num;
}

export function formatDuration(duration: number) {
	if (!duration || duration <= 0) return "00:00";

	const minutes = Math.floor(duration / 60);
	const seconds = Math.floor(duration % 60);

	// 使用padStart确保两位数显示
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatTime(seconds: number) {
	const mins = Math.floor(seconds / 60)
		.toString()
		.padStart(2, "0");
	const secs = Math.floor(seconds % 60)
		.toString()
		.padStart(2, "0");
	return `${mins}:${secs}`;
}

export function formatDate(dateString: Date) {
	return new Date()
		.toLocaleDateString("zh-CN", {
			month: "numeric",
			day: "numeric",
		})
		.replace("/", "-");
}
