var path = require('path')
var rndString = require('randomstring');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;





app.use(express.static(path.join(__dirname, 'public')));
http.listen(port, function () {
    console.log('Port dinlenmeye alındı. %d', port);
});



var array;
function grassed(){
    array = new Array(10);
    for(let i=0; i<10; i++){
        array[i] = new Array(10);
        for(let j=0; j<10; j++){
            array[i][j] = "rgba("+Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+","+Math.floor(Math.random() * 255)+",0.3)";
        }
    }
}
grassed()

var grassesMerkez;

var Drones = {}
var dronetrgig = 0;
io.on('connection', function (socket) {
    var addedUser = false;
    socket.emit('drone komuta', {
        x:"x",
        grasses: grassesMerkez,
        drones: Drones
    });
    socket.emit('grasses color', {
        drones: Drones,
        colors: array
    });

    
    socket.on('grass loaded', function(data){
        console.log(data)
        grassesMerkez = data.grasses;
        console.log(grassesMerkez);
    })
    socket.on('new drone', function (data) {
        var droneID = rndString.generate(8);
        Drones[droneID] = { 
            droneID: droneID,
            charge:100,
            width:225,
            height:225,
            color:"rgba(0,0,0,0.0)",
            e:rndString.generate(16),
            w:rndString.generate(16),
            n:rndString.generate(16),
            s:rndString.generate(16),
            ne:rndString.generate(16),
            nw:rndString.generate(16),
            se:rndString.generate(16),
            sw:rndString.generate(16),
        }
        console.log(Drones)
        
        socket.broadcast.emit('new drone', {
            newdrone:  Drones[droneID]
        });
        socket.emit('new drone', {
            newdrone:  Drones[droneID]
        });
        dronetrgig++;
    });

    socket.on('drone move', function(data){
        socket.broadcast.emit('drone move', {
            message: data.message,
            droneID: data.droneID,
            droneMoveHash: data.droneMoveHash
        });
    })

    socket.on('new position', function(data){
        console.log('new position')
        if(Drones[data.droneID].charge>0){
            Drones[data.droneID].width = data.newPos.x;
            Drones[data.droneID].height = data.newPos.y;
            Drones[data.droneID].color = data.color;
            Drones[data.droneID].charge = Drones[data.droneID].charge-10;
        } else  Drones[data.droneID].charge = -10;

        socket.emit('drone move reponse', {
            drone: Drones[data.droneID]
        });
        
        socket.broadcast.emit('drone move reponse', {
            drone: Drones[data.droneID]
        });
    })


});



app.get('/getDrone/:id', function(req, res){
    var flag=true;
    console.log(req.params.id)
    for(var k in Drones){
        if(Drones[k]['droneID']=== req.params.id){
            flag=false;
            let someone = Drones[req.params.id];
            someone.charge=undefined;  
            someone.width=undefined;  
            someone.height=undefined;   

            res.json(Drones[req.params.id] );
        }
    }
    if(flag){
        res.json("Böyle bir drone Yok." );
    }

});