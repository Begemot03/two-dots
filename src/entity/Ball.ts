import { Graphics } from "pixi.js";
import { vec2 } from "../Types";
import Field from "./Field";
import gsap from "gsap";

export default class Ball {
	color: number;
	field: Field | null; 
	sprite: Graphics | null;

	constructor(color: number) {
		this.color = color;
		
		this.sprite = new Graphics();
		this.sprite.beginFill(color);
		this.sprite.drawCircle(0, 0, 32);
		this.sprite.scale.set(0, 0);
	}

	setPosition(_position: vec2): void {
		if(this.sprite !== null) {
			this.sprite.x = _position.x;
			this.sprite.y = _position.y;
		}	
	}

	setField(field: Field): void {
		this.field = field;
	}

	isNeighbour(ball: Ball): boolean {
		if(this.field !== null && ball.field !== null) {
			return Math.abs(this.field.row - ball.field.row) + Math.abs(this.field.col - ball.field.col) === 1			
		}

		return false;
	}

	clear(): void {
		if(!this.sprite) {
			return;
		}

		this.sprite.destroy();
		this.sprite = null;

		if(this.field) {
			this.field.ball = null;
			this.field = null;
		}
	}

	createTo(): Promise<unknown> {
		return new Promise<void>(resolve => {
			gsap.to(this.sprite, {
				duration: 0.7,
				ease: 'elastic.out',
				pixi: {
					scale: 1,
				},
				onComplete: () => {
					resolve();
				}
			});
		});
	}

	moveTo(position: vec2): Promise<unknown> {
		return new Promise<void>(resolve => {
			gsap.to(this.sprite, {
				duration: 0.7,
				ease: 'bounce.out',
				pixi: {
					x: position.x,
					y: position.y,
				},

				onComplete: () => {
					resolve();
				}
			});
		});
	}

	connectTo(): void {
		gsap.to(this.sprite, {
			duration: 0.7,
			ease: 'elastic.out',
			pixi: {
				scale: 1.2,
			},
		});
	}

	unconnectTo(): void {
		gsap.to(this.sprite, {
			duration: 0.7,
			ease: 'elastic.out',
			pixi: {
				scale: 1,
			},
		});
	}
}