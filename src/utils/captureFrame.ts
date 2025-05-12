function drawVideo(video: HTMLVideoElement) {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		if (!context) {
			throw new Error("无法获取2D上下文");
		}
		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		canvas.toBlob((blob) => {
			if (!blob) {
				throw new Error("无法生成Blob");
			}
			resolve({
				blob,
				url: URL.createObjectURL(blob),
			});
		});
	});
}

export function captureFrame(videofile: File, time = 0) {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");

		video.currentTime = time;
		video.muted = true;
		video.autoplay = true;
		video.oncanplay = async () => {
			const frame = await drawVideo(video);
			resolve(frame);
		};
		video.src = URL.createObjectURL(videofile);
	});
}
