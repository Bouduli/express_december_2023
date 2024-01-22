const express = require("express");
const fu = require("express-fileupload");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const fs = require("fs");

//used for creating, signing and verifying jwts - acheiving stateless login. 
const jwt = require("jsonwebtoken");

//shorthand configuration for environment variables;
require('dotenv').config();

//used for templating
require("pug")

//self writtem modules

const {getAllData} = require("./db");
const send = require("./email");
//controller functions for guitar related stuff
const {guitars} = require("./controllers");

//self written middlewares
const {logware, auth,isUser, isMine} = require("./mw");
const fileMw = require("./mwFileUpload");


//setup
const app = express();
const PORT = 3456;
app.listen(PORT,err=>{
    if(err)onsole.log(err);
    console.log(`Server starting @ http://localhost:${PORT}`);
});
//sets the template engine
app.set("view engine", "pug");


//Global MWs
//Public folder for static resources
app.use(express.static("public"));
//MAKE SURE THAT ./uploads/ EXIST BEFORE UPLOADING IMAGES OTHERWHISE THEY WONT SHOW.
app.use(express.static("uploads"));

//processing cookies for all routes
app.use(cookieParser());

//used to determine, on all routes; wether or not a user is logged in.
app.use(isUser);

//parse incoming data 
app.use(express.urlencoded({extended:true}));
app.use(express.json());
31
app.use(fu());





//#region guitars
app.get("/create", logware, auth, (req,res)=>{
    let user = req.user;
    res.render("createGuitar.pug", {title: "Create Guitar", user})
});

app.get("/guitars", guitars.index);
app.post("/guitars", auth, fileMw.fileCount(), fileMw.fileSize(20000000), fileMw.fileType(["jpg", "jpeg", "png", "gif", "heif"]),guitars.create)
app.get("/guitars/:id",logware,  guitars.show);
app.delete("/guitars/:id", auth, isMine, guitars.destroy);
app.put("/guitars/:id", guitars.update);

//#endregion


//#region File-Upload 16/1

app.get("/fu", (req,res)=>{
    let user = req.user;
    res.render("fu", {title: "File Upload", user});
});
app.post("/fu", /*fileMw.fileCount, fileMw.fileSize, fileMw.fileType ,*/ (req,res)=>{
    console.log("@ POST/fu. Files: ", req.files);
    
    req.files.myFiles.forEach(f=>{
        let name = uniqid();

        let ext = f.name.split(".").pop();
        // console.log("ext", ext);

        f.mv(`uploads/${name}.${ext}`);
    })
    res.send("file uploaded");
});


//#endregion

//#region Authorization
app.post("/login", login);
app.post("/verify", verify);
app.get("/logout", logout);

async function login(req,res){
    
    let email = req.body.email;
    const IS_CLIENT = req.body.client ?? false;
    
    if(!email) return res.status(401).json(
        {TypeError: "Invalid credentials", message: "Please provide an email", success:false}
        );
    //One time password
    let code = uniqid();
    
    //simulates OTP being sent with a email. 
    console.log(code);
        
    let hash = await bcrypt.hash(code ,12);
    
    //uses environment variables created in windows
    let token = await jwt.sign({email, hash}, process.env.NODE_OTP_TOKEN_SECRET, {expiresIn:120});
    
    //skicka kod till användare via send


    //OBS OBS OBS OBS - KOMMENTERA TILLBAKA
    // send(email,code);

    // console.log("@Login - is client:", IS_CLIENT);

    res.cookie("token",token,{
        httpOnly: true,
        maxAge: 60000,
        
    })
    if(IS_CLIENT) return res.redirect("/verify");

    return res.json(token);
    
    
}
async function verify(req,res){
    let {code} = req.body;
    let {token} = req.cookies;
    const IS_CLIENT = req.body.client ?? false;

    // if token is verified -> check pw
    
    //if pw is ok -> new auth-token with long expiry date, used for future requests. 
    
    
    try {
        //verify the otp-token
        let OTP_Token = await jwt.verify(token,process.env.NODE_OTP_TOKEN_SECRET);
        
        let hash = OTP_Token.hash; 
        
        //checking pw
        let checkpw = await bcrypt.compare(code, hash);
        
        if(checkpw){
            let payload = {
                email: OTP_Token.email,
                role:"pwl_user"
            };
            
            //Long term authentication token, is stored in a cookie. 
            let authToken = await jwt.sign(payload, process.env.NODE_LONG_TERM_TOKEN_SECRET, {
                expiresIn: "3h",
                
            });

            // console.log("@Verify - is client:", IS_CLIENT);
            
            res.cookie("auth-token", authToken, {
                httpOnly: true
            });
            if(IS_CLIENT) return res.redirect("/?logged in");
            
            return res.json({
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
    
    
    
}

async function logout(req,res){
    req.user = false;
    res.clearCookie("auth-token");
    return res.redirect("./?logged_out");
}

//#endregion




//templating


app.get("/test", (req,res)=>{

    let cars = ["bmw", "tesla", "mercedes"];
    res.render("test", {title: "cars" ,cars});
});
app.get("/", isUser, async (req,res)=>{
    let guitars = await getAllData();
    let user = req.user
    // console.log("@index: user is ", user);
    console.log(guitars);
    res.render("guitars", {title: "My Guitars", guitars, user});
});

app.get("/verify", async (req,res)=>{
    res.render("verify", {title: "verify"});
})
app.get("/login", async (req,res)=>{
    res.render("login", {title: "login"});
})

// async function testPug(req,res){
//     //bad solution to the probleml.
//     const gs = [{"title":"Gibson Explorer Korina custom","id":"98ue8eyclptmhb6q"},{"title":"Fender Stratocaster Professional II","id":"98ue89zolptmffp2"},{"title":"Gibson 80's deluxe","id":"98ue89c0lptmepz2"},{"title":"Gibson 80's deluxe","id":"98ue89c0lptmepz2"},{"title":"Fender Stratocaster Professional II","id":"98ue89zolptmffp2"},{"title":"Gibson Explorer Korina custom","id":"98ue8eyclptmhb6q"}];
//     res.render("index", {title: "My cooler title", guitars: gs});
// }
