'use strict';
// // @ts-check
/* eslint-disable*/
/* eslint-disable guard-for-in */
/* eslint-disable no-invalid-this */
// TODO Destructure u in function calls!
/* When crossing a wall, things have to move around
Need to be aware of which copies of the fundamental domain are on screen.
Just sampling??
Also need to replace Thing.pos by an array since you can have
multiple copies on screen
 */
/* let displayingGraphics;
if (typeof window === 'undefined') {
  displayingGraphics = false;
} else {
  displayingGraphics = true;
} */
const testing = true;
let then; // Time of last animation frame
const keyCodes = {
    leftKey: 37,
    tab: 9,
    alt: 18,
    enter: 13,
    rightKey: 39,
    upKey: 38,
    downKey: 40,
    rKey: 82,
    spaceBar: 32,
    rShift: 16,
    aKey: 65,
    dKey: 68,
    sKey: 83,
    wKey: 87,
    mKey: 77,
    pKey: 80,
    oKey: 79,
    cKey: 67,
};
const images = {
    imgCar: new Image(),
    imgTree: new Image(),
};
window.onload = function () {
    getImageSources();
    document.fonts.onloadingdone = finishLoading;
};
/**
 * What to do once we have fonts
 */
function finishLoading() {
    document.getElementById('LoadingMessage').style.color = '#000033';
    const g = new GameStatus(); // g for game
    g.area.style.display = 'inline';
    setKeyListeners(g);
    g.showMenu();
    //    controlsClickingListeners(g);
    mainMenuListeners(g);
    if (testing) {
        g.openStuffAutomatically();
    }
}
/** All the variables go here
 * @property {'start'|'GameOver'|'menu'|'options'} scene
 * @property {boolean} playing
 * @property {boolean} paused
 * @property {Object.<number, boolean>} keysList
 * keysList[keyCodes.keyCoce.leftKey] = true means leftKey is pressed
 * @property {number} msPerFrame - Should be 40, make it bigger for my computer
 * @property {Object} mouse
 * @property {[x,y]}  mouse.pos
 * @property {boolean} mouse.lClick
 * @property {boolean} mouse.rClick
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
 * @property {number} defaultSpeed
*/
class GameStatus {
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
        this.p1Keys = new KeySet(keyCodes.leftKey, keyCodes.rightKey, keyCodes.upKey, keyCodes.rShift, keyCodes.downKey);
        this.p2Keys = new KeySet(keyCodes.aKey, keyCodes.dKey, keyCodes.wKey, keyCodes.spaceBar, keyCodes.sKey);
        this.area = document.getElementById('gameZone');
        this.area.width = this.gameWidth;
        this.area.style.width = this.gameWidth + 'px';
        this.area.height = this.gameHeight;
        this.area.style.height = this.gameHeight + 'px';
        this.ctx = this.area.getContext('2d');
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.scale = 0;
        setGameDimensions(this);
        setResizeListener(this);
        this.speedScale = 1 / 40;
        this.defaultSpeed = 0.01;
    }
    /**
     * Finds the complex number corresponding to pixel coordinates
     * // TODO rename to pixToZ
     * @param {number} x
     * @param {number} y
     * @return {Cx}
     */
    pixToCoord(x, y) {
        let re = x - this.gameWidth / 2;
        let im = this.gameHeight / 2 - y;
        re = re / this.scale;
        im = im / this.scale;
        return new Cx(re, im);
    }
    /**
     * Finds the pixel coordinates from top and bottom of a given complex number
     * TODO rename to pixToZ
     * @param {CxLike} z -  A complex number representing a point
     * @return {[number, number]}
     */
    coordToPix(z) {
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
     */
    drawBackground() {
        this.ctx.fillStyle = '#61b061';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
    }
    /**
     * Draw the "Things"
     * @param {UniverseInfo} u
     */
    drawObjects(u) {
        drawObj(new Thing(new Cx(0, 0), 'Player'), this, u);
        /* drawObj(new thing(new cx(1,0), "Player"), g, u);
          drawObj(new thing(new cx(0,1), "Player"), g, u);*/
        for (const o in u.objectList) {
            drawObj(u.objectList[o], this, u);
        }
        for (const w in u.domain.walls) {
            u.domain.walls[w].draw(this);
        }
        /* for (let w in u.wallList){
              drawWall(u.wallList[w], g, u);
          }*/
    }
    /**
     * Start the looping (this function runs once)
     */
    startTheGame() {
        document.getElementById('mainMenu').style.display = 'none';
        const u = new UniverseInfo();
        makeChangeable(u, 'curvature', 'g_input');
        u.addRandomObjects(150, 3);
        this.drawBackground();
        this.playing = true;
        then = Date.now();
        this.scene = 'start';
        playAnim(this, u);
    }
    /**
   * don't wait to click buttons, just open stuff automatically
   */
    openStuffAutomatically() {
        //  g.startTheGame();
    }
    /**
   * Pauses
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
     */
    unPause() {
        this.paused = false;
    }
    /**
     * Shows the menu!
     */
    showMenu() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        this.scene = 'menu';
        document.getElementById('mainMenu').style.display = '';
    }
}
/**
 * Come here to change aspect Ratio
 * @param  {GameStatus} g
 */
