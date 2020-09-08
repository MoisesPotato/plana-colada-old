
/*global window, document, Image, module, console, math*/

/* jshint -W030, -W119*/

/*jshint esversion:6*/

/*jshint browser: true */

var displayingGraphics;
if (typeof window === "undefined"){
    displayingGraphics = false;
} else {
    displayingGraphics = true;
}
var then;                   //Time of last animation frame





function makeContext(g) {
    this.area = document.getElementById("gameZone");
    this.area.width = g.gameWidth;
    this.area.style.width = g.gameWidth + "px";
    this.area.height = g.gameHeight;
    this.area.style.height = g.gameHeight + "px";
    this.ctx = this.area.getContext("2d");
}



function gameStatus() {
    this.scene = "menu";        //Scene: possibilities: "start", "GameOver", "menu"
    this.playing = true;
    this.paused = false;
    this.changingKey = false;        //For changing controls   
    this.whichKeyIsChanging = null; //For changing controls
    this.keysList = [];         // At any given point, keysList[leftKey] should be a Boolean saying if the left key is pressed
    this.mouse = {
        pos:[0,0],
        lClick:false,
        rClick:false
    };
    this.p1Keys = new keySet(leftKey, rightKey, upKey, rShift, downKey);
    this.p2Keys = new keySet(aKey, dKey, wKey, spaceBar, sKey);
    this.gameWidth = window.innerWidth;    //Width of game zone in pixels
    this.gameHeight = window.innerHeight;   //Height of game zone in pixels
    this.gameSize = Math.min(this.gameWidth, this.gameHeight);
    this.area = document.getElementById("gameZone");
    this.area.width = this.gameWidth;
    this.area.style.width = this.gameWidth + "px";
    this.area.height = this.gameHeight;
    this.area.style.height = this.gameHeight + "px";
    this.ctx = this.area.getContext("2d");
    this.scale = 0.4 * this.gameSize;
    this.speedScale = 1/40;
    this.defaultSpeed = 0.01;
}



/////// COMPLEX NUMBERS /////////////////////

function cx(a, b) {
    this.re = a;
    this.im = b;
    this.infty = false;
    this.plus = function(z){
        if (typeof z == "number"){
            z = newReal(z);
        }
        if (this.infty || z.infty){
            console.error("Adding infinity");
            return null;
        }
        return new cx(this.re + z.re, this.im + z.im);
    };
    this.times = function(z){
        if (typeof z == "number"){
            z = newReal(z);
        }
        if (this.infty || z.infty){
            console.error("Multiplying infinity");
            return null;
        }
        let a1 = this.re * z.re - this.im * z.im;
        let b1 = this.re * z.im + this.im * z.re;
        return new cx(a1, b1);
    };
    this.isZero = function(){
        if (this.re === 0 && this.im === 0){
            return true;
        } else {
            return false;
        }
    };
    this.absSq = function(){
        return this.re * this.re + this.im * this.im;
    };
    this.abs = function(){
        return Math.sqrt(this.absSq());
    };
    this.arg = function () {//
        if (this.re === 0){
            if (this.im > 0){
                return Math.PI/2;
            } else {
                return - Math.PI/2;
            }
        } else {
            var answer = Math.atan(this.im/this.re);
            if (this.re < 0) {
                answer = answer + Math.PI;
            }
            return answer;
        }
    };
    this.cong = function(){
        return new cx(this.re, - this.im);
    };
    this.inv = function(){
        let absSq = this.absSq();
        if (this.absSq() === 0){
            console.error("Divide by 0");
            return null;
        } else {
            return this.cong().times(newReal(1/absSq));
        }
    };
    this.divide = function(z){
        if (typeof z == "number"){
            z = newReal(z);
        }
        return this.times(z.inv());
    };
    this.power = function(n){
        let R2 = this.absSq();
        let a = this.arg();
        R2 = Math.pow(R2, n/2);
        a = a * n;
        return new cx(R2 * Math.cos(a), R2 * Math.sin(a));
    };
    this.mobius = function(A){ //A Is a mobius object
        let M = A.matrix;
        let answer;
        if (this.infty){
            if (M[1][0].isZero()){
                answer = new cx(0, 0);
                answer.infty = true;
            } else {
                answer = M[0][0].divide(M[1][0]);
            }
        } else {
            let num = this.times(M[0][0]).plus(M[0][1]);
            let den = this.times(M[1][0]).plus(M[1][1]);
            if (den.isZero()){
                if (num.isZero()){
                    answer = M[0][0].divide(M[1][0]);
                } else {
                    answer = newInfty();
                }
            } else {
                answer = num.divide(den);
            }
        }
        if (A.conj){
            answer = answer.cong();
        }
        return answer;
    };
    this.toString = function(){
        if (this.infty){
            return "INFTY";
        } else {
            return this.re + " + " + this.im + " i ";
        }
    };
}

