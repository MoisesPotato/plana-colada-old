// TopSurface.ts
// A class for working with topological surfaces

// eslint-disable-next-line no-unused-vars
import {string} from 'mathjs';


/**
 * @type {{face:number, index:number, forward:boolean}} edgeOf;
 */
 type edgeOf = {face:number, index:number, forward:boolean};


/**
 * @property {Cell2[]} cells2
 * @property {Cell1[]} cells1
 * @property {Cell0[]} cells0
 * Every other property uses numbers to point
 * to these three arrays
 * @property { {start:number, end:number}[] } edgeToVertices
 * for every edge i edgeToVertices[i].start is the index of the
 * start resp. the end
 * @property {[edgeOf, edgeOf][]} edgeToFaces
 * for every edge i, edgeToFaces[i][0].face is the face index,
 * edgeToFaces, edgeToFaces[i][0].index is the index of this edge
 * in this face, and edgeToFaces[i][0].forward tells us which way it's glued
 * The second one might be undefined
 * @property {Array<{index:number, forward:boolean}[]>}faceToEdges
 * for each face, we get in order
 * the index of its edges and the way they are glued
 * @property {Array<{index:number}[]>} faceToVertices:;
 * for each face, the vertices:
 * starting with the start (or end if it's backwards)
 * of edge 0
 * @property {Array<{index:number, start: boolean}[]>} vertexToEdges
 * for each vertex, the ordered list of its edges and the data
 * of where it's at the start
 * @property {boolean[]} verticesInBoundary
 * for each vertex, this is true if it doesn't have a whole disk around it
 * @property {{index:number, forward:boolean}[]} vertexToFaces
 * for each vertex, the list of faces it's attached to, and whether
 * the ordering of
 * @property {boolean} isManifold:;
 * @property {boolean} isMfldWBoundary: ;
 */
export class CW {
  cells2:Cell2[];
  cells1:Cell1[];
  cells0:Cell0[];
  edgeToVertices:{start:number, end:number}[];
  edgeToFaces:[edgeOf, edgeOf|undefined][];
  faceToEdges:{index:number, forward:boolean}[][];
  faceToVertices:number[][];
  vertexToEdges:{index:number, start: boolean}[][];
  verticesInBoundary:boolean[];
  // vertexToFaces:{index:number, forward:boolean}[];
  isManifold:boolean;
  isMfldWBoundary:boolean;

  /**
 *
 * @param cells2 array of cells
 */
  constructor(cells2: Cell2[]) {
    this.cells2 = cells2;
    const cells1Together = cells2.map((c) => c.cells1);
    const cells0Together = cells2.map((c) => c.cells0);
    this.cells1 = Cell.mergeLists(cells1Together) as Cell1[];
    this.cells0 = Cell.mergeLists(cells0Together) as Cell0[];
    this.isManifold = true;
    this.isMfldWBoundary =true;
    this.edgeToVertices = this.cells1.map((e) =>{
      /* console.log(
          `Edge ${e.toString()}
has start ${e.start()} (${this.findCell(e.start())})
and end ${e.end()} (${this.findCell(e.end())})`,
      ); */
      return {start: this.findCell(e.start()),
        end: this.findCell(e.end()),
      };
    });
    /*  console.log(`Edgesdata:
${JSON.stringify(this.edgeToVertices)}`); */
    this.edgeToFaces = this.cells1.map((e, i) =>{
      const [mfldCompatible,
        mfldWithBoundary,
        face1,
        face2] = this.edgeFaces(i);
      this.isManifold = this.isManifold && mfldCompatible;
      if (!mfldWithBoundary) {
        throw new Error(`Edge ${e} has the wrong number of faces`);
      }
      return [face1, face2];
    });
    /* console.log(`Each edge belongs to these faces:
${JSON.stringify(this.edgeToFaces)}`); */
    this.faceToEdges = this.cells2.map((f, i) =>
      this.getEdgesInFace( i));
    this.faceToVertices = this.cells2.map((f, i) =>
      this.getVerticesInFace(i));
    const vertexFans = this.cells0.map((c, j) =>
      this.vertexNbhd(j),
    );
    this.vertexToEdges = vertexFans.map((a) => a[0]);
    this.verticesInBoundary = vertexFans.map((a) => a[1]);
  }

