/**
 *
 * @param {File} file 文件对象
 * @param {Number} chunkSize 切片大小
 * @param {String} filename 文件名
 * @returns 切片数组
 */
export default function createChunks(
	file: File,
	chunkSize: number,
	filename: string
) {
	// 兼用处理
	filename = filename || file.name;

	const chunks = [];
	// 计算切片数量
	const count = Math.ceil(file.size / chunkSize);
	// 循环切片
	for (let i = 0; i < count; i++) {
		// 获取到切片
		const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
		// 拼接对应的切片文件名
		const chunkFilename = `${i}-${filename}`;
		chunks.push({
			chunk,
			chunkFilename,
		});
	}
	return chunks;
}
