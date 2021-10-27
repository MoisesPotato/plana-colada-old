import {Cx} from './Cx';
import {Mobius} from './Mobius';
import {Polygon} from './Polygon';
import {Wall} from './Wall';

export type orbiName = 'none'|'o'|'444';

/**
 *
 */
export class Thurston {
  /**
     *
     * @param {orbiName} name description
     * @param {number[]} lengths parameters. They depend on which shape
     * we take
     * @return {Polygon} a fundamental domain
     */
  static get(name : orbiName, lengths : number[]) : [number, Polygon] {
    let curvature : number;
    let wallList : Wall[];
    let transf : Mobius[];
    let vertices: Cx[];
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
          new Cx(a, b),
          new Cx(-a, b),
          new Cx(-a, -b),
          new Cx(a, -b),
        ];
        wallList = [
          new Wall(vertices[0], vertices[1], 0),
          new Wall(vertices[1], vertices[2], 0),
          new Wall(vertices[2], vertices[3], 0),
          new Wall(vertices[3], vertices[0], 0),
        ];
        transf = [
          new Mobius([[1, new Cx(0, 2 * b)],
            [0, 1],
          ], false),
          new Mobius([[1, new Cx(-2 * a, 0)],
            [0, 1],
          ], false),
          new Mobius([[1, new Cx(0, -2 * b)],
            [0, 1],
          ], false),
          new Mobius([[1, new Cx(2 * a, 0)],
            [0, 1],
          ], false),
        ];
        break;
      case '444':
        curvature = lengths[0];
        const s = 1 / Math.sqrt(curvature);
        vertices = [
          Cx.makeNew(0),
          Cx.makeNew(s),
          new Cx(0, s),
        ];
        wallList = [
          new Wall(vertices[0], vertices[1], curvature),
          new Wall(vertices[1], vertices[2], curvature),
          new Wall(vertices[2], vertices[0], curvature),
        ];
        // const A = Mobius.find(vertices[1].times(-1), curvature);
        transf = [
          new Mobius([[new Cx(0, -1), 0],
            [0, 1],
          ], false),

          new Mobius([[new Cx(0, -1), 0],
            [0, 1],
          ], false).conjugate(
              Mobius.find(vertices[1].times(-1), curvature)),
          new Mobius([[new Cx(0, 1), 0],
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
    return [curvature, new Polygon(vertices, transf, wallList)];
  }
}
