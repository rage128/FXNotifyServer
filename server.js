
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const http = require('http');
const server = http.createServer( app);
const { Server } = require("socket.io");
const io = new Server(server,{ cors: { origin: '*' } });


const serverPort = 2053;

const ownerList ={};

app.post('/fb-comment', (req, res) => {
    //ownerList[req.body.ownerID].emit("addNotification",req.body);
    let tmpNotification = {
      "seen":false, "read":false, "ownerID":req.body.ownerID,
      "userID":req.body.userID, "userName":req.body.userName, "itemType":req.body.itemType,
      "postID":req.body.postID, "pageID":req.body.pageID, "verb":req.body.verb,
      "time":req.body.time, "message":req.body.message
    };

    //io.sockets.in("owner-"+req.body.ownerID).emit('addNotification', req.body);
    io.sockets.in("owner-"+req.body.ownerID).emit('addNotification', tmpNotification);

    res.sendStatus(200);
    console.log("New Notification received and sent");
});

io.on('connection', (socket) => {
  
    console.log("user connected.");

    socket.on("disconnect", (reason) =>{
      console.log("user Disconnected");
    });
    
    socket.on("logMeIn", (data) =>{
      socket.ownerID = data.ownerID;

      socket.join("owner-"+ data.ownerID );
      socket.emit("loadOwnerNotifyList",getNotifyList());

    });

    socket.on("clearNewNotifications", (data) =>{
      io.sockets.in("owner-"+socket.ownerID).emit('clearNewNotifications');

      // db make seen = false => true
    });
  

});


server.listen(serverPort, () => {
  console.log('listening on *:2053');
});



function getNotifyList(){
    var tmpList ={"notifications":[
        {"seen":false, "read":false, "notifyType":"facebook", "ownerID":555, "userID":"694312234", "userName":"kursat Kurkaya", "itemType":"post", "postID":"3045724302135945", "pageID":"1570437211819111089606891313185650146", "verb":"add", "time":"1621875379", "message":"gidelim buralardan", "pageName":"Post Blog"},
        {"seen":false, "read":false, "notifyType":"instagram", "ownerID":555, "userID":"694312234", "userName":"kursat Kurkaya", "itemType":"post", "postID":"3045724302135945", "pageID":"1570437211819111089606891313185650146", "verb":"add", "time":"1520544814", "message":"ne olacak buralardan gidince", "pageName":"Post Blog"},
        {"seen":true, "read":false, "notifyType":"twitter", "ownerID":555, "userID":"undefined", "userName":"kursat Kurkaya", "itemType":"post", "postID":"3045724302135945", "pageID":"1570437211819111089606891313185650146", "verb":"add", "time":"1520544814", "message":"bilmiyorum ama gidek işte ne var yani", "pageName":"Post Blog"},
        {"seen":true, "read":true, "notifyType":"facebook", "ownerID":555, "userID":"undefined", "userName":"kursat Kurkaya", "itemType":"post", "postID":"3045724302135945", "pageID":"1570437211819111089606891313185650146", "verb":"add", "time":"1520544814", "message":"İyi hadi gidek bakalım....", "pageName":"Post Blog"}
    ]}
    return tmpList;
}
