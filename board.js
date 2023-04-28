class Board {
  constructor() {
    this.boardHeight = width;
    this.boardWidth = width;
    this.btmSp = 20;
    this.orangeColour = "#ec8e45";
    this.greenColour = "#50a186";
    this.shelfPos = new p5.Vector(this.btmSp / 2, this.boardHeight + this.btmSp / 2);
    this.shelfWidth = this.boardWidth - this.btmSp;
    this.shelfHeight = height - this.boardHeight - this.btmSp;
    this.state = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
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
    push();
    // noStroke();
    fill("#217359");
    rect(this.shelfPos.x, this.shelfPos.y, this.shelfWidth, this.shelfHeight);
    pop();
  }
}
