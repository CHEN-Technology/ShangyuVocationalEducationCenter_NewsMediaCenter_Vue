/**
 * 对文件摘要拿到文件名，耗时操作
 * @param {File} file 文件对象
 * @returns 文件名
 */
async function getFilename(file: File) {
	// 获取文件后缀名
	const extension = file.name.split(".").pop();
	// 获取文件摘要
	const digestName = await calculateDigest(file);
	return `${digestName}.${extension}`;
}

/**
 *
 * @param {File} file 文件对象
 * @returns 返回十六进制的字符串
 */
async function calculateDigest(file: File) {
	// 读取文件buffer
	const arrayBuffer = await file.arrayBuffer();
	// 计算摘要buffer
	const digestBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
	// 转换为十六进制字符串
	const digestArray = Array.from(new Uint8Array(digestBuffer));
	const digestHex = digestArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return digestHex;
}

export default getFilename;
