import { Container, FederatedEvent, FederatedPointerEvent } from "pixi.js";
import Field from "./Field";
import Ball from "./Ball";
import BallFactory from "./BallFactory";

export default class Board {
	fields: Array<Field> = new Array();
	container: Container = new Container();
	cols: number = 6;
	rows: number = 6;
	width: number = 0;
	height: number = 0;

	constructor() {
		this.createFields();
		this.createBalls();
		this.ajustPosition();
	}

	createFields(): void {
		for(let row: number = 0; row < this.rows; row++) {
			for(let col: number = 0; col < this.cols; col++) {
				this.createField(row, col);
			}
		}
	}

	createField(row: number, col: number): void {
		const field = new Field(row, col);
		this.fields.push(field);
		this.container.addChild(field.sprite);
	}

	createBalls(): void {
		this.fields.forEach(field => this.createBall(field));
	}

	createBall(field: Field): Promise<unknown> {
		const ball = BallFactory.generate();
		field.setBall(ball);

		ball!.sprite!.eventMode = 'static';
		ball!.sprite!.interactive = true;

		ball!.sprite!.on('pointerdown', () => {
			this.container.emit('ball-touch-start', ball);
		});

		ball!.sprite!.on('pointerover', () => {
			this.container.emit('ball-touch-over', ball);
		});

		ball!.sprite!.on('pointerup', () => {
			this.container.emit('ball-touch-end');
		});

		ball!.sprite!.on('pointerupoutside', () => {
			this.container.emit('ball-touch-end');
		});

		ball!.sprite!.on('globalpointermove', (e: FederatedPointerEvent) => {
			this.container.emit('pointer-move', e);
		});

		if(ball.sprite !== null) {
			this.container.addChild(ball.sprite);
		}

		return ball.createTo();
	}

	ajustPosition(): void {
		this.width = this.cols * 128;
		this.height = this.rows * 128;

		this.container.x = (1080 - this.width) / 2 + 128 / 2;
		this.container.y = (1920 - this.height) / 2 + 128 / 2;
	}

	getField(row: number, col: number): Field {
		let res: Field | undefined = this.fields.find(field => field.row === row && field.col === col);

		if(!res) return this.fields[0];

		return res;
	}
}