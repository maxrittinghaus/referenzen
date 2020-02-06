import * as PIXI from 'pixi.js-legacy'
import EShipDirection from '@enum/EShipDirections';
import EShipState     from '@enum/EShipState';
import EFieldState     from '@enum/EFieldState';
import {EventEmitter} from 'events';

export default class Ship extends EventEmitter{

  constructor(x, y, length, field, direction, state) {
    super();
    this._x = x;
    this._y = y;
    this._length = length;
    this._direction = direction || EShipDirection.HORIZONTAL;
    this._state = state || EShipState.HIDDEN;
    this.hits = [];
    
    this.field = field;

    this.offsetX = 0;
    this.offsetY = 0;

    this._isMoving = false;
    this._isRotating = false;

    this.rect = new PIXI.Graphics();
    this.rect.interactive = true;

    this.field.app.stage.addChild(this.rect);
    
    this._isPlaced = true;

    this.initEvents();

    this.updateRect();
    this.backup();

  }

  initEvents() {
     this.rect.on('rightdown', (e) => {
       if(this._isRotating || this.field.state !== EFieldState.EDITABLE) return;
       this.backup();
       this._isRotating = true;
     })
    
    this.rect.on('rightup', (e) => {
      if (this.isMoving || !this.isPlaced || !this._isRotating || this.field.state !== EFieldState.EDITABLE) return;
      
      const {x: mouseX, y: mouseY} = e.data.getLocalPosition(
          this.field.app.stage);
          
      let offsetX = Math.floor((mouseX - this.canvasX) / this.field.cellWidth);
      let offsetY = Math.floor(
          (mouseY - this.canvasY) / this.field.cellHeight);
      
      this.direction = this._direction === EShipDirection.HORIZONTAL
          ? EShipDirection.VERTICAL
          : EShipDirection.HORIZONTAL;
          
      if(this._direction === EShipDirection.HORIZONTAL) {
        this.x -= offsetY;
        this.y += offsetY;
      } else {
        this.x += offsetX;
        this.y -= offsetX;
      }
      
      this.x = this.adjustX(this.x);
      this.y = this.adjustY(this.y);
      
      this.emit('stateChanged', () => this.revert());
      
      this._isRotating = false;
    });

    this.rect.on('shipmove', (e) => {
      if (!this.isMoving || !this.isPlaced || this.field.state !== EFieldState.EDITABLE) return;
      let newX = this.adjustX(Math.floor(e.clientX / this.field.cellWidth) - this.offsetX);
      let newY = this.adjustY(Math.floor(e.clientY / this.field.cellHeight) - this.offsetY);
      
      this.emit('drag');
      
      this.x = newX;
      this.y = newY;
    });

    this.rect.on('mousedown', (e) => {
      if (this.isMoving || !this.isPlaced || this.field.state !== EFieldState.EDITABLE) return;
      this.backup();
      this.bringToFront();
      this.isMoving = true;

      const {x: mouseX, y: mouseY} = e.data.getLocalPosition(
          this.field.app.stage);
          
      this.offsetX = Math.floor((mouseX - this.canvasX) / this.field.cellWidth);
      this.offsetY = Math.floor((mouseY - this.canvasY) / this.field.cellHeight);
    });

    this.rect.on('mouseup', () => {
      if (!this.isMoving || !this.isPlaced || this.field.state !== EFieldState.EDITABLE) return;
      this.offsetX = 0;
      this.offsetY = 0;
      this.emit('stateChanged', () => this.revert());
      this.isMoving = false;

    });

    this.rect.on('mouseupoutside', () => {
      if (!this.isMoving || !this.isPlaced || this.field.state !== EFieldState.EDITABLE) return;
      this.offsetX = 0;
      this.offsetY = 0;
      this.emit('stateChanged', () => this.revert());
      this.isMoving = false;
    });
  }
  
  adjustX(x) {
    if (x < 0) x = 0;
      else if (x > this.field.cols - this.width) x = this.field.cols -
          this.width;
    return x;      
  }
  
  adjustY(y) {
    if (y < 0) y = 0;
       else if (y > this.field.rows - this.height) y = this.field.rows -
          this.height;
    return y;      
  }
  
  
  
  bringToFront() {
    if(this.rect.parent) {
      let parent = this.rect.parent;
      parent.removeChild(this.rect);
      parent.addChild(this.rect);
    }
  }
  