function setGameDimensions(g) {
    const aspectRatio = 16 / 9;
    if (window.innerHeight * aspectRatio >= window.innerWidth) {
        g.gameWidth = window.innerWidth;
        g.gameHeight = g.gameWidth / aspectRatio;
    }
    else {
        g.gameHeight = window.innerHeight;
        g.gameWidth = g.gameHeight * aspectRatio;
    }
    g.area.width = g.gameWidth;
    g.area.height = g.gameHeight;
    g.scale = 0.4 * g.gameHeight;
}
/**
 * @param  {GameStatus} g
 */
function setResizeListener(g) {
    window.onresize = function () {
        setGameDimensions(g);
    };
}
/**
 * For the start and options buttons
 * @param {GameStatus} g
 */
function mainMenuListeners(g) {
    document.getElementById('gameStart').addEventListener('click', function (e) {
        g.startTheGame();
    });
    document.getElementById('openOptions')
        .addEventListener('click', function () {
        // showOptions(g, u);
    });
}
/**
 * Initialize the event listeners once and for all
 * @param {GameStatus} g
 */
function setKeyListeners(g) {
    g.keysList = []; // At any given point, keysList[keyCodes.leftKey]
    // should be a Boolean saying if the left key is pressed
    window.onkeyup = function (e) {
        g.keysList[e.keyCode] = false;
    };
    window.onkeydown = function (e) {
        g.keysList[e.keyCode] = true;
        // console.log(e.keyCode);
        if (e.keyCode == keyCodes.leftKey ||
            e.keyCode == keyCodes.rightKey ||
            e.keyCode == keyCodes.upKey ||
            e.keyCode == keyCodes.downKey ||
            e.keyCode == keyCodes.spaceBar) { // /
            // Don't scroll with special keys ///////////
            e.preventDefault();
        }
        // if (g.changingKey) {
        // Are we in the screen where controls are changed?///
        // TODO Allow changing controls
        // }
    };
    window.onkeypress = function () {
        debugger;
        if (g.scene == 'GameOver') {
            if (g.keysList[keyCodes.rKey]) {
                g.startTheGame();
            }
            else if (g.keysList[keyCodes.mKey]) {
                g.showMenu();
            }
        }
        if (g.scene == 'menu') {
            if (g.keysList[keyCodes.sKey]) {
                g.startTheGame();
            }
            else if (g.keysList[keyCodes.oKey]) {
                // showOptions(g);
            }
            else if (g.keysList[keyCodes.cKey]) {
                // showCredits(g);
            }
        }
        if (g.scene == 'options' || g.scene == 'credits') {
            if (g.keysList[keyCodes.mKey]) {
                document.getElementById('options').style.display = 'none';
                g.showMenu();
            }
        }
        if (g.scene == 'start') {
            if (g.keysList[keyCodes.pKey] && !g.paused) {
                g.pause();
            }
            else if (g.keysList[keyCodes.pKey] && g.paused) {
                g.unPause();
            }
        }
        if (g.paused && g.keysList[keyCodes.mKey]) {
            g.paused = false;
            g.showMenu();
        }
    };
    g.area.addEventListener('mousedown', function (e) {
        if (e.button === 0) {
            g.mouse.lClick = true;
        }
        else if (e.button == 2) {
            g.mouse.rClick = true;
        }
    });
    g.area.addEventListener('mouseup', function (e) {
        if (e.button === 0) {
            g.mouse.lClick = false;
        }
        else if (e.button == 2) {
            g.mouse.rClick = false;
        }
    });
    g.area.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
    g.area.addEventListener('mousemove', function (evt) {
        g.mouse.pos = getMousePos(g.area, evt);
    });
}
// ///// COMPLEX NUMBERS /////////////////////
/**
 * A number or a complex number
 * @typedef {(number|Cx)} CxLike
 */
/**
 * @property {number|undefined} re
 * @property {number|undefined} im
 * @property {boolean} infty
 */
