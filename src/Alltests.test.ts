
// eslint-disable-next-line no-unused-vars
import {Attach, Cell, Cell0, Cell1, Cell2, CW} from './TopSurface';
import {Cx} from './Cx';

/**
 *
 * @param c A square
 * @param name the name of the square
 * @param e The names of the desired edges
 * @param v the names of the desired vertices
 * @returns do the labels indeed match
 */
function checkPolygonLabels(c:Cell2, name:string,
    e:string[],
    v:string[]):void {
  try {
    try {
      expect(c.isValid()[0]).toBe(true);
    } catch (e) {
      console.log( );
      console.log('Invalid cell:');
      console.log(c.isValid()[1]);
      console.log(c.toString());
      throw e;
    }
    /*     console.log(`Edges:${e}
Real edges:${c.toString()}`); */
    const n = e.length;
    e.forEach((x, i) =>{
      if (c.attachingMap.oriented[i]) {
        expect(c.attachingMap.targets[i].toString())
            .toBe(`${e[i]}: ${v[i]} ---> ${v[(i + 1) % n]}`);
      } else {
        expect(c.attachingMap.targets[i].toString())
            .toBe(`${e[i]}: ${v[(i + 1) % n]} ---> ${v[i]}`);
      }
      expect(c.attachingMap.targets[i]
          .start(c.attachingMap.oriented[i]).toString())
          .toBe(`${v[i]}`);
      expect(c.attachingMap.targets[i]
          .end(c.attachingMap.oriented[i]).toString())
          .toBe(`${v[(i + 1) % n]}`);
    });

    expect(c.name).toBe(name);
    expect(c.attachingMap.dim).toBe(2);
    expect(c.attachingMap.isValid()[0]).toBe(true);
  } catch (error) {
    console.log(error);
    console.log(`Didn't match this cell:\n
    ${c.toString()}
    with this info: name is ${name}\n
    edges:\n
    ${e}\n
    vertices:\n
    ${v}`,
    );
    throw new Error();
  }
}


describe(('0 cells '), () => {
  it('have names', ()=> {
    const v = new Cell0('A');
    expect(v.name).toEqual('A');
  });
});