  backup() {
    this._backup = {
      x: this._x,
      y: this._y,
      direction: this._direction,
    }
  }
  
  revert() {
    this.x = this._backup.x;
    this.y = this._backup.y;
    this.direction = this._backup.direction;
  }
  
  updateRect() {
    this.rect.clear();
    
    if(this.state === EShipState.HIDDEN || !this.isPlaced) return;
    if(this.field.state === EFieldState.ENEMY && !this.isDestroyed()) return;
    
    if(this.state === EShipState.INVALID || this.isDestroyed()) {
      this.rect.beginFill(0xf5365c);  
    } else if(this.state === EShipState.SHOWN) {
      this.rect.beginFill(0x5e72e4);  
    }
    
    this.rect.alpha = this.isMoving ? .8 : 1;
    
    if(this.field.state === EFieldState.PLAYER) this.rect.alpha = .5;

    let rectOptions = [
      this.canvasX,
      this.canvasY,
      this.canvasWidth,
      this.canvasHeight,
      ];
    this.rect.drawRect(...rectOptions);
  }
  
  getCutBoundaries(allowTouching) {
    allowTouching = (!allowTouching) ? 0.5 : 0;

    return {
      x: this.x - allowTouching,
      y: this.y - allowTouching,
      width:  this.width + allowTouching * 2 - 1,
      height: this.height + allowTouching * 2 - 1,
    }
  }

  cuts(ship, allowTouching) {
    allowTouching = allowTouching || false;

    let ship1 = this.getCutBoundaries(allowTouching);
    let ship2 = ship.getCutBoundaries(allowTouching);

    return (
      ship1.x <= ship2.x + ship2.width  &&
      ship2.x <= ship1.x + ship1.width  &&
      ship1.y <= ship2.y + ship2.height &&
      ship2.y <= ship1.y + ship1.height
    );
  }

 isOutOfBoundaries() {
    return (
      this.x < 0 ||
      this.x + this.width > this.field.cols ||
      this.y < 0 ||
      this.y + this.height > this.field.rows
      );
  }
  
  isDestroyed() {
    let ship = this.getCutBoundaries(true);
    for(let y = ship.y; y <= ship.y + ship.height; y++) {
      for(let x = ship.x; x <= ship.x + ship.width; x++) {
        if(this.hits.filter(hit => hit.x === x && hit.y === y).length === 0) {
          return false;
        }
      } 
    }
    return true;
  }
  
  isHit(x,y, includeHits) {
    includeHits = includeHits || false;

    let ship = this.getCutBoundaries(false);

    if(ship.x <= x  && x <= ship.x + ship.width  &&
        ship.y <= y && y <= ship.y + ship.height) {

      if(this.hits.filter(hit => hit.x === x && hit.y === y).length) {
        return includeHits;
      }

      return true;
    }

    return false;
  }

  hit(x, y) {
    if(this.hits.filter(hit => hit.x === x && hit.y === y).length) {
      return false;
    }

    if(!this.isHit(x, y)) {
      return false;
    }

    this.hits.push({x,y});
    this.updateRect();
    return true;
  }

  set x(val) {
    this._x = val;
    this.updateRect();
  }

  set y(val) {
    this._y = val;
    this.updateRect();
  }
  
  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  set length(val) {
    this._length = val;
    this.updateRect();
  }

  set direction(val) {
    this._direction = val;
    this.updateRect();
  }
  
  get direction() {
    return this._direction;
  }
  
  get canvasX() {
      return this.field.cellWidth * this._x
  }

  get canvasY() {
      return this.field.cellHeight * this._y
  }
  
  get canvasWidth() {
      return this.field.cellWidth * this.width
  }

  get canvasHeight() {
      return  this.field.cellHeight * this.height
  }

  get width() {
    return this._direction === EShipDirection.HORIZONTAL ? this._length : 1;
  }

  get height() {
    return this._direction === EShipDirection.VERTICAL ? this._length : 1;
  }
  
  set isMoving(val) {
    this._isMoving = val;
    this.updateRect();
  }
  
  get isMoving() {
    return this._isMoving;
  }
  
  set state(val) {
    this._state = val;
    this.updateRect();
  }
  
  get state() {
    return this._state;
  }
  
  set isPlaced(val) {
    this._isPlaced = val;
    this.updateRect();
  }
  
  get isPlaced() {
    return this._isPlaced;
  }
  
}