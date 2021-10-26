"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
// import {Cx, CxMatrix} from './Cx';
// import {Mobius} from './Mobius';
const GameStatus_1 = require("./GameStatus");
const UniverseInfo_1 = require("./UniverseInfo");
const KeySet_1 = require("./KeySet");
const Drawing_1 = require("./Drawing");
let then;
const testingParams = {
    // shape: 'o' as orbiName,
    // lenghts: [1, 1],
    shape: '444',
    lenghts: [1],
    testing: true,
};
window.onload = function () {
    Drawing_1.Draw.getSources();
    document.fonts.onloadingdone = finishLoading;
};
/**
 * What to do once we have fonts
 * @returns {void}
 */
function finishLoading() {
    const messageObj = document.getElementById('LoadingMessage');
    messageObj.style.color = '#000033';
    const g = new GameStatus_1.GameStatus(); // g for game
    g.area.style.display = 'inline';
    setKeyListeners(g);
    g.showMenu();
    //    controlsClickingListeners(g);
    mainMenuListeners(g);
    if (testingParams.testing) {
        g.openStuffAutomatically();
    }
}
// /**
//  * @param  {GameStatus} g
//  */
// function setResizeListener(g: GameStatus) {
//   window.onresize = function() {
//     g.setGameDimensions();
//   };
// }
/**
 * For the start and options buttons
 * @param {GameStatus} g g
 * @returns {void}
 */
function mainMenuListeners(g) {
    const startButton = document.getElementById('gameStart');
    startButton.addEventListener('click', function (_e) {
        startTheGame(g);
    });
    const editorButton = document.getElementById('openEditor');
    editorButton.addEventListener('click', function (_e) {
        openEditor(g);
    });
    const optionsButton = document.getElementById('openOptions');
    optionsButton.addEventListener('click', function () {
        // showOptions(g, u);
    });
}
/**
 * Initialize the event listeners once and for all
 * @param {GameStatus} g g
 * @returns {void}
 */
function setKeyListeners(g) {
    g.keysList = []; // At any given point, keysList[keyCodes.leftKey]
    // should be a Boolean saying if the left key is pressed
    window.onkeyup = function (e) {
        let code;
        if (e.key !== undefined) {
            code = parseInt(e.key);
        }
        else {
            code = e.keyCode;
        }
        g.keysList[code] = false;
    };
    window.onkeydown = function (e) {
        let code;
        if (e.key !== undefined) {
            code = parseInt(e.key);
        }
        else {
            code = e.keyCode;
        }
        g.keysList[code] = true;
        // console.log(code);
        if (code == KeySet_1.keyCodes.leftKey ||
            code == KeySet_1.keyCodes.rightKey ||
            code == KeySet_1.keyCodes.upKey ||
            code == KeySet_1.keyCodes.downKey ||
            code == KeySet_1.keyCodes.spaceBar) { // /
            // Don't scroll with special keys ///////////
            e.preventDefault();
        }
        // if (g.changingKey) {
        // Are we in the screen where controls are changed?///
        // TODO Allow changing controls
        // }
    };
    window.onkeypress = function () {
        if (g.scene == 'GameOver') {
            if (g.keysList[KeySet_1.keyCodes.rKey]) {
                startTheGame(g);
            }
            else if (g.keysList[KeySet_1.keyCodes.mKey]) {
                g.showMenu();
            }
        }
        if (g.scene == 'menu') {
            if (g.keysList[KeySet_1.keyCodes.sKey]) {
                startTheGame(g);
            }
            else if (g.keysList[KeySet_1.keyCodes.oKey]) {
                // showOptions(g);
            }
            else if (g.keysList[KeySet_1.keyCodes.cKey]) {
                // showCredits(g);
            }
        }
        if (g.scene == 'options' || g.scene == 'credits') {
            if (g.keysList[KeySet_1.keyCodes.mKey]) {
                const options = document.getElementById('options');
                options.style.display = 'none';
                g.showMenu();
            }
        }
        if (g.scene == 'start') {
            if (g.keysList[KeySet_1.keyCodes.pKey] && !g.paused) {
                g.pause();
            }
            else if (g.keysList[KeySet_1.keyCodes.pKey] && g.paused) {
                g.unPause();
            }
        }
        if (g.paused && g.keysList[KeySet_1.keyCodes.mKey]) {
            g.paused = false;
            g.showMenu();
        }
    };
    g.area.addEventListener('mousedown', function (e) {
        if (e.button === 0) {
            g.mouse.lClick = true;
            g.editor.mouse.lClick = true;
        }
        else if (e.button == 2) {
            g.mouse.rClick = true;
            g.editor.mouse.rClick = true;
        }
    });
    g.area.addEventListener('mouseup', function (e) {
        if (e.button === 0) {
            g.mouse.lClick = false;
            g.editor.mouse.lClick = false;
        }
        else if (e.button == 2) {
            g.mouse.rClick = false;
            g.editor.mouse.rClick = false;
        }
    });
    g.area.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
    g.area.addEventListener('mousemove', function (evt) {
        const position = getMousePos(g.area, evt);
        g.mouse.pos = position;
        g.mouse.pos = position;
    });
    g.area.addEventListener('click', g.editor.click);
    const editorButtons = document.getElementsByClassName('editorButton');
    Array(editorButtons.length).forEach((_, i) => {
        editorButtons[i].addEventListener('click', function () {
            g.editor.clickButton(editorButtons[i].id);
        });
    });
}
// ///// COMPLEX NUMBERS /////////////////////
/**
 * Gives the key codes names for easy access
 */