describe('Cells ', () =>{
  const v1 = new Cell0('a');
  const v2 = new Cell0('b');
  const e1 = Cell1.join2('e1');
  const e2 = Cell1.join2('e2', 'a', 'a');

  it('recognize equality', () => {
    expect(v1.equals(v1)).toBe(true);
    expect(v1.equals(v2)).toBe(false);
    expect(v1.equals(e1)).toBe(false);
    expect(e1.equals(e1)).toBe(true);
  });

  it('finds cells in a list', () => {
    const list1 = [v1, v1, v1];
    expect(v1.indexOf(list1)).toBe(2);
    expect(v2.indexOf(list1)).toBe(-1);
  },
  );

  it('removes duplicates', ()=>{
    const list1 = Cell.removeDuplicates([v1, v1, v1]);
    expect(list1.length).toBe(1);
    expect(list1).toEqual([v1]);
    const list2 = Cell.removeDuplicates([e1, e2, e1, e2, e2]);
    expect(list2.length).toBe(2);
    expect(list2).toEqual([e1, e2]);
    const list3 = Cell.mergeLists([[], [e1, e2],
      [e1, e2, e1], [e1, e1, e1], [v1, e2]]);
    expect(list3).toEqual([e1, e2, v1]);
  });

  it('compares sets', () => {
    expect(Cell.compareSets([v1, v1], [])).toBe(false);
    expect(Cell.compareSets([], [])).toBe(true);
    expect(Cell.compareSets([v1, v1], [v1])).toBe(true);
    expect(Cell.compareSets([v1, v1], [v2, v1])).toBe(false);
    expect(Cell.compareSets([v1, v2, v2], [v2, v1])).toBe(true);
  });
});
describe('Cells can be glued', () => {
  const v1 = new Cell0('a');
  const v2 = new Cell0('b');
  const e1 = Cell1.join2('e1');
  const D = Cell2.disk(4, 'D');
  it('0-cells inside of 0-cells', ()=>{
    expect(v1.glue0in0( [v1], v2)).toEqual(v2);
    expect(v1.glue0in0( [v2], v1)).toEqual(v1);
    expect(v1.glue0in0( [v2], v2)).toEqual(v1);
    expect(v1.glue0in0( [v1, v2], v2)).toEqual(v2);
    expect(v1.glue0in0( [], v2)).toEqual(v1);
  } );

  it('0-cells inside of 1-cells', () => {
    const e3 = e1.glue0in1( [], v1);

    // console.log('Made e3');
    // console.log(`e1: ${e1.toString()}`);

    expect(e3).toEqual(e1);
    expect(e1.start().toString()).toEqual('e1-start');

    const e4 = e1.glue0in1( [e1.start(), e1.end()], e1.start());
    expect(e4.cells0);
    expect(e4.start()).toEqual(e1.start());
    expect(e4.cells0).toEqual([e1.start()]);
    expect(e4.attachingMap.targets[1]).toEqual(e1.start());
    expect(e4.toString()).toBe('e1: e1-start ---> e1-start');
    expect(e4.start()).toEqual(e4.end());
    expect(e4.attachingMap.targets[0]).toEqual(e4.end());
    expect(e4.attachingMap.targets[1]).toEqual(e4.start());

    // console.log('Made e4');
    // console.log(`e1: ${e1.toString()}`);
    let e5= e1.glue0in1( [e1.end()], v2);
    expect(e5.start()).toEqual(e1.start());
    expect(e5.end()).toEqual(v2);
    // console.log(`e5: ${e5.toString()}`);
    e5= e5.glue0in1( [e1.start()], v1);
    // console.log(`e5: ${e5.toString()}`);
    expect(e5.start()).toEqual(v1);
    expect(e5.end()).toEqual(v2);


    expect(e1.toString()).toEqual('e1: e1-start ---> e1-end');
  });

  it('0-cells inside of 2-cells', () => {
    const D2 = D.glue0in2([D.cells0[0]], v1);
    D2.name = 'D2';
    checkPolygonLabels(D2, 'D2',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['a', 'D-v1', 'D-v2', 'D-v3']);


    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);

    const D3 = D2.glue0in2([D2.cells0[1], D.cells0[2],
      D2.attachingMap.targets[0].end()], v2);
    D3.name = 'D3';


    checkPolygonLabels(D2, 'D2',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['a', 'D-v1', 'D-v2', 'D-v3']);


    checkPolygonLabels(D3, 'D3',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['a', 'b', 'b', 'D-v3']);

    const D4 = D3.glue0in2(D3.cells0, v1, 'D4');


    checkPolygonLabels(D4, 'D4',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['a', 'a', 'a', 'a']);


    checkPolygonLabels(D3, 'D3',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['a', 'b', 'b', 'D-v3']);


    checkPolygonLabels(D2, 'D2',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['a', 'D-v1', 'D-v2', 'D-v3']);
  });

  it('1-cells inside of 1-cells', () => {
    const e1 = Cell1.join2('e', 'a', 'b');
    const e2 = Cell1.join2('f', 'b', 'c');

    const e3 = e1.glue1in1([], e2);
    expect(e3.toString()).toBe('e: a ---> b');


    const e4 = e1.glue1in1([e1, e2], e2);
    expect(e4.toString()).toBe('f: b ---> c');


    const e5 = e2.glue1in1([e1, e2], e1);
    expect(e5.toString()).toBe('e: a ---> b');

    expect(e4.cells0).toEqual(e2.cells0);
    expect(e5.cells0).toEqual(e1.cells0);
  });
});

