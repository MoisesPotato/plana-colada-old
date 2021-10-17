/**
 * @typedef {Array.<Array.<CxLike>>} CxLikeMatrix
 */

export type CxLike = number|Cx;
export type CxLikeMatrix = [[CxLike, CxLike], [CxLike, CxLike]];
export type CxMatrix = [[Cx, Cx], [Cx, Cx]];


/**
 * @property {number} re
 * @property {number} im
 */
export class Cx {
  re: number;
  im: number;
  /**
   * returns a+bi
   * @param {number} a Real part
   * @param {number} b Complex part
   */
  constructor(a: number, b: number) {
    if ( a === -Infinity) {
      a = Infinity;
    }
    if (b === -Infinity) {
      b = Infinity;
    }
    this.re = a;
    this.im = b;
  };

  /**
   *
   * @return {boolean} Is it infinity?
   */
  isInfty(): boolean {
    return !isFinite(this.re);
  }

  /**
   * @param {CxLike} z
   * @return {Cx} this + z
   */
  plus(z: CxLike): Cx {
    if (typeof z == 'number') {
      z = Cx.makeNew(z);
    }
    if (this.isInfty() || z.isInfty()) {
      throw new Error('Adding infinity');
    }
    return new Cx(this.re + z.re, this.im + z.im);
  };

  /**
   * Multiplication
   * @param {CxLike} z factor
   * @param {string} [debugInfo = '']
   * @return {Cx} this * z
   */
  times(z: CxLike, debugInfo = ''): Cx {
    if (typeof z == 'number') {
      z = Cx.makeNew(z);
    }
    if (this.isInfty() || z.isInfty()) {
      throw new Error('Multiplying infinity\n'+debugInfo);
    }
    const a1 = this.re * z.re - this.im * z.im;
    const b1 = this.re * z.im + this.im * z.re;
    return new Cx(a1, b1);
  };

  /**
   * @return {boolean}
   */
  isZero(): boolean {
    if (this.re === 0 && this.im === 0 && !this.isInfty()) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * @return {number} |this|^2
   */
  absSq(): number {
    return this.re * this.re + this.im * this.im;
  };

  /**
   * @return {number} |this|
   */
  abs(): number {
    return Math.sqrt(this.absSq());
  };
  /**
   * The principal argument
   * @return {number|undefined}
   * arg(0), arg(infty) are undefined
   */
  arg(): number {
    if (this.isInfty() || this.isZero()) {
      return 0;
    }
    if (this.im === 0) {
      if (this.re > 0) {
        return 0;
      } else {
        return Math.PI;
      }
    } else {
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
  };

  /**
   * @return {Cx} overline this
   */
  cong(): Cx {
    return new Cx(this.re, -this.im);
  };


  /**
   * @return {Cx} this^(-1)
   */
  inv(): Cx {
    const absSq = this.absSq();
    if (this.absSq() === 0) {
      return Cx.infty();
    } else {
      return this.cong().times(Cx.makeNew(1 / absSq));
    }
  };

  /**
   * @param  {CxLike} z
   * @param {string} debugInfo = ""
   * @return {Cx} this/z
   */
  divide(z: CxLike, debugInfo =''): Cx {
    if (typeof z == 'number') {
      z = Cx.makeNew(z);
    }
    return this.times(z.inv(), debugInfo);
  };

  /**
   * Exponentiation for real exponents
   * @param  {number} n - a real number
   * @return {Cx} this^n
   */
  power(n: number): Cx {
    let R2 = this.absSq();
    let a = this.arg();
    R2 = Math.pow(R2, n / 2);
    a = a * n;
    return new Cx(R2 * Math.cos(a), R2 * Math.sin(a));
  };


  /**
   * @return {string} INFTY or
   */
  toString(): string {
    if (this.isInfty()) {
      return 'INFTY';
    } else {
      const realPart = Math.round(this.re * 100) / 100;
      const imPart = Math.round(this.im * 100) / 100;
      return realPart + ' + ' + imPart + 'i';
    }
  }
  /**
 *
 * @param {number} r
 * @param {number} theta
 * @return {Cx} complex number
 */
  static polar(r:number, theta:number) : Cx {
    return new Cx(r * Math.cos(theta), r * Math.sin(theta));
  }


  /**
   * @return {Cx} infinity
   */
  static infty(): Cx {
    return new Cx(Infinity, Infinity);
  }

  /**
   * @return {Cx} i
   */
  static i(): Cx {
    return new Cx(0, 1);
  }


  /**
   * Turn real into complex
   * @param {CxLike} z
   * @return {Cx} z
   */
  static makeNew(z: CxLike): Cx {
    if (typeof z === 'number') {
      return new Cx(z, 0);
    } else {
      return z;
    }
  }


  /**
   * Make the entries Cx
   * @param {Array.<Array.<CxLike>>} A
   * @return {Array.<Array.<Cx>>}
   */
  static matrix(A: CxLikeMatrix): CxMatrix {
    return [[Cx.makeNew(A[0][0]), Cx.makeNew(A[0][1])],
      [Cx.makeNew(A[1][0]), Cx.makeNew(A[1][1])]];
  }
  /**
   * A complex number chosen uniformly in a bound x bound box
   * @param {number} [bound=1] Size of the box
   * @return {Cx}
   */
  static random(bound: number): Cx {
    bound = bound || 1;
    return new Cx((2 * Math.random() - 1) * bound,
        (2 * Math.random() - 1) * bound);
  }
  /**
   * Shouldn't this just return a matrix?
   * @param {CxMatrix} M a matrix
   * @return {CxMatrix}
   */
  static conjugateMatrix(M: CxMatrix): CxMatrix { // Conjugate every term
    const A = Cx.matrix([[1, 0], [0, 1]]);
    M.forEach((row, i) =>
      row.forEach((entry, j) =>
        A[i][j] = entry.cong(),
      ),
    );
    return A;
  }
  /**
 *
 * @return {boolean}
 */
  isZeroOrInfty():boolean {
    return (this.isZero() || this.isInfty());
  }
}


