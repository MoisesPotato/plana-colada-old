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
      if (c.indexOf(answer) < 0) {
        answer.push(c);
      }
    });
    return answer;
  }


  /**
   * @param list list of cells
   * @returns the index of the largest appearance on the list
   */
  indexOf(list:Cell[]):number {
    let answer = -1;
    list.forEach((c, i)=>{
      if (this.equals(c)) {
        answer = i;
      }
    });
    return answer;
  }

  /**
   * tells us if two arrays have the same elements.
   * @param list1 list one
   * @param list2 list two
   * @param duplicateFree true if we can assume there are no duplicates
   * @returns yes or no
   */
  static compareSets(list1:Cell[], list2:Cell[],
      duplicateFree = false):boolean {
    let A = list1;
    let B = list2;
    if (!duplicateFree) {
      A = Cell.removeDuplicates(A);
      B = Cell.removeDuplicates(B);
    }
    if (A.length !== B.length) {
      return false;
    }
    if (A.length == 0) {
      return (B.length == 0);
    }
    const i = A[0].indexOf(B);
    A = A.slice(1);
    B.splice(i, 1);
    return (i > -1) && Cell.compareSets(A, B, true );
  }
  /**
 * Is there a cell in common?
 * @param list1 one list
 * @param list2 other list
 * @returns is there a cell in common?
 */
  static listsIntersect(list1:Cell[], list2:Cell[]):boolean {
    for (let i = 0; i < list1.length; i++) {
      if (list1[i].indexOf(list2) >= 0) {
        return true;
      }
    }
    return false;
  }
}

interface edge {
  e:Cell1,
  or:boolean
}

/**
 * @property {Cell1[]} cells1
 * @property {Cell0[]} cells0
 */
export class Cell2 extends Cell {
  cells1:Cell1[];
  cells0:Cell0[];
  attachingMap: Attach<Cell1>;

  /**
   *@param name label
   * @param attachingMap - Array of maps to 1-cells
   * @param cells1 - set of 1-cells
   * @param cells0 - set of 0-cells
   */
  constructor(name: string,
      attachingMap: Attach<Cell1>,
      cells1: Cell1[],
      cells0: Cell0[]) {
    super(name, attachingMap);
    this.attachingMap = attachingMap;
    this.cells1 = cells1;
    this.cells0 = cells0;

    if (!this.isValid()) {
      const message = 'Invalid edge definition\n'+
      'vertices:\n'+
      cells0.map((v) => v.toString()+ '\n').join() +
      'edges:\n'+
      cells1.map((e) => e.toString()+ '\n').join() +
      'attachingMap:\n'+
      attachingMap.toString();
      throw new Error(message);
    }
  }

  /** TODO
   * @returns is this a valid 2-cell and the reason why not
   */
  isValid():[boolean, string] {
    if (this.attachingMap.dim !== 2) {
      return [false, 'Wrong attaching map dimension'];
    }
    this.attachingMap.targets.forEach((t) => {
      if (t.indexOf(this.cells1) < 0) {
        return [false, 'Attaching map targets are not in cell list'];
      }
    });
    this.attachingMap.targets.forEach((t) => {
      if (t.start().indexOf(this.cells0) < 0) {
        return [false, 'Attaching map target vertices are not in cell list'];
      }
      if (t.end().indexOf(this.cells0) < 0) {
        return [false, 'Attaching map target vertices are not in cell list'];
      }
    });
    const [validAttachingMap, message] = this.attachingMap.isValid();
    if (!validAttachingMap) {
      return [false, 'Invalid attaching map:\n'+message];
    }
    return [true, ''];
  }
  /**
   * @param i index
   * @returns e:ith edge, or:glueing side
 */
  edge(i:number):edge {
    return {e: this.attachingMap.targets[i],
      or: this.attachingMap.oriented[i]};
  }

  /**
   *
   * @param name label
   * @param edges array of the edges
   * @param maps list of attaching maps from 1-cells to 0-cells
   * @returns a 2-cell
   */
  static fromGlue(name: string, edges:Cell1[], maps:Attach):Cell2 {
    const attachingMap = new Attach(2, [] );
    const cells1 = edges;
    const cells0 = [] as Cell0[];
    return new Cell2(name, attachingMap, cells1, cells0);
  }

