import {Cx} from './Cx';
import {Draw} from './Drawing';
import {GameStatus} from './GameStatus';

type clickAction = 'none'|'addPoint';

const pointsColor = '#ff0000';

/**
 * @property {editorObject[]} objects list of drawn stuff
 */
export class Editor {
  objects : EditorObject[];
  onClick : clickAction;
  g: GameStatus;

  /**
   *
   * @param objects drawn things
   * @param onClick what will happen when we click
   * @param g g
   */
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
        this.onClick = 'addPoint';
        const pointer = EditorPoint.newPoint(Cx.makeNew(0), pointsColor, true);
        this.objects.push(pointer);
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
        this.clickToMakePoint();
        return;
    }
  }

  /**
 * @returns the object which is the cursor currently
 */
  get cursor():EditorObject|undefined {
    return this.objects.filter((a) => a.pointer)[0];
  }

  /**
   * Adds a point at the cursor position
   * @returns void
   */
  clickToMakePoint():void {
    if (this.cursor) {
      this.cursor.pointer = false;
    } else {
      throw new Error('Tried to make a point but the cursor doesn\'t exist');
    }
  }

  /**
   * adds a point at position t
   * @param pos position
   * @param color color (#ffffff)
   * @returns void
   */
  createPoint(pos:Cx, color:string):void {
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

  /**
 * updates the position of the cursor
 * redraws... will this break everything?
 * @returns void
 */
  mouseMove():void {
    switch (this.onClick) {
      case 'none':
        return;
      case 'addPoint':
        window.requestAnimationFrame(() =>{
          if (this.cursor) {
            this.cursor.pos = this.g.mousePosCx;
          }
          Draw.editor(this.g);
        } );
    }
  }
}

type editorStyle = {
    color:string,
}
/**
 * @property {editorStyle} style currently just the color
 * @property {boolean} pointer is this the cursor?
 * @property {Cx} pos where it is
 */
export class EditorObject {
  style:editorStyle;
  pointer:boolean;
  pos:Cx;

  /**
   * see {@link EditorObject} doc
   * @param pos pos
   * @param style style
   * @param pointer where
   */
  constructor(pos:Cx, style: editorStyle, pointer: boolean) {
    this.pos = pos;
    this.style = style;
    this.pointer = pointer;
  }
}
/**
 * For points
 */
export class EditorPoint extends EditorObject {
  /**
   * see {@link EditorObject} doc
   * @param style style
   * @param pos pos
   * @param pointer cursor
   */
  constructor(style:editorStyle, pos: Cx, pointer:boolean) {
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
  static newPoint(pos:Cx, color:string, pointer = false):EditorPoint {
    return new EditorPoint({color: color}, pos, pointer);
  }
}
