let delay = 0;
const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
	navigator.mediaDevices.getUserMedia({video: true, audio: false})
		.then(localMediaStream => {
			video.src = window.URL.createObjectURL(localMediaStream);
			video.play();
		})
		.catch(err => console.err(`Oh No!!!`, err));
}

function paintToCanvas(filter) {
	clearInterval(delay);
	const width = video.videoWidth;
	const height = video.videoHeight;
	canvas.width = width;
	canvas.height = height;

	delay = setInterval(() => {
		ctx.drawImage(video, 0, 0, width, height);
		let pixels = ctx.getImageData(0, 0, width, height);
		if(filter === 'red') {
			pixels = redEffect(pixels);
		} else if (filter === 'split') {
			pixels = rgbSplit(pixels);
		} else if (filter === 'green') {
			pixels = greenEffect(pixels);
		} else if (filter === 'blue') {
			pixels = blueEffect(pixels);
		} else {
			pixels = greenScreen(pixels);
		}

		ctx.putImageData(pixels, 0, 0);
	}, 16);
}

function takePhoto() {
	//play sound
	snap.currentTime = 0;
	snap.play();

	//take the data of canvas
	const data = canvas.toDataURL('image/jpeg');
	const link = document.createElement('a');
	link.ref = data;
	link.setAttribute('download', 'handsome');
	link.innerHTML = `<img src="${data}" alt="handsome Man"/>`;
	strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
	const len = pixels.data.length;
	for(let i=0; i < len; i+=4) {
		pixels.data[i] = pixels.data[i] + 100; //r
		pixels.data[i+1] = pixels.data[i+1] - 50; //g
		pixels.data[i+2] = pixels.data[i+2] * 0.5; //b
	}
	return pixels;
}

function greenEffect(pixels) {
	const len = pixels.data.length;
	for(let i=0; i < len; i+=4) {
		pixels.data[i] = pixels.data[i] * 0.5; //r
		pixels.data[i+1] = pixels.data[i+1] + 100; //g
		pixels.data[i+2] = pixels.data[i+2] - 50; //b
	}
	return pixels;
}

function blueEffect(pixels) {
	const len = pixels.data.length;
	for(let i=0; i < len; i+=4) {
		pixels.data[i] = pixels.data[i] * 0.5; //r
		pixels.data[i+1] = pixels.data[i+1] - 50; //g
		pixels.data[i+2] = pixels.data[i+2] + 100; //b
	}
	return pixels;
}

function rgbSplit(pixels){
	const len = pixels.data.length;
	for(let i=0; i < len; i+=4) {
		pixels.data[i - 150] = pixels.data[i]; //r
		pixels.data[i + 500] = pixels.data[i+1]; //g
		pixels.data[i - 550] = pixels.data[i+2]; //b
	}
	return pixels;
}

function greenScreen(pixels) {
	const levels = {};
	document.querySelectorAll('.rgb input').forEach((input) => {
		levels[input.name] = input.value;
		document.querySelector(`label[for="${input.name}"]`).textContent = input.name + ': ' + input.value;
	});

	const len = pixels.data.length;

	for (i=0; i < len; i+=4) {
		red = pixels.data[i];
		green = pixels.data[i + 1];
		blue = pixels.data[i + 2];

		if(red >= levels.RedMin
			&& green >= levels.GreenMin
			&& blue >= levels.BlueMin
			&& red <= levels.RedMax
			&& green <= levels.GreenMax
			&& blue <= levels.BlueMax) {
			pixels.data[i + 3] = 0;
		}
	}
	return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);