  /**
   * Makes a disk with n edges
   * @param n number of edges
   * @param name label
   * @returns the cell
   */
  static disk(n:number, name:string = ''):Cell2 {
    const edges = Cell1.circle(n, name);
    const vertices = edges.map((e)=> e.start());
    const attachingMap = new Attach(2, edges);
    return new Cell2(name, attachingMap, edges, vertices);
  }


  /**
   *TODO
   * @param n number of edges
   * @param labels array of {@link glueLabel}
   * @param name label (optional)
   * telling us how to glue
   * @returns An attaching map
   */
  static fromLabels(n:number, labels:glueLabel[], name : string = ''):Cell2 {
    const C = Cell2.disk(n, name);
    return C;
  }


  /**
   * TODO
   * This requires I think recursion
   * to induct in both the dimension of the glue cell and of this
   * Glues subcells together into a new cell
   * @param glued the labels of the subcells that will be glued together
   * expected to be all the same dimension
   * @param newCell the new cell created from combining these two
   * @param newName optionally, a new name
   * @returns a new cell with fewer subcells
   */
  glue0in2(glued:Cell0[], newCell:Cell0, newName = this.name):typeof this {
    const output = this.copy() as typeof this;
    // Change its vertices to the new cell if needbe
    output.cells0 = output.cells0.map((v) => v.glue0in0( glued, newCell));
    output.cells0 = Cell.removeDuplicates(output.cells0);
    // Change its edges to the new cell (this includes the attaching maps)
    output.cells1 = output.cells1.map((e) => e.glue0in1( glued, newCell));
    output.cells1 = Cell.removeDuplicates(output.cells1);
    // Change the vertices of the edges appearing in the attaching map
    output.attachingMap.targets = output.attachingMap.targets.map(
        (e) => e.glue0in1( glued, newCell),
    );

    if (!output.isValid()[0]) {
      throw new Error('Glueing went wrong:\n'+
      output.isValid()[1],
      );
    }
    output.name = newName;
    return output;
  }

  /**
   * TODO
   * DOES NOT TAKE ORIENTATION INTO ACCOUNT
   * This requires I think recursion
   * to induct in both the dimension of the glue cell and of this
   * Glues subcells together into a new cell
   * @param glued for the subcells that will be glued together
   * {e:cell1, or:sidefor glueing}
   * @param newCell the new cell created from combining these two
   * @param newName new name, optional
   * @returns a new cell with fewer subcells
   */
  glue1in2(glued:edge[],
      newCell:Cell1,
      newName = this.name):typeof this {
    /* console.log('Start: Trying to glue\n'+
      glued.toString()+'\n'+
      'in the cell\n'+
      this.toString()+'\n'+
      'with orientations'+'\n'+
      oriented); */
    // console.log(`Orientations: ${oriented}`);
    const cellList = glued.map((edge) => edge.e);
    const orientationList = glued.map((edge) => edge.or);
    let output = this.copy() as typeof this;

    let gluedstarts = [] as Cell0[];
    let gluedends = [] as Cell0[];
    /*     Everything that is going to the
    start of newCell (which might be the endpoints) */
    glued.forEach((edge) => gluedstarts.push(edge.e.start(edge.or)));
    glued.forEach((edge) => gluedends.push(edge.e.end(edge.or)));
    gluedstarts = Cell.removeDuplicates(gluedstarts);
    gluedends = Cell.removeDuplicates(gluedends);
    if (Cell.listsIntersect(gluedstarts, gluedends)) {
      // console.log('They intersect!');
      newCell = newCell.glue0in1(newCell.cells0, newCell.cells0[0]);
      gluedstarts = Cell.removeDuplicates(gluedstarts.concat([...gluedends]));
      // console.log(gluedstarts);
      output = output.glue0in2(gluedstarts, newCell.start());
    } else {
      output = output.glue0in2(gluedstarts, newCell.start());
      output = output.glue0in2(gluedends, newCell.end());
    }
    // Change its edges to the new cell (this includes the attaching maps)
    output.cells1 = output.cells1.map((e) => e.glue1in1( cellList, newCell));
    output.cells1 = Cell.removeDuplicates(output.cells1);
    // Change the vertices of the edges appearing in the attaching map
    output.attachingMap.targets = output.attachingMap.targets.map(
        (e, i) => {
          const {e: replaceMent, or: orientation} =
          e.glue1in1withOrientations(cellList, orientationList, newCell);
          output.attachingMap.oriented[i] =
          (output.attachingMap.oriented[i] == orientation );
          return replaceMent;
        },
    );

    if (!output.isValid()[0]) {
      throw new Error('Glueing went wrong:\n'+
      'Trying to glue\n'+
      cellList.toString()+'\n'+
      'in the cell\n'+
      this.toString()+'\n'+
      'with orientations'+'\n'+
      orientationList+'\n'+
      'obtained\n'+
      output.isValid()[1]+'\n'+
      'output:\n'+
      output.toString(),
      );
    }
    output.name = newName;
    return output;
  }

