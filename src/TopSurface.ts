// TopSurface.ts
// A class for working with topological surfaces

// eslint-disable-next-line no-unused-vars
import {Cx} from './Cx';

/**
 * @property {Cell2[]} cells2
 */
export class CW {
  cells2:Cell2[];

  /**
 *
 * @param cells2 array of cells
 */
  constructor(cells2: Cell2[]) {
    this.cells2 = cells2;
  }
}

/**
 *
 */
export class Cell {
  name:string;
  attachingMap:Attach;
  /**
 *
 * @param name label
 * @param attachingMap attaching map
 */
  constructor(name: string, attachingMap: Attach) {
    this.name = name;
    this.attachingMap = attachingMap;
  }
  /**
   *
   * @returns the dimension of the cell
   */
  get dim():number {
    if (this instanceof Cell0) {
      return 0;
    }
    if (this instanceof Cell1) {
      return 1;
    }
    if (this instanceof Cell2) {
      return 2;
    }
    throw new Error('Cell without dimension');
  }

  /**
   * tells us if two cells have the same label and dimension
   * @param c another cell
   * @returns true or false
   */
  equals(c:Cell):boolean {
    if (this.dim !== c.dim) {
      return false;
    }
    if (this.name !== c.name) {
      return false;
    }

    return true;
  }

  /**
 *
 * @param list an array of cells
 * @returns an array of just the nonrepeated cells
 */
  static removeDuplicates<T extends Cell>(list:T[]):T[] {
    if (list.length == 0) {
      return list;
    }
    const answer = [list[0]];
    list.forEach((c)=>{
      if (!c.inList(answer)) {
        answer.push(c);
      }
    });
    return answer;
  }


  /**
   * @param list list of cells
   * @returns is this cell on that list?
   */
  inList(list:Cell[]):boolean {
    let answer = false;
    list.forEach((c)=>{
      if (this.equals(c)) {
        answer = true;
      }
    });
    return answer;
  }


  /**
   * TODO
   * This requires I think recursion
   * to induct in both the dimension of the glue cell and of this
   * Glues subcells together into a new cell
   * @param c the cell to be glued
   * @param glued the labels of the subcells that will be glued together
   * expected to be all the same dimension
   * @param newCell the new cell created from combining these two
   * @returns a new cell with fewer subcells
   */
  static glue0<T extends Cell>(c:T, glued:Cell0[], newCell:Cell0):T {
    if (c instanceof Cell0) {
      // If c is the vertex, just replace it
      if (c.inList(glued)) {
        return newCell as T;
      }
      return c;
    }
    if (c instanceof Cell1) {
      // console.log('\x1b[36m%s\x1b[0m', `Glueing ${c.toString()}`);
      const output = c.copy() as T & Cell1;
      // Change its vertices to the new cell if needbe
      output.cells0 = output.cells0.map((v) => {
        /* console.log(`The vertex is ${v.toString()}`);
        console.log(`The new vertex is
        ${Cell.glue0(v, glued, newCell).toString()}`); */
        return Cell.glue0(v, glued, newCell);
      });
      /* output.cells0.forEach((v) =>
        console.log(`We have indeed changed it to ${v.toString()}`)); */
      output.cells0 = Cell.removeDuplicates(output.cells0);
      // Do not remove duplicates for the attaching map!
      // The start and end can repeat
      output.attachingMap.targets = output.attachingMap
          .targets.map((v) => Cell.glue0(v, glued, newCell));
      return output;
    }
    if (c instanceof Cell2) {
      // Change its vertices to the new cell if needbe
      c.cells0 = c.cells0.map((v) => Cell.glue0(v, glued, newCell));
      c.cells0 = Cell.removeDuplicates(c.cells0);
      // Change its edges to the new cell
      c.cells1 = c.cells1.map((e) => Cell.glue0(e, glued, newCell));
      c.cells1 = Cell.removeDuplicates(c.cells1);
      // Change the vertices of the edges appearing in the attaching map
      c.attachingMap.targets = c.attachingMap.targets.map(
          (c) => Cell.glue0(c, glued, newCell),
      );
    }
    throw new Error('Cell without dimension');
  }
}


