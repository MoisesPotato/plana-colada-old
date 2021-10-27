"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorPoint = exports.EditorObject = exports.Editor = void 0;
const Drawing_1 = require("./Drawing");
/**
 * @property {editorObject[]} objects list of drawn stuff
 */
class Editor {
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
                console.log('clicked');
                this.onClick = 'addPoint';
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
                this.clickPoint();
                return;
        }
    }
    /**
     * Adds a point at the cursor position
     * @returns void
     */
    clickPoint() {
        const position = this.g.pixToCoord(this.g.mouse.pos[0], this.g.mouse.pos[1]);
        this.addPoint(position, '#ff0000');
    }
    /**
     * adds a point at position t
     * @param pos position
     * @param color color (#ffffff)
     * @returns void
     */
    addPoint(pos, color) {
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
}
exports.Editor = Editor;
class EditorObject {
    constructor(style) {
        this.style = style;
    }
}
exports.EditorObject = EditorObject;
class EditorPoint extends EditorObject {
    constructor(style, pos) {
        super(style);
        this.pos = pos;
    }
    static newPoint(pos, color) {
        return new EditorPoint({ color: color }, pos);
    }
}
exports.EditorPoint = EditorPoint;
