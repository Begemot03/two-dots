import { Assets, Container, Text, TextStyle } from "pixi.js";
import { GameState } from "../Types";

export default class TopMenu {
	container: Container;
	scoreText: Text;
	movesText: Text;
	gameMode: string;
	time: number;
	timer: any;

	constructor(gameState: GameState) {
		this.container = new Container();
		this.gameMode = 'moves';

		Assets.loadBundle('fonts').then(() => {
			this.scoreText = new Text('', new TextStyle({ fontFamily: 'Caviar Dreams', fontSize: 40 }));
			this.movesText = new Text('', new TextStyle({ fontFamily: 'Caviar Dreams', fontSize: 40 }));
			this.container.addChild(this.scoreText);
			this.container.addChild(this.movesText);
			this.movesText.position.set(0, 0);
			this.scoreText.position.set(300, 0);
			this.updateMoves(gameState.moves);
			this.updateScore(gameState.score);
		});

		this.container.position.set(100, 100);
	}

	updateScore(score: number): void {
		this.scoreText.text = 'Очков: ' + score.toString();
	}

	updateMoves(moves: number): void {
		if(this.gameMode === 'moves') {
			this.movesText.text = moves.toString() + ' ходов';
		} else if(this.gameMode === 'times') {
			moves === 60 ? 
					this.movesText.text = 'Время 1:00' : 
					(moves > 9 ? this.movesText.text = 'Время 0:' + moves.toString() : this.movesText.text = 'Время 0:0' + moves.toString());
		}
	}
}