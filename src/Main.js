
class Main {
    constructor(height, width) {
        this.alerts = new Array(3);
        this.sendAlert("");
        this.valid_h = parseInt(height, 10); 
        if (isNaN(this.valid_h)) {
            console.error("Invalid board height, please enter a numerical value!");
            this.sendAlert("Invalid board height, please enter a numerical value!");
            return;
        }
        if (this.valid_h > MAX_HEIGHT) this.valid_h = 20;
        if (this.valid_h < MIN_HEIGHT) this.valid_h = 10;
        this.valid_w = parseInt(width, 10);
        if (isNaN(this.valid_w)) {
            console.error("Invalid board width, please enter a numerical value!");
            this.sendAlert("Invalid board width, please enter a numerical value!");
            return;
        }
        if (this.valid_w > MAX_WIDTH) this.valid_w = 20;
        if (this.valid_w < MIN_WIDTH) this.valid_w = 10;

        this.setLevel();
        this.Boards = new Array(2);
        this.Boards[PLR] = new Board(this.valid_h, this.valid_w);
        this.Boards[CPU] = new Board(this.valid_h, this.valid_w);

        this.destroyedSubs = new Array(2);
        this.destroyedSubs[PLR] = 0;
        this.destroyedSubs[CPU] = 0;
        this.TargetsHistory = new Array(2);
        this.TargetsHistory[PLR] = [];
        this.TargetsHistory[CPU] = [];
        this.Accuracy = new Array(2);
        this.Accuracy[PLR] = 0;
        this.Accuracy[CPU] = 0;
        this.cpuAITarget = [
            false,                                                                     
            Math.floor(Math.random() * this.Boards[PLR].boardSize["height"]),         
            Math.floor(Math.random() * this.Boards[PLR].boardSize["width"]),          
            false,                                                        
            0                                                                        
        ];
        this.cheatState = false;
        if (this.Boards[PLR].validBoard == false || this.Boards[CPU].validBoard == false) {
            this.sendAlert("Board creation failed");
            return;
        }

        this.gameRunning = false;
        this.RenderBoards();
        this.updateRemainingSubs();
        this.updateAccuracy();
        if( BRUTAL_DISABLE_CHEAT )
            document.getElementById("cheatBtn").disabled = true;
    }

    setLevel() {
        BRUTAL_DISABLE_CHEAT = false;
        switch (document.getElementById('level').value) {
            case EASY: {
                CPU_AI              = false;
            }
                break;
            case MEDIUM: {
                CPU_AI              = true;
                AI_TYPE             = BASIC;
            }
                break;
            case HARD: {
                CPU_AI              = true;
                AI_TYPE             = ADVANCED;
            }
                break;
            case BRUTAL: {
                CPU_AI              = true;
                AI_TYPE             = DATASEEK;
                BRUTAL_DISABLE_CHEAT= true;
            }
                break;
        }

    }

    Cheat() {
        let keyword = "";
        if (!this.cheatState) {
            keyword = "sub_marker";
            this.cheatState = true;
        } else {
            keyword = "";
            this.cheatState = false;
        }

        for (let y = 0; y < this.valid_h; y++) {

            for (let x = 0; x < this.valid_w; x++) {

                if (this.Boards[CPU].getGrid()[y][x] && document.getElementById("1_cell_[" + y + "_" + x + "]").className != "clicksub")
                    document.getElementById("1_cell_[" + y + "_" + x + "]").className = keyword;
            }
        }
    }

