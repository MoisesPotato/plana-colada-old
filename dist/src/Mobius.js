"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mobius = void 0;
const Cx_1 = require("./Cx");
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
        this.matrix = Cx_1.Cx.matrix(matrix);
        this.cong = cong;
    }
    /* TODO Maybe use three coordinates from spherical orbifolds
  in order to avoid huge numbers around the north pole?
   */
    /**
     * Composition of Mobius tranformations.
     * @param {Mobius} M2
     * @return {Mobius} this o M2
     */
    times(M2) {
        let A1 = this.matrix;
        const A2 = M2.matrix;
        if (M2.cong) {
            A1 = Cx_1.Cx.conjugateMatrix(A1);
        }
        const answer = Cx_1.Cx.matrix([[1, 0], [0, 1]]);
        answer[0][0] = A1[0][0].times(A2[0][0]).plus(A1[0][1].times(A2[1][0]));
        answer[0][1] = A1[0][0].times(A2[0][1]).plus(A1[0][1].times(A2[1][1]));
        answer[1][0] = A1[1][0].times(A2[0][0]).plus(A1[1][1].times(A2[1][0]));
        answer[1][1] = A1[1][0].times(A2[0][1]).plus(A1[1][1].times(A2[1][1]));
        return new Mobius(answer, this.cong != M2.cong);
    }
    /**
     * Conjugation A * this * A^-1
     * @param {Mobius} A - We conjugate by A
     * @return {Mobius} - A * this* A^-1
     */
    conjugate(A) {
        let answer = A.times(this);
        answer = answer.times(A.inv());
        return answer;
    }
    /**
     * Inverse
     * @return {Mobius} The inverse
     */
    inv() {
        const A = this.matrix;
        let B = [[A[1][1], A[0][1].times(-1)],
            [A[1][0].times(-1), A[0][0]]];
        if (this.cong) {
            B = Cx_1.Cx.conjugateMatrix(B);
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
        const M1 = Mobius.find(z1, curvature); // sends z1 to 0
        let z2Translate = M1.apply(z2);
        /*
          console.log(z2Translate);
      */
        z2Translate = z2Translate
            .divide(Cx_1.Cx.makeNew(z2Translate.abs())).cong().power(0.5);
        const M2 = new Mobius(Cx_1.Cx.matrix([[z2Translate, 0],
            [0, z2Translate.inv()]]), false);
        // sends 0 to 0 and M1(z2) to the reals
        return M2.times(M1); // sends z1 to 0 and z2 to the reals
    }
    /**
     * @param  {Cx} z
     * @return {Cx}
     */
    apply(z) {
        let debugInfo = '';
        debugInfo = debugInfo + '\n' + 'Applying';
        debugInfo = debugInfo + '\n' + this.toString();
        debugInfo = debugInfo + '\n' + 'to';
        debugInfo = debugInfo + '\n' + z.toString();
        const M = this.matrix;
        let answer;
        if (z.isInfty()) {
            if (M[1][0].isZero()) {
                answer = Cx_1.Cx.infty();
            }
            else {
                answer = M[0][0].divide(M[1][0], debugInfo);
            }
        }
        else {
            const num = z.times(M[0][0], debugInfo).plus(M[0][1]);
            const den = z.times(M[1][0], debugInfo).plus(M[1][1]);
            if (den.isZero()) {
                if (num.isZero()) {
                    answer = M[0][0].divide(M[1][0], debugInfo);
                }
                else {
                    answer = Cx_1.Cx.infty();
                }
            }
            else {
                answer = num.divide(den, debugInfo);
            }
        }
        if (this.cong) {
            answer = answer.cong();
        }
        return answer;
    }
    ;
    /**
     * Tell us if there is 0 or infty among the entries
     * @return {boolean}
     */
    hasZeroOrInfty() {
        let answer = false;
        this.matrix.forEach((row) => row.forEach((entry) => answer = answer || entry.isZeroOrInfty()));
        return answer;
    }
    /**
   * Throws an error if all entries are zeroes
   */
    isZero() {
        let answer = true;
        this.matrix.forEach((row) => row.forEach((entry) => answer = answer && entry.isZero()));
        if (answer) {
            throw new Error('Tried to make matrix of zeroes');
        }
    }
    /**
     * Finds the isometry that sends z to 0 and 0 to -z
     * If g is the curvature, this Mobius transformation is
     * x --> (x-z)/(\overline z * g * x + 1)
     * @param {CxLike} z
     * @param {number} curvature - the curvature
     * @return {Mobius}
     */
    static find(z, curvature) {
        z = Cx_1.Cx.makeNew(z);
        if (z.isInfty() && curvature > 0) {
            return new Mobius([[0, 1], [1, 0]], false);
        }
        let deter = 1 / (1 + z.absSq() * curvature);
        deter = Math.sqrt(deter);
        return new Mobius(Cx_1.Cx.matrix([[deter, z.times(-1).times(deter)],
            [z.cong().times(curvature * deter), deter]]), false);
    }
    /**
   * Makes readable
   * @return {string}
   */
    toString() {
        const A = this.matrix.map((row) => row.map((entry) => entry.toString()));
        const answer = `[${A[0][0]}, ${A[0][1]},\n${A[1][0]}, ${A[1][1]}]`;
        return answer;
    }
    /**
     * @return {boolean}
   */
    isIdentity() {
        if (this.cong) {
            return false;
        }
        const A = this.matrix;
        if (!A[1][0].isZero()) {
            return false;
        }
        if (!A[0][1].isZero()) {
            return false;
        }
        if (!A[0][0].plus(new Cx_1.Cx(-1, 0)).isZero()) {
            return false;
        }
        if (!A[1][1].plus(new Cx_1.Cx(-1, 0)).isZero()) {
            return false;
        }
        return true;
    }
}
exports.Mobius = Mobius;