class Cx {
    /**
     * returns a+bi
     * @param {number} a Real part
     * @param {number} b Complex part
     * @param {boolean} [infty=false]
     */
    constructor(a, b, infty) {
        this.infty = !!infty;
        if (!this.infty) {
            this.re = a;
            this.im = b;
        }
    }
    ;
    /**
     * @param {CxLike} z
     * @return {Cx} this + z
     */
    plus(z) {
        if (typeof z == 'number') {
            z = Cx.makeNew(z);
        }
        if (this.infty || z.infty) {
            console.error('Adding infinity');
            return null;
        }
        return new Cx(this.re + z.re, this.im + z.im);
    }
    ;
    /**
     * Multiplication
     * @param {CxLike} z factor
     * @return {Cx} this * z
     */
    times(z) {
        if (typeof z == 'number') {
            z = Cx.makeNew(z);
        }
        if (this.infty || z.infty) {
            console.error('Multiplying infinity');
            return null;
        }
        const a1 = this.re * z.re - this.im * z.im;
        const b1 = this.re * z.im + this.im * z.re;
        return new Cx(a1, b1);
    }
    ;
    /**
     * @return {boolean}
     */
    isZero() {
        if (this.re === 0 && this.im === 0 && !this.infty) {
            return true;
        }
        else {
            return false;
        }
    }
    ;
    /**
     * @return {number} |this|^2
     */
    absSq() {
        return this.re * this.re + this.im * this.im;
    }
    ;
    /**
     * @return {number} |this|
     */
    abs() {
        return Math.sqrt(this.absSq());
    }
    ;
    /**
     * The principal argument
     * @return {number|undefined}
     * arg(0), arg(infty) are undefined
     */
    arg() {
        if (this.infty || this.isZero()) {
            return undefined;
        }
        if (this.im === 0) {
            if (this.re > 0) {
                return 0;
            }
            else {
                return Math.PI;
            }
        }
        else {
            let answer = Math.atan(-this.re / this.im) + Math.PI / 2;
            if (this.im < 0) {
                answer = answer - Math.PI;
            }
            return answer;
        }
        // if (this.re === 0) {
        //   if (this.im > 0) {
        //     return Math.PI / 2;
        //   } else {
        //     return -Math.PI / 2;
        //   }
        // } else {
        //   let answer = Math.atan(this.im / this.re);
        //   if (this.re < 0) {
        //     answer = answer + Math.PI;
        //   }
        //   return answer;
        // }
    }
    ;
    /**
     * @return {Cx} overline this
     */
    cong() {
        return new Cx(this.re, -this.im);
    }
    ;
    /**
     * @return {Cx} this^(-1)
     */
    inv() {
        const absSq = this.absSq();
        if (this.absSq() === 0) {
            console.error('Divide by 0');
            return null;
        }
        else {
            return this.cong().times(Cx.makeNew(1 / absSq));
        }
    }
    ;
    /**
     * @param  {Cx|number} z
     * @return {Cx} this/z
     */
    divide(z) {
        if (typeof z == 'number') {
            z = Cx.makeNew(z);
        }
        return this.times(z.inv());
    }
    ;
    /**
     * Exponentiation for real exponents
     * @param  {number} n - a real number
     * @return {Cx} this^n
     */
    power(n) {
        let R2 = this.absSq();
        let a = this.arg();
        R2 = Math.pow(R2, n / 2);
        a = a * n;
        return new Cx(R2 * Math.cos(a), R2 * Math.sin(a));
    }
    ;
    /**
     * @param  {Mobius} A
     * @return {Cx}
     */
    mobius(A) {
        const M = A.matrix;
        let answer;
        if (this.infty) {
            if (M[1][0].isZero()) {
                answer = new Cx(0, 0);
                answer.infty = true;
            }
            else {
                answer = M[0][0].divide(M[1][0]);
            }
        }
        else {
            const num = this.times(M[0][0]).plus(M[0][1]);
            const den = this.times(M[1][0]).plus(M[1][1]);
            if (den.isZero()) {
                if (num.isZero()) {
                    answer = M[0][0].divide(M[1][0]);
                }
                else {
                    answer = Cx.infty();
                }
            }
            else {
                answer = num.divide(den);
            }
        }
        if (A.cong) {
            answer = answer.cong();
        }
        return answer;
    }
    ;
    /**
     * @return {string} INFTY or
     */
    toString() {
        if (this.infty) {
            return 'INFTY';
        }
        else {
            return this.re + ' + ' + this.im + 'i';
        }
    }
    /**
     * @return {Cx} infinity
     */
    static infty() {
        const z = new Cx(undefined, undefined);
        z.infty = true;
        return z;
    }
    /**
     * @return {Cx} i
     */
    static i() {
        return new Cx(0, 1);
    }
    /**
     * Turn real into complex
     * @param {number|Cx} z
     * @return {Cx} z
     */
    static makeNew(z) {
        if (typeof z == 'number') {
            return new Cx(z, 0);
        }
        else if (z.constructor == Cx) {
            return z;
        }
    }
    /**
     * Make the entries Cx
     * @param {Array.<Array.<CxLike>>} A
     * @return {Array.<Array.<Cx>>}
     */
    static matrix(A) {
        const B = Array(A.length).fill([]);
        for (const i in A) {
            for (const j in A[i]) {
                B[i][j] = Cx.makeNew(A[i][j]);
            }
        }
        return B;
    }
    /**
     * A complex number chosen uniformly in a bound x bound box
     * @param {number} [bound=1] Size of the box
     * @return {Cx}
     */
    static random(bound) {
        bound = bound || 1;
        return new Cx((2 * Math.random() - 1) * bound, (2 * Math.random() - 1) * bound);
    }
}
/**
 * Gives the key codes names for easy access
 */