describe('edges can be glued', () => {
  const e1 = Cell1.join2('e1', 'a', 'b');
  const e2 = Cell1.join2('e2', 'c', 'd');
  const D = Cell2.disk(4, 'D');

  it('can make an empty glueing', () => {
    const D2 = D.glue1in2([], D.cells1[0], 'D2');
    checkPolygonLabels(D2, 'D2',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);


    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });

  it('can replace one edge in a square', () => {
    const D2 = D.glue1in2([{e: D.edge(0).e, or: true}], e1, 'Square');
    checkPolygonLabels(D2, 'Square',
        ['e1', 'D-e1', 'D-e2', 'D-e3'],
        ['a', 'b', 'D-v2', 'D-v3']);


    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });


  it('can replace one edge in a square backwards', () => {
    const D2 = D.glue1in2([{e: D.edge(0).e, or: false}], e1, 'Square');
    checkPolygonLabels(D2, 'Square',
        ['e1', 'D-e1', 'D-e2', 'D-e3'],
        ['b', 'a', 'D-v2', 'D-v3']);


    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });

  it('can identify two opposite edges', () => {
    const D2 = D.glue1in2([{e: D.edge(0).e, or: true},
      {e: D.edge(2).e, or: false}],
    e1, 'Cylinder');
    checkPolygonLabels(D2, 'Cylinder',
        ['e1', 'D-e1', 'e1', 'D-e3'],
        ['a', 'b', 'b', 'a']);


    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });

  it('can make a Mobius band', () => {
    const D2 = D.glue1in2([{e: D.edge(0).e, or: true},
      {e: D.edge(2).e, or: true}], e1, 'Mobius');

    checkPolygonLabels(D2, 'Mobius',
        ['e1', 'D-e1', 'e1', 'D-e3'],
        ['a', 'b', 'a', 'b']);


    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });


  it('can make a torus', () => {
    const D2 = D.glue1in2([{e: D.edge(0).e, or: true},
      {e: D.edge(2).e, or: false}],
    e1, 'Cylinder');

    const D3 = D2.glue1in2([{e: D2.edge(1).e, or: true},
      {e: D2.edge(3).e, or: false}], e2, 'Torus');

    checkPolygonLabels(D3, 'Torus',
        ['e1', 'e2', 'e1', 'e2'],
        ['c', 'c', 'c', 'c']);

    checkPolygonLabels(D2, 'Cylinder',
        ['e1', 'D-e1', 'e1', 'D-e3'],
        ['a', 'b', 'b', 'a']);


    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });

  it('can make a Klein Bottle', () => {
    const D2 = D.glue1in2([{e: D.edge(0).e, or: true},
      {e: D.edge(2).e, or: false}],
    e1, 'Cylinder');

    const D3 = D2.glue1in2([{e: D2.edge(1).e, or: true},
      {e: D2.edge(3).e, or: true}], e2, 'Klein');

    checkPolygonLabels(D3, 'Klein',
        ['e1', 'e2', 'e1', 'e2'],
        ['c', 'c', 'c', 'c']);

    checkPolygonLabels(D2, 'Cylinder',
        ['e1', 'D-e1', 'e1', 'D-e3'],
        ['a', 'b', 'b', 'a']);


    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });


  it('can make a sphere', () => {
    const D2 = D.glue1in2([{e: D.edge(0).e, or: true},
      {e: D.edge(1).e, or: false}],
    e1, 'Cone');
    const D3 = D2.glue1in2([{e: D2.edge(2).e, or: true},
      {e: D2.edge(3).e, or: false}], e2, 'Sphere');

    checkPolygonLabels(D3, 'Sphere',
        ['e1', 'e1', 'e2', 'e2'],
        ['c', 'b', 'c', 'd']);

    checkPolygonLabels(D2, 'Cone',
        ['e1', 'e1', 'D-e2', 'D-e3'],
        ['a', 'b', 'a', 'D-v3']);


    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });

  it('can make RP2', () => {
    const D2 = D.glue1in2([{e: D.edge(0).e, or: true},
      {e: D.edge(2).e, or: true}], e1, 'Mobius');

    const D3 = D2.glue1in2([{e: D2.edge(1).e, or: true},
      {e: D2.edge(3).e, or: true}], e2, 'RP2');

    checkPolygonLabels(D3, 'RP2',
        ['e1', 'e2', 'e1', 'e2'],
        ['d', 'c', 'd', 'c']);

    checkPolygonLabels(D2, 'Mobius',
        ['e1', 'D-e1', 'e1', 'D-e3'],
        ['a', 'b', 'a', 'b']);

    checkPolygonLabels(D, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });
});

describe(('1 cells '), () => {
  it('have vertices', ()=> {
    const e = Cell1.join2('e', 'a', 'b');
    expect(e.cells0[0].toString()).toBe('a');
    expect(e.cells0[1].toString()).toBe('b');
    expect(e.start().toString()).toBe('a');
    expect(e.end().toString()).toBe('b');
    expect(e.toString()).toBe('e: a ---> b');
  });
});

describe('2-cells ', () =>{
  it(' can be created with no identifications', ()=> {
    const edges = Cell1.circle(4, 'T');
    expect(edges[0].toString()).toBe('T-e0: T-v0 ---> T-v1');
    expect(edges[1].toString()).toBe('T-e1: T-v1 ---> T-v2');
    expect(edges[2].toString()).toBe('T-e2: T-v2 ---> T-v3');
    expect(edges[3].toString()).toBe('T-e3: T-v3 ---> T-v0');

    const disk = Cell2.disk(4, 'D');


    checkPolygonLabels(disk, 'D',
        ['D-e0', 'D-e1', 'D-e2', 'D-e3'],
        ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
  });
},
);


describe('I can make surfaces', () =>{
  it('I can make a disk:', () => {
    const a = new Cell0('a');
    const b = new Cell0('b');
    const c = new Cell0('c');
    const d = new Cell0('d');
    const A = Cell1.join2('A', a, b);
    const B = Cell1.join2('B', b, c);
    const C = Cell1.join2('C', c, d);
    const D = Cell1.join2('D', d, a);
    const Square = Cell2.attachToEdges('Square',
        [A, B, C, D],
        [true, true, true, true]);
    expect(Square.toString()).toBe(
        'Square:\n'+
        'A: a ---> b\n'+
        'B: b ---> c\n'+
        'C: c ---> d\n'+
        'D: d ---> a');
  });


  it('I can make a cylinder:', () => {
    const a = new Cell0('a');
    const b = new Cell0('b');
    const A = Cell1.join2('A', a, b);
    const B = Cell1.join2('B', b, b);
    const C = Cell1.join2('C', a, a);
    const Cylinder = Cell2.attachToEdges('Cylinder',
        [A, B, A, C],
        [true, true, false, true]);
    expect(Cylinder.toString()).toBe(
        'Cylinder:\n'+
        'A: a ---> b\n'+
        'B: b ---> b\n'+
        'A\': b ---> a (this is reversed)\n'+
        'C: a ---> a');
  });


  it('I can make a Mobius strip:', () => {
    const a = new Cell0('a');
    const b = new Cell0('b');
    const A = Cell1.join2('A', a, b);
    const B = Cell1.join2('B', b, a);
    const C = Cell1.join2('C', b, a);
    const Mobius = Cell2.attachToEdges('Mobius',
        [A, B, A, C],
        [true, true, true, true]);
    expect(Mobius.toString()).toBe(
        'Mobius:\n'+
        'A: a ---> b\n'+
        'B: b ---> a\n'+
        'A: a ---> b\n'+
        'C: b ---> a');
  });


  it('I can make a Torus:', () => {
    const a = new Cell0('a');
    const A = Cell1.join2('A', a, a);
    const B = Cell1.join2('B', a, a);
    const Torus = Cell2.attachToEdges('Torus',
        [A, B, A, B],
        [true, true, false, false]);
    expect(Torus.toString()).toBe(
        'Torus:\n'+
        'A: a ---> a\n'+
        'B: a ---> a\n'+
        'A\': a ---> a (this is reversed)\n'+
        'B\': a ---> a (this is reversed)');
  });


  it('I can make a sphere:', () => {
    const a = new Cell0('a');
    const b = new Cell0('b');
    const c = new Cell0('c');
    const A = Cell1.join2('A', a, b);
    const B = Cell1.join2('B', a, c);
    const Sphere = Cell2.attachToEdges('Sphere',
        [A, A, B, B],
        [true, false, true, false]);
    expect(Sphere.toString()).toBe(
        'Sphere:\n'+
        'A: a ---> b\n'+
        'A\': b ---> a (this is reversed)\n'+
        'B: a ---> c\n'+
        'B\': c ---> a (this is reversed)');
  });


  it('I can make a Klein Bottle:', () => {
    const a = new Cell0('a');
    const A = Cell1.join2('A', a, a);
    const B = Cell1.join2('B', a, a);
    const Torus = Cell2.attachToEdges('Torus',
        [A, B, A, B],
        [true, true, false, true]);
    expect(Torus.toString()).toBe(
        'Torus:\n'+
        'A: a ---> a\n'+
        'B: a ---> a\n'+
        'A\': a ---> a (this is reversed)\n'+
        'B: a ---> a');
  });


  it('I can make RP2:', () => {
    const a = new Cell0('a');
    const b = new Cell0('b');
    const A = Cell1.join2('A', a, b);
    const B = Cell1.join2('B', b, a);
    const RP2 = Cell2.attachToEdges('RP2',
        [A, B, A, B],
        [true, true, true, true]);
    expect(RP2.toString()).toBe(
        'RP2:\n'+
        'A: a ---> b\n'+
        'B: b ---> a\n'+
        'A: a ---> b\n'+
        'B: b ---> a');
  });
});

describe('It catches mistakes', () => {
  const a = new Cell0('a');
  const b = new Cell0('b');
  const A = Cell1.join2('A', a, b);
  const B = Cell1.join2('B', b, a);
  const C = Cell1.join2('C', a, b);
  it('I can make a mistake:', () => {
    try {
      Cell2.attachToEdges('Wrong',
          [A, B, A, C],
          [true, true, true, true]);
      throw new Error('Didn\'t fail');
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).not.toBe('Didn\'t fail');
      }
    }
  });
  it('I can make a mistake:', () => {
    try {
      Cell2.attachToEdges('Wrong',
          [A, A, A, A],
          [true, true, true, true]);
      throw new Error('Didn\'t fail');
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).not.toBe('Didn\'t fail');
      }
    }
  });


  it('I can make a mistake:', () => {
    Cell2.attachToEdges('Wrong',
        [A, B],
        [true, true]);
  });
});