    Attack(y, x, target = CPU) {
        var cellClassName = document.getElementById(target + "_cell_[" + y + "_" + x + "]").className;
        if (cellClassName == "clicksub" || cellClassName == "clicknonsub") {
            if (target == CPU) {
                console.warn("You already attacked this cell!");
                this.sendAlert("You already attacked this cell!");
                return;
            } else {
                console.warn("CPU Attack ERROR!");
                if (this.cpuAITarget[USE_AI] == true)
                    this.cpuAITarget[USE_AI] = false;
                else
                    return;
            }
        }
        // if there is a sub in the y,x coords
        var getGrid = this.Boards[target].getGrid();
        if (getGrid[y][x]) {
            // change the color to red
            document.getElementById(target + "_cell_[" + y + "_" + x + "]").className = "clicksub";
            getGrid[y][x].takeHit(target);
            if (target == CPU) {
                this.Accuracy[PLR]++;
            }
            else {
                this.Accuracy[CPU]++;
            }
            if (!getGrid[y][x].isAlive()) {
                if (target == PLR && AI_TYPE != DATASEEK) {
                    this.cpuAITarget[USE_AI] = false;
                }

                if(!this.gameRunning)
                    return;

            } else {
                if (target == PLR && CPU_AI == true) {
                    this.cpuAITarget[USE_AI] = true;
                    this.cpuAITarget[TARGET_Y] = y;
                    this.cpuAITarget[TARGET_X] = x;
                    this.cpuAITarget[RAND_DIR] = false;
                    if (getGrid[y][x].Hits == 1) {
                        this.cpuAITarget[RAND_DIR] = true;
                        this.cpuAITarget[ATTEMPTS] = 0;
                    }
                }
            }
        } else {
            document.getElementById(target + "_cell_[" + y + "_" + x + "]").className = "clicknonsub";
        }

        // switch to computer's turn after the player attacks
        if (target == CPU) {
            this.TargetsHistory[PLR].push((y + "_" + x).toString());
            // look for a target for the cpu's next attack
            var failedLoops = 0;
            while (true) {
                var valid = true;
                var targetY = Math.floor(Math.random() * this.Boards[target].boardSize["height"]);
                var targetX = Math.floor(Math.random() * this.Boards[target].boardSize["width"]);
                if (this.cpuAITarget[USE_AI] == true && CPU_AI == true)
                {
                    switch (AI_TYPE) {
                        case BASIC: {
                            let Coords = this.getNearbyCoords(this.cpuAITarget[TARGET_Y], this.cpuAITarget[TARGET_X], target).split("_");
                            targetY = parseInt(Coords[0], 10);
                            targetX = parseInt(Coords[1], 10);
                            this.cpuAITarget[USE_AI] = false;
                        }
                            break;
                        case ADVANCED: {
                            let YXCoords;
                            if (this.cpuAITarget[RAND_DIR] == true || this.Boards[PLR].getGrid()[this.cpuAITarget[TARGET_Y]][this.cpuAITarget[TARGET_X]].Hits == 1) {
                                if (++this.cpuAITarget[ATTEMPTS] <= 3) {
                                    YXCoords = this.getNearbyCoords(this.cpuAITarget[TARGET_Y], this.cpuAITarget[TARGET_X], target).split("_");
                                    targetY = parseInt(YXCoords[0], 10);
                                    targetX = parseInt(YXCoords[1], 10);
                                } else {
                                    YXCoords = this.Boards[PLR].getGrid()[this.cpuAITarget[TARGET_Y]][this.cpuAITarget[TARGET_X]].getRandomCoord();
                                    targetY = parseInt(YXCoords[0].split("[")[1], 10);
                                    targetX = parseInt(YXCoords[1].split("]")[0], 10);
                                    this.cpuAITarget[RAND_DIR] = false;
                                }
                            } else {
                                if (this.Boards[PLR].getGrid()[this.cpuAITarget[TARGET_Y]][this.cpuAITarget[TARGET_X]] && this.Boards[PLR].getGrid()[this.cpuAITarget[TARGET_Y]][this.cpuAITarget[TARGET_X]].isAlive()) {
                                    YXCoords = this.Boards[PLR].getGrid()[this.cpuAITarget[TARGET_Y]][this.cpuAITarget[TARGET_X]].getRandomCoord();
                                    targetY = parseInt(YXCoords[0].split("[")[1], 10);
                                    targetX = parseInt(YXCoords[1].split("]")[0], 10);
                                } else this.cpuAITarget[USE_AI] = false;
                            }
                        }
                            break;
                        case DATASEEK: {
                            let seekTarget;
                            console.clear();
                            while (true) {
                                if (++failedLoops > MAX_RUN_LOOPS)
                                {
                                    console.warn("CPU DataSeek FAILED")
                                    break;
                                }
                                seekTarget  = this.Boards[PLR].totalSubs[Math.floor(Math.random() * this.Boards[PLR].totalSubs.length)];
                                if(!seekTarget.isAlive())
                                    continue;

                                let YXCoords    = seekTarget.getCoords();
                                YXCoords        = YXCoords[Math.floor(Math.random() * YXCoords.length)].split("_");
                                targetY = parseInt(YXCoords[0].split("[")[1], 10);
                                targetX = parseInt(YXCoords[1].split("]")[0], 10);
                                if(this.TargetsHistory[CPU].includes(targetY + "_" + targetX))
                                    continue;

                                console.log(targetY, targetX);
                                break;
                            }

                        }
                        break;
                    }
                }
                // seek a new target
                for (let i = 0; i < this.TargetsHistory[CPU].length; i++) {
                    if ((targetY + "_" + targetX).toString() == this.TargetsHistory[CPU][i]) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    this.TargetsHistory[CPU].push((targetY + "_" + targetX).toString());
                    this.Attack(targetY, targetX, PLR)
                    break;
                }

                // fail-safe check
                failedLoops++;
                if (failedLoops > MAX_RUN_LOOPS) {
                    console.warn("CPU's unable to acquire a target");
                    this.sendAlert("CPU's unable to acquire a target");
                    if (this.cpuAITarget[USE_AI] == true) {
                        console.warn("AI targeting error");
                        this.sendAlert("AI targeting error");
                        this.cpuAITarget[USE_AI] = false;
                        this.cpuAITarget[RAND_DIR] = false;
                    }
                    break;
                }

            }
        } else if( target == PLR ) {
            this.checkStatus();
        }
        this.updateAccuracy();
    }

