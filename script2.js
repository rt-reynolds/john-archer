/**
 * @typedef {Object} ArcherImages
 * @property {import(p5.Image)} bow
 * @property {import(p5.Image)} bowRaised
 * @property {import(p5.Image)} bowDraw
 * @property {import(p5.Image)} bowRelease
 * @property {import(p5.Image)} bowFinish
 * @property {import(p5.Image)} bowUpset
 * @property {import(p5.Image)} bowRaisedUpset
 * @property {import(p5.Image)} bowDrawUpset
 * @property {import(p5.Image)} angerQuiet
 * @property {import(p5.Image)} angerSpeak
 */

/**
 * @typedef {Object} ArcherSounds
 * @property {import(p5.SoundFile)} bowStandBy
 * @property {import(p5.SoundFile)} bowReadying
 * @property {import(p5.SoundFile)} bowDraw
 * @property {import(p5.SoundFile)} bowRelease
 * @property {import(p5.SoundFile)} bowBang
 * @property {import(p5.SoundFile)} notice
 * @property {import(p5.SoundFile)} shout
 */

alert("Please remember to read the rules... You will regret it otherwise!");

/** @type {ArcherImages} */
let archerImages = {};
/** @type {ArcherSounds} */
let archerSounds = {};
/** @type {import(p5.Image)} */
let backgroundHalfImage;
/** @type {import(p5.AudioIn)} */
let mic;
/** @type {Archer} */
let archer;

let archerFlag1 = true;
let archerFlag2 = false;
let archerFlag3 = false;
let archerFlag4 = false;
let archerFlag5 = false;

let angerFlag1 = false;
let angerFlag2 = false;
let angerFlag3 = false;
let angerFlag4 = false;
let angerFlag5 = false;

let audioFlag1 = true;
let audioFlag2 = false;
let audioFlag3 = false;
let audioFlag4 = false;
let audioFlag5 = false;
let audioFlag6 = false;
let audioFlag7 = false;

let cycleFinish = false;
let shotCount = 0;

function preload() {
  archerImages = {
    bow: loadImage("libraries/pictures/archer1-bow.png"),
    bowRaised: loadImage("libraries/pictures/archer1-raise.png"),
    bowDraw: loadImage("libraries/pictures/archer1-draw.png"),
    bowRelease: loadImage("libraries/pictures/archer1-release.png"),
    bowFinish: loadImage("libraries/pictures/archer1-finish.png"),
    bowUpset: loadImage("libraries/pictures/archer1-bow-upset.png"),
    bowRaisedUpset: loadImage("libraries/pictures/archer1-raise-upset.png"),
    bowDrawUpset: loadImage("libraries/pictures/archer1-draw-upset.png"),
    angerQuiet: loadImage("libraries/pictures/anger-quiet.png"),
    angerSpeak: loadImage("libraries/pictures/anger-speak.png"),
  };

  archerSounds = {
    bowStandBy: loadSound("libraries/sounds/archer-standby.mp3"),
    bowReadying: loadSound("libraries/sounds/archer-readying.mp3"),
    bowDraw: loadSound("libraries/sounds/archer-anticipate.mp3"),
    bowRelease: loadSound("libraries/sounds/arrow-release.mp3"),
    bowBang: loadSound("libraries/sounds/arrow-bang.mp3"),
    notice: loadSound("libraries/sounds/archer-notice.mp3"),
    shout: loadSound("libraries/sounds/archer-shout.mp3"),
  };

  backgroundHalfImage = loadImage("libraries/pictures/background-half.png");
}

function setup() {
  frameRate(60);
  createCanvas(720, 720);

  mic = new p5.AudioIn(() => { console.log('audio in not available')});
  mic.start();


  archer = new Archer();
  blackOut = new BlackOut();
  music = new Music();
}