function makeCx(z){
    if (typeof z == "number"){
        return newReal(z);
    } else {
        return z;
    }
}

function makeCxMatrix(A){
    for (let i in A){
        for (let j in A[i]){
            A[i][j] = makeCx(A[i][j]);
        }
    }
    return A;
}

function newReal(a){
    return new cx(a, 0);
}

function I(){
    return new cx(0, 1);
}
    
function newInfty(){
    let z = new cx(0, 0);
    z.infty = true;
    return z;
}

/////// VECTORS //////////////////////////////////////////

function vec(x, y) {   ///Vector operations   ////////////////////////
    this.x = x;
    this.y = y;
    this.times = function (l) {
        return (new vec(this.x * l, this.y * l));
    };
    this.plus = function (v) {
        return new vec(this.x + v.x, this.y + v.y);
    };
    this.op =  function () {
        return new vec(-this.x, -this.y);
    };
    this.VlengthSq = function () {
        return this.x * this.x + this.y * this.y;
    };
    this.Vlength = function () {
        return Math.sqrt(this.VlengthSq());
    };
    this.rot = function (angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            rotX = this.x * cos + this.y * sin,
            rotY = this.x * (-sin) + this.y * cos;
        return new vec(rotX, rotY);
    };
    this.cross = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    this.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    this.flipHor = function (u) {
        return new vec(u.universeWidth - this.x, this.y);
    };
    this.flipVer = function (u) {
        return new vec(this.x, u.universeHeight - this.y);
    };
    this.flipVyH = function (u) {
        return new vec(u.universeWidth - this.x, u.universeHeight - this.y);
    };
    this.toAngle = function () {//Returns the angle that the vector is facing towards, in radians. It is measured from "up"=0, and "left"=PI/2
        var answer = Math.atan(this.x/this.y);
        if (this.y > 0) {
            answer = answer + Math.PI;
        }
        return answer;
    };
    this.projectOn = function (v) {
        return v.times(this.dot(v)/v.VlengthSq());
    };
}






////////////// KEYS AND THEIR CODES ////////////////////////


var leftKey = 37;
var tab = 9;
var alt = 18;
var enter = 13;
var rightKey = 39;
var upKey = 38;
var downKey = 40;
var rKey = 82;
var spaceBar = 32;
var rShift = 16;
var aKey = 65;
var dKey = 68;
var sKey = 83;
var wKey = 87;
var mKey = 77;
var pKey = 80;
var oKey = 79;
var cKey = 67;

function stringFromCharCode(code) { //// The string that is displayed in the "controls" window
    if (code == leftKey) {
        return "Left";
    } else if (code == rightKey) {
        return "Right";
    } else if (code == upKey) {
        return "Up";
    } else if (code == downKey) {
        return "Down";
    } else if (code == spaceBar) {
        return "Space Bar";
    } else if (code == rShift) {
        return "Shift";
    } else if (code == tab) {
        return "tab";
    } else if (code == enter) {
        return "enter";
    } else {
        return String.fromCharCode(code);
    }
}

////////// Default controls  /////////////////////////////////

