import * as PIXI from 'pixi.js-legacy'
import Ship from './Ship';
import EShipDirections from '@enum/EShipDirections';
import EShipState from '@enum/EShipState';
import EFieldState from '@enum/EFieldState';
import {EventEmitter} from 'events';

export default class Field extends EventEmitter{

  constructor(elem, rows, cols, state) {
    super();
    this.elem = elem;
    this.cols = cols || 10;
    this.rows = rows || 10;
    this.state = state || EFieldState.EDITABLE;
    
    this.app = new PIXI.Application({
      view: elem,
      transparent: true,
      height: elem.clientHeight,
      width: elem.clientWidth,
      forceCanvas: true,
    });
    
    
    this.ships = [];
    this.shoots = [];
    this.allowTouching = false;
    this.canShoot = true;
    this._displayGrid = true;
    

    this.grid = new PIXI.Graphics();
    this.app.stage.addChild(this.grid);
    this.shootLayer = new PIXI.Graphics();
    this.app.stage.addChild(this.shootLayer);
    
    // Add ships to field
    [[5, 1],[4, 2],[3, 3],[2, 4]].forEach(([length, amount]) => {
      for(let i = 0; i < amount; i++) {
        this.ships.push(new Ship(0, 0, length, this, EShipDirections.VERTICAL, EShipState.SHOWN));    
      }  
    })
    this.randomizeShips();

    this.initEvents();
    this.renderGrid();
    this.render();
  }