function draw() {
  image(backgroundHalfImage, 0, 0);

  vol = mic.getLevel();

  console.log("hit chance: " + archer.coinFlip);
  // console.log(archer.angerCounter);
  console.log(vol);
  console.log(archer.angerCounter);
  console.log(archer.successCheck);

  if (vol < 0.33 || archer.isMad){
    archer.update();
    if(!archer.isMad){
      archer.archerImage();
    }

    blackOut.update();
    blackOut.display();

    music.checkMusic();
  } else if(vol > 0.33){
    archer.setArcherStop();
    audioFlag6 = true;
  }
  if(vol > 0.33 && archerFlag5){
    archer.successCheck = true;
  }


  archer.checkReset();
  // console.log(cycleFinish)


  if(shotCount >= 1 && cycleFinish == false){
    textSize(17);
    text("Going for " + (shotCount + 1) + "...", 10, 200);
  }else{
    text((" "), 10, 190);
  }

}

function mousePressed() {
  userStartAudio();
}

class Archer {
  constructor() {
    this.counter = 0;
    this.angerCounter = 0;
    this.timeOut = false;

    this.randomStandby = int(random(350, 420));
    this.randomReadying = int(random(100, 200));
    this.randomAnticipate = int(random(100, 200));
    this.randomHold = int(random(120, 360));

    this.isFinished = false;
    this.isMad = false;
    this.successCheck = true;

    this.coinFlip = random(0, 1);
    // this.coinFlip = 1;
    this.volume = 0;
  }
  update() {
    if(this.isMad) {
      if (this.angerCounter === 10000) {
        this.isMad = false;
      } else {
        this.angerCounter += 1;
        this.archerAnger();
      }
    } else {
      this.counter += 1;
      if(this.counter == 0){
        archerFlag1 = true;
        audioFlag1 = true;
      }else if(this.counter == this.randomStandby + this.randomReadying){
        archerFlag2 = true;
        audioFlag2 = true;

      }else if(this.counter == this.randomStandby + this.randomReadying + this.randomAnticipate){
        archerFlag3 = true;
        audioFlag3 = true;

      }else if(this.counter == this.randomStandby + this.randomReadying + this.randomAnticipate + this.randomHold){
        archerFlag4 = true;
        audioFlag4 = true;

        // }else if(this.counter == this.randomStandby + this.randomReadying + this.randomAnticipate + this.randomHold + 40 && this.coinFlip - 0.6 >= 0){
        //   archerFlag5 = true;
        //   audioFlag5 = true;
        //   this.successCheck = false;
      }else if(this.counter == this.randomStandby + this.randomReadying + this.randomAnticipate + this.randomHold + 40 && this.coinFlip - 0.6 >= 0){
        archerFlag5 = true;
        audioFlag5 = true;
        this.successCheck = false;
      }else if(this.successCheck && this.counter >= this.randomStandby + this.randomReadying + this.randomAnticipate + this.randomHold + 200 && this.coinflip - 0.6 < 0){
        cycleFinish = true;
      }
    }
  }
  archerImage(){
    if(archerFlag1){
      image(archer1, 216, 337); //read 216
      // console.log("image 1");
    }
    if(archerFlag2){
      image(archer2, 173, 120);
      // console.log("image 2");
      archerFlag1 = false;
    }
    if(archerFlag3){
      image(archer3, 130, 231);
      // console.log("image 3");
      archerFlag2 = false;
    }
    if(archerFlag4){
      image(archer4, 34, 300);
      // console.log("image 4");
      archerFlag3 = false;
    }
    if(this.successCheck == true && this.counter >= this.randomStandby + this.randomReadying + this.randomAnticipate + this.randomHold + 130){
      image(archer5, 176, 380);
      archerFlag4 = false;
      archerFlag5 = true;
      cycleFinish = true;
    }
    if(this.successCheck == false && this.counter >= this.randomStandby + this.randomReadying + this.randomAnticipate + this.randomHold + 130){
      angerFlag5 = true;

    }else if(this.successCheck == true && this.counter >= this.randomStandby + this.randomReadying + this.randomAnticipate + this.randomHold + 130){

      cycleFinish = true;
    }
  }
  checkReset(){
    if(this.isFinished){
      archerFlag1 = true;
      archerFlag2 = false;
      archerFlag3 = false;
      archerFlag4 = false;
      archerFlag5 = false;

      audioFlag1 = true;
      audioFlag2 = false;
      audioFlag3 = false;
      audioFlag4 = false;
      audioFlag5 = false;
      audioFlag6 = false;

      cycleFinish = false;

      this.counter = 0;
      this.angerCounter = 0;

      angerFlag1 = false;
      angerFlag2 = false;
      angerFlag3 = false;
      angerFlag4 = false;
      angerFlag5 = false;

      this.randomStandby = int(random(350, 420));
      this.randomReadying = int(random(100, 200));
      this.randomAnticipate = int(random(100, 200));
      this.randomHold = int(random(120, 420));

      this.coinFlip = random(0, 1);
      this.successCheck = true;


      // this.isMad = false;

    }

    this.isFinished = false;

  }

