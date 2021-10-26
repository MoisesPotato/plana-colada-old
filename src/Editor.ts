/* eslint-disable require-jsdoc */
import {Cx} from './Cx';

type clickAction = 'none'|'addPoint';

type mouse = {
    pos: [number, number],
    lClick: boolean,
    rClick: boolean
}

/**
 * @property {editorObject[]} objects list of drawn stuff
 */
export class Editor {
  objects : EditorObject[];
  onClick : clickAction;
  mouse: mouse;

  constructor(objects: EditorObject[], onClick: clickAction, mouse:mouse) {
    this.objects = objects;
    this.onClick = onClick;
    this.mouse = mouse;
  }


  /**
   * Changes the status depending on the pressed button
   * @param buttonID which button was pressed
   * @returns void
   */
  clickButton(buttonID:string):void {
    switch (buttonID) {
      case 'addPoint':
        this.onClick = 'addPoint';
    }
  }

  /**
 * Does an action that depends on this.onClick
 * @returns void
  */
  click():void {
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
  clickPoint():void {
    const position = this.mouse.pos;
  }

  /**
   * adds a point at position t
   * @param pos position
   * @returns void
   */
  addPoint(pos:Cx):void {

  }

  static start():Editor {
    return new Editor([], 'none', {pos: [0, 0], lClick: false, rClick: false});
  }
}

type editorStyle = {
    color:string,
}

export class EditorObject {
  style:editorStyle;

  constructor(style: editorStyle) {
    this.style = style;
  }
}
