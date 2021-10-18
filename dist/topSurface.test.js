"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line no-unused-vars
const TopSurface_1 = require("./TopSurface");
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
        expect(v1.inList(list1)).toBe(true);
        expect(v2.inList(list1)).toBe(false);
    });
    it('removes duplicates', () => {
        const list1 = TopSurface_1.Cell.removeDuplicates([v1, v1, v1]);
        expect(list1.length).toBe(1);
        expect(list1).toEqual([v1]);
        const list2 = TopSurface_1.Cell.removeDuplicates([e1, e2, e1, e2, e2]);
        expect(list2.length).toBe(2);
        expect(list2).toEqual([e1, e2]);
    });
});
describe('Cell can be glued', () => {
    const v1 = new TopSurface_1.Cell0('a');
    const v2 = new TopSurface_1.Cell0('b');
    const e1 = TopSurface_1.Cell1.v1v2('e1');
    const e2 = TopSurface_1.Cell1.v1v2('e2', 'a', 'a');
    const D = TopSurface_1.Cell2.disk(4, 'D');
    it('0-cells in 0-cells', () => {
        expect(v1.glue0([v1], v2)).toEqual(v2);
        expect(v1.glue0([v2], v1)).toEqual(v1);
        expect(v1.glue0([v2], v2)).toEqual(v1);
        expect(v1.glue0([v1, v2], v2)).toEqual(v2);
        expect(v1.glue0([], v2)).toEqual(v1);
    });
    it('0-cells in 1-cells', () => {
        console.log(`e1: ${e1.toString()}`);
        const e3 = e1.glue0([], v1);
        // console.log('Made e3');
        // console.log(`e1: ${e1.toString()}`);
        expect(e3).toEqual(e1);
        expect(e1.start.toString()).toEqual('e1-start');
        const e4 = e1.glue0([e1.start, e1.end], e1.start);
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
        let e5 = e1.glue0([e1.end], v2);
        expect(e5.start).toEqual(e1.start);
        expect(e5.end).toEqual(v2);
        // console.log(`e5: ${e5.toString()}`);
        e5 = e5.glue0([e1.start], v1);
        // console.log(`e5: ${e5.toString()}`);
        expect(e5.start).toEqual(v1);
        expect(e5.end).toEqual(v2);
        expect(e1.toString()).toEqual('e1: e1-start ---> e1-end');
    });
    it('0-cells in 2-cells', () => {
        const D2 = D.glue0([D.cells0[0]], v1);
        expect(D2.cells1[0].toString()).toBe('D-e0: a ---> D-v1');
        expect(D2.cells1[1].toString()).toBe('D-e1: D-v1 ---> D-v2');
        expect(D2.cells1[2].toString()).toBe('D-e2: D-v2 ---> D-v3');
        expect(D2.cells1[3].toString()).toBe('D-e3: D-v3 ---> a');
        expect(D2.cells0[0].toString()).toBe('a');
        expect(D2.cells0[1].toString()).toBe('D-v1');
        expect(D2.cells0[2].toString()).toBe('D-v2');
        expect(D2.cells0[3].toString()).toBe('D-v3');
        expect(D2.cells1[0].start.toString()).toBe('a');
        expect(D2.cells1[1].start.toString()).toBe('D-v1');
        expect(D2.cells1[2].start.toString()).toBe('D-v2');
        expect(D2.cells1[3].start.toString()).toBe('D-v3');
        expect(D2.cells1[0].end.toString()).toBe('D-v1');
        expect(D2.cells1[1].end.toString()).toBe('D-v2');
        expect(D2.cells1[2].end.toString()).toBe('D-v3');
        expect(D2.cells1[3].end.toString()).toBe('a');
        expect(D2.attachingMap.dim).toBe(2);
        expect(D2.attachingMap.isValid()[0]).toBe(true);
        expect(D2.attachingMap.oriented).toEqual(Array(4).fill(true));
        expect(D2.attachingMap.targets).toEqual(D2.cells1);
        expect(D.cells1[0].toString()).toBe('D-e0: D-v0 ---> D-v1');
        expect(D.cells1[1].toString()).toBe('D-e1: D-v1 ---> D-v2');
        expect(D.cells1[2].toString()).toBe('D-e2: D-v2 ---> D-v3');
        expect(D.cells1[3].toString()).toBe('D-e3: D-v3 ---> D-v0');
        expect(D.cells0[0].toString()).toBe('D-v0');
        expect(D.cells0[1].toString()).toBe('D-v1');
        expect(D.cells0[2].toString()).toBe('D-v2');
        expect(D.cells0[3].toString()).toBe('D-v3');
        expect(D.cells1[0].start.toString()).toBe('D-v0');
        expect(D.cells1[1].start.toString()).toBe('D-v1');
        expect(D.cells1[2].start.toString()).toBe('D-v2');
        expect(D.cells1[3].start.toString()).toBe('D-v3');
        expect(D.cells1[0].end.toString()).toBe('D-v1');
        expect(D.cells1[1].end.toString()).toBe('D-v2');
        expect(D.cells1[2].end.toString()).toBe('D-v3');
        expect(D.cells1[3].end.toString()).toBe('D-v0');
        const D3 = D2.glue0([D2.cells0[1], D.cells0[2],
            D2.attachingMap.targets[0].end], v2);
    });
});
describe(('1 cells '), () => {
    it('have vertices', () => {
        const e = TopSurface_1.Cell1.v1v2('e', 'a', 'b');
        expect(e.cells0[0].toString()).toBe('a');
        expect(e.cells0[1].toString()).toBe('b');
        expect(e.start.toString()).toBe('a');
        expect(e.end.toString()).toBe('b');
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
        expect(disk.cells1[0].toString()).toBe('D-e0: D-v0 ---> D-v1');
        expect(disk.cells1[1].toString()).toBe('D-e1: D-v1 ---> D-v2');
        expect(disk.cells1[2].toString()).toBe('D-e2: D-v2 ---> D-v3');
        expect(disk.cells1[3].toString()).toBe('D-e3: D-v3 ---> D-v0');
        expect(disk.cells0[0].toString()).toBe('D-v0');
        expect(disk.cells0[1].toString()).toBe('D-v1');
        expect(disk.cells0[2].toString()).toBe('D-v2');
        expect(disk.cells0[3].toString()).toBe('D-v3');
        expect(disk.cells1[0].start.toString()).toBe('D-v0');
        expect(disk.cells1[1].start.toString()).toBe('D-v1');
        expect(disk.cells1[2].start.toString()).toBe('D-v2');
        expect(disk.cells1[3].start.toString()).toBe('D-v3');
        expect(disk.cells1[0].end.toString()).toBe('D-v1');
        expect(disk.cells1[1].end.toString()).toBe('D-v2');
        expect(disk.cells1[2].end.toString()).toBe('D-v3');
        expect(disk.cells1[3].end.toString()).toBe('D-v0');
        expect(disk.attachingMap.dim).toBe(2);
        expect(disk.attachingMap.isValid()[0]).toBe(true);
        expect(disk.attachingMap.oriented).toEqual(Array(4).fill(true));
        expect(disk.attachingMap.targets).toEqual(disk.cells1);
    });
    it(' can have identified edges', () => {
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
