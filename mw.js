module.exports = {logware, auth};

// Custom middleware
function logware(req, res, next){
    console.log("URL: " + req.url);
    if (req.url == "/") return res.send("bad req");
    next();
}


function auth (user){

    return function(req, res, next){
        if(user == "user"){
            console.log("Auth as user");
            return next();
        } 
        if(user=="admin"){
            console.log("auth as admin");
            return next();
        }
        else{
            return res.send("forbidden");
        }
    }
}