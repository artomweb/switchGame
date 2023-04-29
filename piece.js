class Piece {
  constructor(x, y, topColour, bottomColour, shelfPiece) {
    this.pos = new p5.Vector(x, y);
    this.originalPos = new p5.Vector(x, y);
    this.topColour = topColour;
    this.bottomColour = bottomColour;
    // this.owner = allServerData.yourID;
    this.isShelfPiece = shelfPiece;
    this.r = 120;
  }

  drawPiece() {
    push();
    fill("white");
    circle(this.pos.x, this.pos.y, this.r);
    if (this.isShelfPiece) {
      fill(this.topColour);
      arc(this.pos.x, this.pos.y, this.r - this.r / 5, this.r - this.r / 5, 3 * HALF_PI, HALF_PI);
      fill(this.bottomColour);
      arc(this.pos.x, this.pos.y, this.r - this.r / 5, this.r - this.r / 5, -3 * HALF_PI, -HALF_PI);
    } else {
      fill(this.topColour);
      circle(this.pos.x, this.pos.y, this.r - this.r / 5);
    }
    pop();
  }
}
