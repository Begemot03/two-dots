import { Assets, Container, Graphics, LineStyle, Text, TextStyle } from "pixi.js";
import { vec2 } from "../Types";

export default class Menu {
	container: Container;
	menuText: Text;
	movesGameButton: Graphics;
	timesGameButton: Graphics;

	constructor() {
		this.container = new Container();
		this.container.position.set(0, 0);

		Assets.loadBundle('fonts').then(() => {
			this.menuText = new Text('Меню', new TextStyle({ fontFamily: 'Caviar Dreams', fontSize: 72, align: 'center' }));
			this.menuText.anchor.set(0.5);
			this.menuText.position.set(1080 / 2, 100);

			this.movesGameButton = this.createButton({ x: 1080 / 2, y: 800 }, 'На ходы', 'moves');
			this.timesGameButton = this.createButton({ x: 1080 / 2, y: 1100 }, 'На время', 'times');

			this.container.addChild(this.movesGameButton);
			this.container.addChild(this.timesGameButton);
			this.container.addChild(this.menuText);
		});
	}

	createButton(position: vec2, text: string, gameMode: string): Graphics {
		let btn = new Graphics();
		btn.lineStyle(2, 0x000);
		btn.beginFill(0xfff);
		btn.drawRect(0, 0, 300, 150);

		btn.position.set(position.x - btn.width / 2, position.y - btn.height / 2);

		let textContainer = new Text(text, new TextStyle({ fontFamily: 'Caviar Dreams', fontSize: 40 }));

		textContainer.anchor.set(0.5);
		textContainer.x = btn.width / 2;
		textContainer.y = btn.height / 2;

		btn.interactive = true;
		btn.eventMode = 'static';

		btn.on('pointerdown', () => {
			this.container.emit('game-start', gameMode);
		});

	
		btn.addChild(textContainer);
		
		return btn;
	}
}