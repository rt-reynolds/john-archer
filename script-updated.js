/*
The typedefs used below are technically for Typescript, but they can help when
accessing elements in javascript.  Your editor should let you know if you try
to assign an invalid value to an object property and hint property names/methods.

I implemented the core functionality heavily commented everything.

At the bottom you'll find some alternative ways to implement the same functionality.

For something like this, there is no single correct way.  The most important thing
is that you understand what you've implemented.
 */

/**
 * This, as the name implies, is essentially what composes an Archer state
 * Everything in here should be what to display, sound to play, and how long
 * to show it.
 *
 * @typedef {Object} ArcherState
 * @property {string} name - simply a state name
 * @property {function:string} nextState - this could be a string, but by making
 * it a method, we can handle hit/miss here.  this should be the "normal" next
 * @property {?string} angerState - state to go to when the archer is interrupted
 * @property {import(p5.Image)} image - image to show
 * @property {Object} imagePosition - where to position image
 * @property {number} imagePosition.x
 * @property {number} imagePosition.y
 * @property {import(p5.SoundFile)} sound - sound to play
 * @property {boolean} soundPlayed - if sound has been played, since some sounds
 * are shorter than the image display time, we need to check if it's already been played
 * @property {?number} holdUntil - time to move to the next state
 * @property {Object} timeRange - min/max time to hold a given state
 * @property {number} timeRange.min
 * @property {number} timeRange.max
 */

/**
 * ArcherImages and ArcherSounds are just to keep the global namespace
 * as uncluttered as possible
 * @typedef {Object} ArcherImages
 * @property {import(p5.Image)} bowReady
 * @property {import(p5.Image)} bowRaised
 * @property {import(p5.Image)} bowDraw
 * @property {import(p5.Image)} bowRelease
 * @property {import(p5.Image)} bowFinish
 * @property {import(p5.Image)} bowReadyUpset
 * @property {import(p5.Image)} bowRaisedUpset
 * @property {import(p5.Image)} bowDrawUpset
 * @property {import(p5.Image)} angerQuiet
 * @property {import(p5.Image)} angerSpeak
 */

/**
 * @typedef {Object} ArcherSounds
 * @property {import(p5.SoundFile)} bowReady
 * @property {import(p5.SoundFile)} bowRaised
 * @property {import(p5.SoundFile)} bowDraw
 * @property {import(p5.SoundFile)} bowRelease
 * @property {import(p5.SoundFile)} bowFinish
 * @property {import(p5.SoundFile)} bowMissed
 * @property {import(p5.SoundFile)} archerAngry
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
/** @type {number} */
let volume;

function preload() {
  /** @type {ArcherImages} */
  archerImages = {
    bowReady: loadImage("/libraries/pictures/archer1-bow.png"),
    bowRaised: loadImage("/libraries/pictures/archer1-raise.png"),
    bowDraw: loadImage("/libraries/pictures/archer1-draw.png"),
    bowRelease: loadImage("/libraries/pictures/archer1-release.png"),
    bowFinish: loadImage("/libraries/pictures/archer1-finish.png"),
    bowReadyUpset: loadImage("/libraries/pictures/archer1-bow-upset.png"),
    bowRaisedUpset: loadImage("/libraries/pictures/archer1-raise-upset.png"),
    bowDrawUpset: loadImage("/libraries/pictures/archer1-draw-upset.png"),
    angerQuiet: loadImage("/libraries/pictures/anger-quiet.png"),
    angerSpeak: loadImage("/libraries/pictures/anger-speak.png"),
  };
  /** @type {ArcherSounds} */
  archerSounds = {
    bowReady: loadSound("/libraries/sounds/archer-standby.mp3", null, null),
    bowRaised: loadSound("/libraries/sounds/archer-readying.mp3", null, null),
    bowDraw: loadSound("/libraries/sounds/archer-anticipate.mp3", null, null),
    bowRelease: loadSound("/libraries/sounds/arrow-release.mp3", null, null),
    bowFinish: loadSound("/libraries/sounds/arrow-bang.mp3", null, null),
    bowMissed: loadSound("/libraries/sounds/archer-notice.mp3", null, null),
    archerAngry: loadSound("/libraries/sounds/archer-shout.mp3", null, null),
  };

  backgroundHalfImage = loadImage("libraries/pictures/background-half.png");
}