function setKeyListeners(g){
    g.keysList = [];         // At any given point, keysList[leftKey] should be a Boolean saying if the left key is pressed
    window.onkeyup = function (e) {
        g.keysList[e.keyCode]=false;
        };
    window.onkeydown = function (e) {g.keysList[e.keyCode]=true;
                                   //console.log(e.keyCode);
                                   if (e.keyCode == leftKey || e.keyCode == rightKey || e.keyCode == upKey || e.keyCode == downKey || e.keyCode == spaceBar) { ////////// Don't scroll with special keys ///////////
                                       e.preventDefault();
                                   }
                                   if (g.changingKey) { ////////// Are we in the screen where controls are changed? ///////////
                                        //console.log("Changing the key "+g.whichKeyIsChanging);
                                        g.whichKeyIsChanging[0].changeKey(g.whichKeyIsChanging[1], e.keyCode);
                                        //console.log("Keypressed: "+e.keyCode);
                                        //console.log("The letter is "+stringFromCharCode(e.keyCode));
                                        document.getElementById(g.whichKeyIsChanging[2]).innerHTML = stringFromCharCode(e.keyCode);
                                        g.changingKey = false;
                                        g.whichKeyIsChanging = null;
                                        //console.log("Changed to "+g.p1Keys.moveLeft);
                                    }              
    };

    window.onkeypress = function () {
        if(g.scene =="GameOver") {
            if (g.keysList[rKey]) {
                startTheGame(g);
            } else if (g.keysList[mKey]) {
                showMenu(g);
            }
        }
        if (g.scene =="menu") {
            if (g.keysList[sKey]) {
                startTheGame(g);
            } else if (g.keysList[oKey]) {
                //showOptions(g);
            } else if (g.keysList[cKey]) {
                //showCredits(g);
            }
        }
        if (g.scene =="options" || g.scene =="credits") {
            if (g.keysList[mKey]) {
                document.getElementById("options").style.display = "none";
                    showMenu(g);
            }
        }
        if (g.scene =="start") {
            if (g.keysList[pKey] && !g.paused) {
                pause(g);
            } else if (g.keysList[pKey] && g.paused) {
                unPause(g);
            }
        }
        if (g.paused && g.keysList[mKey]) {
            g.paused = false;
            showMenu(g);
        }

    };
    
    g.area.addEventListener('mousedown', function(e){
        if (e.button === 0){
            g.mouse.lClick = true;
        } else if (e.button == 2){
            g.mouse.rClick = true;
        }
    });
    
    g.area.addEventListener('mouseup', function(e){
        if (e.button === 0){
            g.mouse.lClick = false;
        } else if (e.button == 2){
            g.mouse.rClick = false;
        }
    });
    
    g.area.addEventListener('contextmenu', function(e){
        e.preventDefault();
    });
    
    g.area.addEventListener('mousemove', function(evt) {
        g.mouse.pos = getMousePos(g.area, evt);
      });
      
}


function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left, evt.clientY - rect.top];
}

function makeChangeable(what, property, label){
    let htmlList = document.getElementById("variables");
    let inputBox = document.createElement("p");
    inputBox.innerHTML = [
                    label + ':  ',
                    '<input id = "' + label + '" type = "text">'].join("\n");
    htmlList.appendChild(inputBox);
    document.getElementById(label).value = what[property];
    document.getElementById(label).addEventListener("input",function(){
        what[property] = parseFloat(document.getElementById(label).value);
    });
}


////////////////////// Object that stores controls for a given player /////////////////////////////////

function keySet(moveLeft, moveRight, thrust, fire, special) {
    this.moveLeft = moveLeft;
    this.moveRight = moveRight;
    this.thrust = thrust;
    this.fire = fire;
    this.special = special;
}

keySet.prototype.changeKey = function (whichKey, newCode) {
    switch (whichKey) {
        case "left":
            this.moveLeft = newCode;
            break;
        case "right":
            this.moveRight = newCode;
            break;
        case "thrust":
            this.thrust = newCode;
            break;
        case "fire":
            this.fire = newCode;
            break;
        case "special":
            this.special = newCode;
            break;      
    }
};



/*ship.prototype.hitByMissile = function (u) {
    for (var missileIndex = 0; missileIndex < u.missiles.length; missileIndex++) {
        if(u.missiles[missileIndex].living == u.missileLiveTime || u.missiles[missileIndex].firedBy != this.whichPlayer) {
            var relPos = u.missiles[missileIndex].pos.plus(this.pos.op());
            var dist = relPos.Vlength();
            if (dist < 27) {
                relPos = relPos.rot(this.facing);
                console.log("Position of missile is x = "+u.missiles[missileIndex].pos.x+", y = "+u.missiles[missileIndex].pos.y);
                console.log("Position of player is x = "+this.pos.x+", y = "+this.pos.y);
                console.log("Player is facing "+this.facing);
                console.log("relative position is = "+relPos.x+", y = "+relPos.y);
                var hit = this.hitbox.collide(relPos);
                if (hit) {
                    //console.log("Hit!");
                    u.successfulMissiles.push(u.missiles[missileIndex]);
                    this.exploding = true;
                    u.missiles.splice(missileIndex, 1);
                    missileIndex--;
                }
            }
        }
    }
};*/

