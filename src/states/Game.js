/* globals __DEV__ */
import Phaser from 'phaser'
import Brick from '../prefabs/Brick'
import Paddle from '../prefabs/Paddle'
import Ball from '../prefabs/Ball'
import Bullet from '../prefabs/Bullet'

var emitter, emitter1, emitter2, emitter3, emitter4, emitter5
var explosion, explosion1, explosion2, message, bulletshot, ballhit, powerdown
var spaceKey
var bullet
var bullets
var bulletTime = 0
var gunTimer

export default class extends Phaser.State {

  constructor () {
    super()

    this.ballOnPaddle = true
    this.gunModeOn = true
  }

  init () {}

  preload () {
    game.time.advancedTiming = true
  }

  create () {
    // Particle emitter setup
      // Normal brick explosion
      emitter = game.add.emitter(0, 0, 500)
      emitter.makeParticles('brickpart')
      emitter.setAlpha(1, 0.2, 1500, Phaser.Easing.Linear.None, false)
      emitter.autoAlpha = true
      emitter.gravity = 500

      // Ball Speed Increase brick explosion
      emitter1 = game.add.emitter(0, 0, 500)
      emitter1.makeParticles('brickpart1')
      emitter1.setAlpha(1, 0.2, 1500, Phaser.Easing.Linear.None, false)
      emitter1.autoAlpha = true
      emitter1.gravity = 500

      // Ball Speed Decrease brick explosion
      emitter2 = game.add.emitter(0, 0, 500)
      emitter2.makeParticles('brickpart2')
      emitter2.setAlpha(1, 0.2, 1500, Phaser.Easing.Linear.None, false)
      emitter2.autoAlpha = true
      emitter2.gravity = 500

      // Paddle Size Increase/Decrease brick explosion
      emitter3 = game.add.emitter(0, 0, 500)
      emitter3.makeParticles('brickpart3')
      emitter3.setAlpha(1, 0.2, 1500, Phaser.Easing.Linear.None, false)
      emitter3.autoAlpha = true
      emitter3.gravity = 500

      // Bomb brick explosion
      emitter4 = game.add.emitter(0, 0, 500)
      emitter4.makeParticles('brickpart4')
      emitter4.setAlpha(1, 0.2, 1500, Phaser.Easing.Linear.None, false)
      emitter4.autoAlpha = true
      emitter4.gravity = 500

    // Keep ball from colliding with boom of screen
    this.game.physics.arcade.checkCollision.down = false

    // Setup
    this.setupText()
    this.setupBricks()
    this.setupPaddle()
    this.setupBall()
    this.setupBullets()
    this.setupAudio()
    this.checkGameMode()

    // Input handling
    this.game.input.onDown.add(this.releaseBall, this)
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
  }

  render () {
    game.debug.text('FPS: ' + game.time.fps || '--', 20, 90, "#00ff00"); 
  }

  update () {
    // Check for ball on paddle
    if (this.ballOnPaddle) {
      this.ball.body.x = this.paddle.centerX - (this.ball.width / 2)
      this.ball.body.y = this.paddle.centerY - (this.ball.height / 2)
    }

    if (this.gunModeOn === true && !this.ballOnPaddle) {

      this.gunModeText.text = 'Gun Mode: On'
      if (this.spaceKey.isDown) {
        this.fireBullet()
      }
    }

    // TODO Fix hot ball trail
    // if (!this.ballOnPaddle && this.ball.body.velocity.x >= 100) {
    //   emitter5.emitParticle();
    // }

    // Ball -> Paddle collision
    this.game.physics.arcade.collide(
      this.ball,
      this.paddle,
      this.ballHitPaddle,
      null,
      this
    )

    // Ball -> Brick collision
    this.game.physics.arcade.collide(
      this.ball,
      this.bricks,
      this.ballHitBrick,
      null,
      this
    )

    // Bullet -> Brick collision
    this.game.physics.arcade.collide(
      this.bullets,
      this.bricks,
      this.bulletHitBrick,
      null,
      this
    )
  }

  // METHODS
  setupText () {
    this.scoreText = this.createText(20, 20, 'left', `Score: ${this.game.global.score}`, '18px Arial', '#fff')
    this.livesText = this.createText(0, 20, 'center', `Lives: ${this.game.global.lives}`, '18px Arial', '#fff')
    this.levelText = this.createText(-20, 20, 'right', `Level: ${this.game.global.level}`, '18px Arial', '#fff')
    this.gameModeText = this.createText(-20, 20, 'right', `Level: ${this.game.global.level}`, '18px Arial', '#fff')

    this.gunModeText = this.createText(20, 50, 'left', 'Gun Mode: Off', '18px Arial', '#fff')
  }

