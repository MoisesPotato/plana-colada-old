"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorPoint = exports.EditorObject = exports.Editor = void 0;
const Cx_1 = require("./Cx");
const Drawing_1 = require("./Drawing");
const pointsColor = '#ff0000';
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
                const pointer = EditorPoint.newPoint(Cx_1.Cx.makeNew(0), pointsColor, true);
                this.objects.push(pointer);
        }
    }
    /**
   * Does an action that depends on this.onClick
   * @returns void
    */
    click() {
        switch (this.onClick) {
            case 'none':
                return;
            case 'addPoint':
                this.clickToMakePoint();
                return;
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
    clickToMakePoint() {
        if (this.cursor) {
            this.cursor.pointer = false;
        }
        else {
            throw new Error('Tried to make a point but the cursor doesn\'t exist');
        }
    }
    /**
     * adds a point at position t
     * @param pos position
     * @param color color (#ffffff)
     * @returns void
     */
    createPoint(pos, color) {
        this.objects.push(EditorPoint.newPoint(pos, color));
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
        switch (this.onClick) {
            case 'none':
                return;
            case 'addPoint':
                window.requestAnimationFrame(() => {
                    if (this.cursor) {
                        this.cursor.pos = this.g.mousePosCx;
                    }
                    Drawing_1.Draw.editor(this.g);
                });
        }
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
     * @param color color (we are using red rn)
     * @param pointer is this the cursor
     * @returns an EditorPoint to be put in {@link Editor}.objects
     */
    static newPoint(pos, color, pointer = false) {
        return new EditorPoint({ color: color }, pos, pointer);
    }
}
exports.EditorPoint = EditorPoint;
