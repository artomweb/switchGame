class Piece {
    constructor(x, y, topColour, bottomColour, justFlipped, hasFlipped) {
        this.pos = new p5.Vector(x, y);
        this.originalPos = new p5.Vector(x, y);
        this.topColour = topColour;
        this.bottomColour = bottomColour;
        this.r = 120;
        this.justFlipped = justFlipped;
        this.hasFlipped = hasFlipped;
    }

    drawPiece() {
        push();
        fill("white");
        circle(this.pos.x, this.pos.y, this.r);
        let { i, j } = getBoardCoords(this.pos.x, this.pos.y);
        if ((i === 4 && (j === 0 || j === 1)) || this.justFlipped) {
            fill(this.topColour);
            arc(this.pos.x, this.pos.y, this.r - this.r / 5, this.r - this.r / 5, 3 * HALF_PI, HALF_PI);
            fill(this.bottomColour);
            arc(this.pos.x, this.pos.y, this.r - this.r / 5, this.r - this.r / 5, -3 * HALF_PI, -HALF_PI);
            push();
            stroke("black");
            let lineWeight = 5;
            strokeWeight(lineWeight);
            line(this.pos.x, this.pos.y - (this.r / 2 - this.r / 10) + lineWeight, this.pos.x, this.pos.y + this.r - (this.r / 2 + this.r / 10) - lineWeight);
            pop();
        } else {
            fill(this.topColour);
            circle(this.pos.x, this.pos.y, this.r - this.r / 5);
        }
        pop();
    }
}