  createText (xOffset, yOffset, align, text, font, fill) {
    return this.game.add.text(
      xOffset,
      yOffset,
      text,
      {
        font: font,
        fill: fill,
        boundsAlignH: align
      }
    ).setTextBounds(0, 0, this.game.world.width, 0)
  }

  setupBricks () {
    this.bricks = this.game.add.group()
    this.createBricks(this.bricks)
  }

  createBricks (bricksGroup) {
    this.game.physics.arcade.checkCollision.down = false

    let rows = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
    let columns = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
    // let rows = 1
    // let columns = 1

    let xOffset = 100
    let yOffset = 50
    let brick
    // 0 = Regular Brick, 1 = Ball Speed Increase, 2 = Ball Speed Decrease, 3 = Paddle Size Increase, 4 = Paddle Size Decrease, 5 = Explosive Brick

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        let brickType = this.chooseBrickType()
        brick = new Brick(
          this.game,
          x * xOffset,
          y * yOffset,
          brickType
        )
        bricksGroup.add(brick)
      }
    }
    let brickGroupWidth = ((xOffset * columns) - (xOffset - brick.width)) / 2
    bricksGroup.position.setTo(
      this.game.world.centerX - brickGroupWidth,
      this.game.world.centerY - 350
    )
  }

  chooseBrickType () {
    // Pick brick type based on percentage to control rarity
    let temp = Math.random() * 100;
      if (temp < 80) {
        // Regular Brick
        return 0
      }
      if (temp < 85) { //85
        // Coinflip for Ball Speed Increase/Decrease brick
        return (Math.floor(Math.random() * 2) == 0) ? 1 : 2
      }
      if (temp < 99) {
        // Coinflip for Paddle Increase/Decrease brick
        return (Math.floor(Math.random() * 2) == 0) ? 3 : 4
      }
      if (temp < 100){
        // Bomb/Gun brick
        return (Math.floor(Math.random() * 2) == 0) ? 5 : 6
      }
  }

  setupPaddle () {
    this.paddle = new Paddle (
      this.game,
      this.game.world.centerX,
      this.game.world.height - 100
    )
    this.game.add.existing(this.paddle)
    this.paddle.anchor.set(0.5)
  }

  setupBall () {
    this.ball = new Ball(this.game)
    this.game.add.existing(this.ball)

    this.ball.events.onOutOfBounds.add(this.ballLost, this)

    this.attachBallToPaddle()

    // Hot Ball Emitter
    emitter5 = game.add.emitter(0, 0, 1000)
    emitter5.makeParticles('ball')
    this.ball.addChild(emitter5)

    emitter5.y = 0
    emitter5.x = 0
    emitter5.lifespan = 500
    emitter5.setAlpha(1, 0.1, 500, Phaser.Easing.Linear.None, false)
    emitter5.maxParticleSpeed = new Phaser.Point(-100,50)
    emitter5.minParticleSpeed = new Phaser.Point(-200,-50)
    emitter5.gravity = 1000
  }

  attachBallToPaddle () {
    this.ballOnPaddle = true
    this.ball.reset(this.paddle.centerX - (this.ball.width / 2), this.paddle.centerY)
  }

  releaseBall () {
    if (!this.ballOnPaddle) {
      return
    }

    this.ballOnPaddle = false
    this.ball.body.velocity.x = -400
    this.ball.body.velocity.y = -1000

    ballhit.play()
  }

  setupAudio () {
    explosion = game.add.audio('explosion')
    explosion1 = game.add.audio('explosion1')
    explosion2 = game.add.audio('explosion2')

    powerdown = game.add.audio('powerdown')

    bulletshot = game.add.audio('bulletshot')
    ballhit = game.add.audio('ballhit')

    message = game.add.audio('message')
  }

  setupBullets () {
    this.bullets = this.game.add.group()
    this.createBullets(this.bullets)
    this.bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetBullet, this)
    this.bullets.setAll('checkWorldBounds', true)
  }

  createBullets (bulletGroup) {
    for (let i = 0; i <= 10; i++ ) {
      bullet = new Bullet(
        this.game,
        -5,
        -5
      )
      bulletGroup.add(bullet)
    }
  }

  fireBullet () {
    if (game.time.now > bulletTime) {
      bullet = this.bullets.getFirstExists(false);
      if (bullet) {
        bullet.reset(this.paddle.x, this.paddle.y);
        bullet.body.velocity.y = -500;
        bulletTime = game.time.now + 250;
        bulletshot.play()
      }
    }
  }

  //  Called if the bullet goes out of the screen
  resetBullet (bullet) {
      bullet.kill()
  }

  ballHitPaddle (ball, paddle) {
    let diff = 0

    // ballhit.play()

    if (ball.x < paddle.x) {
      diff = paddle.x - ball.x
      ball.body.velocity.x = (-10 * diff)
      return
    }

    if (ball.x > paddle.x) {
      diff = ball.x - paddle.x
      ball.body.velocity.x = (+10 * diff)
      return 
     }
  }

  ballHitBrick (ball, brick) {
    let brickCount = 0

    if (brick.key == 'brick') {
      //  Position the emitter at brick center
      emitter.x = brick.body.x + (brick.body.width / 2)
      emitter.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter.minParticleScale = 0.5
      emitter.maxParticleScale = 5

      //  Initialize emitter
      emitter.start(true, 1500, null, 20)
      explosion2.play()
    }

    if (brick.key == 'brick1') {
      //  Position the emitter at brick center
      emitter1.x = brick.body.x + (brick.body.width / 2)
      emitter1.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter1.minParticleScale = 0.5
      emitter1.maxParticleScale = 5

      //  Initialize emitter
      emitter1.start(true, 1500, null, 20)
    }

    if (brick.key == 'brick2') {
      //  Position the emitter at brick center
      emitter2.x = brick.body.x + (brick.body.width / 2)
      emitter2.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter2.minParticleScale = 0.5
      emitter2.maxParticleScale = 5

      //  Initialize emitter
      emitter2.start(true, 1500, null, 20)
      powerdown.play()
    }

    if (brick.key == 'brick3') {
      //  Position the emitter at brick center
      emitter3.x = brick.body.x + (brick.body.width / 2)
      emitter3.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter3.minParticleScale = 0.5
      emitter3.maxParticleScale = 5

      //  Initialize emitter
      emitter3.start(true, 1500, null, 20)
    }

    if (brick.key == 'brick4') {
      //  Position the emitter at brick center
      emitter3.x = brick.body.x + (brick.body.width / 2)
      emitter3.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter3.minParticleScale = 0.5
      emitter3.maxParticleScale = 5

      //  Initialize emitter
      emitter3.start(true, 1500, null, 20)
      powerdown.play()
    }
  
    if (brick.key == 'brick5') {
      //  Position the emitter at brick center
      emitter4.x = brick.body.x + (brick.body.width / 2)
      emitter4.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter4.minParticleScale = 0.5
      emitter4.maxParticleScale = 5
      emitter4.minParticleSpeed.setTo(-5000, -500)
      emitter4.maxParticleSpeed.setTo(5000, 500)

      //  Initialize emitter
      emitter4.start(true, 1500, null, 50)
      explosion.play()
    }

    // Check brick type
    switch (brick.key) {
        case 'brick':
        // Normal
            console.log('Normal Hit')
            break
        case 'brick1':
        // Increase Ball Speed
            ball.body.velocity.x += 100
            ball.body.velocity.y += 100

            let alertText1 = this.createText(0, 40, 'center', 'Ball Speed Inscreased', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText1).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText1).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            message.play()
            console.log('+BS Hit')
            break
        case 'brick2':
        // Decrease Ball Speed
            ball.body.velocity.x -= 100
            ball.body.velocity.y -= 100

            let alertText2 = this.createText(0, 40, 'center', 'Ball Speed Decreased', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText2).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText2).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            message.play()
            console.log('-BS Hit')
            break
        case 'brick3':
        // Increase Paddle Size
            this.paddle.width = this.paddle.body.width + 10
     
            let alertText3 = this.createText(0, 40, 'center', 'Paddle Size Increased', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText3).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText3).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            message.play()
            console.log('+Pad Hit')
            break
        case 'brick4':
        // Decrease Paddle Size
            if(this.paddle.width < 63) {
              this.paddle.width = this.paddle.width
            } else {
              this.paddle.width = this.paddle.body.width - 10
            }
            
            let alertText4 = this.createText(0, 40, 'center', 'Paddle Size Decreased', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText4).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText4).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            message.play()
            console.log('-Pad Hit')
            break
        case 'brick5':
        // Bomb Brick
            let alertText5 = this.createText(0, 40, 'center', 'Kaboom!', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText5).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText5).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            message.play()
            console.log('Bomb Hit')
            break
        // Gun Brick
        case 'brick6':
            let alertText6 = this.createText(0, 40, 'center', 'Gun Mode Active!', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText6).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText6).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            message.play()
            this.startGunMode()
            console.log('Gun Hit')
            break
    }

    brick.kill()

    this.game.global.score += 10
    this.scoreText.text = `Score: ${this.game.global.score}`

    // Check if any living normal bricks
    this.bricks.forEachAlive(function(brick) {   
      if (brick.key == 'brick') {
        brickCount++
      }
    })

    // Still normal bricks left
    if (brickCount > 0) {
      return
    }

    // No bricks left, start next level
    this.game.physics.arcade.checkCollision.down = true
    this.game.global.level += 1
    this.levelText.text = `Level: ${this.game.global.level}`

    // Fireworks effect
    emitter2.x = this.game.world.centerX
    emitter2.y = this.game.world.centerY

    emitter4.x = this.game.world.centerX
    emitter4.y = this.game.world.centerY

      // Emitter scaling
      emitter2.minParticleScale = 0.5
      emitter2.maxParticleScale = 10
      emitter2.minParticleSpeed.setTo(-1000, -1000)
      emitter2.maxParticleSpeed.setTo(1000, 1000)

      emitter4.minParticleScale = 0.5
      emitter4.maxParticleScale = 10
      emitter4.minParticleSpeed.setTo(-1000, -1000)
      emitter4.maxParticleSpeed.setTo(1000, 1000)

      //  Initialize emitters
      emitter2.start(true, 3500, null, 100);
      emitter4.start(true, 3500, null, 100);

    let nextLevelText = this.createText(0, 450, 'center', `Level ${this.game.global.level}!`, '60px Arial', '#fff')

    game.time.events.add(0, function() {
      game.add.tween(nextLevelText).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
      game.add.tween(nextLevelText).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
    }, this)

    // Reset paddle/bricks
    game.time.events.add(3000, function() {
      this.attachBallToPaddle()
      this.createBricks(this.bricks)
    }, this)
  }

  bulletHitBrick (bullet, brick) {
    let brickCount = 0

    if (brick.key == 'brick') {
      //  Position the emitter at brick center
      emitter.x = brick.body.x + (brick.body.width / 2)
      emitter.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter.minParticleScale = 0.5
      emitter.maxParticleScale = 5

      //  Initialize emitter
      emitter.start(true, 1500, null, 20);
    }

    if (brick.key == 'brick1') {
      //  Position the emitter at brick center
      emitter1.x = brick.body.x + (brick.body.width / 2)
      emitter1.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter1.minParticleScale = 0.5
      emitter1.maxParticleScale = 5

      //  Initialize emitter
      emitter1.start(true, 1500, null, 20);
    }

    if (brick.key == 'brick2') {
      //  Position the emitter at brick center
      emitter2.x = brick.body.x + (brick.body.width / 2)
      emitter2.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter2.minParticleScale = 0.5
      emitter2.maxParticleScale = 5

      //  Initialize emitter
      emitter2.start(true, 1500, null, 20);
    }

    if (brick.key == 'brick3') {
      //  Position the emitter at brick center
      emitter3.x = brick.body.x + (brick.body.width / 2)
      emitter3.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter3.minParticleScale = 0.5
      emitter3.maxParticleScale = 5

      //  Initialize emitter
      emitter3.start(true, 1500, null, 20);
    }

    if (brick.key == 'brick4') {
      //  Position the emitter at brick center
      emitter3.x = brick.body.x + (brick.body.width / 2)
      emitter3.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter3.minParticleScale = 0.5
      emitter3.maxParticleScale = 5

      //  Initialize emitter
      emitter3.start(true, 1500, null, 20);
    }
  
    if (brick.key == 'brick5') {
      //  Position the emitter at brick center
      emitter4.x = brick.body.x + (brick.body.width / 2)
      emitter4.y = brick.body.y + (brick.body.height / 2)

      // Emitter scaling
      emitter4.minParticleScale = 0.5
      emitter4.maxParticleScale = 5
      emitter4.minParticleSpeed.setTo(-5000, -500)
      emitter4.maxParticleSpeed.setTo(5000, 500)

      //  Initialize emitter
      emitter4.start(true, 1500, null, 50);
    }

    // Check brick type
    switch (brick.key) {
        case 'brick':
        // Normal
            console.log('Normal Hit')
            break
        case 'brick1':
        // Increase Ball Speed
            this.ball.body.velocity.x += 100
            this.ball.body.velocity.y += 100

            let alertText1 = this.createText(0, 40, 'center', 'Ball Speed Inscreased', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText1).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText1).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            console.log('+BS Hit')
            break
        case 'brick2':
        // Decrease Ball Speed
            this.ball.body.velocity.x -= 100
            this.ball.body.velocity.y -= 100

            let alertText2 = this.createText(0, 40, 'center', 'Ball Speed Decreased', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText2).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText2).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            console.log('-BS Hit')
            break
        case 'brick3':
        // Increase Paddle Size
            this.paddle.width = this.paddle.body.width + 10
     
            let alertText3 = this.createText(0, 40, 'center', 'Paddle Size Increased', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText3).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText3).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            console.log('+Pad Hit')
            break
        case 'brick4':
        // Decrease Paddle Size
            if(this.paddle.width < 63) {
              this.paddle.width = this.paddle.width
            } else {
              this.paddle.width = this.paddle.body.width - 10
            }
            
            let alertText4 = this.createText(0, 40, 'center', 'Paddle Size Decreased', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText4).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText4).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            console.log('-Pad Hit')
            break
        case 'brick5':
        // Bomb Brick
            let alertText5 = this.createText(0, 40, 'center', 'Kaboom!', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText5).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText5).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)
            console.log('Bomb Hit')
            break
        // Gun Brick
        case 'brick6':
            let alertText6 = this.createText(0, 40, 'center', 'Gun Mode Active!', '28px Arial', '#fff')

            game.time.events.add(0, function() {
              game.add.tween(alertText6).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
              game.add.tween(alertText6).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
            }, this)

            this.startGunMode()
            console.log('Gun Hit')
            break
    }

    bullet.kill()
    brick.kill()

    this.game.global.score += 10
    this.scoreText.text = `Score: ${this.game.global.score}`

    // Check if any living normal bricks
    this.bricks.forEachAlive(function(brick) {   
      if (brick.key == 'brick') {
        brickCount++
      }
    })

    // Still normal bricks left
    if (brickCount > 0) {
      return
    }

    // No bricks left, start next level
    this.game.physics.arcade.checkCollision.down = true
    this.game.global.level += 1
    this.levelText.text = `Level: ${this.game.global.level}`

    // Fireworks effect
    emitter2.x = this.game.world.centerX
    emitter2.y = this.game.world.centerY

    emitter4.x = this.game.world.centerX
    emitter4.y = this.game.world.centerY

      // Emitter scaling
      emitter2.minParticleScale = 0.5
      emitter2.maxParticleScale = 10
      emitter2.minParticleSpeed.setTo(-1000, -1000)
      emitter2.maxParticleSpeed.setTo(1000, 1000)

      emitter4.minParticleScale = 0.5
      emitter4.maxParticleScale = 10
      emitter4.minParticleSpeed.setTo(-1000, -1000)
      emitter4.maxParticleSpeed.setTo(1000, 1000)

      //  Initialize emitters
      emitter2.start(true, 3500, null, 100);
      emitter4.start(true, 3500, null, 100);

    let nextLevelText = this.createText(0, 450, 'center', `Level ${this.game.global.level}!`, '60px Arial', '#fff')

    game.time.events.add(0, function() {
      game.add.tween(nextLevelText).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
      game.add.tween(nextLevelText).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
    }, this)

    // Reset paddle/bricks
    game.time.events.add(2000, function() {
      this.attachBallToPaddle()
      this.createBricks(this.bricks)
    }, this)
  }

  startGunMode () {
    this.gunModeOn = true
  }

  endGunMode () {
    this.gunModeOn = false

    let alertText7 = this.createText(0, 40, 'center', 'Gun Mode Ended!', '28px Arial', '#fff')

    game.time.events.add(0, function() {
      game.add.tween(alertText7).to({y: 0}, 1500, Phaser.Easing.Linear.None, true)
      game.add.tween(alertText7).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true)
    }, this)
  }

  ballLost() {
    --this.game.global.lives

    // If no lives left
    if (this.game.global.lives === 0) {
      this.endGame()
      return
    }

    this.livesText.text = `Lives: ${this.game.global.lives}`
    this.attachBallToPaddle()
  }

  checkGameMode () {
    // GAME MODES: 0 = Normal, 1 = Hardcore, 2 = Stoned, 3 = Drunk
    console.log('Game Mode: ' + this.game.global.gameMode)
  }

  endGame () {
    this.game.state.start('GameOver')
  }
}