//ship.prototype.easyCollide = function (whatHit, size) { //Checks collision against thing. Uses easy hitbox. WhatHit is the position vector of the second object
//    var relPos = whatHit.plus(this.pos.op());
//    var dist = relPos.Vlength();
//    if (dist < 27 + size) {
//        relPos = relPos.rot(this.facing);
//        /*console.log("Position of missile is x = "+u.missiles[j].pos.x+", y = "+u.missiles[j].pos.y);
//        console.log("Position of player is x = "+this.pos.x+", y = "+this.pos.y);
//        console.log("Player is facing "+this.facing);
//        console.log("relative position is = "+relPos.x+", y = "+relPos.y);*/
//        return this.hitbox.increase(size).collide(relPos);
//    } else{
//        return false;
//    }
//};


/*function gameStep(u, status){
        u.Player.One.makeDecision(u.Player.One.whoPlaying, status, u);
        u.Player.Two.makeDecision(u.Player.Two.whoPlaying, status, u);
        u.Player.One.takeStep(u, status);
        u.Player.Two.takeStep(u, status);
        if (u.Player.One.crashed || u.Player.Two.crashed) {
            g.playing = false;
            g.winner = "none";
            if (!u.Player.One.exploding) {
                g.winner = "P1";
            } else if (!u.Player.Two.exploding) {
                g.winner = "P2";
            }
        }
        u.Player.One.fireMissile(status, u);
        u.Player.Two.fireMissile(status, u);
        for (var m = 0; m < u.missiles.length; m++) {
            u.missiles[m].history.push(u.missiles[m].pos);
            u.missiles[m].takeStep(u);
            //u.missiles[m].draw(c, g, u);
            if (u.missiles[m].crashed) {
                u.missiles.splice(m, 1);
                m--;
            }
        }
        //dealWithBoxes(u);
        //u.floatingBox.draw(c, g, imgList, u);
        //drawEyes(c, g, u);
        //dealWithWeapons(u);
//        if (u.topologyCounter > 0){
//            u.topologyCounter--;
//        }
        //drawWeapons(c, g, imgList, u);
//        specialEffects(u);
//        if (playing && !g.paused) {
//            window.requestAnimationFrame(function(){playAnim(c, g, imgList, status, u);});
//        }
//    } else {
//        if (playing && !g.paused) {
//            window.requestAnimationFrame(function(){playAnim(c, g, imgList, status, u);});
//        }
//    }
//    if (!playing) {
//        gameOver(c, g, imgList, status, u);
//    }
}*/
    


function universeInfo() {
    this.curvature = -0.2; //This value^(-1/2) is the radius of the circle at infinity (if negative), or the radius of the equator if positive
    this.objectList = [];
    this.wallList = [/*new wall(new cx(1, 0), new cx(0, 1), this),
                    new wall(new cx(Math.random(), Math.random()), new cx(Math.random(), Math.random()), this),
                    new wall(new cx(Math.random(), Math.random()), new cx(Math.random(), Math.random()), this),
                    new wall(new cx(Math.random(), Math.random()), new cx(Math.random(), Math.random()), this)*/];
    this.speed = new cx(0, 0);
    this.domain = new polygon([], [], this);
    /*this.makeDomain("o"); THis will break changing the curvature*/
}

universeInfo.prototype.setSpeed = function(g){
    if (g.mouse.lClick){
        let v = pixToCoord(g.mouse.pos[0], g.mouse.pos[1], g);
        v = v.times(newReal(g.speedScale));
        this.speed = v;
    } else {
        this.speed = newReal(0);
    }
};

universeInfo.prototype.makeDomain = function(label){
    switch (label) {
        case "o":
            this.curvature = 0;
            this.domain = polygonFromVertices(
                [
                    makeCx(1),
                    I().plus(1),
                    I(),
                    makeCx(0)
                ],
                [
                    new mobius( makeCxMatrix([[1, 1], [0, 1]]), false),
                    new mobius( makeCxMatrix([[1, I()], [0, 1]]), false),
                    new mobius( makeCxMatrix([[1, -1], [0, 1]]), false),
                    new mobius( makeCxMatrix([[1, I().times(-1)], [0, 1]]), false)
                ],
                this
            );
            break;
    }
};