  /**
   *
   * @returns an identical copy, NOT RECURSIVE! edges are THE SAME
   */
  copy():Cell2 {
    const [...mapTargets] = this.attachingMap.targets;
    const [...mapOriented] = this.attachingMap.oriented;
    return new Cell2(this.name,
        new Attach(2, mapTargets, mapOriented),
        [...this.cells1], [...this.cells0] );
  }

  /**
   * @returns pretty string
   */
  toString():string {
    let output = this.name+ ':';
    this.attachingMap.targets.forEach((e, i) => {
      if (this.attachingMap.oriented[i]) {
        output = output + '\n' + e.toString();
      } else {
        const e2 = e.reverse();
        output = output + '\n' + e2.toString() + ' (this is reversed)';
      }
    });
    return output;
  }
}

/**
 *  @property {[Cell0, Cell0]} cells0
 */
export class Cell1 extends Cell {
  cells0:Cell0[];
  attachingMap:Attach<Cell0>;

  /**
   * @param name label
   * @param cells0 start end
   * @param attachingMap the maps
   */
  constructor(name:string, cells0: Cell0[], attachingMap:Attach<Cell0>) {
    super(name, attachingMap);
    this.attachingMap = attachingMap;
    this.cells0 = cells0;
    if (!this.isValid()) {
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
  isValid():[boolean, string] {
    if (this.cells0.length > 2) {
      return [false, 'Too many vertices'];
    }
    if (this.attachingMap.dim !== 1) {
      return [false, 'Wrong attaching map dimension'];
    }
    this.attachingMap.targets.forEach((t) => {
      if (t.indexOf(this.cells0) < 0) {
        return [false, 'Attaching map targets are not in cell list'];
      }
    });
    if (!this.attachingMap.isValid()[0]) {
      return [false, 'Invalid attaching map:\n'+this.attachingMap.isValid()[1]];
    }
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
 * @param theCorrectOne it false, give me the other one
 * @returns the starting vertex
 */
  start(theCorrectOne = true):Cell0 {
    let v = this.attachingMap.targets[0];
    if (!theCorrectOne) {
      v = this.attachingMap.targets[1];
    }
    return v;
    throw new Error('The vertex is not a 0-cell');
  }
  /**
 * @param theCorrectOne if false give me the start instead
 * @returns the ending vertex
 */
  end(theCorrectOne = true):Cell0 {
    let v = this.attachingMap.targets[1];
    if (!theCorrectOne) {
      v = this.attachingMap.targets[0];
    }
    return v;
    throw new Error('The vertex is not a 0-cell');
  }
  /**
 * @param n number of edges
 * @param labelPrefix words to attach to every cell label
 * @returns an array of 1-cells joined in a circle
 */
  static circle(n:number, labelPrefix?:string):Cell1[] {
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
    this.start().toString() +
    ' ---> '+
    this.end().toString();
  }

  /**
   * NOT RECURSIVE COPY!!
   * @returns a copy of this cell WITH THE SAME VERTICES!
   */
  copy():typeof this {
    const [...targets] = this.attachingMap.targets;
    const A = new Attach(1, targets);
    return new Cell1(this.name, [...this.cells0], A) as typeof this;
  }

  /**
   * TODO
   * This requires I think recursion
   * to induct in both the dimension of the glue cell and of this
   * Glues subcells together into a new cell
   * @param glued the labels of the subcells that will be glued together
   * expected to be all the same dimension
   * @param newCell the new cell created from combining these two
   * @returns a new cell with fewer subcells
   */
  glue0in1(glued:Cell0[], newCell:Cell0):typeof this {
    // console.log('\x1b[36m%s\x1b[0m', `Glueing ${c.toString()}`);
    const output = this.copy();
    // Change its vertices to the new cell if needbe
    output.cells0 = output.cells0.map((v) => {
      /* console.log(`The vertex is ${v.toString()}`);
        console.log(`The new vertex is
        ${v.glue0(glued, newCell).toString()}`); */
      return v.glue0in0(glued, newCell);
    });
    /* output.cells0.forEach((v) =>
        console.log(`We have indeed changed it to ${v.toString()}`)); */
    output.cells0 = Cell.removeDuplicates(output.cells0);
    // Do not remove duplicates for the attaching map!
    // The start and end can repeat
    output.attachingMap.targets = output.attachingMap
        .targets.map((v) => v.glue0in0(glued, newCell));
    if (!output.isValid()[0]) {
      throw new Error('Glueing went wrong:\n'+
      output.isValid()[1],
      );
    }
    return output;
  }

  /**
   * Glues subcells together into a new cell. Doesn't alter the original
   * @param glued the labels of the subcells that will be glued together
   * expected to be all the same dimension
   * @param newCell the new cell created from combining these two
   * @returns a new cell with fewer subcells
   */
  glue1in1(glued:typeof this[], newCell:typeof this):typeof this {
    // If this is the edge, just replace it
    if (this.indexOf(glued) >= 0) {
      return newCell;
    }
    return this;
  }
  /**
   * Glues subcells together into a new cell. Doesn't alter the original
   * @param gluedCells the labels of the subcells that will be glued together
   * expected to be all the same dimension
   * @param orientations which side each one goes
   * @param newCell the new cell created from combining these two
   * @returns a new cell with fewer subcells
   */
  glue1in1withOrientations(gluedCells:typeof this[],
      orientations:boolean[], newCell:typeof this):edge {
    // If this is the edge, just replace it
    const j = this.indexOf(gluedCells);
    if (j >= 0) {
      return {e: newCell, or: orientations[j]};
    }
    return {e: this, or: true};
  }
  /**
 * @returns the same edge, in reverse
 */
  reverse():typeof this {
    return Cell1.v1v2(this.name +'\'', this.end(), this.start()) as typeof this;
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

  /**
   * Glues subcells together into a new cell. Doesn't alter the original
   * @param glued the labels of the subcells that will be glued together
   * expected to be all the same dimension
   * @param newCell the new cell created from combining these two
   * @returns a new cell with fewer subcells
   */
  glue0in0(glued:typeof this[], newCell:typeof this):typeof this {
    // If c is the vertex, just replace it
    if (this.indexOf(glued) >= 0) {
      return newCell;
    }
    return this;
  }
}
/**
 * Attaching maps
 * @property {number} dim - of the map
 * @property {FaceType[]} target - of the map
 * @property {boolean[]} oriented - is the map orientation compatible,
 * i.e. does the 1-cell go counterclockwise around the 2-cell? (for 1->0
 * cells this is just true always
 */
export class Attach<FaceType extends Cell = Cell1|Cell0> {
  dim: number;
  targets: FaceType[];
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
  constructor(dim: number,
      targets: FaceType[],
      oriented?: boolean[]) {
    oriented = oriented || targets.map((x) => true);
    this.dim = dim;
    this.targets = targets;
    this.oriented = oriented;
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
      const n = this.targets.length;
      this.targets.forEach((e) =>{
        if (e.dim !== 1) {
          return [false, 'Attached 2-cell to something other than 1-cell'];
        }
      });
      if (n !== this.oriented.length) {
        return [false, 'Wrong length of oriented'];
      }
      let isCircular = true;
      let correctEdges = true;
      this.targets.forEach((e, i) =>{
        const e2 = this.targets[(i + 1) % n];
        if (e instanceof Cell1 && e2 instanceof Cell1) {
          const v1 = e.end(this.oriented[i]);
          const v2 = e2.start(this.oriented[(i + 1) % n]);
          if (!v1.equals(v2)) {
            /* console.log(`Glueing ${e.toString()} (${this.oriented[i]})
            with ${e2.toString()}(${this.oriented[(i + 1) % n]}):`);
            console.log(`Vertex ${v1.toString()}
            and vertex ${v2.toString()} match: ${v1.equals(v2)}`); */
            isCircular = false;
          }
        } else {
          correctEdges = false;
        }
      });
      if (!isCircular) {
        return [false, 'Vertices don\'t line up'];
      }
      if (!correctEdges) {
        return [false, 'Faces are not 1-cells'];
      }
      return [true, ''];
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