/**
 * @param {number} code
 * @return {string} The string to name this key e.g. "tab"
 */
function stringFromCharCode(code) {
    if (code == keyCodes.leftKey) {
        return 'Left';
    }
    else if (code == keyCodes.rightKey) {
        return 'Right';
    }
    else if (code == keyCodes.upKey) {
        return 'Up';
    }
    else if (code == keyCodes.downKey) {
        return 'Down';
    }
    else if (code == keyCodes.spaceBar) {
        return 'Space Bar';
    }
    else if (code == keyCodes.rShift) {
        return 'Shift';
    }
    else if (code == keyCodes.tab) {
        return 'Tab';
    }
    else if (code == keyCodes.enter) {
        return 'Enter';
    }
    else {
        return String.fromCharCode(code);
    }
}
// //////// Default controls  /////////////////////////////////
/**
 * @param {HTMLCanvasElement} canvas the canvas
 * @param {MouseEvent} evt The mousemove event
 * @return {[number, number]} distance from left and top in pixels
 */
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left, evt.clientY - rect.top];
}
/**
 * Make it so we can change a parameter via form input
 * @param {object} what an object whose property we will change
 * @param {string} property the property key
 * @param {string} label label to be displayed
 */
function makeChangeable(what, property, label) {
    const htmlList = document.getElementById('variables');
    const inputBox = document.createElement('p');
    inputBox.innerHTML = [
        label + ':  ',
        '<input id = "' + label + '" type = "text">'
    ].join('\n');
    htmlList.appendChild(inputBox);
    document.getElementById(label).value = what[property];
    document.getElementById(label).addEventListener('input', function () {
        what[property] = parseFloat(document.getElementById(label).value);
    });
}
// Object that stores controls for a given player //////////
/**
 * Stores which keys do what
 * @property {number} moveLeft
 * @property {number} moveRight
 * @property {number} thrust
 * @property {number} fire
 * @property {number} special
 */
class KeySet {
    /**
     * Input codes for all controls
     * @param {number} moveLeft
     * @param {number} moveRight
     * @param {number} thrust
     * @param {number} fire
     * @param {number} special
     */
    constructor(moveLeft, moveRight, thrust, fire, special) {
        this.moveLeft = moveLeft;
        this.moveRight = moveRight;
        this.thrust = thrust;
        this.fire = fire;
        this.special = special;
    }
    /**
     * changeKey(left, 3) makes keyCode 3  become the left control
     * @param {string} whichKey left, right, thrust, fire, special
     * @param {number} newCode keyCode for new key
     */
    changeKey(whichKey, newCode) {
        switch (whichKey) {
            case 'left':
                this.moveLeft = newCode;
                break;
            case 'right':
                this.moveRight = newCode;
                break;
            case 'thrust':
                this.thrust = newCode;
                break;
            case 'fire':
                this.fire = newCode;
                break;
            case 'special':
                this.special = newCode;
                break;
        }
    }
    ;
}
;
/**
 * @property {number} curvature This value^(-1/2) is the radius of
 * the circle at infinity (if negative),
 * or the radius of the equator if positive
 * @property {Array.Thing} objectList The stuff lying around on the map
 * @property {Array.Wall} wallList Walls of the fundamental domain
 * @property {Cx} speed speed of the player
 * @property {Polygon} domain fundamental domain
 */
