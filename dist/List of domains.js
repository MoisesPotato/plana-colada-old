"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thurston = void 0;
const Cx_1 = require("./Cx");
const Mobius_1 = require("./Mobius");
const Polygon_1 = require("./Polygon");
const Wall_1 = require("./Wall");
/**
 *
 */
class Thurston {
    /**
       *
       * @param {orbiName} name description
       * @param {number[]} lengths parameters. They depend on which shape
       * we take
       * @return {Polygon} a fundamental domain
       */
    static get(name, lengths) {
        let curvature;
        let wallList;
        let transf;
        let vertices;
        switch (name) {
            case 'none':
                vertices = [];
                curvature = 0;
                wallList = [];
                transf = [];
                break;
            case 'o':
                curvature = 0;
                const a = lengths[0];
                const b = lengths[1];
                vertices = [
                    new Cx_1.Cx(a, b),
                    new Cx_1.Cx(-a, b),
                    new Cx_1.Cx(-a, -b),
                    new Cx_1.Cx(a, -b),
                ];
                wallList = [
                    new Wall_1.Wall(vertices[0], vertices[1], 0),
                    new Wall_1.Wall(vertices[1], vertices[2], 0),
                    new Wall_1.Wall(vertices[2], vertices[3], 0),
                    new Wall_1.Wall(vertices[3], vertices[0], 0),
                ];
                transf = [
                    new Mobius_1.Mobius([[1, new Cx_1.Cx(0, 2 * b)],
                        [0, 1],
                    ], false),
                    new Mobius_1.Mobius([[1, new Cx_1.Cx(-2 * a, 0)],
                        [0, 1],
                    ], false),
                    new Mobius_1.Mobius([[1, new Cx_1.Cx(0, -2 * b)],
                        [0, 1],
                    ], false),
                    new Mobius_1.Mobius([[1, new Cx_1.Cx(2 * a, 0)],
                        [0, 1],
                    ], false),
                ];
                break;
            case '444':
                curvature = lengths[0];
                const s = 1 / Math.sqrt(curvature);
                vertices = [
                    Cx_1.Cx.makeNew(0),
                    Cx_1.Cx.makeNew(s),
                    new Cx_1.Cx(0, s),
                ];
                wallList = [
                    new Wall_1.Wall(vertices[0], vertices[1], curvature),
                    new Wall_1.Wall(vertices[1], vertices[2], curvature),
                    new Wall_1.Wall(vertices[2], vertices[0], curvature),
                ];
                // const A = Mobius.find(vertices[1].times(-1), curvature);
                transf = [
                    new Mobius_1.Mobius([[new Cx_1.Cx(0, -1), 0],
                        [0, 1],
                    ], false),
                    new Mobius_1.Mobius([[new Cx_1.Cx(0, -1), 0],
                        [0, 1],
                    ], false).conjugate(Mobius_1.Mobius.find(vertices[1].times(-1), curvature)),
                    new Mobius_1.Mobius([[new Cx_1.Cx(0, 1), 0],
                        [0, 1],
                    ], false),
                ];
                // console.log(A.toString());
                // debugger;
                // const t2 = transf[1];
                // console.log('t2.0');
                // console.log(t2.apply(new Cx(0, 0)).toString());
                // console.log('t2.1');
                // console.log(t2.apply(new Cx(1, 0)).toString());
                // console.log('t2.i');
                // console.log(t2.apply(new Cx(0, 1)).toString());
                // console.log('t2.-1');
                // console.log(t2.apply(new Cx(-1, 0)).toString());
                // debugger;
                break;
        }
        return [curvature, new Polygon_1.Polygon(vertices, transf, wallList)];
    }
}
exports.Thurston = Thurston;