    updateAccuracy()
    {
        let plr_acc = "";
        if( this.TargetsHistory[PLR].length == 0 )
            plr_acc = 0;
        else
            plr_acc = parseInt(( 100 / this.TargetsHistory[PLR].length ) * this.Accuracy[PLR]);

        document.getElementById("plr_acc").innerHTML = "<span class='bgspan'>Player Accuracy: " + plr_acc + "%</span>";

        let cpu_acc = "";
        if( this.TargetsHistory[CPU].length == 0 )
            cpu_acc = 0;
        else
            cpu_acc = parseInt( ( ( 100 / this.TargetsHistory[CPU].length ) * this.Accuracy[CPU]) );

        document.getElementById("cpu_acc").innerHTML = "<span class='bgspan'>Computer Accuracy: " + cpu_acc + "%</span>";

        let total_moves = this.TargetsHistory[PLR].length;
        document.getElementById("total_moves").innerHTML = "<span class='bgspan'>Total Rounds: " + total_moves + "</span>";
    }

    updateRemainingSubs()
    {
        let plr_str = "<span class='bgspan'><u>Player</u></span><br><br>";
        for(let i = 0, plr_remaining = 0;i < subTypes.length;i++)
        {
            for(let j = 0;j < this.Boards[PLR].totalSubs.length; j++)
            {
                if(this.Boards[PLR].totalSubs[j].isAlive() && this.Boards[PLR].totalSubs[j].getCoords().length == subTypes[i].size)
                    plr_remaining++;
            }
            plr_str     += "<span class='bgspan'>" + plr_remaining + "x " + subTypes[i].size + " Cells</span><br>";
            plr_remaining=0;
        }

        plr_str     += "<br><br><span class='bgspan'>Total: " + (this.Boards[PLR].totalSubs.length - this.destroyedSubs[PLR]) + "</span>";
        document.getElementById("plr_subs").innerHTML = plr_str;

        let cpu_str = "<span class='bgspan'><u>Computer</u></span><br><br>";
        for(let i = 0, cpu_remaining = 0;i < subTypes.length;i++)
        {
            for(let j = 0;j < this.Boards[CPU].totalSubs.length; j++)
            {
                if(this.Boards[CPU].totalSubs[j].isAlive() && this.Boards[CPU].totalSubs[j].getCoords().length == subTypes[i].size)
                    cpu_remaining++;
            }
            cpu_str     += "<span class='bgspan'>" + cpu_remaining + "x " + subTypes[i].size + " Cells</span><br>";
            cpu_remaining=0;
        }

        cpu_str     += "<br><br><span class='bgspan'>Total: " + (this.Boards[CPU].totalSubs.length - this.destroyedSubs[CPU]) + "</span>";
        document.getElementById("cpu_subs").innerHTML = cpu_str;
    }

