"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wall = void 0;
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
const math = require("mathjs");
const Cx_1 = require("./Cx");
const Mobius_1 = require("./Mobius");
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
        this.goesToOrigin = Mobius_1.Mobius.twoPoints(z1, z2, curvature);
        this.originToWall = this.goesToOrigin.inv();
        this.curvature = curvature;
        // TODO rename to replace "origin" by "reals"??
        [this.isStraight, this.center, this.radius] = this.computeThings();
    }
    /**
     * Is z on this wall?
     * @param {Cx} z - a point
     * @return {boolean}
     */
    onWall(z) {
        const translate = this.goesToOrigin.apply(z);
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
        const translate = this.goesToOrigin.apply(z);
        return translate.im > 0;
    }
    ;
    /**
     * Runs compute things and reassigns the values!!
     */
    recalculate() {
        [this.isStraight, this.center, this.radius] = this.computeThings();
        const shouldBeIdentity = this.goesToOrigin
            .times(this.originToWall);
        if (!shouldBeIdentity.isIdentity) {
            throw new Error('Somehow a line\'s to line and to origin ' +
                'transformations are not mutual invarses: Got this:\n' +
                shouldBeIdentity.toString());
        }
    }
    /**
     * DOESN'T CHANGE THE WALL!
     * computes the center and the radius or evaluates isStraight
     * @return {[boolean, Cx, number]}
     * If it is a straight line, we get the center and the radius to be infinite
     */
    computeThings() {
        let isStraight;
        let center;
        let radius;
        if (this.curvature === 0) {
            isStraight = true;
        }
        else {
            isStraight = this.onWall(Cx_1.Cx.makeNew(0));
        }
        if (!isStraight) {
            center = this.findCenterOfWall();
            radius = center
                .plus(this.originToWall.apply(Cx_1.Cx.makeNew(0)).times(-1)).abs();
        }
        else {
            center = Cx_1.Cx.infty();
            radius = Infinity;
        }
        return [isStraight, center, radius];
    }
    ;
    /**
     * The image under a Mobius tranformation
     * @param {Mobius} M - A transformation
     */
    moveBy(M) {
        this.goesToOrigin = this.goesToOrigin.times(M.inv());
        this.originToWall = M.times(this.originToWall);
        this.recalculate();
    }
    ;
    /**
     * Assuming this wall is a circle
     * @return {Cx} - The center of the circle
     */
    findCenterOfWall() {
        // a1, a2, a3 are three points on the wall
        const a2 = this.originToWall.apply(Cx_1.Cx.makeNew(1));
        const a1 = this.originToWall.apply(Cx_1.Cx.makeNew(0));
        const a3 = this.originToWall.apply(Cx_1.Cx.makeNew(-1));
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
        const x = math.lusolve(A, b);
        return new Cx_1.Cx(x[0][0], x[1][0]);
    }
}
exports.Wall = Wall;
