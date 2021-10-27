import {Cx} from './Cx';
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
  points : EditorPoint[];
  lines : EditorEdge[];
  onClick : clickAction;
  g: GameStatus;
  curvature:number;

  /**
   *
   * @param points drawn points
   * @param lines drawn lines
   * @param onClick what will happen when we click
   * @param g g
   * @param curvature curvature
   */
  constructor(
      points : EditorPoint[],
      lines : EditorEdge[],
      onClick: clickAction, g:GameStatus, curvature: number) {
    this.points = points;
    this.lines = lines;
    this.onClick = onClick;
    this.g = g;
    this.curvature = curvature;
    this.points.push(EditorPoint.newPoint(Cx.makeNew(0), false,
        {
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
  clickButton(buttonID:string):void {
    switch (buttonID) {
      case 'addPoint':
        this.onClick = 'addPoint';
        this.cursorGrabsNewPoint(cursorPointStyle);
        break;
      case 'addEdge':
        this.onClick = 'addEdgeStart';
        this.cursorGrabsNewPoint(startingEdgeStyle);
        break;
    }
  }

  /**
 * Creates a new point and makes it follow cursor
 * @param style the style of new point
 * @returns void
 */
  cursorGrabsNewPoint(style:editorStyle):void {
    const pointer = EditorPoint.newPoint(this.g.mousePosCx, true, style);
    this.points.push(pointer);
  }

  /**
 * Does an action that depends on this.onClick
 * @returns void
  */
  click():void {
    switch (this.onClick) {
      case 'none':
        this.selectPointByClick();
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
      v1 = this.points[clickedPoint];
    } else {
      v1 = this.cursor;
      v1.pointer = false;
      this.cursorGrabsNewPoint(endingEdgeStyle);
    }
    v1.style = pointStyle;
    const v2 = this.cursor;
    this.lines.push(EditorEdge.fromEndPoints(v1, v2, this));
    this.onClick = 'addEdgeEnd';
  }

  /**
 * Drops the current point in place
 * @returns none
 */
  endEdgeAtCursor():void {
    if (!this.cursor) {
      throw new Error('There is no cursor!');
    }
    const clickedPoint = this.findClicked('point');
    if (clickedPoint > -1) {
      this.reattachEdges(this.cursor, this.points[clickedPoint]);
      this.deleteCursor();
    } else {
      this.cursor.style = pointStyle;
      this.cursor.pointer = false;
    }
    this.onClick = 'none';
  }

  /**
 *
 * @param oldV a vertex
 * @param newV another vertex
 * @returns void
 * Every edge that has endpoint oldv is reassigned to newV
 */
  reattachEdges(oldV:EditorPoint, newV:EditorPoint):void {
    const edges = this.findEdgesByVertex(oldV);
    edges.forEach(({index: i, start: start}) => {
      const e = this.lines[i];
      if (start) {
        e.start = newV;
      } else {
        e.end = newV;
      }
    });
  }

  /**
 * @param v a vertex
 * @returns [i1, i2..] the list of indices of the edges
 * that have v as a vertex
 */
  findEdgesByVertex(v:EditorPoint):{index:number, start:boolean}[] {
    const returnList = [] as {index:number, start:boolean}[];
    this.lines.forEach((o, i) => {
      if (o instanceof EditorEdge) {
        if (o.start == v) {
          returnList.push({index: i, start: true});
        }
        if (o.end == v) {
          returnList.push({index: i, start: false});
        }
      }
    });
    return returnList;
  }

  /**
 *
 * @param type are we looking for just points/edges or any
 * @returns the index of the first object that is clicked, or -1
 */
  findClicked(type:'point'|'edge'):number {
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
  get cursor():EditorObject|undefined {
    return this.points.filter((a) => a.pointer)[0];
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
    } else {
      throw new Error('Tried to make a point but the cursor doesn\'t exist');
    }
  }

  /**
 * Runs through the objects to see which ones
 * are clicked and takes action accordingly
 * @returns void
 */
  selectPointByClick():void {
    const clicked = this.findClicked('point');
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
    const clickedObject = this.points[i];
    // remove the pointer
    this.deleteCursor();
    clickedObject.pointer = true;
    clickedObject.style = cursorPointStyle;
  }

  /**
   * @returns void. Deletes the cursor point
   */
  deleteCursor():void {
    this.points = this.points.filter((o) => !o.pointer);
  }

  /**
   * adds a point at position t
   * @param pos position
   * @param color color (#ffffff)
   * @returns void
   */
  createPoint(pos:Cx, color:string):void {
    this.points.push(EditorPoint.newPoint(pos));
  }

  /**
   *
   * @param g g
   * @param curvature curvature
   * @returns a new instance of Editor
   */
  static start(g:GameStatus, curvature: number):Editor {
    return new Editor([], [], 'none', g, curvature);
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
    } );
  }
}

interface editorStyle {
    color:string,
    radius:number,
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
   * @param {EditorPoint} start starting vertex
   * @param {EditorPoint} end ending vertex
   */
  constructor(pos:Cx, style:editorStyle, pointer:boolean,
      start:EditorPoint, end:EditorPoint) {
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
      {curvature: curvature}:{curvature:number},
      style?:editorStyle):EditorEdge {
    if (!style) {
      style = lineStyle;
    }
    return new EditorEdge(Cx.infty(), style, false, v1, v2);
  }
}
