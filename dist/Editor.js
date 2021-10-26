"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorObject = exports.Editor = void 0;
/**
 * @property {editorObject[]} objects list of drawn stuff
 */
class Editor {
    constructor(objects, onClick, mouse) {
        this.objects = objects;
        this.onClick = onClick;
        this.mouse = mouse;
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
        const position = this.mouse.pos;
    }
    /**
     * adds a point at position t
     * @param pos position
     * @returns void
     */
    addPoint(pos) {
    }
    static start() {
        return new Editor([], 'none', { pos: [0, 0], lClick: false, rClick: false });
    }
}
exports.Editor = Editor;
class EditorObject {
    constructor(style) {
        this.style = style;
    }
}
exports.EditorObject = EditorObject;