  archerAnger(){
    this.angerCounter += 1;
    this.counter = 10000;

    if(archerFlag1){
      // archerFlag1 = false;
      angerFlag1 = true;
    }else if(archerFlag2){
      // archerFlag2 = false;
      angerFlag2 = true;
    }else if(archerFlag3){
      // archerFlag3 = false;
      angerFlag3 = true;
    }else if(archerFlag4){
      // archerFlag4 = false;
      angerFlag4 = true;
    }
    archerFlag1 = false;
    archerFlag2 = false;
    archerFlag3 = false;
    archerFlag4 = false;
    archerFlag5 = false;

    if(angerFlag1){
      image(archerMad1, 216, 337)
      // audioFlag6 = true;
    }
    if(angerFlag2){
      image(archerMad2, 173, 120);
      // audioFlag6 = true;
    }
    if(angerFlag3){
      image(archerMad3, 130, 231);
      // audioFlag6 = true;
    }
    if(angerFlag5){
      image(angerSpeak, 0, 0);
      shotCount = 0;
    }
    if(this.angerCounter == 60){
      audioFlag7 = true;
    }
    if(this.angerCounter == 200){
      cycleFinish = true;
    }
  }

  setArcherStop(){
    this.isMad = true;
    this.angerCounter = 0;
    shotCount = 0;

  }
}


class BlackOut {
  constructor() {
    this.color = 0;
    this.alpha = 255;
  }
  display() {
    fill(this.color, this.alpha);
    rect(0, 0, 720, 720);
  }
  update() {
    if(cycleFinish == false && this.alpha >= 0){
      this.alpha -= 2;
    }
    if(cycleFinish == true && this.alpha <= 281){
      this.alpha += 2;
    }else if(this.alpha == 283){
      archer.isFinished = true;
      archer.isMad = false;
    }
    // console.log(this.alpha);
  }
}



class Music {
  checkMusic(){
    if(audioFlag1){
      music.bowMusic();
    }else if(audioFlag2){
      music.raiseMusic();
    }else if(audioFlag3){
      music.drawMusic();
    }else if(audioFlag4){
      music.arrowRelease();
    }else if(audioFlag5){
      music.arrowBang();
    }else if(audioFlag6){
      music.archerNotice();
    }else if(audioFlag7){
      music.archerShout();
    }
  }

  bowMusic(){
    archerBowMusic.play();
    audioFlag1 = false;

    // console.log("1")
  }
  raiseMusic(){
    archerRaiseMusic.play();
    audioFlag2 = false;
    // console.log("2")
  }
  drawMusic(){
    archerDrawMusic.play();
    audioFlag3 = false;
    // console.log("3")
  }
  arrowRelease(){
    arrowRelease.play();
    audioFlag4 = false;
    // console.log("4")
  }
  arrowBang(){
    arrowBang.play();
    audioFlag5 = false;
    shotCount += 1;
    // console.log("5")
  }
  archerNotice(){
    archerNotice.play();
    audioFlag6 = false;
    archerBowMusic.stop();
  }
  archerShout(){
    archerShout.play();
    audioFlag7 = false;
  }
}
