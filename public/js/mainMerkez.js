    
var DRONES = {}
var uzayussu;

var grasses = [];
function startGame() {
    uzayussu = new component(100, 100, "grey", 200, 200);
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        document.getElementById("cizim").insertBefore(this.canvas, document.getElementById("cizim").childNodes[0]);
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

function component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(x , y , this.width, this.height);
        ctx.restore();    
    }
    this.newPos = function(ix,iy){
        this.x = x;
        this.y = iy;
    }
}

function updateGameArea() {
    myGameArea.clear();
    grasses.forEach(function(grass){
        grass.update();
    })
    uzayussu.update();
}

var socket = io();
$('#yeniBtn').on('click', function(){
    $('#msg').html('');
    var msg = "Yeni Drone Havalandı"
    socket.emit('new drone',{message: msg});
    return false;
})
$('#btnYolla').on('click', function(){
    var msg = $('#droneIdInput').val() + "Hareket Ettirildi";
    if( $('#droneIdInput').val() && $('#moveIdInput').val()){
        socket.emit('drone move',
        {   message: msg,
            droneID: $('#droneIdInput').val(),
            droneMoveHash: {move: $('#moveIdInput').val().split('/')[0],hash:$('#moveIdInput').val().split('/')[1]}});
    }else{
        alert("Önce Boş Alanları Doldurun.")
    }
    return false;
})

function textboxinput(droneID){
    $('#msg').html('');
    $('#droneIdInput').val(droneID)
}
function textboxinput2(dronemoveID){
    $('#msg').html('');
    if( $('#droneIdInput').val()){
        $('#moveIdInput').val(dronemoveID + "/" +DRONES[$('#droneIdInput').val()][dronemoveID])
    }else{
        alert("Önce DroneID'sini Giriniz...")
    }

}

socket.on('drone komuta', data => {
    for(var k in data["drones"]) {
        DRONES[data["drones"][k].droneID] = data["drones"][k] 
        $('#dronIDButonlari').append("<button class='btn mr-1' onclick='textboxinput(this.id)' id='"+data["drones"][k].droneID+"'>"+data["drones"][k].droneID+"</button>")
    }
    if(data.grasses){
        data.grasses.forEach(function(grasias){
            console.log(grasias)
            grasses.push(new component(50, 50, grasias.color , grasias.x,grasias.y));
        })
    }
    console.log(DRONES);
});
socket.on('new drone', data => {
    $('#dronIDButonlari').append("<button  class='btn mr-1' onclick='textboxinput(this.id)' id='"+data.newdrone.droneID+"'>"+data.newdrone.droneID+"</button>")
    DRONES[data.newdrone.droneID] = data.newdrone;
});
socket.on('drone move reponse', data => {
    
    let idD = data["drone"].droneID;
    if(parseInt(DRONES[idD]['charge']) <= 0 ){
        $('#msg').html('');
        $('#msg').text('sarjı bitti'); 
        console.log(DRONES[idD]+'şarjı bitti');
    }else{
        DRONES[idD] = data["drone"];
        let its =  DRONES[idD] ;
        console.log(its)
        let grass = new component(50, 50, its.color , its.width-25,its.height-25);
        grasses.push(grass);
        console.log(grasses);
        console.log(its['charge'])
        
        console.log(grasses)
        socket.emit('grass loaded', {grasses: grasses})
        updateGameArea()
    }
    
})
