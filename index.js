const express = require("express"); 
const {logware, auth} = require("./mw");
const {guitars} = require("./controllers");
const cookieParser = require("cookie-parser");

const app = express();
require("pug")

app.listen(3456,err=>{
    if(err)onsole.log(err);
    console.log("listening on: "+3456);
});

app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(express.json())


/* let guitars= [

    {id:1, title:"Les Paul"},
    {id:2, title:"Ibanez"},
    {id:3, title:"Stratocaster"}
]; */

let user = "admin";

//#region guitars
app.get("/guitars", logware, guitars.index);

app.post("/guitars", guitars.create)
app.get("/guitars/:id",logware,  guitars.show);
app.delete("/guitars/:id", auth(user), guitars.destroy);
app.put("/guitars/:id", guitars.update);

//#endregion



//AUTH routes


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid");

app.post("/login", login);
app.post("/verify", cookieParser(), verify);

async function login(req,res){

    let email = req.body.email;

    if(!email) return res.status(401).json(
        {TypeError: "Invalid credentials", message: "Please provide an email", success:false}
    );
    //One time password
    let code = uniqid();

    //simulates OTP being sent with a email. 
    console.log(code);

    let hash = await bcrypt.hash(code ,12);

    //uses environment variables created in windows
    let token = await jwt.sign({email, hash}, process.env.NODE_SECRET, {expiresIn:60});
    
    res.cookie("token",token,{
        httpOnly: true,
        maxAge: 60000,

    })
    res.json(token);


}
async function verify(req,res){
    let {code} = req.body;
    let {token} = req.cookies;


    //verify the token

    try {
        let checkedToken = await jwt.verify(token,process.env.NODE_SECRET);

        let hash = checkedToken.hash; 

        let checkpw = await bcrypt.compare(code, hash);
        
        if(checkpw){
            let payload = {
                email: checkedToken.email,
                role:"pwl_user"
            };
    
            let authToken = await jwt.sign(payload, process.env.NODE_PASSWORDLESS_TOKEN, {
                expiresIn: "3h",
    
            });
    
            return res.cookie("auth_token", authToken, {
                httpOnly: true
            }).json({
                authToken,
                success: true
            });
        }

        

        throw {TypeError: "Invalid Credentials", message: "Invalid credentials", success:false};
        
    } catch (error) {
        console.log("it do be erroring");
        console.log(error);
        return res.status(401).json(error);
    }
    
    // if token is verified -> check pw

    //if pw is ok -> new auth-token with long expiry date, used for future requests. 

    // res.json({code, token});

}

// const { verify } = require("crypto");

// app.post("/verify", verify);



const fs = require("fs");

app.get("/pug", testPug);
app.set("view engine", "pug");

async function testPug(req,res){
    //bad solution to the probleml.
    const gs = [{"title":"Gibson Explorer Korina custom","id":"98ue8eyclptmhb6q"},{"title":"Fender Stratocaster Professional II","id":"98ue89zolptmffp2"},{"title":"Gibson 80's deluxe","id":"98ue89c0lptmepz2"},{"title":"Gibson 80's deluxe","id":"98ue89c0lptmepz2"},{"title":"Fender Stratocaster Professional II","id":"98ue89zolptmffp2"},{"title":"Gibson Explorer Korina custom","id":"98ue8eyclptmhb6q"}];
    res.render("index", {title: "My cooler title", guitars: gs});
}