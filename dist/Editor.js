"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorEdge = exports.EditorPoint = exports.EditorObject = exports.Editor = void 0;
const Cx_1 = require("./Cx");
const Mobius_1 = require("./Mobius");
const UniverseInfo_1 = require("./UniverseInfo");
// TODO mouse wheel scale
// TODO show equator
// TODO fix hyperbolic stuff (prevent placing points outside of the universe)
const pointStyle = {
    color: '#ff0000',
    radius: 3,
    label: '',
    fill: true,
};
const hoverPointStyle = {
    color: '#0000ff',
    radius: 3,
    label: '',
    fill: true,
};
const cursorPointStyle = {
    color: '#ffb30f',
    radius: 4,
    label: '',
    fill: true,
};
const startingEdgeStyle = {
    color: '#f2f542',
    radius: 3,
    label: 'Start',
    fill: false,
};
const endingEdgeStyle = {
    color: '#f2f542',
    radius: 3,
    label: 'End',
    fill: false,
};
const lineStyle = {
    color: 'black',
    radius: 0,
    label: '',
    fill: false,
};
const hoverLineStyle = {
    color: 'blue',
    radius: 0,
    label: '',
    fill: false,
};
const selectedLineStyle = {
    color: 'yellow',
    radius: 0,
    label: '',
    fill: false,
};
/**
 * @property {editorObject[]} objects list of drawn stuff
 */
