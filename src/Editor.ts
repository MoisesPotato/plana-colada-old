import {Cx} from './Cx';
import {Draw} from './Drawing';
import {GameStatus} from './GameStatus';

type clickAction = 'none'|'addPoint';


/**
 * @property {editorObject[]} objects list of drawn stuff
 */
export class Editor {
  objects : EditorObject[];
  onClick : clickAction;
  g: GameStatus;

  constructor(objects: EditorObject[], onClick: clickAction, g:GameStatus) {
    this.objects = objects;
    this.onClick = onClick;
    this.g = g;
  }


  /**
   * Changes the status depending on the pressed button
   * @param buttonID which button was pressed
   * @returns void
   */
  clickButton(buttonID:string):void {
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
    const position = this.g.pixToCoord( this.g.mouse.pos[0],
        this.g.mouse.pos[1] );
    this.addPoint(position, '#ff0000');
  }

  /**
   * adds a point at position t
   * @param pos position
   * @param color color (#ffffff)
   * @returns void
   */
  addPoint(pos:Cx, color:string):void {
    this.objects.push(EditorPoint.newPoint(pos, color));
    Draw.editor(this.g);
  }

  /**
   *
   * @param g g
   * @returns a new instance of Editor
   */
  static start(g:GameStatus):Editor {
    return new Editor([], 'none', g);
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

export class EditorPoint extends EditorObject {
  pos:Cx;

  constructor(style:editorStyle, pos: Cx) {
    super(style);
    this.pos = pos;
  }

  static newPoint(pos:Cx, color:string):EditorPoint {
    return new EditorPoint({color: color}, pos);
  }
}
