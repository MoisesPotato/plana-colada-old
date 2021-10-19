"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line no-unused-vars
const TopSurface_1 = require("./TopSurface");
const Cx_1 = require("./Cx");
/**
 *
 * @param c A square
 * @param name the name of the square
 * @param e The names of the desired edges
 * @param v the names of the desired vertices
 * @returns do the labels indeed match
 */
function checkSquareLabels(c, name, e, v) {
    try {
        try {
            expect(c.isValid()[0]).toBe(true);
        }
        catch (e) {
            console.log();
            console.log('Invalid cell:');
            console.log(c.isValid()[1]);
            console.log(c.toString());
            throw e;
        }
        /*     console.log(`Edges:${e}
    Real edges:${c.toString()}`); */
        const n = e.length;
        e.forEach((x, i) => {
            expect(c.attachingMap.targets[i].toString())
                .toBe(`${e[i]}: ${v[i]} ---> ${v[(i + 1) % n]}`);
            expect(c.attachingMap.targets[i].start().toString())
                .toBe(`${v[i]}`);
            expect(c.attachingMap.targets[i].end().toString())
                .toBe(`${v[(i + 1) % n]}`);
        });
        expect(c.name).toBe(name);
        expect(c.attachingMap.dim).toBe(2);
        expect(c.attachingMap.isValid()[0]).toBe(true);
        expect(c.attachingMap.oriented).toEqual(Array(4).fill(true));
    }
    catch (error) {
        console.log(error);
        console.log(`Didn't match this cell:\n
    ${c.toString()}
    with this info: name is ${name}\n
    edges:\n
    ${e}\n
    vertices:\n
    ${v}`);
        throw new Error();
    }
}
describe(('0 cells '), () => {
    it('have names', () => {
        const v = new TopSurface_1.Cell0('A');
        expect(v.name).toEqual('A');
    });
});
describe('Cells ', () => {
    const v1 = new TopSurface_1.Cell0('a');
    const v2 = new TopSurface_1.Cell0('b');
    const e1 = TopSurface_1.Cell1.v1v2('e1');
    const e2 = TopSurface_1.Cell1.v1v2('e2', 'a', 'a');
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
    });
    it('removes duplicates', () => {
        const list1 = TopSurface_1.Cell.removeDuplicates([v1, v1, v1]);
        expect(list1.length).toBe(1);
        expect(list1).toEqual([v1]);
        const list2 = TopSurface_1.Cell.removeDuplicates([e1, e2, e1, e2, e2]);
        expect(list2.length).toBe(2);
        expect(list2).toEqual([e1, e2]);
    });
    it('compares sets', () => {
        expect(TopSurface_1.Cell.compareSets([v1, v1], [])).toBe(false);
        expect(TopSurface_1.Cell.compareSets([], [])).toBe(true);
        expect(TopSurface_1.Cell.compareSets([v1, v1], [v1])).toBe(true);
        expect(TopSurface_1.Cell.compareSets([v1, v1], [v2, v1])).toBe(false);
        expect(TopSurface_1.Cell.compareSets([v1, v2, v2], [v2, v1])).toBe(true);
    });
});
describe('Cells can be glued', () => {
    const v1 = new TopSurface_1.Cell0('a');
    const v2 = new TopSurface_1.Cell0('b');
    const e1 = TopSurface_1.Cell1.v1v2('e1');
    const e2 = TopSurface_1.Cell1.v1v2('e2');
    const D = TopSurface_1.Cell2.disk(4, 'D');
    it('0-cells inside of 0-cells', () => {
        expect(v1.glue0in0([v1], v2)).toEqual(v2);
        expect(v1.glue0in0([v2], v1)).toEqual(v1);
        expect(v1.glue0in0([v2], v2)).toEqual(v1);
        expect(v1.glue0in0([v1, v2], v2)).toEqual(v2);
        expect(v1.glue0in0([], v2)).toEqual(v1);
    });
    it('0-cells inside of 1-cells', () => {
        const e3 = e1.glue0in1([], v1);
        // console.log('Made e3');
        // console.log(`e1: ${e1.toString()}`);
        expect(e3).toEqual(e1);
        expect(e1.start().toString()).toEqual('e1-start');
        const e4 = e1.glue0in1([e1.start(), e1.end()], e1.start());
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
        let e5 = e1.glue0in1([e1.end()], v2);
        expect(e5.start()).toEqual(e1.start());
        expect(e5.end()).toEqual(v2);
        // console.log(`e5: ${e5.toString()}`);
        e5 = e5.glue0in1([e1.start()], v1);
        // console.log(`e5: ${e5.toString()}`);
        expect(e5.start()).toEqual(v1);
        expect(e5.end()).toEqual(v2);
        expect(e1.toString()).toEqual('e1: e1-start ---> e1-end');
    });
    it('0-cells inside of 2-cells', () => {
        const D2 = D.glue0in2([D.cells0[0]], v1);
        D2.name = 'D2';
        checkSquareLabels(D2, 'D2', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['a', 'D-v1', 'D-v2', 'D-v3']);
        checkSquareLabels(D, 'D', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
        const D3 = D2.glue0in2([D2.cells0[1], D.cells0[2],
            D2.attachingMap.targets[0].end()], v2);
        D3.name = 'D3';
        checkSquareLabels(D2, 'D2', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['a', 'D-v1', 'D-v2', 'D-v3']);
        checkSquareLabels(D3, 'D3', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['a', 'b', 'b', 'D-v3']);
        const D4 = D3.glue0in2(D3.cells0, v1, 'D4');
        checkSquareLabels(D4, 'D4', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['a', 'a', 'a', 'a']);
        checkSquareLabels(D3, 'D3', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['a', 'b', 'b', 'D-v3']);
        checkSquareLabels(D2, 'D2', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['a', 'D-v1', 'D-v2', 'D-v3']);
    });
    it('1-cells inside of 1-cells', () => {
        const e1 = TopSurface_1.Cell1.v1v2('e', 'a', 'b');
        const e2 = TopSurface_1.Cell1.v1v2('f', 'b', 'c');
        const e3 = e1.glue1in1([], e2);
        expect(e3.toString()).toBe('e: a ---> b');
        const e4 = e1.glue1in1([e1, e2], e2);
        expect(e4.toString()).toBe('f: b ---> c');
        const e5 = e2.glue1in1([e1, e2], e1);
        expect(e5.toString()).toBe('e: a ---> b');
        expect(e4.cells0).toEqual(e2.cells0);
        expect(e5.cells0).toEqual(e1.cells0);
    });
    it('1-cells inside of 2-cells', () => {
        const D2 = D.glue1in2([], [], D.cells1[0], 'D2');
        checkSquareLabels(D2, 'D2', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
        checkSquareLabels(D, 'D', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
        const D3 = D2.glue1in2([D2.cells1[0]], [true], e1, 'D3');
        checkSquareLabels(D2, 'D2', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
        checkSquareLabels(D3, 'D3', ['e1', 'D-e1', 'D-e2', 'D-e3'], ['e1-start', 'e1-end', 'D-v2', 'D-v3']);
        const D4 = D3.glue1in2([D2.cells1[0], D2.cells1[2]], [true, false], e1, 'D4');
        checkSquareLabels(D4, 'D4', ['e1', 'D-e1', 'e1', 'D-e3'], ['e1-start', 'e1-end', 'e1-start', 'e1-end']);
        checkSquareLabels(D3, 'D3', ['e1', 'D-e1', 'D-e2', 'D-e3'], ['e1-start', 'e1-end', 'D-v2', 'D-v3']);
        checkSquareLabels(D2, 'D2', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
        const Torus = D4.glue1in2([D4.cells1[1], D4.cells1[2]], [true, false], e2, 'Torus');
        checkSquareLabels(D4, 'D4', ['e1', 'D-e1', 'e1', 'D-e3'], ['e1-start', 'e1-end', 'e1-start', 'e1-end']);
        checkSquareLabels(Torus, 'Torus', ['e1', 'e2', 'e1', 'e2'], ['e2-start', 'e2-start', 'e2-start', 'e2-start']);
        const D6 = D.glue1in2([D.cells1[0], D.cells1[1]], [true, false], e1, 'D6');
        checkSquareLabels(D6, 'D6', ['e1', 'e1', 'D-e2', 'D-e3'], ['e1-start', 'e1-end', 'e1-start', 'D-v3']);
    });
});
describe(('1 cells '), () => {
    it('have vertices', () => {
        const e = TopSurface_1.Cell1.v1v2('e', 'a', 'b');
        expect(e.cells0[0].toString()).toBe('a');
        expect(e.cells0[1].toString()).toBe('b');
        expect(e.start().toString()).toBe('a');
        expect(e.end().toString()).toBe('b');
        expect(e.toString()).toBe('e: a ---> b');
    });
});
describe('2-cells ', () => {
    it(' can be created with no identifications', () => {
        const edges = TopSurface_1.Cell1.circle(4, 'T');
        expect(edges[0].toString()).toBe('T-e0: T-v0 ---> T-v1');
        expect(edges[1].toString()).toBe('T-e1: T-v1 ---> T-v2');
        expect(edges[2].toString()).toBe('T-e2: T-v2 ---> T-v3');
        expect(edges[3].toString()).toBe('T-e3: T-v3 ---> T-v0');
        const disk = TopSurface_1.Cell2.disk(4, 'D');
        checkSquareLabels(disk, 'D', ['D-e0', 'D-e1', 'D-e2', 'D-e3'], ['D-v0', 'D-v1', 'D-v2', 'D-v3']);
    });
    it.skip(' can have identified edges', () => {
        const f = TopSurface_1.Cell2.fromLabels(4, [[1, 3, true], [2, 4, true]]);
        expect(f.cells0.length).toBe(1);
        expect(f.cells1.length).toBe(2);
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
    const one = new Cx_1.Cx(1, 0);
    const i = new Cx_1.Cx(0, 1);
    const infty = Cx_1.Cx.infty();
    const twoplusi = new Cx_1.Cx(2, 1);
    beforeEach(() => {
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