/**
 * @param {number} code a key Code
 * @return {string} The string to name this key e.g. "tab"
 */
function stringFromCharCode(code) {
    if (code == KeySet_1.keyCodes.leftKey) {
        return 'Left';
    }
    else if (code == KeySet_1.keyCodes.rightKey) {
        return 'Right';
    }
    else if (code == KeySet_1.keyCodes.upKey) {
        return 'Up';
    }
    else if (code == KeySet_1.keyCodes.downKey) {
        return 'Down';
    }
    else if (code == KeySet_1.keyCodes.spaceBar) {
        return 'Space Bar';
    }
    else if (code == KeySet_1.keyCodes.rShift) {
        return 'Shift';
    }
    else if (code == KeySet_1.keyCodes.tab) {
        return 'Tab';
    }
    else if (code == KeySet_1.keyCodes.enter) {
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
 * IDK IF THIS WORKS
 * @param {number} property the parameter
 * @param {string} label label to be displayed
 * @returns {void}
 */
function makeChangeable(property, label) {
    const htmlList = document.getElementById('variables');
    const inputBox = document.createElement('p');
    inputBox.innerHTML = [
        label + ':  ',
        '<input id = "' + label + '" type = "text">'
    ].join('\n');
    htmlList.appendChild(inputBox);
    const inputElt = document.getElementById(label);
    inputElt.value = property.toString();
    inputElt.addEventListener('input', function () {
        property = parseFloat(inputElt.value);
    });
}
;
/* TODO make sure that everywhere mobius transformations
can be taken to be complex-like rather than complex
TODO rename the word Mobius from these functions!!
 */
/**
 * Play a step in the animation
 * or wait some more
 * TODO make it not recursive???
 * @param {GameStatus} g g
 * @param {UniverseInfo} u u
 * @returns {void}
 */
function playAnim(g, u) {
    const currTime = Date.now();
    if (currTime - then > g.msPerFrame && g.playing && !g.paused) {
        then = Date.now();
        g.drawBackground();
        g.userInput(u);
        u.move();
        //        console.log(`${u.speed.re} + ${u.speed.im}i`);
        Drawing_1.Draw.everythingIn(g, u);
        if (testingParams.testing) {
            const w = u.domain.walls[1];
            Drawing_1.Draw.mobius(w.goesToOrigin, u.domain.vertices, g, u);
            // Draw.polygonVertices(u.domain, g, u);
        }
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
/**
   * Start the looping (this function runs once)
   * @param {GameStatus} g g
   * @returns {void}
   */
function startTheGame(g) {
    const menu = document.getElementById('mainMenu');
    menu.style.display = 'none';
    const u = new UniverseInfo_1.UniverseInfo(testingParams.shape, testingParams.lenghts);
    makeChangeable(u.curvature, 'g_input');
    u.addRandomObjects(150, 3);
    g.drawBackground();
    g.playing = true;
    then = Date.now();
    g.scene = 'start';
    playAnim(g, u);
}
/**
 *
 * @param g g
 * @returns void
 */
function openEditor(g) {
    const menu = document.getElementById('mainMenu');
    menu.style.display = 'none';
    g.drawBackground();
    g.scene = 'editor';
}