  /**
   *
   * @param c a celll
   * @returns the index n, i.e. this.cellsD[n] = c
   */
  findCell(c:Cell0|Cell1|Cell2):number {
    if (c instanceof Cell0) {
      return Cell.findByName(c.name, this.cells0);
    }
    if (c instanceof Cell1) {
      return Cell.findByName(c.name, this.cells1);
    }
    if (c instanceof Cell2) {
      return Cell.findByName(c.name, this.cells2);
    }
    throw new Error('How did we get here???');
  }

  /**
   * @returns the Euler characteristic
   */
  get euler():number {
    return this.cells0.length - this.cells1.length + this.cells2.length;
  }

  /**
 * @param labels a string such as aba'b'.
 * Apostrophes are used for opposite glueing
 * @param name optional name
 * @returns a surface from the labellin.
 * For example aba'b' gives a torus
 */
  static fromString(labels:string, name?:string):CW {
    return new CW([Cell2.fromString(labels, name)]);
  }

  /**
   *
   * @param faceIndex the index of a face
   * @returns the list of edges and the way they are glued
   */
  getEdgesInFace(faceIndex:number):{index:number, forward:boolean}[] {
    const face = this.cells2[faceIndex];
    const edgeList = face
        .attachingMap.targets.map((e, j) => {
          const edgeIndex = this.findCell(e);
          const forward = face.edge(j).or;
          // console.log(`Edge number ${j} is
          // ${e}
          // which appears with index ${edgeIndex} in the list.
          // It is oriented ${face.edge(j).or?'forward':'backwards'}.
          // So we will return index: ${edgeIndex} forward: ${forward}}
          // `);
          return {index: edgeIndex, forward: forward};
        });
    // console.log(edgeList);
    return edgeList;
  }

  /**
   *
   * @param faceIndex the index of a face
   * @returns the list of edges and the way they are glued
   */
  getVerticesInFace(faceIndex:number):number[] {
    const vertexList = this.faceToEdges[faceIndex].map(
        ({index: e, forward: or}, j) => {
          if (or) {
            return this.edgeToVertices[e].start;
          } else {
            return this.edgeToVertices[e].end;
          }
        });
    return vertexList;
  }

  // /**
  //  * @returns [isItASurface, isItASurfaceWithBoundary]
  //  */
  // get isManifold():[boolean, boolean] {

  // }

