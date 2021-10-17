import {Cx} from './Cx';
import {Mobius} from './Mobius';
import {Wall} from './Wall';

/**
 * @property {Array.Mobius} transf - T[i] is the Mobius transformation
 * you should do if you cross past Z[i] -- Z[i+1]
 * @property {Array.Wall} walls - the walls
 * @property {Cx[]} vertices - the vertices
 */
export class Polygon {
  transf: Mobius[];
  walls: Wall[];
  vertices: Cx[];
  clockwise: boolean;
  /**
   * Make a polygon from the list of walls and the list of transformations
   * @param {Cx[]} vertices
   * @param {Array.<Mobius>} transf  - Array of Mobius transformations
   * @param {Array.<Wall>} walls - Wall list. In clockwise order???
   * What if it's not orientable?!?!?
   * @param {boolean} clockwise
   */
  constructor(vertices: Cx[], transf: Array<Mobius>,
      walls: Array<Wall>, clockwise = true) {
    // Z is an array of the vertices, and T[i] is the Mobius transformation
    // you should do if you cross past Z[i] -- Z[i+1]
    this.vertices = vertices;
    this.transf = transf;
    this.walls = walls;
    this.clockwise = clockwise;
  }


  /**
 * A polygon from the list of vertices plus the transformations
 * @param {Array.<Cx>} vertices - Polygon vertices
 * @param {Array.<Mobius>} transf - transformations
 * @param {number} curvature - curvature?
 * @return {Polygon}
 */
  static fromVerticesAndTransf(vertices: Array<Cx>,
      transf: Array<Mobius>,
      curvature: number): Polygon {
    // Z is an array of the vertices, and T[i] is the Mobius transformation
    // you should do if you cross past Z[i] -- Z[i+1]
    const walls = [];
    for (let i = 0; i < vertices.length; i++) {
      walls.push(new Wall(vertices[i],
          vertices[(i + 1) % vertices.length],
          curvature));
    }
    return new Polygon(vertices, transf, walls);
  }

  /**
  * Is the origin inside the polygon?
  * @param {Polygon} p - the polygon
  * @return {number} - The index of the first wall hit,
  * OR -1 if nothing is hit
  */
  static crossed(p: Polygon): number {
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
  move(M: Mobius) {
    this.vertices.forEach((v, i) => this.vertices[i] = M.apply(v),
    );
    this.walls.forEach((w) => w.moveBy(M),
    );
    this.transf.forEach((T, i) => this.transf[i] = T.conjugate(M),
    );
  }

  /**
   * Transform according to the wall we crossed
   * @param {number} i which wall?
   */
  crossWall(i: number) {
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
      } else {
        return;
      }
    }
    throw new Error('We have crossed 10 walls at once');
  }
}