function findMobius(z, u){//Find the isometry that sends z to 0 and 0 to -z
    z = makeCx(z);
    let deter = 1/(1 + z.absSq() * u.curvature);
    deter = Math.sqrt(deter);
    return new mobius(makeCxMatrix([[deter, z.times(-1).times(deter)], [z.cong().times(u.curvature * deter), deter]]), false);
}

function mobius(M, cong){//A mobius transformation is the matrix, then conjugation maybe
    this.matrix = M;
    this.cong = cong;
}

function conjugateMatrix(M){ //Conjugate every term
    let A = [[1,0],[0,1]];
    for (let i in M){
        for (let j in M){
            A[i][j] = M[i][j].cong();
        }
    }
    return new mobius(A, this.cong);
}

function determinant(A){
    return A[0][0].times(A[1][1]).plus(
            A[1][0].times(A[0][1]).times(-1)
            );
}


function mobiusTimes(M1, M2){
    let A1 = M1.matrix;
    let A2 = M2.matrix;
    if (M2.cong){
        A1 = conjugateMatrix(A1);
    }
    let answer = [[1,0],[0,1]];
    answer[0][0] = A1[0][0].times(A2[0][0]).plus(
                    A1[0][1].times(A2[1][0]));
    answer[0][1] = A1[0][0].times(A2[0][1]).plus(
                    A1[0][1].times(A2[1][1]));
    answer[1][0] = A1[1][0].times(A2[0][0]).plus(
                    A1[1][1].times(A2[1][0]));
    answer[1][1] = A1[1][0].times(A2[0][1]).plus(
                    A1[1][1].times(A2[1][1]));
    return new mobius(answer, M1.cong != M2.cong);
}

function mobiusConjugate(A, B){ //Returns ABA^{-1}
    let answer = mobiusTimes(A, B);
    answer = mobiusTimes(answer, mobiusInv(A));
    return answer;
}

function mobiusInv(M){
    let A = M.matrix;
    let B = [[A[1][1], A[0][1].times(-1)],
           [A[1][0].times(-1), A[0][0]]];
    if (M.cong){
        B = conjugateMatrix(B);
    }
    return new mobius(B, M.cong);
}

universeInfo.prototype.move = function(g){
    this.setSpeed(g);
    let M = findMobius(this.speed, this);/// sends speed to 0
    if (this.speed !== 0 && !isNaN(M.matrix[1][0].re)){
        for (let o in this.objectList){
            this.objectList[o].pos = this.objectList[o].pos.mobius(M);
//            if(isNaN(this.objectList[o].pos.re)){
//                debugger;
//            }
        }
        for (let w in this.wallList){
            this.wallList[w].moveBy(M, this);
        }
        this.domain = movePolygon(this.domain, M, this);
        this.domain = resetPolygon(this.domain, this);
    }
};


function thing(pos, type){
    this.pos = makeCx(pos);
    this.type = type;
}

function addRandomObjects(n, spread, u){
    for(let i = 0; i < n; i++){
        let pos = new cx(Math.random() * 2 * spread - spread, Math.random() * 2 * spread - spread);
        let o = new thing(pos, "Tree");
        u.objectList.push(o);
    }
}

function coordToPix(z, g){
    z = makeCx(z);
    let x = z.re;
    let y = z.im;
    x = x * g.scale;
    y = y * g.scale;
    x = x + g.gameWidth / 2;
    y = g.gameHeight / 2 - y;
    return [x, y];
}

function pixToCoord(x1, y1, g){
    let x = x1;
    let y = y1;    
    //console.log(`${x1} ${y}`);
    x = x - g.gameWidth / 2;
    y = g.gameHeight / 2 - y;    
    x = x / g.scale;
    y = y / g.scale;
    return new cx(x, y);
}

function localScale(z, u){
    /*console.log(`Curvature: ${u.curvature}`);
    console.log(`z: ${z.re} + i ${z.im}`);*/
    let S = 1 + z.absSq() * u.curvature;
//    console.log(S);
    return Math.max(0, S);
}



