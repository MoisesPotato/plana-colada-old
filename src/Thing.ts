import {Cx, CxLike} from './Cx';

/**
 * Objects lying around
 * @property {Cx} pos - Position
 * @property {string} type - "Tree", "Player"
 */
export class Thing {
  pos: Cx;
  type: any;
  /**
   * Give it position and type
   * @param {CxLike} pos Position
   * @param {string} type "Tree", "Player"
   */
  constructor(pos: CxLike, type: string) {
    this.pos = Cx.makeNew(pos);
    this.type = type;
  }
}
