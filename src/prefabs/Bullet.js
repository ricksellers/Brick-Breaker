import Phaser from 'phaser'

class Bullet extends Phaser.Sprite {
    constructor (game, x, y) {
        super(game, x, y, 'bullet')

        this.game.physics.arcade.enableBody(this)
        this.scale.setTo(1, 3)
    }
}

export default Bullet