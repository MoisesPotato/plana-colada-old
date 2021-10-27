import {Cx, CxLike} from './Cx';
import {Editor} from './Editor';
import {KeySet, keyCodes} from './KeySet';
import {UniverseInfo} from './UniverseInfo';


export type mouse = {
  pos: [number, number],
  lClick: boolean,
  rClick: boolean
}

/** All the variables go here
 * @property {'start'|'GameOver'|'menu'|'options'|'credits'} scene
 * @property {boolean} playing
 * @property {boolean} paused
 * @property {Object.<number, boolean>} keysList
 * keysList[keyCodes.keyCoce.leftKey] = true means leftKey is pressed
 * @property {number} msPerFrame - Should be 40, make it bigger for my computer
 * @property {Object} mouse
 * @property {[x,y]}  mouse.pos
 * @property {boolean} mouse.lClick
 * @property {boolean} mouse.rClick
 * @property {Array.<boolean>} keysList - which keys are pressed
 * @property {KeySet} p1Keys
 * @property {KeySet} p2Keys
 * @property {number} gameWidth
 * @property {number} gameHeight
 * @property {HTMLCanvasElement} area
 * @property {CanvasRenderingContext2D} ctx
 * @property {number} scale - A distance of 1 in the complex numbers
 * is scale*Height on the screen
 * @property {number} speedScale If the distance between the mouse and
 * the center is d, every frame the player moves d * speedScale
 * @property {number} defaultSpeed what is this???
*/
export class GameStatus {
  scene: 'menu' | 'start' | 'GameOver' | 'options' | 'editor' | 'credits';
  playing: boolean;
  area: HTMLCanvasElement;
  paused: boolean;
  keysList: boolean[];
  msPerFrame: number;
  mouse: { pos: [number, number]; lClick: boolean; rClick: boolean; };
  p1Keys: KeySet;
  p2Keys: KeySet;
  gameWidth: number;
  gameHeight: number;
  ctx: CanvasRenderingContext2D;
  scale: number;
  speedScale: number;
  defaultSpeed: number;
  then : number;
  editor :Editor;
  /**
   */
  constructor() {
    this.scene = 'menu'; // Scene: possibilities: "start", "GameOver", "menu"
    this.playing = true;
    this.paused = false;
    // this.changingKey = false; // For changing controls
    // this.whichKeyIsChanging = null; // For changing controls
    this.keysList = [];
    this.msPerFrame = 40;
    this.mouse = {
      pos: [0, 0],
      lClick: false,
      rClick: false,
    };
    this.p1Keys = new KeySet(keyCodes.leftKey,
        keyCodes.rightKey,
        keyCodes.upKey,
        keyCodes.rShift,
        keyCodes.downKey);
    this.p2Keys = new KeySet(keyCodes.aKey,
        keyCodes.dKey,
        keyCodes.wKey,
        keyCodes.spaceBar,
        keyCodes.sKey);
    this.area = document.getElementById('gameZone') as HTMLCanvasElement;
    this.ctx = this.area.getContext('2d') as CanvasRenderingContext2D;
    this.gameWidth = 0;
    this.gameHeight = 0;
    this.scale = 0;
    this.setGameDimensions();
    this.setResizeListener();
    this.speedScale = 1 / 40;
    this.defaultSpeed = 0.01;
    this.then = 0;
    this.editor = Editor.start(this);
  }

  /**
   * // TODO rename to pixToZ
   * @param {number} x pixel left
   * @param {number} y pixel top
   * @return {Cx} the complex number corresponding to pixel coordinates
   */
  pixToCoord(x: number, y: number): Cx {
    let re = x - this.gameWidth / 2;
    let im = this.gameHeight / 2 - y;
    re = re / this.scale;
    im = im / this.scale;
    return new Cx(re, im);
  }


  /**
   * @param {CxLike} z -  A complex number representing a point
   * @return {[number, number]} the pixel coordinates
   * from top and bottom of a given complex number
   */
  coordToPix(z: CxLike): [number, number] {
    z = Cx.makeNew(z);
    let x = z.re;
    let y = z.im;
    x = x * this.scale;
    y = y * this.scale;
    x = x + this.gameWidth / 2;
    y = this.gameHeight / 2 - y;
    return [x, y];
  }

  /**
   * Right now, draws a big green rectangle
   * @returns void
   */
  drawBackground(): void {
    this.ctx.fillStyle = '#61b061';
    this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
  }


  /**
 * don't wait to click buttons, just open stuff automatically
 * @returns void
 */
  openStuffAutomatically(): void {
    //  g.startTheGame();
  }


  /**
 * Pauses
 * @returns void
 */
  pause() {
    this.paused = true;
    this.ctx.fillStyle = 'red';
    this.ctx.font = '90px Monoton';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.gameWidth / 2, this.gameHeight / 2);
  }

  /**
   * Unpauses. Easy!
   * @returns void
   */
  unPause() {
    this.paused = false;
  }


  /**
   * Shows the menu!
   * @returns void
   */
  showMenu() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
    this.scene = 'menu';
    const menu = document.getElementById('mainMenu') as HTMLElement;
    menu.style.display = '';
  }


  /**
   * Reads the speed from user input
   * @param {UniverseInfo} u u
   * @returns void
   */
  userInput(u: UniverseInfo) {
    if (this.mouse.lClick) {
      let v = this.pixToCoord(this.mouse.pos[0], this.mouse.pos[1]);
      v = v.times(Cx.makeNew(this.speedScale));
      u.speed = v;
    } else {
      u.speed = Cx.makeNew(0);
    }
  };


  /**
   * Come here to change aspect Ratio
   * @returns void
   */
  setGameDimensions() {
    const aspectRatio = 16/9;
    if (this.scene == 'start') {
      if (window.innerHeight * aspectRatio >= window.innerWidth) {
        this.gameWidth = window.innerWidth;
        this.gameHeight = this.gameWidth / aspectRatio;
      } else {
        this.gameHeight = window.innerHeight;
        this.gameWidth = this.gameHeight * aspectRatio;
      }
    } else {
      this.gameWidth = window.innerWidth;
      this.gameHeight = window.innerHeight;
    }
    this.area.width = this.gameWidth;
    this.area.height = this.gameHeight;
    this.scale = 0.4 * this.gameHeight;
  }

  /**
   * @param  {GameStatus} g g
   * @returns void
   */
  setResizeListener() {
    const self = this;
    window.onresize = function() {
      self.setGameDimensions();
    };
  }
}
