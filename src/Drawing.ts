

import {Cx} from './Cx';
import {GameStatus} from './GameStatus';
// import {Polygon} from './Polygon';
import {Thing} from './Thing';
import {Mobius} from './Mobius';
import {UniverseInfo} from './UniverseInfo';
import {Wall} from './Wall';
import {Polygon} from './Polygon';

// ////////////////////////DRAWING //////


const images = {
  imgCar: new Image(),
  imgTree: new Image(),
  imgRedDot: new Image(),
  imgBlueDot: new Image(),
};

// / IMAGES
/**
 *
 */
export class Draw {
/**
 * All the file names
 */
  static getSources() {
    images.imgCar.src = 'Car.png';
    images.imgTree.src = 'Tree.png';
    images.imgRedDot.src = 'RedDot.png';
    images.imgBlueDot.src = 'BlueDot.png';
  }

  /**
   * Puts an image on the canvas
   * @param {HTMLImageElement} img
   * @param {Cx} center
   * @param {number} radius average of the width and the height
   * I'm pretty sure it's in pixels
   * @param {number} rotation Clockwise
   * @param {GameStatus} g - g
   */
  static image(img: HTMLImageElement,
      center: Cx,
      radius: number,
      rotation: number,
      g: GameStatus) {
    // //the radius is the average of the width and the height
    const position = g.coordToPix(center);
    const scale = 2 * radius/(img.width + img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    g.ctx.translate(position[0], position[1]);
    g.ctx.rotate(- rotation);
    g.ctx.drawImage(img, -w / 2, -h / 2, w, h);
    /* g.ctx.fillStyle = "white";
      g.ctx.fillRect(0, 0, 100, 100);*/
    g.ctx.rotate(rotation);
    g.ctx.translate(-position[0], -position[1]);
  }

  /**
   * Draws a thing on the canvas
   * @param {Thing} o The drawn thing
   * @param {GameStatus} g
   * @param {UniverseInfo} u
   */
  static obj(o: Thing, g: GameStatus, u: UniverseInfo) {
    // const V = g.coordToPix(o.pos);
    let s = u.localScale(o.pos);
    s = Math.min(s, 10);
    switch (o.type) {
      case 'Tree':
        if (s !== 0) {
          Draw.image(images.imgTree, o.pos,
              0.2 * g.scale * s, 0, g);
          /* g.ctx.fillStyle = 'red';
                  g.ctx.beginPath();
                  g.ctx.arc(V[0], V[1], 0.03 * g.scale * s, 0, 2 * Math.PI);
                  g.ctx.fill();*/
        }
        break;
      case 'Player':
        if (s !== 0) {
          Draw.image(images.imgCar, o.pos,
              0.2 * g.scale * s,
              g.pixToCoord(g.mouse.pos[0], g.mouse.pos[1]).arg(), g);
          /* g.ctx.fillStyle = '#080270';
                    g.ctx.beginPath();
                    g.ctx.arc(V[0], V[1], 0.06 * g.scale * s, 0, 2 * Math.PI);
                    g.ctx.fill();*/
        }
        break;
      case 'blueDot':
        if (s !== 0) {
          Draw.image(images.imgBlueDot, o.pos,
              0.05 * g.scale * s, 0, g);
        }
        break;
      case 'redDot':
        if (s !== 0) {
          Draw.image(images.imgRedDot, o.pos,
              0.05 * g.scale * s, 0, g);
        }
        break;
    }
  }


  /**
   * Draw the "Things"
   * @param {GameStatus} g
   * @param {UniverseInfo} u
   */
  static everythingIn(g: GameStatus, u: UniverseInfo) {
    Draw.obj(new Thing(new Cx(0, 0), 'Player'), g, u);
    /* drawObj(new thing(new cx(1,0), "Player"), g, u);
      drawObj(new thing(new cx(0,1), "Player"), g, u);*/
    u.objectList.forEach((o) => Draw.obj(o, g, u),
    );
    u.domain.walls.forEach((wall) => Draw.wall(wall, g),
    );
  }


  /**
 * Draw this on the canvas
 * @param {Wall} wall
 * @param {GameStatus} g
 */
  static wall(wall : Wall, g: GameStatus) {
    /* for (let x = -3; x < 3; x+= 0.1){SHADE THE WHOLE AREA
          for (let y = -3; y < 3; y+= 0.1){
              let z = new cx(x, y);
              let V = g.coordToPix(z);
              let color = "blue";
              if (W.isLeft(z)){
                  color = "red";
              }
              g.ctx.fillStyle = color;
              g.ctx.beginPath();
              g.ctx.arc(V[0], V[1], 0.006 * g.scale, 0, 2 * Math.PI);
              g.ctx.fill();
          }
      }*/
    if (wall.isStraight) {
      const a1 = g.coordToPix(wall.originToWall.apply(Cx.makeNew(-100)));
      const a2 = g.coordToPix(wall.originToWall.apply(Cx.makeNew(100)));
      g.ctx.strokeStyle = 'black';
      g.ctx.beginPath();
      g.ctx.moveTo(a1[0], a1[1]);
      g.ctx.lineTo(a2[0], a2[1]);
      g.ctx.stroke();
    } else {
      const x = g.coordToPix(wall.center);
      const r = wall.radius * g.scale;
      g.ctx.strokeStyle = 'black';
      g.ctx.beginPath();
      g.ctx.arc(x[0], x[1], r, 0, 2 * Math.PI);
      g.ctx.stroke();
    }
  }

  /**
   * draws the source and target of a Mobius trans
   * for debugging
   * @param {Mobius} M
   * @param {Cx[]} v vertices to draw
   * @param {GameStatus} g
   * @param {UniverseInfo} u
   */
  static mobius(M: Mobius, v: Cx[], g : GameStatus, u : UniverseInfo) : void {
    const sources = v.map((vert) =>
      new Thing(vert, 'blueDot'),
    );
    const targets = v.map((vert) =>
      new Thing(M.apply(vert), 'redDot'),
    );
    sources.forEach((p : Thing) => {
      Draw.obj(p, g, u);
    });
    targets.forEach((p : Thing) => {
      Draw.obj(p, g, u);
    });
  }

  /**
   *
   * @param {Polygon} P
   * @param {GameStatus} g
   * @param {UniverseInfo} u
   * @param {number} [i = 0] if drawing one, which one?
   */
  static polygonTransf(P: Polygon,
      g : GameStatus,
      u : UniverseInfo,
      i: number = 0):void {
    Draw.mobius(P.transf[i], P.vertices, g, u);
  }


  /**
   *
   * @param {Polygon} P
   * @param {GameStatus} g
   * @param {UniverseInfo} u
   */
  static allPolygonTransf(P: Polygon,
      g : GameStatus,
      u : UniverseInfo):void {
    P.transf.forEach((M, i) => Draw.polygonTransf(P, g, u, i));
  }

  /**
   *
   * @param {Polygon} P
   * @param {GameStatus} g
   * @param {UniverseInfo} u
   */
  static polygonVertices(P: Polygon, g: GameStatus, u: UniverseInfo) {
    P.vertices.forEach((v) => Draw.obj(new Thing(v, 'blueDot'), g, u));
  }
}
