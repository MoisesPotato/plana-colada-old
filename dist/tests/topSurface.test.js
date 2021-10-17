"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line no-unused-vars
const TopSurface_1 = require("../src/TopSurface");
describe(('0 cells '), () => {
    it('have names', () => {
        const v = new TopSurface_1.Cell0('A');
        expect(v.name).toEqual('A');
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
    it(' can be created', () => {
        const edges = TopSurface_1.Cell1.createCircle(4, 'T');
        expect(edges[0].toString()).toBe('T-e0: T-v0 ---> T-v1');
        expect(edges[1].toString()).toBe('T-e1: T-v1 ---> T-v2');
        expect(edges[2].toString()).toBe('T-e2: T-v2 ---> T-v3');
        expect(edges[3].toString()).toBe('T-e3: T-v3 ---> T-v0');
        const maps = TopSurface_1.Attach.fromLabels(edges, [[1, 3, true], [2, 4, true]]);
        const f = TopSurface_1.Cell2.fromGlue('Torus', edges, maps);
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
