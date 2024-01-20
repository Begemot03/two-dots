import { Application, Assets, FederatedPointerEvent, Graphics, ICanvas } from "pixi.js";
import Board from "./Board";
import Ball from "./Ball";
import Field from "./Field";
import TopMenu from "./TopMenu";
import { GameState } from "../Types";
import Menu from "./Menu";

export default class Game {
	app: Application<ICanvas>;
	width: number;
	height: number;
	board: Board;
	topMenu: TopMenu;
	menu: Menu;
	isTouched: boolean = false;
	selected: Array<Ball> = [];
	lines: Array<Graphics> = [];
	lastLine: Graphics;
	isDisabled: boolean = false;
	gameState: GameState;

	timer: any;

	bestScore: number;

	constructor(app: Application<ICanvas>, _w: number, _h: number) {
		this.gameState = { score: 0, moves: 20, gameMode: 'moves' };
		this.width = _w;
		this.height = _h;
		this.app = app;
		this.board = new Board();
		this.topMenu = new TopMenu(this.gameState);
		this.menu = new Menu();

		this.lastLine = new Graphics();
		this.board.container.addChild(this.lastLine);

		this.board.container.on('ball-touch-start',this.onBallClicked.bind(this));
		this.board.container.on('ball-touch-over', this.onAddBall.bind(this));
		this.board.container.on('ball-touch-end', this.onBallEnd.bind(this));
		this.board.container.on('pointer-move', this.onPointerMove.bind(this));

		this.menu.container.on('game-start', this.onStartGame.bind(this));
		
		this.app.stage.addChild(this.menu.container);
		this.app.stage.addChild(this.board.container);
		this.app.stage.addChild(this.topMenu.container);
		this.board.container.visible = false;
		this.topMenu.container.visible = false;
	}

	onStartGame(gameMode: string): void {
		this.board.container.visible = true;
		this.topMenu.container.visible = true;
		this.menu.container.visible = false;
		this.gameState.gameMode = gameMode;
		this.topMenu.gameMode = gameMode;

		if(gameMode === 'moves') {
			this.gameState.moves = 20;
		} else if(gameMode === 'times') {
			this.gameState.moves = 60;
			this.timer = setInterval(this.timerUpdate.bind(this), 1000);
		}
		
		this.topMenu.updateMoves(this.gameState.moves);
	}

	gameEnd(): void {
		this.board.container.visible = false;
		this.topMenu.container.visible = false;
		this.menu.container.visible = true;
	} 

	timerUpdate(): void {
		if(this.gameState.moves === 0) {
			clearInterval(this.timer);
			this.gameEnd();
			return;
		}

		this.gameState.moves--;
		this.topMenu.updateMoves(this.gameState.moves);
	}

	onBallClicked(ball: Ball): void {
		if(this.gameState.moves < 1) return;
		if(this.isDisabled) return;

		this.isTouched = true;
		this.selected.push(ball);

		ball.connectTo();
	}

	onAddBall(ball: Ball): void {
		if(!this.lastSelected) return;
		if(!this.lastLine) return;
		if(this.isDisabled) return;

		if(!this.isTouched) return;

		// Разные цвета
		if(this.selected[0].color !== ball.color) return;

		if(this.isPrevSelected(ball) && this.selected.length > 1) {
			this.lines.pop()?.destroy();
			this.selected.pop()?.unconnectTo();
		} else if(ball.isNeighbour(this.selected[this.selected.length - 1])) {
			if(this.checkClosure() && this.isSelected(ball)) return;

			this.lastLine.clear();
			this.lastLine.lineStyle(32, this.lastSelected.color, 1);

			this.lastLine.moveTo(this.lastSelected!.sprite!.position.x, this.lastSelected!.sprite!.position.y)
						.lineTo(ball!.sprite!.position.x, ball!.sprite!.position.y);
			
			this.lines.push(this.lastLine);
			this.selected.push(ball);

			this.lastLine = new Graphics();
			this.lastLine.lineStyle(32, ball.color, 1);
			this.board.container.addChild(this.lastLine);
			
			ball.connectTo();
		}

		if(this.checkClosure()) {
			this.connectClosure();
		} else {
			this.unconnectClosure();
		}
	}

	onPointerMove(e: FederatedPointerEvent): void {
		if(!this.lastSelected) return;
		if(!this.lastLine) return;
		if(this.isDisabled) return;
		if(!this.isTouched) return;

		this.lastLine.clear();
		this.lastLine.lineStyle(32, this.lastSelected.color, 1);
		this.lastLine.moveTo(this.lastSelected!.sprite!.position.x, this.lastSelected!.sprite!.position.y)
						.lineTo(e.globalX - this.board.container.position.x, e.globalY - this.board.container.position.y);
	}