function wall(z1, z2, u){
    this.goesToOrigin = getMobiusFromTwoPoints(z1, z2, u);
    this.originToWall = mobiusInv(this.goesToOrigin);
    this.onWall = function(z){
        let translate = z.mobius(this.goesToOrigin);
        return translate.im === 0;
    };
    this.isLeft = function(z){
        let translate = z.mobius(this.goesToOrigin);
        return translate.im > 0;
    };
    this.computeThings = function(u){
        if (u.curvature === 0){
            this.isStraight = true;
        } else {
            this.isStraight = this.onWall(makeCx(0));
        }
        if (!this.isStraight){
            this.center = findCenterOfWall(this.originToWall);
            this.radius = this.center.plus(makeCx( 0).mobius(this.originToWall).times(-1)).abs();
        }
    };
    this.computeThings(u);
    this.moveBy = function(M, u){
        this.goesToOrigin = mobiusTimes(this.goesToOrigin, mobiusInv(M));
        this.originToWall = mobiusTimes(M, this.originToWall);
        this.computeThings(u);
    };
}
   
function findCenterOfWall(M){//Given a mobius transformation that sends the reals to the wall
    //debugger;
    let a1 = makeCx( 0).mobius(M);
    let a2 = makeCx( 1).mobius(M);
    let a3 = makeCx(-1).mobius(M);
    let b12 = a1.plus(a2.times(-1));
    let b13 = a1.plus(a3.times(-1));
    let m12 = a2.plus(b12.times(1/2));
    let m13 = a3.plus(b13.times(1/2));
    let A = [[b12.re, b12.im],
            [b13.re, b13.im]];
    let b = [[b12.re * m12.re + b12.im * m12.im],
             [b13.re * m13.re + b13.im * m13.im]];
    /*console.log("Mobius:");
    console.log(M);*/
    let x = math.lusolve(A, b);
    return new cx(x[0][0], x[1][0]);
}

//function matrixTimes(A, B){UNFINISHED
//    let C = Array(A.length);
//    for (let i in A){
//        C[i] = Array(B[i].length);
//        for(let j in A){
//            let total = 0;
//            for (let k)
//        }
//    }
//}

    
function getMobiusFromTwoPoints(z1, z2, u){
    let M1 = findMobius(z1, u); //sends z1 to 0
    let z2Translate = z2.mobius(M1);
/*
    console.log(z2Translate);
*/
    z2Translate = z2Translate.divide(makeCx(z2Translate.abs())).cong().power(0.5);
    let M2 = new mobius(makeCxMatrix([[z2Translate, 0],[0,z2Translate.inv()]]), false); //sends 0 to 0 and M1(z2) to the reals
    return mobiusTimes(M2, M1); //sends z1 to 0 and z2 to the reals
}

function polygon(T, walls, u){//Z is an array of the vertices, and T[i] is the Mobius transformation you should do if you cross past Z[i] -- Z[i+1]
    this.transf = T;
    this.walls = walls;
}

function polygonFromVertices(Z, T, u){//Z is an array of the vertices, and T[i] is the Mobius transformation you should do if you cross past Z[i] -- Z[i+1]
    let walls = [];
    for (let i = 0; i < Z.length; i++){
        walls.push(new wall(Z[i], Z[(i + 1) % Z.length], u));
    }
    return new polygon(T, walls, u);
}

function checkPolygon(p){
    for (let i in p.walls){
        if (!p.walls[i].isLeft(makeCx(0))){
            return i;
        }
    }
    return -1;
}

function movePolygon(p, M, u){
    for (let i in p.walls){
        p.walls[i].moveBy(M, u);
    }
    for (let i in p.transf){
        p.transf[i] = mobiusConjugate(M, p.transf[i]);
    }
    return p;
}

function polyCrossWall(p, i, u){
    movePolygon(p, p.transf[i], u);
    return p;
}

function resetPolygon(p, u){
    let i = checkPolygon(p);
    if (i != -1){
        polyCrossWall(p, i, u);
    }
    return p;
}


//////////////////////////DRAWING //////


/// IMAGES

const imgCar = new Image();  //Image of ship
imgCar.src = 'Car.png';
const imgTree = new Image();  //Image of ship
imgTree.src = 'Tree.png';

function drawImage(img, center, radius, rotation, g) { ////the radius is the average of the width and the height
    let position = coordToPix(center, g);
    let scale = 2 * radius/(img.width + img.height);
    let w = img.width * scale;
    let h = img.height * scale;
    g.ctx.translate(position[0], position[1]);
    g.ctx.rotate(- rotation);
    g.ctx.drawImage(img, -w / 2, -h / 2, w, h);
    /*g.ctx.fillStyle = "white";
    g.ctx.fillRect(0, 0, 100, 100);*/
    g.ctx.rotate(rotation);
    g.ctx.translate(-position[0], -position[1]);
}

