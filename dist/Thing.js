"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thing = void 0;
const Cx_1 = require("./Cx");
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
        this.pos = Cx_1.Cx.makeNew(pos);
        this.type = type;
    }
}
exports.Thing = Thing;