  /**
   *TODO
   * @param v a vertex number
   * @returns the list of edges in order and if the vertex is on the boundary
   */
  vertexNbhd(v:number):[{index: number, start: boolean}[], boolean] {
    const unOrderedEdges = this.edgesContainingAVertex(v);
    const {links: linkData, boundaries: boundaries} = this
        .findLinksBetweenEdges(v, unOrderedEdges);
    let currentIndex = 0;
    let onBoundary = false;
    if (boundaries.length >= 2) {
      currentIndex = boundaries[0];
      onBoundary = true;
    }
    let {index: currentEdge, start: currentStart} =
    unOrderedEdges[currentIndex];
    const orderedEdges = [unOrderedEdges[currentIndex]];
    let previousLink = 1;
    let newIndex = currentIndex;
    /* console.log(`Link data:
    ${JSON.stringify(linkData)}`); */
    unOrderedEdges.forEach(({index: i}, iteration) => {
      // We want to run the loop one less time than the number of edges
      // since we have already included one thing in the array
      /* console.log(`Previous link: ${previousLink}`);
      console.log('\x1b[36m%s\x1b[0m', `i = ${iteration},
      and we stop if we reach ${unOrderedEdges.length}`); */
      if (iteration < unOrderedEdges.length - 1) {
        /* console.log(
            `We are currently on edge ${newIndex} of the list,
The list:
${JSON.stringify(unOrderedEdges)},
so far we have found
${JSON.stringify(orderedEdges)}
the last connection we used was ${previousLink}`,
        );
        console.log(`The last edge we looked at was:
edge ${currentEdge} at the ${currentStart?'start':'end'}`); */
        const oldEdge = currentEdge;
        const oldStart = currentStart;
        // the new edge in the list
        ({index: currentEdge, start: currentStart} =
        linkData[newIndex][1-previousLink]);
        /* console.log(`Following the connection we find
edge ${currentEdge} at the ${currentStart?'start':'end'}`); */
        // find it it the list of unordered edges
        newIndex = -1;
        unOrderedEdges.forEach(({index: i, start: s}, j)=> {
          if ((i == currentEdge) && (s == currentStart)) {
            newIndex = j;
          }
        });
        /* console.log(`This new edge is found at position ${newIndex}
in the unordered list
${JSON.stringify(unOrderedEdges)}
        `); */
        // If we didn't find it something went wrong
        if (newIndex == -1) {
          let unOrderedString = '';
          unOrderedEdges.forEach(({index: i, start: s}) => {
            unOrderedString = unOrderedString +
          '\n' + `Index: ${i}, ${s?'start':'end'}.`;
          });
          let orderedString = '';
          orderedEdges.forEach(({index: i, start: s}) => {
            orderedString = orderedString +
          '\n' + `Index: ${i}, ${s?'start':'end'}.`;
          });
          let linkString = '';
          linkData.forEach(([{index: i, start: s}, otherEdge], j) => {
            linkString = linkString +
            `
            Edge ${j} links to
            Index: ${i} at ${s?'start':'end'}
            ${otherEdge?`and
            Index: ${otherEdge.index} at ${otherEdge.start?'start':'end'}
            `:''}
            `;
          });
          throw new Error(`Cone over vertex ${v} `+
          `has too many connected components
        Edges around this vertex are
        ${unOrderedString}
        Currently ordered edges are
        ${orderedString}
        Link info is
        ${linkString}
        Was looking for the edge ${currentEdge}
        at the ${currentStart?'start':'end'} `+
        `but couldn't find it
        `);
        }
        // If we found it, add the new edge to the list
        orderedEdges.push(unOrderedEdges[newIndex]);
        // Which link did we come in through, 0 or 1?
        const isItFirst = ((oldEdge == linkData[newIndex][0].index) &&
      (oldStart == linkData[newIndex][0].start));
        if (isItFirst) {
          previousLink = 0;
        } else {
          previousLink = 1;
        }
        /* console.log(`Based on the data
${JSON.stringify(linkData)}
we came in through connection ${previousLink}`); */
      }
    });
    return [orderedEdges, onBoundary];
  }

  /**
  *
  * @param v a vertex
  * @returns a list with no order (inherited from this.Cells1)
  * of all the edges that contain this vertex, twice if they are
  * the start and end. If this.cells1[i] has the vertex, the array contains
  * {index:i, start:(false if it's the end)}
  */
  edgesContainingAVertex(v:number):{index:number, start:boolean}[] {
    const edges = [] as {index:number, start:boolean}[];
    this.cells1.forEach((e, i) => {
      if (v == this.edgeToVertices[i].start) {
        edges.push({index: i, start: true});
      }
      if (v == this.edgeToVertices[i].end) {
        edges.push({index: i, start: false});
      }
    });
    /* console.log(`
These are the endpoints of each edge:
${JSON.stringify(this.edgeToVertices)}
The edges containing vertex ${v}
are ${JSON.stringify(edges)}`); */
    return edges;
  }

