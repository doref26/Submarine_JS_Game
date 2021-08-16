class Submarine {
    constructor(subNum) {
        this.Coords = new Array();
        this.Alive = true;
        this.ID = subNum;
        this.Hits = 0;
    }

    takeHit(target) {
        this.Hits++;
        if (target == PLR) {
            Game.sendAlert("Player Took a Hit", "red");
        }
        else {
            Game.sendAlert("Computer Took a Hit", "orange");
        }
        if (this.Hits == this.getCoords().length) {

            var ID = this.getID();
            if (target == CPU) {
                Game.sendAlert("Computer's Sub #" + ID + " is destroyed!", "green");
            }
            else {
                Game.sendAlert("Player's Sub #" + ID + " is destroyed!", "darkred");
            }
            document.getElementById("alertBox").style.animation = "shake 0.3s";
            setTimeout( function() { document.getElementById("alertBox").style.animation = ""; }, 300 );
            this.Destroy();
            Game.destroyedSubs[target]++;
            Game.updateRemainingSubs();
        }
    }

    addCoords(y, x) {
        this.Coords[this.Coords.length] = "[" + y + "_" + x + "]";
    }

    getCoords() {
        return this.Coords;
    }

    getRandomCoord() {
        let RandomCoordID = Math.floor(Math.random() * this.getCoords().length);
        return this.getCoords()[RandomCoordID].split("_");
    }

    isAlive() {
        return this.Alive;
    }

    Destroy() {
        this.Alive = false;
    }

    getID() {
        return this.ID;
    }
}