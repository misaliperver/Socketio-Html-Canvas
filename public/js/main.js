
    var DRONES={}
    var drones=[]
    var grasses=[]
    function startGame(colors) {
        
        for(let i=0; i<10; i++){
            for(let j=0; j<10; j++){
                let xcolor = colors[i][j];
                let grass = new component("grass",50, 50, xcolor , i*50+25,j*50+25);
                grasses.push(grass);
            }
        }
        uzayUssu = new component("uzayussu", 100, 100, "Grey", 250,250);
        myGameArea.start();
    }
    var myGameArea = {
        canvas : document.createElement("canvas"),
        start : function() {
            this.canvas.width = 500;
            this.canvas.height = 500;
            this.context = this.canvas.getContext("2d");
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
            this.frameNo = 0;
            this.interval = setInterval(updateGameArea, 20);
        },
        stop : function() {
            clearInterval(this.interval);
        },    
        clear : function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    function component(droneID, width, height, color, x, y, type) {
        this.droneID = droneID;
        this.type = type;
        this.width = width;
        this.pixelColor="rgba('0,0,0,0.3')";
        this.height = height;
        this.x = x;
        this.y = y;    
        this.update = (wid=this.width,heig=this.height) => {
            ctx = myGameArea.context;
            ctx.save();
            let imageData = ctx.getImageData(this.x, this.y , 1, 1);
            let pixel = imageData.data;
            this.pixelColor = "rgba("+pixel[0]+", "+pixel[1]+", "+pixel[2]+",0.3)";
            ctx.translate(this.x, this.y);
            ctx.fillStyle = color;
            ctx.fillRect(wid / -2, heig / -2, this.width, this.height);
            ctx.restore();    
        }
        this.position = (width=0,height=0) =>{
            this.x = this.x + width;
            this.y  = this.y + height;

            return {x:this.x , y:this.y  }
        }
        this.getColor = () =>{
            let imageData = ctx.getImageData(this.x, this.y , 1, 1);
            let pixel = imageData.data;
            this.pixelColor = "rgba("+pixel[0]+", "+pixel[1]+", "+pixel[2]+",0.3)";
            return this.pixelColor
        }
    }
    function updateGameArea() {
        myGameArea.clear();

        grasses.forEach(function(grass){
            grass.update();
        })
        
        uzayUssu.update();

        drones.forEach(function(drone){
            drone.update();
        })
    }

    
    var socket = io();
    
socket.on('grasses color', data => {
    for(var k in data["drones"]) {
        console.log(k, data["drones"][k]);
        let drone = new component(data["drones"][k].droneID, 5, 5, "red", data["drones"][k].width,data["drones"][k].height);
        drones.push(drone)
        DRONES[data["drones"][k].droneID] = data["drones"][k];
        }
    
    startGame(data.colors);
});
socket.on('new drone', data => {
    let drone = new component(data.newdrone.droneID, 5, 5, "red", data.newdrone.width,data.newdrone.height);
    drones.push(drone)
    DRONES[data.newdrone.droneID] = data.newdrone;
    console.log(data.newdrone)
});


function changeforDrone(move){
    if(move === "nw"){ return {height:-50, width:-50}}
    if(move === "n"){ return {height:-50, width:0}}
    if(move === "ne"){ return {height:-50, width:+50}}
    if(move === "w"){ return {height:0, width:-50}}
    if(move === "e"){ return {height:0, width:+50}}
    if(move === "sw"){ return {height:+50, width:-50}}
    if(move === "s"){ return {height:+50, width:0}}
    if(move === "se"){ return {height:+50, width:+50}}

}

socket.on('drone move', data => {
    let idD = data.droneID;
    var move = data.droneMoveHash.move;
    console.log(idD + "   " + move   + "   " +  DRONES[idD][move]  + "   " + data.droneMoveHash.hash)

    if(DRONES[idD][move] === data.droneMoveHash.hash && parseInt(DRONES[idD]['charge']) > 0){
        drones.forEach(function(drone){
            if(drone.droneID === idD){
                let newPos = changeforDrone(move);
                console.log(newPos)
                newPos = drone.position(newPos.width, newPos.height);
                DRONES[idD]["width"] = newPos.width;
                DRONES[idD]["height"] = newPos.height;
                if(parseInt(DRONES[idD]['charge'])-10 >=0){
                    DRONES[idD]['charge'] = parseInt(DRONES[idD]['charge'])-10;
                    socket.emit('new position',{droneID:idD, newPos: newPos, color:drone.getColor()});
                }
                else{
                    DRONES[idD]['charge'] = -10;
                }
               
                updateGameArea() 
            }
        })
    }else  socket.emit('new position',{droneID:idD, newPos: null, color:null});
});

socket.on('drone move reponse', data =>{
    DRONES[data.droneID] = data;
})
   