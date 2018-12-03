
var game = new Phaser.Game(1500, 125, Phaser.CANVAS, 'game', null, true, false);
game.state.add('Game', Game);
game.state.start("Game");