  /**
   * @param v a vertex
   * @param edges The output of {@link edgesContainingAVertex}
   * A list of indices and start/end {index:number, start:boolean}
   * @returns [indices of the connected edges][]
   */
  findLinksBetweenEdges(v:number, edges:{index:number, start:boolean}[] )
  :{links:{index:number, start:boolean}[][], boundaries:number[]} {
    const linkData = [] as {index:number, start:boolean}[][];
    const boundaries = [] as number[];

    edges.forEach(({index: index, start: start}, i) => {
      const faces = this.edgeToFaces[index];
      // console.log('Faces: '+JSON.stringify(faces));
      const nextEdges = [this.nextEdge(v, start, faces[0])];
      if (faces[1] !== undefined) {
        nextEdges.push(this.nextEdge(v, start, faces[1]));
      } else {
        boundaries.push(i);
      }
      // console.log(JSON.stringify(nextEdges));
      linkData.push(nextEdges);
    });
    if (boundaries.length > 2) {
      throw new Error('This vertex has too many boundary edges');
    }
    /* console.log(`We want to find the links of vertex ${v}
    The unordered list of edges it belongs to is
    ${JSON.stringify(edges)}
    The link data is this:
    ${JSON.stringify(linkData)}
    `); */
    return {links: linkData, boundaries: boundaries};
  }

  /**
   *
   * @param v a vertex
   * @param start is the vertex the start of its edge
   * @param face a 2-cell containing this vertex
   * @param i the edge of this 2-cell that contains the vertex
   * @returns [the index of the 1-cell that is neighboring in this cell,
   * true if the vertex is the start
   * ]
   */
  nextEdge(v:number, start:boolean,
      {face: f, index: i}:edgeOf):{index:number, start:boolean} {
    const edgeList = this.faceToEdges[f];
    const gluedForward = edgeList[i].forward;
    const doWeWantNextEdge = !(start == gluedForward);
    let newi = doWeWantNextEdge? i + 1 : i - 1;
    newi = newi < 0 ? edgeList.length - 1 : newi;
    newi = (newi >= edgeList.length) ? 0 : newi;
    const newStart = (edgeList[newi].forward == doWeWantNextEdge);
    /* console.log(
        `Vertex ${v} as the ${start?'start':'end'} `+
      `of the ${i}th edge of face ${f}:
      This edge is glued ${gluedForward?'forward':'backwards'},
      so we want the ${doWeWantNextEdge?'next':'previous'} edge, ${newi}
      We choose the ${newStart?'start':'end'} of edge ${newi},
      which is the ${edgeList[newi].index} edge on the list
      `,
    ); */
    return {index: edgeList[newi].index, start: newStart};
  }


