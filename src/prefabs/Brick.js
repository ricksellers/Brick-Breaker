import Phaser from 'phaser'

class Brick extends Phaser.Sprite {
    constructor (game, x, y, brickType) {
        let brickId
        
        switch (brickType) {
            case 0:
                brickId = 'brick'
                break
            case 1:
                brickId = 'brick1'
                break
            case 2:
                brickId = 'brick2'
                break
            case 3:
                brickId = 'brick3'
                break
            case 4:
                brickId = 'brick4'
                break
            case 5:
                brickId = 'brick5'
                break
            case 6:
                brickId = 'brick6'
                break
        }
        super(game, x, y, brickId)

        this.game.physics.arcade.enableBody(this)
        this.body.immovable = true
    }
}

export default Brick