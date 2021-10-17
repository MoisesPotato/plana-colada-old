"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Draw = void 0;
const Cx_1 = require("./Cx");
// import {Polygon} from './Polygon';
const Thing_1 = require("./Thing");
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
class Draw {
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
    static image(img, center, radius, rotation, g) {
        // //the radius is the average of the width and the height
        const position = g.coordToPix(center);
        const scale = 2 * radius / (img.width + img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        g.ctx.translate(position[0], position[1]);
        g.ctx.rotate(-rotation);
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
    static obj(o, g, u) {
        // const V = g.coordToPix(o.pos);
        let s = u.localScale(o.pos);
        s = Math.min(s, 10);
        switch (o.type) {
            case 'Tree':
                if (s !== 0) {
                    Draw.image(images.imgTree, o.pos, 0.2 * g.scale * s, 0, g);
                    /* g.ctx.fillStyle = 'red';
                            g.ctx.beginPath();
                            g.ctx.arc(V[0], V[1], 0.03 * g.scale * s, 0, 2 * Math.PI);
                            g.ctx.fill();*/
                }
                break;
            case 'Player':
                if (s !== 0) {
                    Draw.image(images.imgCar, o.pos, 0.2 * g.scale * s, g.pixToCoord(g.mouse.pos[0], g.mouse.pos[1]).arg(), g);
                    /* g.ctx.fillStyle = '#080270';
                              g.ctx.beginPath();
                              g.ctx.arc(V[0], V[1], 0.06 * g.scale * s, 0, 2 * Math.PI);
                              g.ctx.fill();*/
                }
                break;
            case 'blueDot':
                if (s !== 0) {
                    Draw.image(images.imgBlueDot, o.pos, 0.05 * g.scale * s, 0, g);
                }
                break;
            case 'redDot':
                if (s !== 0) {
                    Draw.image(images.imgRedDot, o.pos, 0.05 * g.scale * s, 0, g);
                }
                break;
        }
    }
    /**
     * Draw the "Things"
     * @param {GameStatus} g
     * @param {UniverseInfo} u
     */
    static everythingIn(g, u) {
        Draw.obj(new Thing_1.Thing(new Cx_1.Cx(0, 0), 'Player'), g, u);
        /* drawObj(new thing(new cx(1,0), "Player"), g, u);
          drawObj(new thing(new cx(0,1), "Player"), g, u);*/
        u.objectList.forEach((o) => Draw.obj(o, g, u));
        u.domain.walls.forEach((wall) => Draw.wall(wall, g));
    }
    /**
   * Draw this on the canvas
   * @param {Wall} wall
   * @param {GameStatus} g
   */
    static wall(wall, g) {
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
            const a1 = g.coordToPix(wall.originToWall.apply(Cx_1.Cx.makeNew(-100)));
            const a2 = g.coordToPix(wall.originToWall.apply(Cx_1.Cx.makeNew(100)));
            g.ctx.strokeStyle = 'black';
            g.ctx.beginPath();
            g.ctx.moveTo(a1[0], a1[1]);
            g.ctx.lineTo(a2[0], a2[1]);
            g.ctx.stroke();
        }
        else {
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
    static mobius(M, v, g, u) {
        const sources = v.map((vert) => new Thing_1.Thing(vert, 'blueDot'));
        const targets = v.map((vert) => new Thing_1.Thing(M.apply(vert), 'redDot'));
        sources.forEach((p) => {
            Draw.obj(p, g, u);
        });
        targets.forEach((p) => {
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
    static polygonTransf(P, g, u, i = 0) {
        Draw.mobius(P.transf[i], P.vertices, g, u);
    }
    /**
     *
     * @param {Polygon} P
     * @param {GameStatus} g
     * @param {UniverseInfo} u
     */
    static allPolygonTransf(P, g, u) {
        P.transf.forEach((M, i) => Draw.polygonTransf(P, g, u, i));
    }
    /**
     *
     * @param {Polygon} P
     * @param {GameStatus} g
     * @param {UniverseInfo} u
     */
    static polygonVertices(P, g, u) {
        P.vertices.forEach((v) => Draw.obj(new Thing_1.Thing(v, 'blueDot'), g, u));
    }
}
exports.Draw = Draw;
