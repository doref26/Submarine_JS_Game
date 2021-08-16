
class Board {
    constructor(height, width) {
        this.Grid = new Array(height);
        this.Icons = new Array(height);
        this.totalSubs = new Array();
        this.boardSize = {
            "height": height,
            "width": width,
        };
        this.validBoard = true;

        for (let y = 0; y < height; y++) {
            this.Grid[y] = new Array(width);
            this.Icons[y] = new Array(width);
            for (let x = 0; x < width; x++) {
                this.Grid[y][x] = null;
                this.Icons[y][x] = "";
            }
        }

        for (let i = 0, placedSubsPerRun = 0, failedLoops = 0; i < subTypes.length; i++, placedSubsPerRun = 0) {
            // fail-safe check
            if (failedLoops > MAX_RUN_LOOPS) {
                this.validBoard = false;
                break;
            }

            var amount = subTypes[i].amount;
            while (placedSubsPerRun < amount) {
                // fail-safe check
                if (failedLoops > MAX_RUN_LOOPS) {
                    this.validBoard = false;
                    break;
                }
                var cellX = Math.floor(Math.random() * width);
                var cellY = Math.floor(Math.random() * height);

                if (this.Grid[cellY][cellX]) {
                    failedLoops++;
                    continue;
                }

                // randomize direction
                var direction = Math.floor(Math.random() * 2);
                if (direction < 1) // left to right
                {
                    if (cellX + subTypes[i].size >= width) {
                        // increase error counter if not fit
                        failedLoops++;
                        continue;
                    }

                    for (var valid = 1, sizeItr = 1; sizeItr < subTypes[i].size; sizeItr++) {
                        if (this.Grid[cellY][cellX + sizeItr]) {
                            // increase error counter
                            failedLoops++;
                            continue;
                        }
                        // if pass check, increase the valid cells count by 1
                        valid++;
                    }

                    if (valid < subTypes[i].size) {
                        // increase error counter
                        failedLoops++;
                        continue;
                    }

                    let newSub = new Submarine(this.totalSubs.length);
                    for (let i = 0; i < valid; i++) {
                        newSub.addCoords(cellY, (cellX + i));
                        this.Grid[cellY][cellX + i] = newSub;
                        if (i == 0)
                            this.Icons[cellY][cellX] = "start_to_side"
                        else if (i == (valid - 1))
                            this.Icons[cellY][cellX + i] = "end_to_side"
                        else
                            this.Icons[cellY][cellX + i] = "mid_to_side"
                    }
                    this.totalSubs[this.totalSubs.length] = newSub;
                } else {                               // top to bottom
                    if (cellY + subTypes[i].size >= height) {
                        // increase error counter
                        failedLoops++;
                        continue;
                    }

                    let valid = 1
                    for (let sizeItr = 1; sizeItr < subTypes[i].size; sizeItr++) {

                        if (this.Grid[cellY + sizeItr][cellX]) {
                            // increase error counter
                            failedLoops++;
                            continue;
                        }

                        valid++;
                    }

                    if (valid < subTypes[i].size) {
                        // increase error counter
                        failedLoops++;
                        continue;
                    }

                    let newSub = new Submarine(this.totalSubs.length);
                    for (let i = 0; i < valid; i++) {
                        newSub.addCoords((cellY + i), cellX);
                        this.Grid[cellY + i][cellX] = newSub;
                        if (i == 0)
                            this.Icons[cellY][cellX] = "end_to_bottom"
                        else if (i == (valid - 1))
                            this.Icons[cellY + i][cellX] = "start_to_bottom"
                        else
                            this.Icons[cellY + i][cellX] = "mid_to_bottom"
                    }
                    this.totalSubs[this.totalSubs.length] = newSub;
                }
                placedSubsPerRun++;
            }
        }
    }

    getGrid() {
        return this.Grid;
    }

}