function drawBackground (g, u){
    g.ctx.fillStyle = "#61b061";
    g.ctx.fillRect(0, 0, g.gameWidth, g.gameHeight);
}

function drawObj(o, g, u){
    let V = coordToPix(o.pos, g);
    let s = localScale(o.pos, u);
    s = Math.min(s, 10);
    switch (o.type) {
        case "Tree":
            if (s !== 0){
                drawImage(imgTree, o.pos, 0.2 * g.scale * s, 0, g);
                /*g.ctx.fillStyle = 'red';
                g.ctx.beginPath();
                g.ctx.arc(V[0], V[1], 0.03 * g.scale * s, 0, 2 * Math.PI);
                g.ctx.fill();*/
            }
            break;
        case "Player":
            if (s !== 0){
                drawImage(imgCar, o.pos, 0.2 * g.scale * s, pixToCoord(g.mouse.pos[0],g.mouse.pos[1], g).arg(), g);
                /*g.ctx.fillStyle = '#080270';
                g.ctx.beginPath();
                g.ctx.arc(V[0], V[1], 0.06 * g.scale * s, 0, 2 * Math.PI);
                g.ctx.fill();*/
            }
            break;
    }
}

function drawWall(W, g, u){
    /*for (let x = -3; x < 3; x+= 0.1){SHADE THE WHOLE AREA
        for (let y = -3; y < 3; y+= 0.1){
            let z = new cx(x, y);
            let V = coordToPix(z, g);
            let color = "blue";
            if (W.isLeft(z)){
                color = "red";
            }
            g.ctx.fillStyle = color;
            g.ctx.beginPath();
            g.ctx.arc(V[0], V[1], 0.006 * g.scale, 0, 2 * Math.PI);
            g.ctx.fill();
        }
    }*/
    if (W.isStraight){
        let a1 = coordToPix(makeCx(-100).mobius(W.originToWall), g);
        let a2 = coordToPix(makeCx(100).mobius(W.originToWall), g);
        g.ctx.strokeStyle = "black";
        g.ctx.beginPath();
        g.ctx.moveTo(a1[0], a1[1]);
        g.ctx.lineTo(a2[0], a2[1]);
        g.ctx.stroke(); 
    } else {
        let x = coordToPix(W.center, g);
        let r = W.radius * g.scale;
        g.ctx.strokeStyle = "black";
        g.ctx.beginPath();
        g.ctx.arc(x[0], x[1], r, 0, 2 * Math.PI);
        g.ctx.stroke();
    }
}

function drawObjects(g, u){
    drawObj(new thing(new cx(0,0), "Player"), g, u);
    /*drawObj(new thing(new cx(1,0), "Player"), g, u);
    drawObj(new thing(new cx(0,1), "Player"), g, u);*/
    for (let o in u.objectList){
        drawObj(u.objectList[o], g, u);
    }
    for (let w in u.domain.walls){
        drawWall(u.domain.walls[w], g, u);
    }
    /*for (let w in u.wallList){
        drawWall(u.wallList[w], g, u);
    }*/
}











/////////////////////////////// Things running in the game ////////////////////////

/*function gameOver(c, g, imgList, status, u) {
    clearKeys(status, u);
    g.scene = "GameOver";
    drawBackground(c, g, imgList, u);
    drawEyes(c, g, u);
    u.Player.One.draw(c, g, imgList, status, u);
    u.Player.Two.draw(c, g, imgList, status, u);
    drawSuccessfulMissiles(c, g, imgList, u).then(
        function () {
            c.ctx.font = "30px Monoton";
            c.ctx.textAlign = "center";
            if (g.winner == "none") {
                c.ctx.fillStyle = "red";
                c.ctx.fillText("You both lose", g.gameWidth/2, g.gameHeight/2);
            } else if (g.winner == "P1") {
                c.ctx.fillStyle = "yellow";
                c.ctx.fillText("Player one wins", g.gameWidth/2, g.gameHeight/2);
                g.score[0]++;
            } else {
                c.ctx.fillStyle = "turquoise";
                c.ctx.fillText("Player two wins", g.gameWidth/2, g.gameHeight/2);
                g.score[1]++;
            }
            c.ctx.fillText("Press R to restart", g.gameWidth/2, g.gameHeight*3/4); 
            c.ctx.fillText("Press M to go to the Menu", g.gameWidth/2, g.gameHeight*3/4+60);
            showScore(c, g, status, u);
        }
    );
}*/