class Editor {
    /**
     *
     * @param points drawn points
     * @param lines drawn lines
     * @param onClick what will happen when we click
     * @param g g
     * @param curvature curvature
     */
    constructor(points, lines, onClick, g, curvature) {
        this.points = points;
        this.lines = lines;
        this.onClick = onClick;
        this.g = g;
        this.curvature = curvature;
        this.points.push(EditorPoint.newPoint(Cx_1.Cx.makeNew(0), false, {
            color: 'black',
            radius: 5,
            label: '',
            fill: true,
        }));
    }
    /**
     * Changes the status depending on the pressed button
     * @param buttonID which button was pressed
     * @returns void
     */
    clickButton(buttonID) {
        switch (buttonID) {
            case 'addPoint':
                this.setAction('addPoint');
                this.cursorGrabsNewPoint(cursorPointStyle);
                break;
            case 'addEdge':
                this.setAction('addEdgeStart');
                this.cursorGrabsNewPoint(startingEdgeStyle);
                break;
        }
    }
    /**
   * Creates a new point and makes it follow cursor
   * @param style the style of new point
   * @returns void
   */
    cursorGrabsNewPoint(style) {
        const pointer = EditorPoint.newPoint(this.g.mousePosCx, true, style);
        this.points.push(pointer);
    }
    /**
   * Does an action that depends on this.onClick
   * @returns void
    */
    click() {
        switch (this.onClick) {
            case 'none':
                this.selectPointByClick();
                if (this.onClick == 'none') {
                    this.selectEdgeByClick();
                }
                return;
            case 'addPoint':
                this.placePointAtCursor();
                return;
            case 'addEdgeStart':
                this.startEdgeAtCursor();
                return;
            case 'addEdgeEnd':
                this.endEdgeAtCursor();
                return;
            case 'glueEdge':
                const clicked = this.findClicked('edge');
                const edge1 = this.lines.find((o) => o.selected);
                if (!edge1) {
                    throw new Error('No edge selected!');
                }
                if (clicked > -1) {
                    this.glueEdges(edge1, this.lines[clicked]);
                }
                edge1.selected = false;
                edge1.style = lineStyle;
                this.setAction('none');
        }
    }
    /**
     * identifies them together
     * @param e1 edge
     * @param e2 edge
     * @return void
     */
    glueEdges(e1, e2) {
        e1.glued = e2;
        e2.glued = e1;
    }
    /**
     * Creates a new edge with starting vertex at the cursor.
     * If we are not clicking any vertex, creates a new vertex
     * Otherwise, places a vertex as the start
     * @returns void
     */
    startEdgeAtCursor() {
        const clickedPoint = this.findClicked('point');
        let v1;
        if (!this.cursor) {
            throw new Error('There is no cursor!');
        }
        if (clickedPoint > -1) {
            v1 = this.points[clickedPoint];
        }
        else {
            v1 = this.cursor;
            v1.pointer = false;
            this.cursorGrabsNewPoint(endingEdgeStyle);
        }
        v1.style = pointStyle;
        const v2 = this.cursor;
        this.lines.push(EditorEdge.fromEndPoints(v1, v2, this));
        this.setAction('addEdgeEnd');
    }
    /**
   * Drops the current point in place
   * @returns none
   */
    endEdgeAtCursor() {
        if (!this.cursor) {
            throw new Error('There is no cursor!');
        }
        const clickedPoint = this.findClicked('point');
        if (clickedPoint > -1) {
            this.reattachEdges(this.cursor, this.points[clickedPoint]);
            this.deleteCursor();
        }
        else {
            this.cursor.style = pointStyle;
            this.cursor.pointer = false;
        }
        this.setAction('none');
    }
    /**
   *
   * @param oldV a vertex
   * @param newV another vertex
   * @returns void
   * Every edge that has endpoint oldv is reassigned to newV
   */
    reattachEdges(oldV, newV) {
        const edges = this.findEdgesByVertex(oldV);
        edges.forEach(({ index: i, start: start }) => {
            const e = this.lines[i];
            if (start) {
                e.start = newV;
            }
            else {
                e.end = newV;
            }
        });
    }
    /**
   * @param v a vertex
   * @returns [i1, i2..] the list of indices of the edges
   * that have v as a vertex
   */
    findEdgesByVertex(v) {
        const returnList = [];
        this.lines.forEach((o, i) => {
            if (o instanceof EditorEdge) {
                if (o.start == v) {
                    returnList.push({ index: i, start: true });
                }
                if (o.end == v) {
                    returnList.push({ index: i, start: false });
                }
            }
        });
        return returnList;
    }
    /**
     * Changes the onclick property and the message
     * in the help box
     * @param a the action
     * @returns void
     */
    setAction(a) {
        this.onClick = a;
        let message = '';
        switch (a) {
            case 'none':
                message = 'Click on button, a dot or an edge.';
                break;
            case 'addPoint':
                message = 'Click where you would like to place the point.';
                break;
            case 'addEdgeStart':
                message = 'Click where you would like the new line to start.';
                break;
            case 'addEdgeEnd':
                message = 'Click where you would like the new line to end.';
                break;
            case 'glueEdge':
                message = 'Click on the edge to identify this with';
                break;
        }
        const help = document.getElementById('editorHelp');
        help.innerHTML = message;
    }
    /**
   *
   * @param type are we looking for just points/edges or any
   * @returns the index of the first object that is clicked, or -1
   */
    findClicked(type) {
        const mousePos = this.g.mousePosCx;
        switch (type) {
            case 'point':
                return this.points.findIndex((o) => {
                    return o instanceof EditorPoint && o.closeTo(mousePos, this.g);
                });
            case 'edge':
                return this.lines.findIndex((o) => {
                    return o instanceof EditorEdge && o.closeTo(mousePos, this.g);
                });
        }
    }
    /**
   * @returns the object which is the cursor currently
   */
    get cursor() {
        return this.points.filter((a) => a.pointer)[0];
    }
    /**
     * Adds a point at the cursor position
     * @returns void
     */
    placePointAtCursor() {
        if (this.cursor) {
            this.cursor.style = pointStyle;
            this.cursor.pointer = false;
            this.setAction('none');
        }
        else {
            throw new Error('Tried to make a point but the cursor doesn\'t exist');
        }
    }
    /**
   * Runs through the edges to see which ones
   * are clicked and takes action accordingly
   * @returns void
   */
    selectEdgeByClick() {
        const clicked = this.findClicked('edge');
        if (clicked > -1) {
            this.setAction('glueEdge');
            const e = this.lines[clicked];
            e.selected = true;
            e.style = selectedLineStyle;
            if (e.glued) {
                const otherEdge = this.findPartner(e);
                otherEdge.glued = false;
                e.glued = false;
            }
        }
    }
    /**
   *
   * @param e an edge
   * @returns the edge it is glued to, or nothing
   */
    findPartner(e) {
        const partner = this.lines.find((l) => l.glued == e);
        if (!partner) {
            throw new Error('Edge not glued!');
        }
        return partner;
    }
    /**
   * Runs through the points to see which ones
   * are clicked and takes action accordingly
   * @returns void
   */
    selectPointByClick() {
        const clicked = this.findClicked('point');
        if (clicked > -1) {
            this.pickUpPoint(clicked);
            this.setAction('addPoint');
        }
    }
    /**
   * Takes first point with this index and makes it into the cursor
   * Removes the existing cursor if it's there
   * @param i index
   * @returns void
   */
    pickUpPoint(i) {
        const clickedObject = this.points[i];
        // remove the pointer
        this.deleteCursor();
        clickedObject.pointer = true;
        clickedObject.style = cursorPointStyle;
    }
    /**
     * @returns void. Deletes the cursor point
     */
    deleteCursor() {
        this.points = this.points.filter((o) => !o.pointer);
    }
    /**
     * adds a point at position t
     * @param pos position
     * @param color color (#ffffff)
     * @returns void
     */
    createPoint(pos, color) {
        this.points.push(EditorPoint.newPoint(pos));
    }
    /**
     *
     * @param g g
     * @param curvature curvature
     * @returns a new instance of Editor
     */
    static start(g, curvature) {
        return new Editor([], [], 'none', g, curvature);
    }
    /**
   * updates the position of the cursor
   * redraws... will this break everything?
   * @returns void
   */
    mouseMove() {
        window.requestAnimationFrame(() => {
            const mouse = this.g.mousePosCx;
            if (this.cursor) {
                this.cursor.pos = mouse;
            }
            let foundHovered = false;
            this.points.forEach((p) => {
                if (!p.pointer) {
                    if (foundHovered) {
                        p.style = pointStyle;
                    }
                    else if (p.closeTo(mouse, this.g)) {
                        p.style = hoverPointStyle;
                        foundHovered = true;
                    }
                    else {
                        p.style = pointStyle;
                    }
                }
            });
            this.lines.forEach((e) => {
                if (!e.selected) {
                    if (foundHovered) {
                        e.style = lineStyle;
                    }
                    else if (e.closeTo(mouse, this.g)) {
                        e.style = hoverLineStyle;
                        foundHovered = true;
                    }
                    else {
                        e.style = lineStyle;
                    }
                }
            });
        });
    }
}
exports.Editor = Editor;
/**
 * @property {editorStyle} style currently just the color
 * @property {boolean} pointer is this the cursor?
 * @property {Cx} pos where it is
 */
