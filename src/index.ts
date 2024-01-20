import * as PIXI from "pixi.js";
import Game from "./entity/Game";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

const width = 1080;
const height = 1920;

const app = new PIXI.Application({
	view: document.getElementById("app") as HTMLCanvasElement,
	width: width,
	height: height,
	resolution: window.devicePixelRatio || 1,
	autoDensity: true,
	background: '#DCEBCF',
});

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

PIXI.Assets.addBundle('fonts', {
	CaviarDreams: 'caviar-dreams.ttf',
});

function resize(): void {
	const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	const scale = Math.min(screenWidth / width, screenHeight / height);

	const enlargedWidth = Math.floor(scale * width);
	const enlargedHeight = Math.floor(scale * height);

	app.view.style!.width = `${enlargedWidth}px`;
	app.view.style!.height = `${enlargedHeight}px`;
}

resize();

window.addEventListener('resize', resize);

let game = new Game(app, width, height);