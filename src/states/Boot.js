import Phaser from 'phaser'
import WebFont from 'webfontloader'
import globals from './global/index'
import { clone } from 'lodash'

export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#000'
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)
  }

  create () {
    this.initGlobalVariables()
  }

  initGlobalVariables () {
    this.game.global = clone(globals)
  }

  preload () {
    WebFont.load({
      google: {
        families: ['Bangers']
      },
      active: this.fontsLoaded
    })

    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' })
    text.anchor.setTo(0.5, 0.5)

    // IMAGES
    this.load.image('loaderBg', './assets/images/loader-bg.png')
    this.load.image('loaderBar', './assets/images/loader-bar.png')

    this.load.image('brick', './assets/images/brick.png')
    this.load.image('brick1', './assets/images/brick_1.png')
    this.load.image('brick2', './assets/images/brick_2.png')
    this.load.image('brick3', './assets/images/brick_3.png')
    this.load.image('brick4', './assets/images/brick_4.png')
    this.load.image('brick5', './assets/images/brick_5.png')
    this.load.image('brick6', './assets/images/brick_6.png')

    this.load.image('paddle', './assets/images/paddle.png')
    this.load.image('ball', './assets/images/ball.png')

    this.load.image('brickpart', './assets/images/particle.png')
    this.load.image('brickpart1', './assets/images/particle1.png')
    this.load.image('brickpart2', './assets/images/particle2.png')
    this.load.image('brickpart3', './assets/images/particle3.png')
    this.load.image('brickpart4', './assets/images/particle4.png')

    this.load.image('bullet', './assets/images/particle2.png')

    // AUDIO
    this.load.audio('explosion', './assets/sound/fx/explosion.wav')
    this.load.audio('explosion1', './assets/sound/fx/explosion1.wav')
    this.load.audio('explosion2', './assets/sound/fx/explosion2.wav')

    this.load.audio('powerup', './assets/sound/fx/powerup.wav')
    this.load.audio('powerup1', './assets/sound/fx/powerup1.wav')
    this.load.audio('powerup2', './assets/sound/fx/powerup2.wav')
    this.load.audio('powerup3', './assets/sound/fx/powerup2.wav')
    this.load.audio('powerup4', './assets/sound/fx/powerup2.wav')

    this.load.audio('powerdown', './assets/sound/fx/powerdown.wav')

    this.load.audio('level', './assets/sound/fx/level.wav')
    this.load.audio('message', './assets/sound/fx/message.wav')

    this.load.audio('bulletshot', './assets/sound/fx/bullet.wav')
    this.load.audio('ballhit', './assets/sound/fx/ballhit.wav')
  }

  render () {
    if (this.fontsReady) {
      this.state.start('Splash')
    }
  }

  fontsLoaded () {
    this.fontsReady = true
  }
}
