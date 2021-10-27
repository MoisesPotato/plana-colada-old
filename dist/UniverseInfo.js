"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniverseInfo = void 0;
const Cx_1 = require("./Cx");
const Mobius_1 = require("./Mobius");
const Polygon_1 = require("./Polygon");
const Thing_1 = require("./Thing");
const List_of_domains_1 = require("./List of domains");
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
     * @param {orbiName} domain The shape of where we are
     * @param {number[]} lengths some parameters, depends
     * on shape
     */
    constructor(domain = 'none', lengths = []) {
        this.objectList = [];
        // TODO do we even use this property or is it contained in domain?
        this.speed = Cx_1.Cx.makeNew(0);
        [this.curvature, this.domain] = List_of_domains_1.Thurston.get(domain, lengths);
    }
    ;
    /**
     * Creates the polygon and walls
     * @param {string} label Orbifold notation?
     * @returns void
     */
    makeDomain(label) {
        switch (label) {
            case 'o':
                this.curvature = 0;
                this.domain = Polygon_1.Polygon.fromVerticesAndTransf([
                    Cx_1.Cx.makeNew(1),
                    Cx_1.Cx.i().plus(1),
                    Cx_1.Cx.i(),
                    Cx_1.Cx.makeNew(0),
                ], [
                    new Mobius_1.Mobius(Cx_1.Cx.matrix([[1, 1], [0, 1]]), false),
                    new Mobius_1.Mobius(Cx_1.Cx.matrix([[1, Cx_1.Cx.i()], [0, 1]]), false),
                    new Mobius_1.Mobius(Cx_1.Cx.matrix([[1, -1], [0, 1]]), false),
                    new Mobius_1.Mobius(Cx_1.Cx.matrix([[1, Cx_1.Cx.i().times(-1)], [0, 1]]), false),
                ], this.curvature);
                break;
        }
    }
    /**
     * A step of one frame.
     * Moves objects and walls
     * @returns void
     */
    move() {
        const M = Mobius_1.Mobius.find(this.speed, this.curvature); // / sends speed to 0
        if (!this.speed.isZero() && !isNaN(M.matrix[1][0].re)) {
            this.objectList.forEach((o) => o.pos = M.apply(o.pos));
            this.domain.move(M);
            this.domain.reset();
        }
    }
    ;
    /**
   * Adds trees
   * @param {number} n - How many?
   * @param {number} spread - How far apart?
   * @returns void
   */
    addRandomObjects(n, spread) {
        for (let i = 0; i < n; i++) {
            const pos = Cx_1.Cx.random(spread);
            const o = new Thing_1.Thing(pos, 'Tree');
            this.objectList.push(o);
        }
    }
    /**
     *
     * @param {Cx} z Where
     * @return {number} This is the norm of the differential
     * of the Mobius transformation
     * from 0 to z. I.e. If the thing is size 1 at the origin, it has size
     * localScale if it is at z.
     */
    localScale(z) {
        const S = 1 + z.absSq * this.curvature;
        return Math.max(0, S);
    }
}
exports.UniverseInfo = UniverseInfo;
