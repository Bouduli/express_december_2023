module.exports = {logware, auth, isUser,isMine};

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {getAllData} = require("./db");

// Custom middleware
function logware(req, res, next){
    console.log("URL: " + req.url);
    next();
}


async function auth (req,res,next){
    // console.log(req.cookies);
    let token = req.cookies["auth-token"];
    try{
        token = jwt.verify(token, process.env.NODE_LONG_TERM_TOKEN_SECRET);
        let user = {email: token.email, role: token.role}
        req.user = user;
        next();
    }
    catch{
        return res.redirect("/error_AUTH_MW");
    }
}

async function isUser(req,res,next){
    // console.log(req.cookies);
    let token = req.cookies["auth-token"];
    try{
        token = jwt.verify(token, process.env.NODE_LONG_TERM_TOKEN_SECRET);
        let user = {email: token.email, role: token.role}
        req.user = user;
    }
    catch{
        req.user=false;
    }

    next();
}
async function isMine(req,res,next){
    
    try {
        let {id} = req.params;
        let guitars = await getAllData();

        let guitar = guitars.find(g=>{
            console.log(g);
            return g.id == id && g.user.email==req.user.email;
        });
        if(guitar) next();
        
        else res.send({error: "not your guitar"});
    } catch (err) {
        console.log("Error @ isMine: ", err);
        return res.status(500).send(err);
    }
}