    RenderBoards() {
        let playerBoardSTR = "<p>Player's Board</p><table>";
        for (let y = 0; y < this.valid_h; y++) {
            playerBoardSTR += "<tr>";
            for (let x = 0; x < this.valid_w; x++) {

                playerBoardSTR += "<td id='0_cell_[" + y + "_" + x + "]'";
                if (this.Boards[PLR].getGrid()[y][x]) playerBoardSTR += " class ='" + this.Boards[PLR].Icons[y][x] + "'>"; else playerBoardSTR += ">";
                playerBoardSTR += "</td >";
            }
            playerBoardSTR += "</tr >";
        }
        playerBoardSTR += "</table>";

        let computerBoardSTR = "<p>Computer's Board</p><table>";
        for (let y = 0; y < this.valid_h; y++) {
            computerBoardSTR += "<tr>";
            for (let x = 0; x < this.valid_w; x++) {
                computerBoardSTR += "<td id='1_cell_[" + y + "_" + x + "]' onClick='Game.Attack(" + y + "," + x + ", " + CPU + ")'></td >";
            }
            computerBoardSTR += "</tr >";
        }
        computerBoardSTR += "</table>";
        document.getElementById("ch").innerHTML = computerBoardSTR;
        document.getElementById("ph").innerHTML = playerBoardSTR;
        document.getElementById("cheatBtn").disabled = false;
        document.getElementById("gs").style.visibility = 'hidden';
        document.getElementById('menu').style.visibility='hidden';
        this.sendAlert("Game Started", "darkgreen");
        this.gameRunning = true;
    }

    getNearbyCoords(y, x, target) {
        let direction = Math.floor(Math.random() * 2);
        let sub_dir = Math.floor(Math.random() * 2);
        if (direction < 1) {
            if (sub_dir < 1) {
                if (++x > (this.Boards[target].boardSize["width"] - 1))
                    x -= 2;
            } else {
                if (--x < 0)
                    x += 2;
            }
        } else {
            if (sub_dir < 1) {
                if (++y > (this.Boards[target].boardSize["height"] - 1))
                    y -= 2;
            } else {
                if (--y < 0)
                    y += 2;
            }
        }

        return y + "_" + x;
    }

    checkStatus()
    {
        let status = new Array(false, false);
        let str, word, color = "";
        if(this.destroyedSubs[PLR] == this.Boards[PLR].totalSubs.length) 
            status[CPU] = true

        if(this.destroyedSubs[CPU] == this.Boards[CPU].totalSubs.length) 
            status[PLR] = true

        if( status[PLR] == true && status[CPU] == false )           // Player won
        {
            word = "YOU WIN!";
            str = "Computer's fleet destroyed";
            color = "green";
        } else if( status[CPU] == true && status[PLR] == false )    // Computer won
        {
            word = "YOU LOSE!";
            str = "Player's fleet destroyed";
            color = "red";
        } else if( status[CPU] == true && status[PLR] == true )     // DRAW
        {
            word = "DRAW!";
            str = "Both fleets destroyed";
            color = "darkblue";
        } else return;                                              

        this.sendAlert("");
        this.sendAlert("<span style='font-size: 26px;'>" + word + "</span>", color );
        this.sendAlert("<span style='font-size: 26px;'>" + str +"</span>", color);
        this.Attack = function () {
            return this.sendAlert("Please start a new Game")
        };
        document.getElementById("gs").style.visibility = 'visible';
        this.gameRunning = false;
    }

    sendAlert(text, color = "") {
        this.alerts[2] = this.alerts[1];
        this.alerts[1] = this.alerts[0];
        if (color) {
            this.alerts[0] = "<span style='color: " + color + ";'>" + text + "</span>";
        }
        else {
            this.alerts[0] = text;
        }
        document.getElementById("alertBox").innerHTML = this.alerts.join("<br>");
    }
}