class EditorObject {
    /**
     * see {@link EditorObject} doc
     * @param pos pos
     * @param style style
     * @param pointer where
     */
    constructor(pos, style, pointer) {
        this.pos = pos;
        this.style = style;
        this.pointer = pointer;
    }
    /**
     *
     * @param z a position on the screen
     * @returns true if this is closeand this is not the pointer
     * (within some tolerance...)
     */
    closeTo(z, { scale: scale, curvature: curvature }) {
        if (this instanceof EditorPoint && !this.pointer) {
            const dist = z.plus(this.pos.times(-1));
            const tolerance = 0.005; // Square distance!!
            return dist.absSq < tolerance;
        }
        else if (this instanceof EditorEdge) {
            const M = Mobius_1.Mobius.twoPoints(this.start.pos, this.end.pos, curvature);
            const z2 = M.apply(z);
            const tolerance = 0.05;
            return Math.abs(z2.im) < tolerance /
                UniverseInfo_1.UniverseInfo.localScale(z, curvature);
        }
        else {
            return false;
        }
    }
}
exports.EditorObject = EditorObject;
/**
 * For points
 */
class EditorPoint extends EditorObject {
    /**
     * see {@link EditorObject} doc
     * @param style style
     * @param pos pos
     * @param pointer cursor
     */
    constructor(style, pos, pointer) {
        super(pos, style, pointer);
        this.pointer = pointer;
    }
    /**
     *
     * @param pos position
     * @param pointer is this the cursor
     * @param style style data, or default for a point
     * @returns an EditorPoint to be put in {@link Editor}.objects
     */
    static newPoint(pos, pointer = false, style) {
        if (!style) {
            style = pointer ? cursorPointStyle : pointStyle;
        }
        return new EditorPoint(style, pos, pointer);
    }
}
exports.EditorPoint = EditorPoint;
/**
   *
   * @property {Cx} pos this is just infty for an edge
   * @property {editorStyle} style color?
   * @property {boolean} pointer this is just false
   * @property {EditorPoint} start starting vertex
   * @property {EditorPoint} end ending vertex
   */
class EditorEdge extends EditorObject {
    /**
     *
     * @param pos this is just infty for an edge
     * @param style color?
     * @param pointer this is just false
     * @param {EditorPoint} start starting vertex
     * @param {EditorPoint} end ending vertex
     */
    constructor(pos, style, pointer, start, end) {
        super(pos, style, pointer);
        this.start = start;
        this.end = end;
        this.selected = false;
        this.glued = false;
    }
    /**
   *
   * @param v1 start
   * @param v2 end
   * @param style style (optional)
   * @returns an edge with these endpoints
   */
    static fromEndPoints(v1, v2, { curvature: curvature }, style) {
        if (!style) {
            style = lineStyle;
        }
        return new EditorEdge(Cx_1.Cx.infty(), style, false, v1, v2);
    }
}
exports.EditorEdge = EditorEdge;