/**
 * @property {Cell1[]} cells1
 * @property {Cell2[]} cells2
 */
export class Cell2 extends Cell {
  cells1:Cell1[];
  cells0:Cell0[];

  /**
   *@param name label
   * @param {Attach} attachingMap - Array of maps to 1-cells
   * @param {Cell1[]} cells1 - set of 1-cells
   * @param {Cell0[]} cells0 - set of 0-cells
   */
  constructor(name: string,
      attachingMap: Attach,
      cells1: Cell1[],
      cells0: Cell0[]) {
    super(name, attachingMap);
    this.cells1 = cells1;
    this.cells0 = cells0;
  }

  /**
   *
   * @param name label
   * @param edges array of the edges
   * @param maps list of attaching maps from 1-cells to 0-cells
   * @returns a 2-cell
   */
  static fromGlue(name: string, edges:Cell1[], maps:Attach):Cell2 {
    const attachingMap = new Attach(2, []);
    const cells1 = edges;
    const cells0 = [] as Cell0[];
    return new Cell2(name, attachingMap, cells1, cells0);
  }
}

/**
 *  @property {[Cell0, Cell0]} cells0
 */
export class Cell1 extends Cell {
  cells0:Cell0[];
  attachingMap:Attach;

  /**
   * @param name label
   * @param cells0 start end
   * @param attachingMap the maps
   */
  constructor(name:string, cells0: Cell0[], attachingMap:Attach) {
    super(name, attachingMap);
    this.cells0 = cells0;
    this.attachingMap = attachingMap;
    if (!this.validate()) {
      const message = 'Invalid edge definition\n'+
      'vertices:\n'+
      cells0.map((v) => v.toString()+ '\n').join() +
      'attachingMap:\n'+
      attachingMap.toString();
      throw new Error(message);
    }
  }

  /**
   * @returns is this valid and the reason
   */
  validate():[boolean, string] {
    if (this.cells0.length > 2) {
      return [false, 'Too many vertices'];
    }
    if (this.attachingMap.dim !== 1) {
      return [false, 'Wrong attaching map dimension'];
    }
    this.attachingMap.targets.forEach((t) => {
      if (!t.inList(this.cells0)) {
        return [false, 'Attaching map targets are not in cell list'];
      }
    });
    return [true, ''];
  }

  /**
 *@param name label
 * @param start start or [start, end]
 * @param end end
 * @return {Cell1} a new 1-cell with these endpoints
 * the default endspoints are name-start and name-end
 */
  static v1v2(name: string, start?:Cell0|string, end?:Cell0|string):Cell1 {
    start = start || (name + '-start');
    end = end || (name + '-end');
    const v1=Cell0.fromString(start);
    const v2=Cell0.fromString(end);
    const attachingMap = new Attach(1, [v1, v2]);
    return new Cell1(name, [v1, v2], attachingMap);
  }
  /**
 *
 * @returns the starting vertex
 */
  get start():Cell0 {
    return this.attachingMap.targets[0];
  }
  /**
 *
 * @returns the ending vertex
 */
  get end():Cell0 {
    return this.attachingMap.targets[1];
  }
  /**
 * @param n number of edges
 * @param labelPrefix words to attach to every cell label
 * @returns an array of 1-cells joined in a circle
 */
  static createCircle(n:number, labelPrefix?:string):Cell1[] {
    labelPrefix = labelPrefix || '';
    const keys = [...Array(n).keys()];
    const edgeLabels = keys.map((i) => labelPrefix+'-e'+i);
    const vertexLabels = keys.map((i) => labelPrefix+'-v'+i);
    const vertices = keys.map((i) =>
      new Cell0(vertexLabels[i]),
    );
    // Make it so the n+1st loops back
    vertices.push(vertices[0]);
    const edges = keys.map((i) =>
      Cell1.v1v2(edgeLabels[i], vertices[i], vertices[i+1]),
    );
    return edges;
  }

