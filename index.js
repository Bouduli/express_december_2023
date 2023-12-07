const express = require("express"); 
const {logware, auth} = require("./mw");
const {guitars} = require("./controllers")
const app = express();

app.listen(3456,err=>{
    if(err)onsole.log(err);
    console.log("listening on: "+3456);
});

app.use(express.urlencoded({extended:true}))
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
app.get("/guitars/:id",logware, auth(user), guitars.show);
app.delete("/guitars/:id", guitars.destroy);
app.put("/guitars/:id", guitars.update);

//#endregion



//AUTH routes


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid");

app.post("/login", login);

async function login(req,res){

    let email = req.body.email;

    //One time password
    let code = uniqid();
    console.log(code);

    let hash = bcrypt.hash(code ,12);

    let token = await jwt.sign({email, hash}, process.env.secret, {expiresIn:60});
    res.json(token);


}


// app.post("/verify", verify);



