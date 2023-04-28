class Piece {
  constructor(x, y, topColour, bottomColour) {
    this.pos = new p5.Vector(x, y);
    this.originalPos = new p5.Vector(x, y);
    this.topColour = topColour;
    this.bottomColour = bottomColour;
    this.boardCoord = 0;
    this.r = 120;
  }

  drawPiece() {
    push();
    fill("white");
    circle(this.pos.x, this.pos.y, this.r);
    if (this.boardCoord !== 0) {
      fill(this.topColour);
      circle(this.pos.x, this.pos.y, this.r - this.r / 5);
    } else {
      fill(this.topColour);
      arc(this.pos.x, this.pos.y, this.r - this.r / 5, this.r - this.r / 5, 3 * HALF_PI, HALF_PI);
      fill(this.bottomColour);
      arc(this.pos.x, this.pos.y, this.r - this.r / 5, this.r - this.r / 5, -3 * HALF_PI, -HALF_PI);
      pop();
    }
  }
}