  initEvents() {
    this.app.view.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      let {x: offsetX, y: offsetY} = this.app.renderer.view.getBoundingClientRect();
      this.ships.filter(s => s.isMoving).
          forEach(s => s.rect.emit('shipmove', {clientX:  e.clientX - offsetX, clientY: e.clientY - offsetY}));
    });
    
    this.app.view.addEventListener('mouseup', e => {
      if(!this.canShoot || this.state !== EFieldState.ENEMY) return;
      
      let {x: offsetX, y: offsetY} = this.app.renderer.view.getBoundingClientRect();
      let x = Math.floor((e.clientX - offsetX) / this.cellWidth);
      let y = Math.floor((e.clientY - offsetY) / this.cellHeight);
      
      this.shoot(x,y);
    });

    this.ships.forEach(ship => {
      ship.on('stateChanged', revert => {
        if (this.cutsAny(ship, this.allowTouching)) {
          revert();
          ship.state = EShipState.SHOWN;
        }
      });
    });

    this.ships.forEach(ship => {
      ship.on('drag', revert => {
        ship.state = this.cutsAny(ship, this.allowTouching) ? EShipState.INVALID : EShipState.SHOWN;
      });
    });
    
  }
  
  handleResize() {
    this.app.renderer.resize(this.elem.clientWidth, this.elem.clientHeight);
    this.renderGrid();
    this.rendershoots();
    this.ships.forEach(ship => ship.updateRect());
  }
  
  botHit() {
    let possibleHits = [];
    
    const getShotsOnCoord = (x,y) => this.shoots.filter(({x: sX, y: sY}) => (sX === x && sY === y));
      
    const addToPossibleShots = ({x,y}) => {
        if(!getShotsOnCoord(x, y).length && x < this.cols && x >= 0 && y >= 0 && y < this.rows && !possibleHits.filter(({x: sX, y: sY}) => (sX === x && sY === y)).length) {
          possibleHits.push({x,y});
        }
    };
    
    this.shoots.filter(s => s.isHit && !s.isDestroyed).forEach(({x, y}) => {
        let direction = null;
        
        if(!this.allowTouching) {
          if(getShotsOnCoord(x, y-1).filter(s => s.isHit).length || getShotsOnCoord(x, y+1).filter(s => s.isHit).length) {
            direction = EShipDirections.VERTICAL;
          } else if(getShotsOnCoord(x-1, y).filter(s => s.isHit).length || getShotsOnCoord(x+1, y).filter(s => s.isHit).length) {
            direction = EShipDirections.HORIZONTAL;
          }          
        }
        
        if(direction === null || direction === EShipDirections.VERTICAL) {
          addToPossibleShots({x, y: y-1});  // NORTH
          addToPossibleShots({x, y: y+1});  // SOUTH
        }
        
        if(direction === null || direction === EShipDirections.HORIZONTAL) {
          addToPossibleShots({x: x+1, y});  // EAST
          addToPossibleShots({x: x-1, y});  // WEST
        }
    });
    
    if(!possibleHits.length) {
      for(let iY = 0; iY < this.rows; iY++) {
       for(let iX = 0; iX < this.cols; iX++) {
        addToPossibleShots({x: iX, y: iY});
       } 
      }
    }
    
    if(possibleHits.length) {
      let selectedCoords = possibleHits[Math.floor(Math.random() * possibleHits.length)];
      this.shoot(selectedCoords.x, selectedCoords.y);
    }
  }
  
  
  shoot(x, y, destroyedShip) {
    if(this.shoots.filter(({x: sX, y: sY}) => (sX === x && sY === y)).length) return true;
      
      let isHit = false;
      for(let ship of this.ships) {
        isHit = ship.hit(x,y);
        
        if(isHit) {
         if(ship.isDestroyed()) {
           
           if(!this.allowTouching) {
             let cutBounds = ship.getCutBoundaries(false);
             
             cutBounds.x = Math.floor(cutBounds.x)
             cutBounds.y = Math.floor(cutBounds.y)
             cutBounds.width = Math.ceil(cutBounds.width);
             cutBounds.height = Math.ceil(cutBounds.height);
             
             
             for(let yy = cutBounds.y; yy <= cutBounds.y + cutBounds.height + 1; yy++) {
              for(let xx = cutBounds.x; xx <= cutBounds.x + cutBounds.width + 1; xx++) {
               this.shoot(Math.floor(xx),Math.floor(yy), true);
              } 
             }
           }
           
              let cutBounds = ship.getCutBoundaries(true);
              for(let yy = cutBounds.y; yy < cutBounds.y + cutBounds.height + 1; yy++) {
                for(let xx = cutBounds.x; xx < cutBounds.x + cutBounds.width + 1; xx++) {
                 this.markAsDestroyed(xx,yy);
                } 
             }
         }
         
         break; 
        }
      }
      
     if(destroyedShip !== true)
        this.emit(isHit ? 'hit' : 'miss');
   
      
      this.shoots.push({
          x,
          y,
          isHit,
          isDestroyed: false,
      });
        
      this.rendershoots();
      
      return isHit;
  }
  
  areAllShipsDestroyed() {
    return this.ships.filter(s => !s.isDestroyed()).length === 0;
  }

  renderGrid() {
    const gridThickness = 1;
    const gridColor = 0x00000;

    this.grid.clear();

    if (!this._displayGrid) return;

    this.grid.lineStyle(gridThickness, gridColor);

    // Vertical
    for (let i = this.app.renderer.width / this.cols - (gridThickness / 2); i <
    this.app.renderer.width - this.app.renderer.width /
    this.cols; i += this.app.renderer.width / this.cols) {
      this.grid.moveTo(i, 0);
      this.grid.lineTo(i, this.app.renderer.height);
    }

    // Horizontal
    for (let i = this.app.renderer.height / this.rows - (gridThickness / 2); i <
    this.app.renderer.height - this.app.renderer.height /
    this.rows; i += this.app.renderer.height / this.rows) {
      this.grid.moveTo(0, i);
      this.grid.lineTo(this.app.renderer.width, i);
    }

    this.grid.alpha = 0.1;

  }
  
  rendershoots() {
     this.shootLayer.clear();
     
     this.shoots.forEach(shoot => {
      this.shootLayer.lineStyle(2,shoot.isHit ? 0xf5365c : 0x5e72e4);
      this.shootLayer.moveTo(shoot.x * this.cellWidth + 10, shoot.y * this.cellHeight + 10);
      this.shootLayer.lineTo(shoot.x * this.cellWidth + this.cellWidth - 10, shoot.y * this.cellHeight + this.cellHeight - 10);
      this.shootLayer.moveTo(shoot.x * this.cellWidth + 10, shoot.y * this.cellHeight + this.cellHeight - 10);
      this.shootLayer.lineTo(shoot.x * this.cellWidth + this.cellWidth - 10, shoot.y * this.cellHeight + 10);
     });
  }

  render() {
    this.app.ticker.add(time => {
      this.app.renderer.render(this.app.stage);
    });
  }
  
  markAsDestroyed(x,y) {
    for(let i = 0; i < this.shoots.length; i++) {
      if(this.shoots[i].x === x && this.shoots[i].y === y) {
        this.shoots[i].isDestroyed = true;
        return;
      }
    }
    
  }

  randomizeShips() {
    this.ships.forEach(s => s.isPlaced = false);
    this.ships.forEach(ship => {
      let possiblePlacements = this.getPossiblePlacements(ship);
      if(possiblePlacements.length === 0) return;
      let selectedPosition = possiblePlacements[Math.floor(
          Math.random() * possiblePlacements.length)];
      
          
      ship.x = selectedPosition.x;
      ship.y = selectedPosition.y;
      ship.direction = selectedPosition.direction;
      ship.isPlaced = true;
    });
  }

  getPossiblePlacements(ship) {
    let possiblePlacements = [];  // {pos: {x,y}, direction: EShipDirection}

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        ship.x = x;
        ship.y = y;

        ship.direction = EShipDirections.HORIZONTAL;
        if (!this.cutsAny(ship,this.allowTouching,s => s.isPlaced) &&
            !ship.isOutOfBoundaries()) {
          possiblePlacements.push({x, y, direction: ship.direction});
        }

        ship.direction = EShipDirections.VERTICAL;
        if (!this.cutsAny(ship,this.allowTouching, s => s.isPlaced) &&
            !ship.isOutOfBoundaries()) {
          possiblePlacements.push({x, y, direction: ship.direction});
        }
      }
    }

    return possiblePlacements;
  }

  cutsAny(ship, allowTouching, filter) {
    filter = filter || (() => true);
    
    let ret = false;
    
    this.ships.filter(s => s !== ship).filter(filter).forEach(s => {
      if (s.cuts(ship, allowTouching)) {
        ret = true;
      }
    });
    return ret;
  }

  get cellHeight() {
    return this.app.renderer.height / this.rows;
  }

  get cellWidth() {
    return this.app.renderer.width / this.cols;
  }
  
  set displayGrid(val) {
    this._displayGrid = val;
    this.renderGrid();
  }
  
  get displayGrid() {
    return this._displayGrid;
  }
  

}
