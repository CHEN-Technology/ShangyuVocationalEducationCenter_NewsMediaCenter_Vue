/**
 * Generates a filename based on file content hash with progress reporting
 * @param {File} file - The file object
 * @param {(progress: number) => void} [onProgress] - Optional progress callback
 * @returns {Promise<string>} The generated filename with extension
 */
async function getFilename(
	file: File,
	onProgress?: (progress: number) => void
): Promise<string> {
	// Get file extension
	const extension = file.name.split(".").pop();

	// Calculate file hash with progress reporting
	const digestName = await calculateDigest(file, onProgress);
	console.log("File hash calculated:", digestName);

	return `${digestName}.${extension}`;
}

/**
 * Calculates SHA-256 hash with progress reporting
 * @param {File} file - The file object
 * @param {(progress: number) => void} [onProgress] - Optional progress callback
 * @returns {Promise<string>} Hexadecimal string of the hash
 */
async function calculateDigest(
	file: File,
	onProgress?: (progress: number) => void
): Promise<string> {
	const chunkSize = 10 * 1024 * 1024; // 10MB chunks
	const chunks = Math.ceil(file.size / chunkSize);
	let hash: ArrayBuffer | null = null;
	let bytesProcessed = 0;

	for (let i = 0; i < chunks; i++) {
		const start = i * chunkSize;
		const end = Math.min(start + chunkSize, file.size);
		const chunk = file.slice(start, end);
		const chunkBuffer = await chunk.arrayBuffer();

		// Update hash incrementally
		if (!hash) {
			hash = await crypto.subtle.digest("SHA-256", chunkBuffer);
		} else {
			// Combine previous hash with new chunk
			const combined = new Uint8Array(hash.byteLength + chunkBuffer.byteLength);
			combined.set(new Uint8Array(hash), 0);
			combined.set(new Uint8Array(chunkBuffer), hash.byteLength);
			hash = await crypto.subtle.digest("SHA-256", combined);
		}

		bytesProcessed += end - start;
		const progress = bytesProcessed / file.size;

		// Report progress if callback provided
		if (onProgress) {
			onProgress(progress);
		}
	}

	if (!hash) {
		throw new Error("Failed to calculate file hash");
	}

	// Convert to hex string
	const hashArray = Array.from(new Uint8Array(hash));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default getFilename;
