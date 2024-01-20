import Ball from "./Ball";

const colors: Array<number> = [
	0xFCCC25,
	0x4928A7,
	0xD83C32,
	0x7BD842,
];

export default class BallFactory {
	static generate() {
		const ball = new Ball(colors[Math.floor(Math.random() * colors.length)]);
		return ball;
	}
}