class UniverseInfo {
    /**
     * No info needed
     */
    constructor() {
        this.curvature = -0.2;
        this.objectList = [];
        // TODO do we even use this property or is it contained in domain?
        this.wallList = [ /* new wall(new cx(1, 0), new cx(0, 1), this),
                new wall(new cx(Math.random(), Math.random()),
                 new cx(Math.random(), Math.random()), this),
                new wall(new cx(Math.random(), Math.random()),
                new cx(Math.random(), Math.random()), this),
                new wall(new cx(Math.random(), Math.random()),
                new cx(Math.random(), Math.random()), this) */];
        this.speed = Cx.makeNew(0);
        this.domain = new Polygon([], []);
    }
    ;
    /**
     * Reads the speed from user input
     * @param {GameStatus} g
     */
    setSpeed(g) {
        if (g.mouse.lClick) {
            let v = g.pixToCoord(g.mouse.pos[0], g.mouse.pos[1]);
            v = v.times(Cx.makeNew(g.speedScale));
            this.speed = v;
        }
        else {
            this.speed = Cx.makeNew(0);
        }
    }
    ;
    /**
     * Creates the polygon and walls
     * @param {string} label Orbifold notation?
     */
    makeDomain(label) {
        switch (label) {
            case 'o':
                this.curvature = 0;
                this.domain = Polygon.fromVerticesAndTransf([
                    Cx.makeNew(1),
                    Cx.i().plus(1),
                    Cx.i(),
                    Cx.makeNew(0),
                ], [
                    new Mobius(Cx.matrix([[1, 1], [0, 1]]), false),
                    new Mobius(Cx.matrix([[1, Cx.i()], [0, 1]]), false),
                    new Mobius(Cx.matrix([[1, -1], [0, 1]]), false),
                    new Mobius(Cx.matrix([[1, Cx.i().times(-1)], [0, 1]]), false),
                ], this.curvature);
                break;
        }
    }
    /**
     * A step of one frame.
     * Moves objects and walls
     * @param {GameStatus} g
     */
    move(g) {
        this.setSpeed(g);
        const M = findMobius(this.speed, this.curvature); // / sends speed to 0
        if (!this.speed.isZero() && !isNaN(M.matrix[1][0].re)) {
            for (const o in this.objectList) {
                this.objectList[o].pos = this.objectList[o].pos.mobius(M);
                //            if(isNaN(this.objectList[o].pos.re)){
                //                debugger;
                //            }
            }
            for (const w in this.wallList) {
                this.wallList[w].moveBy(M);
            }
            this.domain.move(M);
            this.domain.reset();
        }
    }
    ;
    /**
   * Adds trees
   * @param {number} n - How many?
   * @param {number} spread - How far apart?
   */
    addRandomObjects(n, spread) {
        for (let i = 0; i < n; i++) {
            const pos = Cx.random(spread);
            const o = new Thing(pos, 'Tree');
            this.objectList.push(o);
        }
    }
    /**
     * This is the norm of the differential of the Mobius transformation
     * from 0 to z. I.e. If the thing is size 1 at the origin, it has size
     * localScale if it is at z.
     * @param {Cx} z Where
     * @return {number}
     */
    localScale(z) {
        const S = 1 + z.absSq() * this.curvature;
        return Math.max(0, S);
    }
}
;
/**
 * Finds the isometry that sends z to 0 and 0 to -z
 * @param {CxLike} z
 * @param {number} curve - the curvature
 * @return {Mobius}
 */
function findMobius(z, curve) {
    z = Cx.makeNew(z);
    if (z.infty && curve > 0) {
        return new Mobius([[0, 1], [1, 0]], false);
    }
    let deter = 1 / (1 + z.absSq() * curve);
    deter = Math.sqrt(deter);
    return new Mobius(Cx.matrix([[deter, z.times(-1).times(deter)],
        [z.cong().times(curve * deter), deter]]), false);
}
/**
 * @typedef {Array.<Array.<CxLike>>} CxLikeMatrix
 */
/**
 * @typedef {Array.<Array.<Cx>>} CxMatrix
 */
/**
 * A mobius transformation is given by az+b/cz+d,
 * followed by conjugation if this.cong
 * @property {CxMatrix} matrix - The matrix
 * describing the transformation
 * @property {boolean} cong - Is it followed by conjugation?
 */
class Mobius {
    /**
     * @param {CxLikeMatrix} matrix
     * @param {boolean} cong
     */
    constructor(matrix, cong) {
        // A mobius transformation is the matrix, then conjugation maybe
        this.matrix = Cx.matrix(matrix);
        this.cong = cong;
    }
    /**
     * Composition of Mobius tranformations.
     * @param {Mobius} M2
     * @return {Mobius} this o M2
     */
    mobiusTimes(M2) {
        let A1 = this.matrix;
        const A2 = M2.matrix;
        if (M2.cong) {
            A1 = conjugateMatrix(A1);
        }
        const answer = Cx.matrix([[1, 0], [0, 1]]);
        answer[0][0] = A1[0][0].times(A2[0][0]).plus(A1[0][1].times(A2[1][0]));
        answer[0][1] = A1[0][0].times(A2[0][1]).plus(A1[0][1].times(A2[1][1]));
        answer[1][0] = A1[1][0].times(A2[0][0]).plus(A1[1][1].times(A2[1][0]));
        answer[1][1] = A1[1][0].times(A2[0][1]).plus(A1[1][1].times(A2[1][1]));
        return new Mobius(answer, this.cong != M2.cong);
    }
    /**
     * Conjugation
     * @param {Mobius} A - We conjugate by A
     * @return {Mobius} - A * this* A^-1
     */
    mobiusConjugate(A) {
        let answer = A.mobiusTimes(this);
        answer = answer.mobiusTimes(A.mobiusInv());
        return answer;
    }
    /**
     * Inverse
     * @return {Mobius} The inverse
     */
    mobiusInv() {
        const A = this.matrix;
        let B = [[A[1][1], A[0][1].times(-1)],
            [A[1][0].times(-1), A[0][0]]];
        if (this.cong) {
            B = conjugateMatrix(B);
        }
        return new Mobius(B, this.cong);
    }
    /**
     * Find the unique Mobius transformation such that
     * z1 --> 0
     * z2 --> a positive real number
     * TODO replace u by u.curvature
     * @param {Cx} z1 - Point 1
     * @param {Cx} z2 - Point 2
     * @param {number} curvature
     * @return {Mobius}
     */
    static twoPoints(z1, z2, curvature) {
        const M1 = findMobius(z1, curvature); // sends z1 to 0
        let z2Translate = z2.mobius(M1);
        /*
          console.log(z2Translate);
      */
        z2Translate = z2Translate
            .divide(Cx.makeNew(z2Translate.abs())).cong().power(0.5);
        const M2 = new Mobius(Cx.matrix([[z2Translate, 0],
            [0, z2Translate.inv()]]), false);
        // sends 0 to 0 and M1(z2) to the reals
        return M2.mobiusTimes(M1); // sends z1 to 0 and z2 to the reals
    }
}
/* TODO make sure that everywhere mobius transformations
can be taken to be complex-like rather than complex
TODO rename the word Mobius from these functions!!
 */
