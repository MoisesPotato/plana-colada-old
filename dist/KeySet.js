"use strict";
// Object that stores controls for a given player //////////
/**
 * Stores which keys do what
 * @property {number} moveLeft
 * @property {number} moveRight
 * @property {number} thrust
 * @property {number} fire
 * @property {number} special
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeySet = exports.keyCodes = void 0;
exports.keyCodes = {
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
/**
 * Stores the key code for each action
 * @property {number} moveLeft
  * @property {number} moveRight
  * @property {number} thrust
  * @property {number} fire
* @property {number} special
 */
class KeySet {
    /**
     * Input codes for all controls
     * @param {number} moveLeft which key to do this
     * @param {number} moveRight which key to do this
     * @param {number} thrust which key to do this
     * @param {number} fire which key to do this
     * @param {number} special which key to do this
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
     * @returns void
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
exports.KeySet = KeySet;
