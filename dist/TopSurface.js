"use strict";
// TopSurface.ts
// A class for working with topological surfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attach = exports.Cell0 = exports.Cell1 = exports.Cell2 = exports.Cell = exports.CW = void 0;
/**
 * @property {Cell2[]} cells2
 */
class CW {
    /**
   *
   * @param cells2 array of cells
   */
    constructor(cells2) {
        this.cells2 = cells2;
    }
}
exports.CW = CW;
/**
 *
 */
class Cell {
    /**
   *
   * @param name label
   * @param attachingMap attaching map
   */
    constructor(name, attachingMap) {
        this.name = name;
        this.attachingMap = attachingMap;
    }
    /**
     *
     * @returns the dimension of the cell
     */
    get dim() {
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
    equals(c) {
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
    static removeDuplicates(list) {
        if (list.length == 0) {
            return list;
        }
        const answer = [list[0]];
        list.forEach((c) => {
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
    indexOf(list) {
        let answer = -1;
        list.forEach((c, i) => {
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
    static compareSets(list1, list2, duplicateFree = false) {
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
        return (i > -1) && Cell.compareSets(A, B, true);
    }
    /**
   * Is there a cell in common?
   * @param list1 one list
   * @param list2 other list
   * @returns is there a cell in common?
   */
    static listsIntersect(list1, list2) {
        for (let i = 0; i < list1.length; i++) {
            if (list1[i].indexOf(list2) >= 0) {
                return true;
            }
        }
        return false;
    }
}
exports.Cell = Cell;
/**
 * @property {Cell1[]} cells1
 * @property {Cell0[]} cells0
 */
class Cell2 extends Cell {
    /**
     *@param name label
     * @param attachingMap - Array of maps to 1-cells
     * @param cells1 - set of 1-cells
     * @param cells0 - set of 0-cells
     */
    constructor(name, attachingMap, cells1, cells0) {
        super(name, attachingMap);
        this.attachingMap = attachingMap;
        this.cells1 = cells1;
        this.cells0 = cells0;
        if (!this.isValid()) {
            const message = 'Invalid edge definition\n' +
                'vertices:\n' +
                cells0.map((v) => v.toString() + '\n').join() +
                'edges:\n' +
                cells1.map((e) => e.toString() + '\n').join() +
                'attachingMap:\n' +
                attachingMap.toString();
            throw new Error(message);
        }
    }
    /** TODO
     * @returns is this a valid 2-cell and the reason why not
     */
    isValid() {
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
            return [false, 'Invalid attaching map:\n' + message];
        }
        return [true, ''];
    }
    /**
     *
     * @param name label
     * @param edges array of the edges
     * @param maps list of attaching maps from 1-cells to 0-cells
     * @returns a 2-cell
     */
    static fromGlue(name, edges, maps) {
        const attachingMap = new Attach(2, []);
        const cells1 = edges;
        const cells0 = [];
        return new Cell2(name, attachingMap, cells1, cells0);
    }
    /**
     * Makes a disk with n edges
     * @param n number of edges
     * @param name label
     * @returns the cell
     */
    static disk(n, name = '') {
        const edges = Cell1.circle(n, name);
        const vertices = edges.map((e) => e.start());
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
    static fromLabels(n, labels, name = '') {
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
    glue0in2(glued, newCell, newName = this.name) {
        const output = this.copy();
        // Change its vertices to the new cell if needbe
        output.cells0 = output.cells0.map((v) => v.glue0in0(glued, newCell));
        output.cells0 = Cell.removeDuplicates(output.cells0);
        // Change its edges to the new cell (this includes the attaching maps)
        output.cells1 = output.cells1.map((e) => e.glue0in1(glued, newCell));
        output.cells1 = Cell.removeDuplicates(output.cells1);
        // Change the vertices of the edges appearing in the attaching map
        output.attachingMap.targets = output.attachingMap.targets.map((e) => e.glue0in1(glued, newCell));
        if (!output.isValid()[0]) {
            throw new Error('Glueing went wrong:\n' +
                output.isValid()[1]);
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
     * @param glued the labels of the subcells that will be glued together
     * expected to be all the same dimension
     * @param newCell the new cell created from combining these two
     * @param newName new name, optional
     * @returns a new cell with fewer subcells
     */
    glue1in2(glued, newCell, newName = this.name) {
        let output = this.copy();
        let gluedstarts = [];
        let gluedends = [];
        glued.forEach((e) => gluedstarts.push(e.start()));
        glued.forEach((e) => gluedends.push(e.end()));
        gluedstarts = Cell.removeDuplicates(gluedstarts);
        gluedends = Cell.removeDuplicates(gluedends);
        if (Cell.listsIntersect(gluedstarts, gluedends)) {
            console.log('They intersect!');
            newCell = newCell.glue0in1(newCell.cells0, newCell.cells0[0]);
            gluedstarts = Cell.removeDuplicates(gluedstarts.concat([...gluedends]));
            console.log(gluedstarts);
            output = output.glue0in2(gluedstarts, newCell.start());
        }
        else {
            output = output.glue0in2(gluedstarts, newCell.start());
            output = output.glue0in2(gluedends, newCell.end());
        }
        // Change its edges to the new cell (this includes the attaching maps)
        output.cells1 = output.cells1.map((e) => e.glue1in1(glued, newCell));
        output.cells1 = Cell.removeDuplicates(output.cells1);
        // Change the vertices of the edges appearing in the attaching map
        output.attachingMap.targets = output.attachingMap.targets.map((e) => e.glue1in1(glued, newCell));
        if (!output.isValid()[0]) {
            throw new Error('Glueing went wrong:\n' +
                output.isValid()[1]);
        }
        output.name = newName;
        return output;
    }
    /**
     *
     * @returns an identical copy, NOT RECURSIVE! edges are THE SAME
     */
    copy() {
        const [...mapTargets] = this.attachingMap.targets;
        const [...mapOriented] = this.attachingMap.oriented;
        return new Cell2(this.name, new Attach(2, mapTargets, mapOriented), [...this.cells1], [...this.cells0]);
    }
    /**
     * @returns pretty string
     */
    toString() {
        let output = this.name + ':';
        this.attachingMap.targets.forEach((e, i) => {
            if (this.attachingMap.oriented[i]) {
                output = output + '\n' + e.toString();
            }
            else {
                const e2 = e.reverse();
                output = output + '\n' + e2.toString();
            }
        });
        return output;
    }
}
exports.Cell2 = Cell2;
/**
 *  @property {[Cell0, Cell0]} cells0
 */
class Cell1 extends Cell {
    /**
     * @param name label
     * @param cells0 start end
     * @param attachingMap the maps
     */
    constructor(name, cells0, attachingMap) {
        super(name, attachingMap);
        this.attachingMap = attachingMap;
        this.cells0 = cells0;
        if (!this.isValid()) {
            const message = 'Invalid edge definition\n' +
                'vertices:\n' +
                cells0.map((v) => v.toString() + '\n').join() +
                'attachingMap:\n' +
                attachingMap.toString();
            throw new Error(message);
        }
    }
    /**
     * @returns is this valid and the reason
     */
    isValid() {
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
            return [false, 'Invalid attaching map:\n' + this.attachingMap.isValid()[1]];
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
    static v1v2(name, start, end) {
        start = start || (name + '-start');
        end = end || (name + '-end');
        const v1 = Cell0.fromString(start);
        const v2 = Cell0.fromString(end);
        const attachingMap = new Attach(1, [v1, v2]);
        return new Cell1(name, [v1, v2], attachingMap);
    }
    /**
   * @param theCorrectOne it false, give me the other one
   * @returns the starting vertex
   */
    start(theCorrectOne = true) {
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
    end(theCorrectOne = true) {
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
    static circle(n, labelPrefix) {
        labelPrefix = labelPrefix || '';
        const keys = [...Array(n).keys()];
        const edgeLabels = keys.map((i) => labelPrefix + '-e' + i);
        const vertexLabels = keys.map((i) => labelPrefix + '-v' + i);
        const vertices = keys.map((i) => new Cell0(vertexLabels[i]));
        // Make it so the n+1st loops back
        vertices.push(vertices[0]);
        const edges = keys.map((i) => Cell1.v1v2(edgeLabels[i], vertices[i], vertices[i + 1]));
        return edges;
    }
    /**
     *
     * @returns name: start ---> end
     */
    toString() {
        return this.name + ': ' +
            this.start().toString() +
            ' ---> ' +
            this.end().toString();
    }
    /**
     * NOT RECURSIVE COPY!!
     * @returns a copy of this cell WITH THE SAME VERTICES!
     */
    copy() {
        const [...targets] = this.attachingMap.targets;
        const A = new Attach(1, targets);
        return new Cell1(this.name, [...this.cells0], A);
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
    glue0in1(glued, newCell) {
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
            throw new Error('Glueing went wrong:\n' +
                output.isValid()[1]);
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
    glue1in1(glued, newCell) {
        // If this is the edge, just replace it
        if (this.indexOf(glued) >= 0) {
            return newCell;
        }
        return this;
    }
    /**
   * @returns the same edge, in reverse
   */
    reverse() {
        return Cell1.v1v2(this.name + '\'', this.end(), this.start());
    }
}
exports.Cell1 = Cell1;
/**
 * @property {string} name
 */
class Cell0 extends Cell {
    /**
     *
     * @param {string} name label
     */
    constructor(name) {
        super(name, new Attach(0, []));
    }
    /**
   *
   * @return {string} just the name
   */
    toString() {
        return this.name;
    }
    /**
   * makes a vertex from maybe a label
   * @param v vertex or label
   * @return a vertex
   */
    static fromString(v) {
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
    glue0in0(glued, newCell) {
        // If c is the vertex, just replace it
        if (this.indexOf(glued) >= 0) {
            return newCell;
        }
        return this;
    }
}
exports.Cell0 = Cell0;
/**
 * Attaching maps
 * @property {number} dim - of the map
 * @property {FaceType[]} target - of the map
 * @property {boolean[]} oriented - is the map orientation compatible,
 * i.e. does the 1-cell go counterclockwise around the 2-cell? (for 1->0
 * cells this is just true always
 */
class Attach {
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
    constructor(dim, targets, oriented) {
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
    isValid() {
        if (this.dim === 0) {
            if (this.targets.length !== 0) {
                return [false, 'Dimension 0 has a target'];
            }
            if (this.oriented.length !== 0) {
                return [false, 'Dimension 0 has orientations'];
            }
            return [true, ''];
        }
        else if (this.dim === 1) {
            if (this.targets.length !== 2) {
                return [false, 'Dimension 1 has target number != 2'];
            }
            this.targets.forEach((v) => {
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
            });
            return [true, ''];
        }
        else if (this.dim == 2) {
            const n = this.targets.length;
            this.targets.forEach((e) => {
                if (e.dim !== 1) {
                    return [false, 'Attached 2-cell to something other than 1-cell'];
                }
            });
            if (n !== this.oriented.length) {
                return [false, 'Wrong length of oriented'];
            }
            let isCircular = true;
            let correctEdges = true;
            this.targets.forEach((e, i) => {
                const e2 = this.targets[(i + 1) % n];
                if (e instanceof Cell1 && e2 instanceof Cell1) {
                    const v1 = e.end(this.oriented[i]);
                    const v2 = e2.start(this.oriented[(i + 1) % n]);
                    /* console.log(`Glueing ${e.toString()}
                    with ${e2.toString()}:`);
                    console.log(`Vertex ${v1.toString()}
                    and vertex ${v2.toString()} match: ${v1.equals(v2)}`); */
                    if (!v1.equals(v2)) {
                        isCircular = false;
                    }
                }
                else {
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
    toString() {
        return JSON.stringify(this);
    }
}
exports.Attach = Attach;
