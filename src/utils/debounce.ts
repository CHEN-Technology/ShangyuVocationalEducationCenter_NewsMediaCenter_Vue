export default function debounce(fn: Function, delay: number) {
	let timer: number | null = null; // 使用 number 类型代替 NodeJS.Timeout
	return (...args: any[]) => {
		if (timer !== null) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => fn(...args), delay) as unknown as number; // 强制类型转换
	};
}