  /**
   *
   * @param n an edge index
   * @returns Is this compatible with a manifold? answer[0]
   * With boundary? answer[1]
   * Face #1 {face: the cell, index:when it appears}
   * Face #2 (maybe)
   */
  edgeFaces(n:number): [boolean, boolean, edgeOf, edgeOf|undefined] {
    const edge = this.cells1[n];
    let faceCounter = 0;
    let face1 = undefined as undefined|edgeOf;
    let face2 = undefined as undefined|edgeOf;
    let mfldCompatible = false;
    let mfldWithBoundary = false;
    this.cells2.forEach((f, faceIndex)=> {
      f.attachingMap.targets.forEach((e, i) => {
        if (edge.equals(e)) {
          if (faceCounter == 0) {
            face1 = {
              face: faceIndex,
              index: i,
              forward: f.edge(i).or,
            };
            faceCounter++;
            mfldWithBoundary = true;// at least one face
          } else if (faceCounter == 1) {
            face2 = {
              face: faceIndex,
              index: i,
              forward: f.edge(i).or,
            };
            faceCounter++;
            mfldCompatible = true;// at least two faces
          } else {// two many faces
            mfldWithBoundary = false;
            mfldCompatible = false;
          }
        }
      });
    });
    if (typeof face1 == 'undefined') {
      throw new Error('Edge is no one\'s edge. How did we get here?');
    }
    /* console.log(
        `Edge ${n} is
the ${face1.index}th edge in face ${face1.face},`+
`glued ${face1.forward?'forward':'backward'}
${face2?`and the ${face2.index}th edge in face ${face2.face},`+
`glued ${face2.forward?'forward':'backward'}`:''}
`); */
    if (face2) {
      return [mfldCompatible, mfldWithBoundary, face1, face2];
    } else {
      return [mfldCompatible, mfldWithBoundary, face1, undefined];
    }
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
   * @param name name of a cell
   * @param list array of cells
   * @returns the last index at which this name appears in the array
   */
  static findByName(name:string, list:Cell[]):number {
    let found = -1;
    list.forEach((c, i) => {
      if (c.name === name) {
        found = i;
      }
    });
    return found;
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

  /**
   * @returns the array without duplicates
   * @param list an array of cell arrays
   */
  static mergeLists(list:Cell[][]):Cell[] {
    let output = [] as Cell[];
    list.forEach((A)=>{
      output = output.concat(A);
    });
    output = Cell.removeDuplicates(output);
    return output;
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

  /**
   *
   * @param v a vertex
   * @param edgeIndex the index of the edge in the ordering
   * @param start is the vertex the start? (or the end?)
   * @returns [next edge, start of next edge or end]
   */
  nextEdge(v:Cell0, edgeIndex:number, start:boolean):[number, boolean] {
    if (!this.edge(edgeIndex).e.start(start).equals(v)) {
      throw new Error('This is not a vertex of the right edge:\n'+
      `Vertex: ${v.toString}
      Index: ${edgeIndex}
      Edge: ${this.edge(edgeIndex).e}
      ${start? 'start':'end'}`);
    }
    // Decide if we are taking the next or previous edge in the order
    const chooseNext = !(this.edge(edgeIndex).or == start);
    let newIndex:number;
    if (chooseNext) {
      newIndex =edgeIndex + 1;
    } else {
      newIndex =edgeIndex - 1;
    }
    const {e: newEdge, or: newOrient} = this.edge(newIndex);
    /* console.log(`${newOrient? 'Forward':'Backwards'}`); */
    if (!newEdge.hasVertex(v)) {
      const [, message] = this.isValid();
      throw new Error('Bad polygon:\n'+message);
    }
    // Decide if we want the start or end of the other edge
    const newStart = (chooseNext == newOrient);
    /* console.log(`We are moving ${chooseNext? 'forward':
  'backwards'}, and the new edge is ${newOrient? 'forward':
  'backwards'}, so we are going with the ${newStart?'start':'end'}`); */
    return [newIndex, newStart];
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
   * @param i index. Could be at most -(nEdges)
   * @returns e:ith edge, or:glueing side
 */
  edge(i:number):edge {
    const n = this.attachingMap.targets.length;
    if (i < 0) {
      i = n + i;
    } else if (i >= n) {
      i = i % n;
    }
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
   * @param name label (optional)
   * @param n number of edges
   * @param labels {@link glueLabel}
   * telling us how to glue
   * @returns An attaching map
   */
  static fromLabels(name:string, n:number, ...labels:glueLabel[]):Cell2 {
    let C = Cell2.disk(n, name);
    labels.forEach(([i, j, oriented]) =>{
      if ((i >= n) || (j >= n)) {
        throw new Error('Labels out of range');
      }
      const gluedEdges = [C.edge(i), {e: C.edge(j).e, or: !oriented}];
      C = C.glue1in2(gluedEdges, C.edge(i).e, name);
    });
    return C;
  }
  /**
 * @returns a polygon with the edges identified as the given string
 * @param labels a string describing how to glue the polygon edges
 * @param name optional
 * E.g. `aba'b'` gives a torus
 */
  static fromString(labels:string, name=labels):Cell2 {
    const letters = labels.split('');
    const distinctLetters = [] as string[];
    let nSides = 0;
    let trueIndex = -1;
    // letters.filter((l) => {
    //   if (l != `'` && distinctLetters.indexOf(l) >= 0) {
    //     return true;
    //   }
    //   return false;
    // });
    // const edgeLabels =[] as string[];
    const labelCount =[] as number[];
    const glueing = [] as
    {thisEdge:number, otherEdge:number|undefined, or:boolean}[];
    let lastIndex = -1;
    letters.forEach((l, i)=>{
      if (l ==`'`) {
        glueing[lastIndex].or = !glueing[lastIndex].or;
        // console.log(`Found an apostrophe: ${glueing[lastIndex].toString()}`);
      } else {
        trueIndex++;
        nSides++;
        const j = distinctLetters.indexOf(l);
        if (j == -1) {
          distinctLetters.push(l);
          labelCount.push(1);
          glueing.push({thisEdge: trueIndex,
            otherEdge: undefined,
            or: false});
          lastIndex = glueing.length - 1;
        } else {
          lastIndex = j;
          labelCount[j] = labelCount[j] + 1;
          if (labelCount[j] > 2) {
            throw new Error('More than three edges have same name');
          }
          glueing[j].otherEdge = trueIndex;
        }
      }
      /* console.log(`Finished step ${i - apostropheCount}.
      Read the letter ${l},
      The distinct letters we have so far are ${distinctLetters}
      Of each there are ${labelCount}
      The glueing data is ${glueing}`); */
    });
    let glueLabels = glueing.map(({thisEdge: i, otherEdge: j, or: or}) => {
      if (typeof j == 'number') {
        return [i, j, or] as glueLabel;
      } else {
        return [-1, -1, true] as glueLabel;
      }
    });
    // console.log(name);
    // console.log(glueLabels);
    glueLabels = glueLabels.filter((l) => l[0] >= 0);
    return Cell2.fromLabels(name, nSides, ...glueLabels);
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
    // console.log(`Orientations: ${oriented}`);
    const cellList = glued.map((edge) => edge.e);
    const orientationList = glued.map((edge) => edge.or);

    /* console.log('Start: Trying to glue\n'+
    cellList.toString()+'\n'+
      'in the cell\n'+
      this.toString()+'\n'+
      'with orientations'+'\n'+
      orientationList); */
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

  /**
   *
   * @param name the name
   * @param edges edges to attach, in order
   * @param rightWay if true, same direction, if false, other way
   * @returns a cell from these edges
   */
  static attachToEdges(name : string, edges:Cell1[], rightWay:boolean[]):Cell2 {
    let vertices = [] as Cell0[];
    edges.forEach((e) => {
      vertices.push(e.start());
      vertices.push(e.end());
    });
    vertices = Cell.removeDuplicates(vertices);
    const attaching = new Attach(2, edges, rightWay);
    const output = new Cell2(name, attaching,
        Cell.removeDuplicates(edges), vertices);
    const [valid, message] = output.isValid();
    if (valid) {
      return output;
    } else {
      throw new Error('These edges don\'t glue that way!\n'+message);
    }
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
 *
 * @param v a 0 cell
 * @returns true if this is one of its vertices
 */
  hasVertex(v:Cell0):boolean {
    return (v.equals(this.start()) ||v.equals(this.end()));
  }

  /**
 *@param name label
 * @param start start or [start, end]
 * @param end end
 * @return {Cell1} a new 1-cell with these endpoints
 * the default endspoints are name-start and name-end
 */
  static join2(name: string, start?:Cell0|string, end?:Cell0|string):Cell1 {
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
      Cell1.join2(edgeLabels[i], vertices[i], vertices[i+1]),
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
    return Cell1.join2(this.name +'\'',
        this.end(), this.start()) as typeof this;
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

