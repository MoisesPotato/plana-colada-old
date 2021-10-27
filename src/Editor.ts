import {Cx} from './Cx';
import {Draw} from './Drawing';
import {GameStatus} from './GameStatus';

type clickAction = 'none'|'addPoint';


const pointStyle = {
  color: '#ff0000',
  radius: 3,
};

const cursorPointStyle = {
  color: '#ffb30f',
  radius: 4,
};

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
        const pointer = EditorPoint.newPoint(this.g.mousePosCx, true);
        this.objects.push(pointer);
        Draw.editor(this.g);
    }
  }

  /**
 * Does an action that depends on this.onClick
 * @returns void
  */
  click():void {
    switch (this.onClick) {
      case 'none':
        this.checkForClickedObjects();
        return;
      case 'addPoint':
        this.placePointAtCursor();
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
  placePointAtCursor():void {
    if (this.cursor) {
      this.cursor.style = pointStyle;
      this.cursor.pointer = false;
      this.onClick = 'none';
      Draw.editor(this.g);
    } else {
      throw new Error('Tried to make a point but the cursor doesn\'t exist');
    }
  }

  /**
 * Runs through the objects to see which ones
 * are clicked and takes action accordingly
 * @returns void
 */
  checkForClickedObjects():void {
    const mousePos = this.g.mousePosCx;
    const clicks = this.objects.map((o) => o.closeTo(mousePos, this.g));
    const clicked = clicks.indexOf(true);
    if (clicked > -1) {
      const clickedObject = this.objects[clicked];
      // remove the pointer
      this.objects = this.objects.filter((o) => !o.pointer);
      clickedObject.pointer = true;
      clickedObject.style = cursorPointStyle;
      this.onClick = 'addPoint';
    }
  }

  /**
   * adds a point at position t
   * @param pos position
   * @param color color (#ffffff)
   * @returns void
   */
  createPoint(pos:Cx, color:string):void {
    this.objects.push(EditorPoint.newPoint(pos));
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
    radius:number,
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

  /**
   *
   * @param z a position on the screen
   * @returns true if this is closeand this is not the pointer
   * (within some tolerance...)
   */
  closeTo(z:Cx, {scale: scale}:{scale:number}):boolean {
    if (this instanceof EditorPoint && !this.pointer) {
      const dist = z.plus(this.pos.times(-1));
      const tolerance = 0.005; // Square distance!!
      return dist.absSq < tolerance;
    } else {
      return false;
    }
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
   * @param pointer is this the cursor
   * @param style style data, or default for a point
   * @returns an EditorPoint to be put in {@link Editor}.objects
   */
  static newPoint(pos:Cx, pointer = false, style? :editorStyle):EditorPoint {
    if (!style) {
      style = pointer?cursorPointStyle:pointStyle;
    }
    return new EditorPoint(style, pos, pointer);
  }
}