/**
 * Shouldn't this just return a matrix?
 * @param {CxMatrix} M a matrix
 * @return {CxMatrix}
 */
function conjugateMatrix(M) {
    const A = Cx.matrix([[1, 0], [0, 1]]);
    for (const i in M) {
        for (const j in M) {
            A[i][j] = M[i][j].cong();
        }
    }
    return A;
}
/**
 * @param {CxMatrix} A
 * @return {Cx}
 */
function determinant(A) {
    A = Cx.matrix(A);
    return A[0][0].times(A[1][1]).plus(A[1][0].times(A[0][1]).times(-1));
}
/**
 * Objects lying around
 * @property {Cx} pos - Position
 * @property {string} type - "Tree", "Player"
 */
class Thing {
    /**
     * Give it position and type
     * @param {CxLike} pos Position
     * @param {string} type "Tree", "Player"
     */
    constructor(pos, type) {
        this.pos = Cx.makeNew(pos);
        this.type = type;
    }
}
/**
 * Walls have two chosen vertices z1, z2 (very redundant)
 * @property {Mobius} goesToOrigin - Transformation
 * that sends this wall to the real line. Concretely it sends
 * z1 to 0, z2 to the positive reals
 * @property {Mobius} originToWall - Transformation that
 * sends the real line to this wall. It sends
 * 0 to z1 and a positive real to z2
 * @property {boolean} isStraight - is it a line? it's a circle otherwise
 * @property {Cx|undefined} center - if it's a circle, this is the center
 * @property {radius|undefined} radius - if it's a circle, this is the radius
 * @property {UniverseInfo} u - the universe we are in
 */
class Wall {
    /**
     * We give the wall from two vertices
     * @param {Cx} z1 - z1 point on the wall
     * @param {Cx} z2 - z2 point on the wall
     * @param {number} curvature - u.curvature
     */
    constructor(z1, z2, curvature) {
        this.goesToOrigin = Mobius.twoPoints(z1, z2, curvature);
        this.originToWall = this.goesToOrigin.mobiusInv();
        this.curvature = curvature;
        // TODO rename to replace "origin" by "reals"??
        this.computeThings();
    }
    /**
     * Is z on this wall?
     * @param {Cx} z - a point
     * @return {boolean}
     */
    onWall(z) {
        const translate = z.mobius(this.goesToOrigin);
        return translate.im === 0;
    }
    ;
    /**
     * Is z ``over'' this wall? i.e. is the triangle
     * z1-z2-z clcokwise?
     * @param {Cx} z - a point
     * @return {boolean}
     */
    isLeft(z) {
        const translate = z.mobius(this.goesToOrigin);
        return translate.im > 0;
    }
    ;
    /**
     * computes the center and the radius or evaluates isStraight
     */
    computeThings() {
        if (this.curvature === 0) {
            this.isStraight = true;
        }
        else {
            this.isStraight = this.onWall(Cx.makeNew(0));
        }
        if (!this.isStraight) {
            this.center = this.findCenterOfWall();
            this.radius = this.center
                .plus(Cx.makeNew(0).mobius(this.originToWall).times(-1)).abs();
        }
        else {
            this.center = undefined;
            this.radius = undefined;
        }
    }
    ;
    /**
     * The image under a Mobius tranformation
     * @param {Mobius} M - A transformation
     */
    moveBy(M) {
        this.goesToOrigin = this.goesToOrigin.mobiusTimes(M.mobiusInv());
        this.originToWall = M.mobiusTimes(this.originToWall);
        this.computeThings();
    }
    ;
    /**
     * Assuming this wall is a circle
     * @return {Cx} - The center of the circle
     */
    findCenterOfWall() {
        // a1, a2, a3 are three points on the wall
        const a1 = Cx.makeNew(0).mobius(this.originToWall);
        const a2 = Cx.makeNew(1).mobius(this.originToWall);
        const a3 = Cx.makeNew(-1).mobius(this.originToWall);
        // b12, b13 are the vectors joining these
        const b12 = a1.plus(a2.times(-1));
        const b13 = a1.plus(a3.times(-1));
        // m12, m13 are the midpoints between a1a2, a1a3
        const m12 = a2.plus(b12.times(1 / 2));
        const m13 = a3.plus(b13.times(1 / 2));
        // The answer is the intersection between the perpendicular lines
        // to b12, b13 through m12, m13.
        const A = [[b12.re, b12.im],
            [b13.re, b13.im]];
        const b = [[b12.re * m12.re + b12.im * m12.im],
            [b13.re * m13.re + b13.im * m13.im]];
        /* console.log("Mobius:");
        console.log(M);*/
        // We are finding the vector c such that
        // c.b12 = m12.b12 & c.b13 = m13.b13
        const x = Math.lusolve(A, b);
        return new Cx(x[0][0], x[1][0]);
    }
    /**
   * Draw this on the canvas
   * @param {GameStatus} g
   */
    draw(g) {
        /* for (let x = -3; x < 3; x+= 0.1){SHADE THE WHOLE AREA
              for (let y = -3; y < 3; y+= 0.1){
                  let z = new cx(x, y);
                  let V = g.coordToPix(z);
                  let color = "blue";
                  if (W.isLeft(z)){
                      color = "red";
                  }
                  g.ctx.fillStyle = color;
                  g.ctx.beginPath();
                  g.ctx.arc(V[0], V[1], 0.006 * g.scale, 0, 2 * Math.PI);
                  g.ctx.fill();
              }
          }*/
        if (this.isStraight) {
            const a1 = g.coordToPix(Cx.makeNew(-100).mobius(this.originToWall));
            const a2 = g.coordToPix(Cx.makeNew(100).mobius(this.originToWall));
            g.ctx.strokeStyle = 'black';
            g.ctx.beginPath();
            g.ctx.moveTo(a1[0], a1[1]);
            g.ctx.lineTo(a2[0], a2[1]);
            g.ctx.stroke();
        }
        else {
            const x = g.coordToPix(this.center);
            const r = this.radius * g.scale;
            g.ctx.strokeStyle = 'black';
            g.ctx.beginPath();
            g.ctx.arc(x[0], x[1], r, 0, 2 * Math.PI);
            g.ctx.stroke();
        }
    }
}
/**
 * @property {Array.Mobius} transf - T[i] is the Mobius transformation
 * you should do if you cross past Z[i] -- Z[i+1]
 * @property {Array.Wall} walls - the walls
 */
