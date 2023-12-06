const http = require("http");

http.createServer(handleServer).listen(3456, err=>{
    if(err) return console.log(err);
    
    console.log("listening on: " + 3456);
});


function handleServer(req, res){
    
    let message = {mes:"hi world2 "}

    res.writeHead("200",{"Content-Type": "application/json"});

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    "})

    res.end("Hello world");
}