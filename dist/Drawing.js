"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Draw = void 0;
const Cx_1 = require("./Cx");
// import {Polygon} from './Polygon';
const Thing_1 = require("./Thing");
const UniverseInfo_1 = require("./UniverseInfo");
const Wall_1 = require("./Wall");
const Editor_1 = require("./Editor");
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
     * @returns void
     */
    static getSources() {
        images.imgCar.src = 'Car.png';
        images.imgTree.src = 'Tree.png';
        images.imgRedDot.src = 'RedDot.png';
        images.imgBlueDot.src = 'BlueDot.png';
    }
    /**
     * Puts an image on the canvas
     * @param {HTMLImageElement} img image object
     * @param {Cx} center center of the image as complex number
     * @param {number} radius average of the width and the height
     * I'm pretty sure it's in pixels
     * @param {number} rotation Clockwise
     * @param {GameStatus} g - g
     * @returns void
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
     * @param {GameStatus} g g
     * @param {UniverseInfo} u u
     * @returns {void}
     */
    static obj(o, g, u) {
        // const V = g.coordToPix(o.pos);
        let s = UniverseInfo_1.UniverseInfo.localScale(o.pos, u.curvature);
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
     * @param {GameStatus} g g
     * @param {UniverseInfo} u u
     * @returns {void}
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
   * @param {Wall} wall this wall
   * @param {GameStatus} g g
   * @param color color optional
   * @returns {void}
   */
    static wall(wall, g, color = 'black') {
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
            const [x1, y1] = g.coordToPix(wall.start);
            const [x2, y2] = g.coordToPix(wall.end);
            // const a1 = g.coordToPix(wall.originToWall.apply(Cx.makeNew(-100)));
            // const a2 = g.coordToPix(wall.originToWall.apply(Cx.makeNew(100)));
            g.ctx.strokeStyle = color;
            g.ctx.beginPath();
            // g.ctx.moveTo(a1[0], a1[1]);
            // g.ctx.lineTo(a2[0], a2[1]);
            g.ctx.moveTo(x1, y1);
            g.ctx.lineTo(x2, y2);
            g.ctx.stroke();
        }
        else {
            const x = g.coordToPix(wall.center);
            const r = wall.radius * g.scale;
            g.ctx.strokeStyle = color;
            g.ctx.beginPath();
            const [an1, an2] = Draw.findSmallestAngle(Draw.findAngle(wall.center, wall.start, g), Draw.findAngle(wall.center, wall.end, g));
            g.ctx.arc(x[0], x[1], r, an1, an2);
            g.ctx.stroke();
        }
    }
    /**
     *
     * @param a an angle
     * @param b another angle
     * @returns the angles in an order so that counterclockwise
     * is the shortest path
     */
    static findSmallestAngle(a, b) {
        const twoPi = 2 * Math.PI;
        a = a > 0 ? a % twoPi : (a % twoPi) + twoPi;
        b = b > 0 ? b % twoPi : (b % twoPi) + twoPi;
        const [c, d] = [Math.max(a, b), Math.min(a, b)];
        if (c - d > Math.PI) {
            return [c, d - twoPi];
        }
        else {
            return [d, c];
        }
    }
    /**
   *
   * @param p1 start
   * @param p2 end
   * @param g g
   @returns the angle of the line going from p1 to p2
   */
    static findAngle(p1, p2, g) {
        const [x1, y1] = g.coordToPix(p1);
        const [x2, y2] = g.coordToPix(p2);
        const [l1, l2] = [x2 - x1, y2 - y1];
        // We have implemented this angle finding in Cx lol
        const z = new Cx_1.Cx(l1, l2);
        return z.arg();
    }
    /**
     * draws the source and target of a Mobius trans
     * for debugging
     * @param {Mobius} M the mobius
     * @param {Cx[]} v vertices to draw
     * @param {GameStatus} g g
     * @param {UniverseInfo} u u
   * @returns {void}
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
     * draw the mobius transformation of a polygon for debugging
     * @param {Polygon} P a polygon
     * @param {GameStatus} g g
     * @param {UniverseInfo} u u
     * @param {number} [i = 0] if drawing one, which one?
   * @returns {void}
     */
    static polygonTransf(P, g, u, i = 0) {
        Draw.mobius(P.transf[i], P.vertices, g, u);
    }
    /**
     * draw all polygon transformations for debugging
     * @param {Polygon} P polygon
     * @param {GameStatus} g g
     * @param {UniverseInfo} u u
   * @returns {void}
     */
    static allPolygonTransf(P, g, u) {
        P.transf.forEach((M, i) => Draw.polygonTransf(P, g, u, i));
    }
    /**
     * draw the vertices of a polygon
     * @param {Polygon} P polygon
     * @param {GameStatus} g g
     * @param {UniverseInfo} u u
   * @returns {void}
     */
    static polygonVertices(P, g, u) {
        P.vertices.forEach((v) => Draw.obj(new Thing_1.Thing(v, 'blueDot'), g, u));
    }
    /**
     * draws everything on the editor
     * @param g g
     * @returns void
     */
    static editor(g) {
        g.drawBackground();
        g.editor.lines.forEach((o) => Draw.editorObj(o, g));
        g.editor.points.forEach((o) => Draw.editorObj(o, g));
    }
    /**
   * draws something on the editor
   * @param o an editor object
   * @param g g
   * @returns void
   */
    static editorObj(o, g) {
        if (o instanceof Editor_1.EditorPoint) {
            const [x, y] = g.coordToPix(o.pos);
            g.ctx.beginPath();
            g.ctx.arc(x, y, o.style.radius, 0, 2 * Math.PI);
            g.ctx.fillStyle = o.style.color;
            g.ctx.fill();
        }
        else if (o instanceof Editor_1.EditorEdge) {
            const wall = new Wall_1.Wall(o.start.pos, o.end.pos, g.curvature);
            Draw.wall(wall, g, o.style.color);
        }
    }
}
exports.Draw = Draw;
