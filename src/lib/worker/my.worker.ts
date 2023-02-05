let mycanvas: OffscreenCanvas;
let myctx: OffscreenCanvasRenderingContext2D;

let step = 0;

const run = () => {
	myctx.clearRect(0, 0, 600, 600);
	myctx.beginPath();
	myctx.arc(step % 200, 100, 10, 0, 2 * Math.PI);
	myctx.fillStyle = 'red';
	myctx.fill();
	step++;

	self.requestAnimationFrame(run);
};

onmessage = ({data}) => {
	console.log('Worker received a message from the main thread');
	const {canvas: canvasMessage} = data;
	if (canvasMessage) {
		mycanvas = canvasMessage;
	} else {
		myctx = mycanvas.getContext('2d')!;
		run();
	}
};

