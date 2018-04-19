import Phaser from 'phaser'
import globals from './global/index'
import { clone } from 'lodash'

export default class extends Phaser.State {
  init () {}

  preload () {}

  create () {
    let text = this.add.text(
      this.game.width / 2, this.game.height / 2,
      `Game Over\n\nYou Reached Level ${this.game.global.level} with a score of ${this.game.global.score}`,
      {
        font: '28px Arial',
        fill: '#fff',
        align: 'center'
      }
    )
    text.anchor.set(0.5)

    this.input.onDown.add(this.restartGame, this)
  }

  // METHODS
  restartGame () {
    this.resetGlobalVariables()
    this.game.state.start('Game')
  }

  resetGlobalVariables () {
    this.game.global = clone(globals)
  }
}