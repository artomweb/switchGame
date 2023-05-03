class Piece {
    constructor(x, y, topColour, bottomColour, shelfPiece, justFlipped) {
        this.pos = new p5.Vector(x, y);
        this.originalPos = new p5.Vector(x, y);
        this.topColour = topColour;
        this.bottomColour = bottomColour;
        this.isShelfPiece = shelfPiece;
        this.r = 120;
        this.justFlipped = justFlipped;
    }

    drawPiece(flashItt) {
        push();
        fill("white");
        circle(this.pos.x, this.pos.y, this.r);
        if (this.isShelfPiece) {
            fill(this.topColour);
            arc(this.pos.x, this.pos.y, this.r - this.r / 5, this.r - this.r / 5, 3 * HALF_PI, HALF_PI);
            fill(this.bottomColour);
            arc(this.pos.x, this.pos.y, this.r - this.r / 5, this.r - this.r / 5, -3 * HALF_PI, -HALF_PI);
        } else {
            if (this.justFlipped) {
                let from, to, t;
                if (flashItt < 25) {
                    t = map(flashItt, 0, 25, 0, 1);
                    from = color(this.topColour);

                    to = color("white");
                } else if (flashItt < 50) {
                    t = map(flashItt, 25, 50, 0, 1);

                    from = color("white");

                    to = color(this.bottomColour);
                } else if (flashItt < 75) {
                    t = map(flashItt, 50, 75, 0, 1);
                    from = color(this.bottomColour);
                    to = color("white");
                } else if (flashItt < 100) {
                    t = map(flashItt, 75, 100, 0, 1);
                    from = color("white");

                    to = color(this.topColour);
                }

                let c = lerpColor(from, to, t);
                console.log(from.levels, to.levels, flashItt, t, c.levels);
                fill(c);
            } else {
                fill(this.topColour);
            }

            circle(this.pos.x, this.pos.y, this.r - this.r / 5);
        }
        pop();
    }
}