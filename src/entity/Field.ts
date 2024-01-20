import { Container } from "pixi.js";
import Ball from "./Ball";
import { vec2 } from "../Types";

export default class Field {
	col: number;
	row: number;
	ball: Ball | null;
	sprite: Container;

	constructor(row: number, col: number) {
		this.col = col;
		this.row = row;

		this.sprite = new Container();
		this.sprite.x = this.position.x;
		this.sprite.y = this.position.y;
	}

	get position(): vec2 {
		return {
			x: this.col * 128,
			y: this.row * 128,
		};
	}

	setBall(ball: Ball): void {
		this.ball = ball;
		ball.setField(this);
		ball.setPosition(this.position);
	}
}