  /**
   *
   * @returns name: start ---> end
   */
  toString():string {
    return this.name + ': '+
    this.start.toString() +
    ' ---> '+
    this.end.toString();
  }

  /**
   * NOT RECURSIVE COPY!!
   * @returns a copy of this cell WITH THE SAME VERTICES!
   */
  copy():Cell1 {
    const [...targets] = this.attachingMap.targets;
    const A = new Attach(1, targets);
    return new Cell1(this.name, [...this.cells0], A);
  }
}

/**
 * @property {string} name
 */
export class Cell0 extends Cell {
  /**
   *
   * @param {string} name label
   */
  constructor(name: string) {
    super(name, new Attach(0, []));
  }

  /**
 *
 * @return {string} just the name
 */
  toString(): string {
    return this.name;
  }
  /**
 * makes a vertex from maybe a label
 * @param v vertex or label
 * @return a vertex
 */
  static fromString(v:Cell0|string):Cell0 {
    if (typeof v == 'string') {
      return new Cell0(v);
    }
    return v;
  }
}
/**
 * Attaching maps
 * @property {Cell} source - of the map
 * @property {Cell} target - of the map
 * @property {boolean} oriented - is the map orientation compatible,
 * i.e. does the 1-cell go counterclockwise around the 2-cell? (for 1->0
 * cells this is just true always
 */
export class Attach {
  dim: number;
  targets: Cell[];
  oriented: boolean[];

  /**
   * An attaching map has a source which is cell and
   * targets:
   * The source is the cell that has this map as a property
   * The source should not be a 0-cell
   * If the source is a 1-cell, the targets are 2 vertices
   * and 'oriented' is true
   * If the source is a 2-cell, the targets are 1-cells,
   * 'oriented' has the same length as the 1-cell
   * @param dim the dimension of the source
   * @param targets to
   * @param oriented preserves orientation
   */
  constructor(dim: number, targets: Cell[], oriented?: boolean[]) {
    oriented = oriented || targets.map((x) => true);
    this.dim = dim;
    this.targets = targets;
    this.oriented = oriented;
  }

  /**
   *TODO
   * @param edges array of 1-cells
   * @param labels array of {@link glueLabel}
   * telling us how to glue
   * @returns An attaching map
   */
  static fromLabels(edges:Cell1[], labels:glueLabel[]):Attach {
    return new Attach(0, []);
  }
  /**
 * Checks to see if the definitions are sensical.
 * See {@link Attach}
 * @returns boolean and why
 */
  isValid():[boolean, string] {
    if (this.dim === 0) {
      if (this.targets.length !== 0) {
        return [false, 'Dimension 0 has a target'];
      }
      if (this.oriented.length !== 0) {
        return [false, 'Dimension 0 has orientations'];
      }
      return [true, ''];
    } else if (this.dim === 1) {
      if (this.targets.length !== 2) {
        return [false, 'Dimension 1 has target number != 2'];
      }
      this.targets.forEach((v) =>{
        if (v.dim !== 0) {
          return [false,
            'Dimension 1 attached to something other than a vertex'];
        }
      });
      if (this.oriented.length !== 2) {
        return [false, 'Oriented doesn\'t have two vertices'];
      }
      this.oriented.forEach((tf) => {
        if (!tf) {
          return [false, 'Tried to attach a vertex with opposite orientation'];
        }
      },
      );
      return [true, ''];
    } else if (this.dim == 2) {
      this.targets.forEach((e) =>{
        if (e.dim !== 1) {
          return [false, 'Attached 2-cell to something other than 1-cell'];
        }
      });
      if (this.targets.length !== this.oriented.length) {
        return [false, 'Wrong length of oriented'];
      }
    }
    return [false, 'No dimension'];
  }
  /**
 * TODO
 * @returns a representation
 */
  toString():string {
    return JSON.stringify(this);
  }
}

/**
 * @typedef {[number, number, string]} glueLabel
 */
type glueLabel = [number, number, boolean]