function setup() {
  frameRate(60);
  createCanvas(720, 720);

  mic = new p5.AudioIn(() => { console.log('audio in not available')});
  mic.start();

  archer = new Archer(archerImages, archerSounds, backgroundHalfImage);
}

/**
 * The only thing we need to do each draw call is get the mic volume and let
 * the archer update.  The update function takes a boolean, so rather use an
 * intermediate value, just pass the boolean result of the comparison. This
 * is equivalent to:
 *
 * let isInterrupted = volume > 0.33;
 * archer.update(isInterrupted);
 */
function draw() {
  volume = mic.getLevel();
  archer.update(volume > 0.33);
}

class Archer {
  /** @type {import(p5.Image)} */
  backgroundImage;
  /** @type {Map<string, ArcherState>} */
  states;
  /** @type {?ArcherState} */
  state;
  /**
   * @param {ArcherImages} archerImages
   * @param {ArcherSounds} archerSounds
   * @param {p5.Image} backgroundImage
   */
  constructor(archerImages, archerSounds, backgroundImage) {
    this.backgroundImage = backgroundImage;
    /** @type {?ArcherState} */
    this.state = null; // active state
    this.shots = 1; // not used, but would be easy to increment when needed
    this.setStates(archerImages, archerSounds); // gets the initial states setup
    this.isFading = true; // if we're fading in, could also be used to fade back out
    this.fadeIn = true; // flag for fade direct
    this.alpha = 254; // alpha for the fade animations
  }