function playAnim(g, u) {
    var currTime = Date.now();
    if (currTime - then > 40 && g.playing && !g.paused) {       
        then = Date.now();
        drawBackground(g, u);
        u.move(g);
//        console.log(`${u.speed.re} + ${u.speed.im}i`);
        drawObjects(g, u);
        window.requestAnimationFrame(function(){playAnim(g, u);});
    } else if (g.playing){
        window.requestAnimationFrame(function(){playAnim(g, u);});
    } else {
        showMenu(g);
    }
}


/*function clearKeys(status, u){
    g.keysList[u.Player.One.keyScheme(status).thrust] = false;
    g.keysList[u.Player.One.keyScheme(status).fire] = false;
    g.keysList[u.Player.One.keyScheme(status).moveLeft] = false;
    g.keysList[u.Player.One.keyScheme(status).moveRight] = false;
    g.keysList[u.Player.Two.keyScheme(status).thrust] = false;
    g.keysList[u.Player.Two.keyScheme(status).fire] = false;
    g.keysList[u.Player.Two.keyScheme(status).moveLeft] = false;
    g.keysList[u.Player.Two.keyScheme(status).moveRight] = false;
}*/

function startTheGame(g) {
    document.getElementById("mainMenu").style.display = "none";
    var u = new universeInfo();
    makeChangeable(u, "curvature", "g_input");
    addRandomObjects(150, 3, u);
    drawBackground(g, u);
    g.playing = true;
    then = Date.now();
    g.scene = "start";
    playAnim(g, u);
}


/*function controlsClickingListeners(status){
    document.getElementById("p1left").addEventListener("click", function () {
        changeControls(g.p1Keys, "left", "p1left", status);
    });
    document.getElementById("p1right").addEventListener("click", function () {
        changeControls(g.p1Keys, "right", "p1right", status);
    });
    document.getElementById("p1thrust").addEventListener("click", function () {
        changeControls(g.p1Keys, "thrust", "p1thrust", status);
    });
    document.getElementById("p1fire").addEventListener("click", function () {
        changeControls(g.p1Keys, "fire", "p1fire", status);
    });
    document.getElementById("p1special").addEventListener("click", function () {
        changeControls(g.p1Keys, "special", "p1special", status);
    });
    document.getElementById("p2left").addEventListener("click", function () {
        changeControls(g.p2Keys, "left", "p2left", status);
    });
    document.getElementById("p2right").addEventListener("click", function () {
        changeControls(g.p2Keys, "right", "p2right", status);
    });
    document.getElementById("p2thrust").addEventListener("click", function () {
        changeControls(g.p2Keys, "thrust", "p2thrust", status);
    });
    document.getElementById("p2fire").addEventListener("click", function () {
        changeControls(g.p2Keys, "fire", "p2fire", status);
    });
    document.getElementById("p2special").addEventListener("click", function () {
        changeControls(g.p2Keys, "special", "p2special", status);
    });
    document.getElementById("symmetricControls").addEventListener("click", function () {
        symmetricControls(status);
        showControlButtons(status);
    });
}*/



function pause(g) {
    g.paused = true;
    g.ctx.fillStyle = "red";
    g.ctx.font = "90px Monoton";
    g.ctx.textAlign = "center";
    g.ctx.fillText("PAUSED", g.gameWidth/2, g.gameHeight/2);
}

function unPause(g) {
    g.paused = false;
}

function mainMenuListeners(g){                                 
    document.getElementById("gameStart").addEventListener("click", function (e) {
        startTheGame(g);
    });                                 
    document.getElementById("openOptions").addEventListener("click", function () {
        //showOptions(g, u);
    });
}

function showMenu(g){
    g.ctx.fillStyle = "black";
    g.ctx.fillRect(0,0,g.gameWidth,g.gameHeight);
    g.scene = "menu";
    document.getElementById("mainMenu").style.display = "";
}


function finishLoading() {
    document.getElementById("LoadingMessage").style.color = "#000033";
    var g = new gameStatus(); //g for game
    g.area.style.display = "inline";
    setKeyListeners(g);
    showMenu(g);
//    controlsClickingListeners(g); 
    mainMenuListeners(g);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//async function demo() {
//  await sleep(0);
//  finishLoading();
//}


document.fonts.onloadingdone = finishLoading;