describe('Can make a surfce from a string', ()=>{
  // it('A square', ()=> {
  //   const square = Cell2.fromLabels('Square', 4,
  //       [1, 3, true], [2, 0, true]);
  //   console.log(square.toString());
  // });

  // console.log('\x1b[31m', 'Trying to make RP2');
  const RP2 = CW.fromString(`abab`, 'RP2');
  // console.log('\x1b[31m', 'Trying to make sphere');
  const Sphere = CW.fromString(`aa'`, 'S2');
  const v2 = Sphere.cells0[0];
  const v3 = Sphere.cells0[1];
  const sphereFace = Sphere.cells2[0];
  // console.log('\x1b[31m', 'Trying to make Klein bottle');
  const Klein = CW.fromString(`abab'`, 'K');
  // console.log('\x1b[31m', 'Trying to make sphere from hexagon');
  const Sphere2 = CW.fromString(`abcc'b'a'`, 'S');
  // console.log('\x1b[31m', 'Trying to make cylinder');
  const Cyl = CW.fromString(`aba'c`, 'Cylinder');
  // console.log('\x1b[31m', 'Trying to make genus 3 surface');
  const Sigma3 = CW.fromString(`aba'b'cdc'd'efe'f'`, 'Sigma3');
  // console.log('\x1b[31m', 'Trying to make torus');

  const Torus = CW.fromString(`aba'b'`, 'T2');
  const v1= Torus.cells0[0];
  const face = Torus.cells2[0];

  it('Euler characteristics', () => {
    expect(Torus.euler).toBe(0);
    expect(Sphere.euler).toBe(2);
    expect(Klein.euler).toBe(0);
    expect(RP2.euler).toBe(1);
    expect(Sphere2.euler).toBe(2);
    expect(Cyl.euler).toBe(0);
    expect(Sigma3.euler).toBe(-4);
  });

  it('finds edge vertices', () => {
    expect(Torus.edgeToVertices).toEqual(
        [
          {start: 0, end: 0},
          {start: 0, end: 0},
        ],
    );
    expect(Sphere.edgeToVertices).toEqual(
        [
          {start: 0, end: 1},
        ],
    );
    expect(Cyl.edgeToVertices).toEqual(
        [
          {start: 0, end: 1},
          {start: 1, end: 1},
          {start: 0, end: 0},
        ],
    );
  });

  it('finds edges on a face', () => {
    expect(Torus.faceToEdges[0]).toEqual(
        [
          {index: 0, forward: true},
          {index: 1, forward: true},
          {index: 0, forward: false},
          {index: 1, forward: false},
        ],
    );
  });

  it('finds vertices on a face', () => {
    expect(Torus.faceToVertices[0]).toEqual(
        [0, 0, 0, 0],
    );
  });

  it('finds next edge', () => {
    expect(face.nextEdge(v1, 0, true))
        .toEqual([-1, true]);
    expect(face.nextEdge(v1, 0, false))
        .toEqual([1, true]);
    expect(face.nextEdge(v1, 1, true))
        .toEqual([0, false]);
    expect(face.nextEdge(v1, 1, false))
        .toEqual([2, false]);
    expect(face.nextEdge(v1, 2, true))
        .toEqual([3, false]);
    expect(face.nextEdge(v1, 2, false))
        .toEqual([1, false]);
    expect(face.nextEdge(v1, 3, true))
        .toEqual([4, true]);
    expect(face.nextEdge(v1, 3, false))
        .toEqual([2, true]);

    expect(sphereFace.nextEdge(v2, 0, true))
        .toEqual([-1, true]);
    expect(sphereFace.nextEdge(v2, 1, true))
        .toEqual([2, true]);
    expect(sphereFace.nextEdge(v3, 0, false))
        .toEqual([1, false]);
    expect(sphereFace.nextEdge(v3, 1, false))
        .toEqual([0, false]);

    expect(Cyl.edgeFaces(0)).toEqual(
        [
          true,
          true,
          {face: 0, forward: true, index: 0},
          {face: 0, forward: false, index: 2},
        ],
    );
    expect(Cyl.edgeFaces(1)).toEqual(
        [
          false,
          true,
          {face: 0, forward: true, index: 1},
          undefined,
        ],
    );
    expect(Cyl.edgeFaces(2)).toEqual(
        [
          false,
          true,
          {face: 0, forward: true, index: 3},
          undefined,
        ],
    );
  });

  it('finds faces attached to an edge', () => {
    expect(Torus.edgeFaces(0)).toEqual([true, true,
      {face: 0, forward: true, index: 0}, {face: 0, forward: false, index: 2}]);
    expect(Torus.edgeFaces(1)).toEqual([true, true,
      {face: 0, forward: true, index: 1}, {face: 0, forward: false, index: 3}]);
    expect(Sphere.edgeFaces(0)).toEqual([true, true,
      {face: 0, forward: true, index: 0}, {face: 0, forward: false, index: 1},
    ]);
  });

  it('Finds set of edges containing a vertex', () => {
    expect(Torus.edgesContainingAVertex(0)).toEqual(
        [
          {index: 0, start: true},
          {index: 0, start: false},
          {index: 1, start: true},
          {index: 1, start: false},
        ],
    );

    expect(RP2.edgesContainingAVertex(0)).toEqual(
        [
          {index: 0, start: true},
          {index: 1, start: false},
        ],
    );
    expect(RP2.edgesContainingAVertex(1)).toEqual(
        [
          {index: 0, start: false},
          {index: 1, start: true},
        ],
    );
  });

  it('describes edges around a vertex', () => {
    expect(Torus.vertexToEdges[0]).toEqual(
        [
          {index: 0, start: true},
          {index: 1, start: true},
          {index: 0, start: false},
          {index: 1, start: false},
        ],
    );

    expect(RP2.vertexToEdges[0]).toEqual(
        [
          {index: 0, start: true},
          {index: 1, start: false},
        ],
    );

    expect(RP2.vertexToEdges[1]).toEqual(
        [
          {index: 0, start: false},
          {index: 1, start: true},
        ],
    );

    expect(Sphere.vertexToEdges[0]).toEqual(
        [
          {index: 0, start: true},
        ],
    );

    expect(Sphere.vertexToEdges[1]).toEqual(
        [
          {index: 0, start: false},
        ],
    );

    expect(Klein.vertexToEdges[0]).toEqual(
        [
          {index: 0, start: true},
          {index: 1, start: true},
          {index: 0, start: false},
          {index: 1, start: false},
        ],
    );

    expect(Sphere2.vertexToEdges[0]).toEqual(
        [
          {index: 0, start: true},
        ],
    );

    expect(Sphere2.vertexToEdges[1]).toEqual(
        [
          {index: 0, start: false},
          {index: 1, start: true},
        ],
    );

    expect(Sphere2.vertexToEdges[2]).toEqual(
        [
          {index: 1, start: false},
          {index: 2, start: true},
        ],
    );

    expect(Sphere2.vertexToEdges[3]).toEqual(
        [
          {index: 2, start: false},
        ],
    );

    expect(Cyl.vertexToEdges[0]).toEqual(
        [
          {index: 2, start: true},
          {index: 0, start: true},
          {index: 2, start: false},
        ],
    );

    expect(Cyl.vertexToEdges[1]).toEqual(
        [
          {index: 1, start: true},
          {index: 0, start: false},
          {index: 1, start: false},
        ],
    );

    expect(Sigma3.vertexToEdges[0]).toEqual(
        [
          {index: 0, start: true},
          {index: 5, start: true},
          {index: 4, start: false},
          {index: 5, start: false},
          {index: 4, start: true},
          {index: 3, start: true},
          {index: 2, start: false},
          {index: 3, start: false},
          {index: 2, start: true},
          {index: 1, start: true},
          {index: 0, start: false},
          {index: 1, start: false},
        ],
    );
  });
});

// describe(('Surfaces '), () =>{
//   // let S;
//   beforeEach(() =>{
//     // S = new TopSurface();
//   });

//   it.todo('');
// });


describe.skip('Cx', () => {
  const one = new Cx(1, 0);
  const i = new Cx(0, 1);
  const infty = Cx.infty();
  const twoplusi = new Cx(2, 1);

  beforeEach(() =>{
  });

  it('adds 1 + i', () => {
    const c = one.plus(i);
    expect(c.re).toBe(1);
    expect(c.im).toBe(1);
    const compare = c.compare(1, 1);
    expect(compare).toBe(true);
  });

  it('recognizes infty', () => {
    expect(infty.isInfty()).toBe(true);
  });

  it('multiplies', () => {
    expect(twoplusi.times(i)).toEqual(i.times(twoplusi));
    const c = i.times(twoplusi).compare(-1, 2);
    expect(c).toBe(true);
  });
});
