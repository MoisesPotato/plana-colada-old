// eslint-disable-next-line no-unused-vars

import {Attach, Cell, Cell0, Cell1, Cell2} from './TopSurface';


describe(('0 cells '), () => {
  it('have names', ()=> {
    const v = new Cell0('A');
    expect(v.name).toEqual('A');
  });
});

describe('Cells ', () =>{
  const v1 = new Cell0('a');
  const v2 = new Cell0('b');
  const e1 = Cell1.v1v2('e1');
  const e2 = Cell1.v1v2('e2', 'a', 'a');

  it('recognize equality', () => {
    expect(v1.equals(v1)).toBe(true);
    expect(v1.equals(v2)).toBe(false);
    expect(v1.equals(e1)).toBe(false);
    expect(e1.equals(e1)).toBe(true);
  });

  it('finds cells in a list', () => {
    const list1 = [v1, v1, v1];
    expect(v1.inList(list1)).toBe(true);
    expect(v2.inList(list1)).toBe(false);
  },
  );

  it('removes duplicates', ()=>{
    const list1 = Cell.removeDuplicates([v1, v1, v1]);
    expect(list1.length).toBe(1);
    expect(list1).toEqual([v1]);
    const list2 = Cell.removeDuplicates([e1, e2, e1, e2, e2]);
    expect(list2.length).toBe(2);
    expect(list2).toEqual([e1, e2]);
  });

  it('glues 0-cells in 0-cells', ()=>{
    expect(Cell.glue0(v1, [v1], v2)).toEqual(v2);
    expect(Cell.glue0(v1, [v2], v1)).toEqual(v1);
    expect(Cell.glue0(v1, [v2], v2)).toEqual(v1);
    expect(Cell.glue0(v1, [v1, v2], v2)).toEqual(v2);
    expect(Cell.glue0(v1, [], v2)).toEqual(v1);
  } );

  it('glues 0-cells in 1-cells', () => {
    console.log(`e1: ${e1.toString()}`);

    const e3 = Cell.glue0(e1, [], v1);

    // console.log('Made e3');
    // console.log(`e1: ${e1.toString()}`);

    expect(e3).toEqual(e1);
    expect(e1.start.toString()).toEqual('e1-start');

    const e4 = Cell.glue0(e1, [e1.start, e1.end], e1.start);
    expect(e4.cells0);
    expect(e4.start).toEqual(e1.start);
    expect(e4.cells0).toEqual([e1.start]);
    expect(e4.attachingMap.targets[1]).toEqual(e1.start);
    expect(e4.toString()).toBe('e1: e1-start ---> e1-start');
    expect(e4.start).toEqual(e4.end);
    expect(e4.attachingMap.targets[0]).toEqual(e4.end);
    expect(e4.attachingMap.targets[1]).toEqual(e4.start);

    // console.log('Made e4');
    // console.log(`e1: ${e1.toString()}`);
    let e5= Cell.glue0(e1, [e1.end], v2);
    expect(e5.start).toEqual(e1.start);
    expect(e5.end).toEqual(v2);
    // console.log(`e5: ${e5.toString()}`);
    e5= Cell.glue0(e5, [e1.start], v1);
    // console.log(`e5: ${e5.toString()}`);
    expect(e5.start).toEqual(v1);
    expect(e5.end).toEqual(v2);


    expect(e1.toString()).toEqual('e1: e1-start ---> e1-end');
  });
});

describe(('1 cells '), () => {
  it('have vertices', ()=> {
    const e = Cell1.v1v2('e', 'a', 'b');
    expect(e.cells0[0].toString()).toBe('a');
    expect(e.cells0[1].toString()).toBe('b');
    expect(e.start.toString()).toBe('a');
    expect(e.end.toString()).toBe('b');
    expect(e.toString()).toBe('e: a ---> b');
  });
});

describe('2-cells ', () =>{
  it(' can be created', ()=> {
    const edges = Cell1.createCircle(4, 'T');
    expect(edges[0].toString()).toBe('T-e0: T-v0 ---> T-v1');
    expect(edges[1].toString()).toBe('T-e1: T-v1 ---> T-v2');
    expect(edges[2].toString()).toBe('T-e2: T-v2 ---> T-v3');
    expect(edges[3].toString()).toBe('T-e3: T-v3 ---> T-v0');
    const maps = Attach.fromLabels(edges,
        [[1, 3, true], [2, 4, true]]);
    const f = Cell2.fromGlue('Torus', edges, maps);
    expect(f.cells0.length).toBe(1);
    expect(f.cells1.length).toBe(2);
  });
},
);

// describe(('Surfaces '), () =>{
//   // let S;
//   beforeEach(() =>{
//     // S = new TopSurface();
//   });

//   it.todo('');
// });
