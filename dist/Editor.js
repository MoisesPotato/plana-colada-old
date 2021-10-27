"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorEdge = exports.EditorPoint = exports.EditorObject = exports.Editor = void 0;
const Cx_1 = require("./Cx");
const Drawing_1 = require("./Drawing");
const pointStyle = {
    color: '#ff0000',
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
/**
 * @property {editorObject[]} objects list of drawn stuff
 */
class Editor {
    /**
     *
     * @param objects drawn things
     * @param onClick what will happen when we click
     * @param g g
     */
    constructor(objects, onClick, g) {
        this.objects = objects;
        this.onClick = onClick;
        this.g = g;
    }
    /**
     * Changes the status depending on the pressed button
     * @param buttonID which button was pressed
     * @returns void
     */
    clickButton(buttonID) {
        switch (buttonID) {
            case 'addPoint':
                this.onClick = 'addPoint';
                this.cursorGrabsNewPoint(cursorPointStyle);
                break;
            case 'addEdge':
                this.onClick = 'addEdgeStart';
                this.cursorGrabsNewPoint(cursorPointStyle);
                break;
        }
        Drawing_1.Draw.editor(this.g);
    }
    /**
   * Creates a new point and makes it follow cursor
   * @param style the style of new point
   * @returns void
   */
    cursorGrabsNewPoint(style) {
        const pointer = EditorPoint.newPoint(this.g.mousePosCx, true, style);
        this.objects.push(pointer);
    }
    /**
   * Does an action that depends on this.onClick
   * @returns void
    */
    click() {
        console.log('canvas click');
        switch (this.onClick) {
            case 'none':
                this.selectByClick();
                return;
            case 'addPoint':
                this.placePointAtCursor();
                return;
            case 'addEdgeStart':
                this.startEdgeAtCursor();
                return;
            case 'addEdgeEnd':
                this.endEdgeAtCursor();
        }
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
            v1 = this.objects[clickedPoint];
        }
        else {
            v1 = this.cursor;
            v1.pointer = false;
            this.cursorGrabsNewPoint(endingEdgeStyle);
        }
        v1.style = pointStyle;
        const v2 = this.cursor;
        this.objects.push(EditorEdge.fromEndPoints(v1, v2));
        this.onClick = 'addEdgeEnd';
        Drawing_1.Draw.editor(this.g);
    }
    /**
   * Drops the current point in place
   * @returns none
   */
    endEdgeAtCursor() {
        if (!this.cursor) {
            throw new Error('There is no cursor!');
        }
        this.cursor.style = pointStyle;
        this.cursor.pointer = false;
        this.onClick = 'none';
        console.log(JSON.stringify(this.objects));
        Drawing_1.Draw.editor(this.g);
    }
    /**
   *
   * @param type are we looking for just points/edges or any
   * @returns the index of the first object that is clicked, or -1
   */
    findClicked(type = '') {
        const mousePos = this.g.mousePosCx;
        switch (type) {
            case '':
                return this.objects.findIndex((o) => o.closeTo(mousePos, this.g));
            case 'point':
                return this.objects.findIndex((o) => {
                    return o instanceof EditorPoint && o.closeTo(mousePos, this.g);
                });
            case 'edge':
                return this.objects.findIndex((o) => {
                    return o instanceof EditorEdge && o.closeTo(mousePos, this.g);
                });
        }
    }
    /**
   * @returns the object which is the cursor currently
   */
    get cursor() {
        return this.objects.filter((a) => a.pointer)[0];
    }
    /**
     * Adds a point at the cursor position
     * @returns void
     */
    placePointAtCursor() {
        if (this.cursor) {
            this.cursor.style = pointStyle;
            this.cursor.pointer = false;
            this.onClick = 'none';
            Drawing_1.Draw.editor(this.g);
        }
        else {
            throw new Error('Tried to make a point but the cursor doesn\'t exist');
        }
    }
    /**
   * Runs through the objects to see which ones
   * are clicked and takes action accordingly
   * @returns void
   */
    selectByClick() {
        const clicked = this.findClicked('');
        if (clicked > -1) {
            this.pickUpPoint(clicked);
            this.onClick = 'addPoint';
        }
    }
    /**
   * Takes first point with this index and makes it into the cursor
   * Removes the existing cursor if it's there
   * @param i index
   * @returns void
   */
    pickUpPoint(i) {
        const clickedObject = this.objects[i];
        // remove the pointer
        this.objects = this.objects.filter((o) => !o.pointer);
        clickedObject.pointer = true;
        clickedObject.style = cursorPointStyle;
    }
    /**
     * adds a point at position t
     * @param pos position
     * @param color color (#ffffff)
     * @returns void
     */
    createPoint(pos, color) {
        this.objects.push(EditorPoint.newPoint(pos));
        Drawing_1.Draw.editor(this.g);
    }
    /**
     *
     * @param g g
     * @returns a new instance of Editor
     */
    static start(g) {
        return new Editor([], 'none', g);
    }
    /**
   * updates the position of the cursor
   * redraws... will this break everything?
   * @returns void
   */
    mouseMove() {
        window.requestAnimationFrame(() => {
            if (this.cursor) {
                this.cursor.pos = this.g.mousePosCx;
            }
            Drawing_1.Draw.editor(this.g);
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
    closeTo(z, { scale: scale }) {
        if (this instanceof EditorPoint && !this.pointer) {
            const dist = z.plus(this.pos.times(-1));
            const tolerance = 0.005; // Square distance!!
            return dist.absSq < tolerance;
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
     * @param start starting vertex
     * @param end ending vertex
     */
    constructor(pos, style, pointer, start, end) {
        super(pos, style, pointer);
        this.start = start;
        this.end = end;
    }
    /**
   *
   * @param v1 start
   * @param v2 end
   * @param style style (optional)
   * @returns an edge with these endpoints
   */
    static fromEndPoints(v1, v2, style) {
        if (!style) {
            style = lineStyle;
        }
        return new EditorEdge(Cx_1.Cx.infty(), style, false, v1, v2);
    }
}
exports.EditorEdge = EditorEdge;