  /**
   * Here we're just setting the states map and the initial state.  Notice
   * above that isFading starts are true and all the holdUntil values start
   * as null, that information will be used below when rendering.
   *
   * @param images
   * @param sounds
   */
  setStates(images, sounds) {
    /**
     * We use a map here since it gives us an easy way to lookup objects from
     * a string.
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
     *
     * @type {Map<string, ArcherState>}
     */
    this.states = new Map();
    /** @type {ArcherState[]} */
    let archerStates = [
      {
        name: 'ready',
        nextState: () => 'raise',
        angerState: 'ready-upset',
        image: images.bowReady,
        imagePosition: {x: 216, y: 337},
        sound: sounds.bowReady,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 6000, max: 7000},
      },
      {
        name: 'raise',
        nextState: () => 'draw',
        angerState: 'raise-upset',
        image: images.bowRaised,
        imagePosition: {x: 173, y: 120},
        sound: sounds.bowRaised,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 1500, max: 3300},
      },
      {
        name: 'draw',
        nextState: () => 'release',
        angerState: 'draw-upset',
        image: images.bowDraw,
        imagePosition: {x: 130, y: 231},
        sound: sounds.bowDraw,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 2000, max: 7000},
      },
      /**
       * This is hit/miss random for the next state, there wasn't a "miss" image,
       * but it does play the "thunk" sound
       */
      {
        name: 'release',
        nextState: () => Math.round(Math.random()) === 1
            ? 'finish-hit'
            : 'finish-miss',
        angerState: 'release-upset',
        image: images.bowRelease,
        imagePosition: {x: 34, y: 300},
        sound: sounds.bowRelease,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 1000, max: 2000},
      },
      {
        name: 'finish-hit',
        nextState: () => 'ready',
        angerState: null,
        image: images.bowFinish,
        imagePosition: {x: 176, y: 380},
        sound: sounds.bowFinish,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 2000, max: 4000},
      },
      {
        name: 'finish-miss',
        nextState: () => 'ready',
        angerState: null,
        image: images.bowFinish,
        imagePosition: {x: 176, y: 380},
        sound: sounds.bowMissed,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 2000, max: 4000},
      },
      {
        name: 'ready-upset',
        nextState: () => 'ready',
        angerState: null,
        image: images.bowReadyUpset,
        imagePosition: {x: 216, y: 337},
        sound: sounds.archerAngry,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 3000, max: 6000},
      },
      {
        name: 'raise-upset',
        nextState: () => 'raise',
        angerState: null,
        image: images.bowRaisedUpset,
        imagePosition: {x: 173, y: 120},
        sound: sounds.archerAngry,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 3000, max: 6000},
      },
      {
        name: 'draw-upset',
        nextState: () => 'draw',
        angerState: null,
        image: images.bowDrawUpset,
        imagePosition: {x: 130, y: 231},
        sound: sounds.archerAngry,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 3000, max: 6000},
      },
      {
        name: 'release-upset',
        nextState: () => 'finish-miss',
        angerState: null,
        image: images.angerSpeak,
        imagePosition: {x: 0, y: 0},
        sound: sounds.archerAngry,
        soundPlayed: false,
        holdUntil: null,
        timeRange: {min: 3000, max: 6000},
      },
    ];
    archerStates.forEach((state) => {
      this.states.set(state.name, state);
    });
    this.state = archerStates[0];
  }

  /**
   * We have 4 paths here
   *  1. We're fading, so we just want to showState and show fade
   *  2. We're showing a general state (mid-draw for example)
   *  3. We're interrupted
   *  4. The state is finished
   *
   * @param {boolean} interrupted - volume > 0.33
   */
  update(interrupted) {
    /**
     * This is if we were interrupted, we're not already in an anger state
     * (anger states have null for their anger states), and not fading
     *
     * If we were not interrupted check if next state time has been set and
     * if the archer is past that
     */
    if (interrupted && this.state.angerState !== null && !this.isFading) {
      this.changeState(this.state.angerState);
    } else if (this.state.holdUntil !== null &&
        this.state.holdUntil <= Date.now()
    ) {
      this.changeState(this.state.nextState());
    }

    this.showState();

    /**
     * When fade finishes, set the state end
     * End time must be set here instead of on state change or it will not
     * be accurate
     */
    if (this.isFading) {
      this.showFade();
    } else if (this.state.holdUntil === null) {
      this.state.holdUntil = this.getTime(this.state.timeRange.min,
          this.state.timeRange.max);
    }
  }

  /**
   * @param {string} newState
   */
  changeState(newState) {
    // check if state is valid
    if (this.states.has(newState)) {
      // stop sound if playing
      this.state.sound.stop();
      // set hold until to null, so it can be set on next showing
      this.state.holdUntil = null;
      this.state = this.states.get(newState);
      // reset sound played
      this.state.soundPlayed = false;
    }
  }

  /**
   * Show current image and play sound if not already started
   * Image is always shown, otherwise fade will not work properly,
   * Sound is only played if not currently fading
   */
  showState() {
    image(this.backgroundImage, 0, 0);
    image(this.state.image, this.state.imagePosition.x,
        this.state.imagePosition.y);

    if (!this.state.soundPlayed && !this.isFading) {
      this.state.sound.play(0);
      this.state.soundPlayed = true;
    }
  }

  /**
   * Returns the current time in milliseconds plus the minimum hold time plus
   * a random number that is between min - max
   *
   * @param {number} min
   * @param {number} max
   * @return {number}
   */
  getTime(min, max) {
    return Date.now() + min + (Math.random() * (max - min));
  }

  /**
   * this will just show the fade in animation (alpha decreasing)
   * You could use this and the fadeIn flag to both fade in and out
   */
  showFade() {
    this.alpha -= 2;
    fill(0, this.alpha);
    rect(0, 0, 720, 720);
    if (this.alpha <= 0) {
      this.isFading = false;
      this.alpha = 254;
    }
  }
}

/**
 * Possible improvements to this version
 *
 * Images and Sounds could be store as objects instead of using multiple
 * properties in ArcherState EX:
 *
 * archerImage = {
 *   image: P5.Image,
 *   x: number,
 *   y: number
 * }
 *
 * archerSound = {
 *   sound: P5.Sound,
 *   played: boolean
 * }
 *
 * States could be stored separately and imported as JSON or another JS file
 */
