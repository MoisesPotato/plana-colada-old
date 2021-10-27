import {Cx} from './Cx';
import {Draw} from './Drawing';
import {GameStatus} from './GameStatus';

type clickAction = 'none'|'addPoint'|'addEdgeStart'|'addEdgeEnd';


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
        this.cursorGrabsNewPoint(cursorPointStyle);
        break;
      case 'addEdge':
        this.onClick = 'addEdgeStart';
        this.cursorGrabsNewPoint(cursorPointStyle);
        break;
    }
    Draw.editor(this.g);
  }

  /**
 * Creates a new point and makes it follow cursor
 * @param style the style of new point
 * @returns void
 */
  cursorGrabsNewPoint(style:editorStyle):void {
    const pointer = EditorPoint.newPoint(this.g.mousePosCx, true, style);
    this.objects.push(pointer);
  }

  /**
 * Does an action that depends on this.onClick
 * @returns void
  */
  click():void {
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
  startEdgeAtCursor():void {
    const clickedPoint = this.findClicked('point');
    let v1:EditorPoint;
    if (!this.cursor) {
      throw new Error('There is no cursor!');
    }
    if (clickedPoint > -1) {
      v1 = this.objects[clickedPoint];
    } else {
      v1 = this.cursor;
      v1.pointer = false;
      this.cursorGrabsNewPoint(endingEdgeStyle);
    }
    v1.style = pointStyle;
    const v2 = this.cursor;
    this.objects.push(EditorEdge.fromEndPoints(v1, v2));
    this.onClick = 'addEdgeEnd';
    Draw.editor(this.g);
  }

  /**
 * Drops the current point in place
 * @returns none
 */
  endEdgeAtCursor():void {
    if (!this.cursor) {
      throw new Error('There is no cursor!');
    }
    this.cursor.style = pointStyle;
    this.cursor.pointer = false;
    this.onClick = 'none';
    console.log(JSON.stringify(this.objects));
    Draw.editor(this.g);
  }

  /**
 *
 * @param type are we looking for just points/edges or any
 * @returns the index of the first object that is clicked, or -1
 */
  findClicked(type:''|'point'|'edge' = ''):number {
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
  selectByClick():void {
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
  pickUpPoint(i:number):void {
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
    window.requestAnimationFrame(() =>{
      if (this.cursor) {
        this.cursor.pos = this.g.mousePosCx;
      }
      Draw.editor(this.g);
    } );
  }
}

interface editorStyle {
    color:string,
    radius?:number,
    label?:string,
    fill?:boolean
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

/**
   *
   * @property {Cx} pos this is just infty for an edge
   * @property {editorStyle} style color?
   * @property {boolean} pointer this is just false
   * @property {EditorPoint} start starting vertex
   * @property {EditorPoint} end ending vertex
   */
export class EditorEdge extends EditorObject {
  start:EditorPoint;
  end:EditorPoint;

  /**
   *
   * @param pos this is just infty for an edge
   * @param style color?
   * @param pointer this is just false
   * @param start starting vertex
   * @param end ending vertex
   */
  constructor(pos:Cx, style:editorStyle, pointer:boolean,
      start: EditorPoint, end: EditorPoint) {
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
  static fromEndPoints(v1:EditorPoint, v2:EditorPoint,
      style?:editorStyle):EditorEdge {
    if (!style) {
      style = lineStyle;
    }
    return new EditorEdge(Cx.infty(), style, false, v1, v2);
  }
}