	onBallEnd(): void {
		if(this.isDisabled) return;

		this.isDisabled = true;

		if(this.selected.length > 1) {
			if(this.checkClosure()) {
				this.gameState.score += this.clearClosure();
				this.topMenu.updateScore(this.gameState.score);
			} else {
				this.gameState.score += this.selected.length;
				this.topMenu.updateScore(this.gameState.score);
				this.clearSelected();
			}
			
			this.fallDown()
				.then(() => this.addBalls())
				.then(() => this.isDisabled = false);
			

			if(this.gameState.gameMode === 'moves') {
				this.gameState.moves--;
				this.topMenu.updateMoves(this.gameState.moves);
				if(this.gameState.moves === 0) {
					this.gameEnd();
				}
			}
		} else {
			this.isDisabled = false;
			this.selected.forEach(ball => ball.unconnectTo());
		}

		this.isTouched = false;
		this.lastLine.clear();
		this.lines.forEach(l => l.destroy());
		this.lines = [];
		this.selected = [];
	}

	get lastSelected(): Ball {
		return this.selected[this.selected.length - 1];
	}

	isPrevSelected(ball: Ball): boolean {
		if(this.lastSelected.field !== null && ball.field !== null) {
			if(this.selected.length === 1) {
				return this.lastSelected.field.col === ball.field.col &&  this.lastSelected.field.row === ball.field.row;
			}
	
			return this.selected[this.selected.length - 2]?.field?.col === ball.field.col &&  this.selected[this.selected.length - 2]?.field?.row === ball.field.row;
		}

		return false;
	}

	isBallSelected(ball: Ball): boolean {
		let f = false;

		this.selected.forEach(s => {
			if(s?.field?.row === ball?.field?.row && s?.field?.col === ball?.field?.col) {
				f = true;
			}
		});

		return f;
	}

	checkClosure(): boolean {
		let f = false;

		this.selected.forEach((ball, index) => {
			this.selected.forEach((b, i) => {
				if(ball.field?.row === b.field?.row && ball.field?.col === b.field?.col && index !== i) {
					f = true;
				}
			});
		});

		return f;
	}

	isSelected(ball: Ball): Boolean {
		if(this.selected.length === 0) return false;

		let f = false;

		this.selected.forEach(b => {
			if(b.field?.col === ball.field?.col && b.field?.row === ball.field?.row) {
				f = true;
			}
		});

		return f;
	}

	connectClosure(): void {
		if(this.selected.length === 0) return;

		const color = this.selected[0].color;

		this.board.fields.forEach(field => {
			if(field.ball?.color === color && !this.isSelected(field.ball)) {
				field.ball.connectTo();
			}
		});
	}

	unconnectClosure(): void {
		if(this.selected.length === 0) return;

		const color = this.selected[0].color;

		this.board.fields.forEach(field => {
			if(field.ball?.color === color && !this.isSelected(field.ball)) {
				field.ball.unconnectTo();
			}
		});
	}

	clearSelected(): void {
		this.selected.forEach(select => select.clear());
	}

	clearClosure(): number {
		const color = this.selected[0].color;
		let balls = 0;

		this.board.fields.forEach(field => {
			if(field.ball?.color === color) {
				field.ball.clear();
				balls++;
			}
		});

		return balls;
	}

	fallDown() {
		return new Promise<void>(resolve => {
			let completed: number = 0;
			let started: number = 0;

			for(let row = this.board.rows - 1; row >= 0; row--) {
				for(let col = this.board.cols - 1; col >= 0; col--) {
					const field = this.board.getField(row, col);

					if(!field.ball) {
						++started;

						this.fallDownTo(field).then(() => {
							++completed;

							if(completed >= started) {
								resolve();
							}
						});
					}
				}
			}
		});
	}

	fallDownTo(emptyField: Field): Promise<unknown> {
		for(let row = emptyField.row - 1; row >= 0; row--) {
			let fallingField = this.board.getField(row, emptyField.col);

			if(fallingField.ball) {
				const fallingBall = fallingField.ball;
				fallingBall.field = emptyField;
				emptyField.ball = fallingBall;
				fallingField.ball = null;

				return fallingBall.moveTo(emptyField.position);
			}
		}

		return Promise.resolve();
	}

	addBalls(): Promise<unknown> {
		return new Promise<void>(resolve => {
			const fields = this.board.fields.filter(field => field.ball === null);
			let total= fields.length;
			let completed = 0;

			fields.forEach(field => {
				this.board.createBall(field).then(() => {
					++completed;

					if(completed >= total) {
						resolve();
					}
				});
			});
		});
	}
}