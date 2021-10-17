// Object that stores controls for a given player //////////
/**
 * Stores which keys do what
 * @property {number} moveLeft
 * @property {number} moveRight
 * @property {number} thrust
 * @property {number} fire
 * @property {number} special
 */


export const keyCodes = {
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
export class KeySet {
  moveLeft: number;
  moveRight: number;
  thrust: number;
  fire: number;
  special: number;
  /**
   * Input codes for all controls
   * @param {number} moveLeft
   * @param {number} moveRight
   * @param {number} thrust
   * @param {number} fire
   * @param {number} special
   */
  constructor(moveLeft: number,
      moveRight: number,
      thrust: number,
      fire: number,
      special: number) {
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
  changeKey(whichKey: string, newCode: number) {
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
  };
}