class Polygon {
    /**
     * Make a polygon from the list of walls and the list of transformations
     * @param {Array.<Mobius>} transf  - Array of Mobius transformations
     * @param {Array.<Wall>} walls - Wall list. In clockwise order???
     */
    constructor(transf, walls) {
        // Z is an array of the vertices, and T[i] is the Mobius transformation
        // you should do if you cross past Z[i] -- Z[i+1]
        this.transf = transf;
        this.walls = walls;
    }
    /**
   * A polygon from the list of vertices plus the transformations
   * @param {Array.<Cx>} vertices - Polygon vertices
   * @param {Array.<Mobius>} transf - transformations
   * @param {number} curvature - curvature?
   * @return {Polygon}
   */
    static fromVerticesAndTransf(vertices, transf, curvature) {
        // Z is an array of the vertices, and T[i] is the Mobius transformation
        // you should do if you cross past Z[i] -- Z[i+1]
        const walls = [];
        for (let i = 0; i < vertices.length; i++) {
            walls.push(new Wall(vertices[i], vertices[(i + 1) % vertices.length], curvature));
        }
        return new Polygon(transf, walls);
    }
    /**
    * Is the origin inside the polygon?
    * @param {Polygon} p - the polygon
    * @return {number} - The index of the first wall hit,
    * OR -1 if nothing is hit
    */
    static crossed(p) {
        for (let i = 0; i < p.walls.length; i++) {
            if (!p.walls[i].isLeft(Cx.makeNew(0))) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Moves this polygon by the transformation M
     * @param {Mobius} M
     */
    move(M) {
        for (const i in this.walls) {
            this.walls[i].moveBy(M);
        }
        for (const i in this.transf) {
            this.transf[i] = this.transf[i].mobiusConjugate(M);
        }
    }
    /**
     * Transform according to the wall we crossed
     * @param {number} i which wall?
     */
    crossWall(i) {
        this.move(this.transf[i]);
    }
    /**
     * Check if we have crossed a wall, move the polygon accordingly
     * TODO: There are too many functions to do one thing
     * This assumes we've only crossed one wall.
     */
    reset() {
        for (let wallcount = 0; wallcount < 10; wallcount++) {
            const i = Polygon.crossed(this);
            if (i != -1) {
                this.crossWall(i);
            }
            else {
                return;
            }
        }
        throw new Error('We have crossed 10 walls at once');
    }
}
// ////////////////////////DRAWING //////
// / IMAGES
/**
 * All the file names
 */
function getImageSources() {
    images.imgCar.src = 'Car.png';
    images.imgTree.src = 'Tree.png';
}
/**
 * Puts an image on the canvas
 * @param {HTMLImageElement} img
 * @param {Cx} center
 * @param {number} radius average of the width and the height
 * I'm pretty sure it's in pixels
 * @param {number} rotation Clockwise
 * @param {GameStatus} g - g
 */
function drawImage(img, center, radius, rotation, g) {
    // //the radius is the average of the width and the height
    const position = g.coordToPix(center);
    const scale = 2 * radius / (img.width + img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    g.ctx.translate(position[0], position[1]);
    g.ctx.rotate(-rotation);
    g.ctx.drawImage(img, -w / 2, -h / 2, w, h);
    /* g.ctx.fillStyle = "white";
      g.ctx.fillRect(0, 0, 100, 100);*/
    g.ctx.rotate(rotation);
    g.ctx.translate(-position[0], -position[1]);
}
/**
 * Draws a thing on the canvas
 * @param {Thing} o The drawn thing
 * @param {GameStatus} g
 * @param {UniverseInfo} u
 */
function drawObj(o, g, u) {
    // const V = g.coordToPix(o.pos);
    let s = u.localScale(o.pos);
    s = Math.min(s, 10);
    switch (o.type) {
        case 'Tree':
            if (s !== 0) {
                drawImage(images.imgTree, o.pos, 0.2 * g.scale * s, 0, g);
                /* g.ctx.fillStyle = 'red';
                        g.ctx.beginPath();
                        g.ctx.arc(V[0], V[1], 0.03 * g.scale * s, 0, 2 * Math.PI);
                        g.ctx.fill();*/
            }
            break;
        case 'Player':
            if (s !== 0) {
                drawImage(images.imgCar, o.pos, 0.2 * g.scale * s, g.pixToCoord(g.mouse.pos[0], g.mouse.pos[1]).arg(), g);
                /* g.ctx.fillStyle = '#080270';
                        g.ctx.beginPath();
                        g.ctx.arc(V[0], V[1], 0.06 * g.scale * s, 0, 2 * Math.PI);
                        g.ctx.fill();*/
            }
            break;
    }
}
/**
 * Play a step in the animation
 * or wait some more
 * TODO make it not recursive???
 * @param {GameStatus} g
 * @param {UniverseInfo} u
 */
function playAnim(g, u) {
    const currTime = Date.now();
    if (currTime - then > g.msPerFrame && g.playing && !g.paused) {
        then = Date.now();
        g.drawBackground();
        u.move(g);
        //        console.log(`${u.speed.re} + ${u.speed.im}i`);
        g.drawObjects(u);
        window.requestAnimationFrame(function () {
            playAnim(g, u);
        });
    }
    else if (g.playing) {
        window.requestAnimationFrame(function () {
            playAnim(g, u);
        });
    }
    else {
        g.showMenu();
    }
}
/* function clearKeys(status, u){
    g.keysList[keyCodes.u.Player.One.keyScheme(status).thrust] = false;
    g.keysList[keyCodes.u.Player.One.keyScheme(status).fire] = false;
    g.keysList[keyCodes.u.Player.One.keyScheme(status).moveLeft] = false;
    g.keysList[keyCodes.u.Player.One.keyScheme(status).moveRight] = false;
    g.keysList[keyCodes.u.Player.Two.keyScheme(status).thrust] = false;
    g.keysList[keyCodes.u.Player.Two.keyScheme(status).fire] = false;
    g.keysList[keyCodes.u.Player.Two.keyScheme(status).moveLeft] = false;
    g.keysList[keyCodes.u.Player.Two.keyScheme(status).moveRight] = false;
}*/
/* function controlsClickingListeners(status){
    document.getElementById("p1left").addEventListener("click", function () {
        changeControls(g.p1Keys, "left", "p1left", status);
    });
    document.getElementById("p1right").addEventListener("click", function () {
        changeControls(g.p1Keys, "right", "p1right", status);
    });
    document.getElementById("p1thrust").addEventListener("click", function () {
        changeControls(g.p1Keys, "thrust", "p1thrust", status);
    });
    document.getElementById("p1fire").addEventListener("click", function () {
        changeControls(g.p1Keys, "fire", "p1fire", status);
    });
    document.getElementById("p1special").addEventListener("click", function () {
        changeControls(g.p1Keys, "special", "p1special", status);
    });
    document.getElementById("p2left").addEventListener("click", function () {
        changeControls(g.p2Keys, "left", "p2left", status);
    });
    document.getElementById("p2right").addEventListener("click", function () {
        changeControls(g.p2Keys, "right", "p2right", status);
    });
    document.getElementById("p2thrust").addEventListener("click", function () {
        changeControls(g.p2Keys, "thrust", "p2thrust", status);
    });
    document.getElementById("p2fire").addEventListener("click", function () {
        changeControls(g.p2Keys, "fire", "p2fire", status);
    });
    document.getElementById("p2special").addEventListener("click", function () {
        changeControls(g.p2Keys, "special", "p2special", status);
    });
    document.getElementById("symmetricControls")
        .addEventListener("click", function () {
        symmetricControls(status);
        showControlButtons(status);
    });
}*/
// async function demo() {
//  await sleep(0);
//  finishLoading();
// }
