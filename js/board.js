class Board {
  constructor() {
    let btmSp = 20;
    this.boardHeight = width;
    this.boardWidth = width;
    this.shelfPos = new p5.Vector(btmSp / 2, this.boardHeight + btmSp / 2);
    this.shelfWidth = this.boardWidth - btmSp;
    this.shelfHeight = height - this.boardHeight - btmSp;
    this.shelfColour = "#50a186";
  }

  drawBoard() {
    let w = this.boardWidth / 4;
    let h = this.boardHeight / 4;

    strokeWeight(5);
    stroke("white");

    // Draw grid
    line(w, 0, w, this.boardHeight);
    line(w * 2, 0, w * 2, this.boardHeight);
    line(w * 3, 0, w * 3, this.boardHeight);
    line(0, h, this.boardWidth, h);
    line(0, h * 2, this.boardWidth, h * 2);
    line(0, h * 3, this.boardWidth, h * 3);

    // Draw shelf
    // console.log("drawing shelf...", this);
    push();
    // noStroke();
    fill("#50a186");
    rect(this.shelfPos.x, this.shelfPos.y, this.shelfWidth, this.shelfHeight);
    pop();
  }
}
