const express = require("express"); 
const uniqid = require("uniqid");
const {logware, auth} = require("./mw");
const {saveToFile, getAllData} = require("./db");

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

app.get("/guitars", logware, index);

app.post("/guitars", create)
app.get("/guitars/:id",logware, auth(user), show);
app.delete("/guitars/:id", destroy);
app.put("/guitars/:id", update);

function update(req,res){
    let guitars = getAllData();

    let guitar = guitars.find(g=>g.id == req.params.id);

    if(!guitar) return res.status(400).json({error: "not present"});
    
    let {title} = req.body;
    
    if(!guitar) return res.status(400).json({error: "bad data"});
    
    
    guitar.title = title;

    saveToFile(guitars);

    res.status(200).json(guitar); 

}

function index(req,res){
    let guitars = getAllData();
    res.json(guitars);
}

function create(req,res){

    let guitars = getAllData();

    let {title} = req.body;
    if(!title ) return res.status(400).json({error: "bad data"});
    let id = uniqid();
    
    let g = {title, id};
    guitars.push(g);

    guitars = [g,...guitars];

    saveToFile(guitars);

    res.status(200).json(g);
}

function show(req,res){
    let guitars = getAllData();
    let id = req.params.id;

    let guitar = guitars.find(g=>g.id==id);

    if(guitar) return res.status(200).json(guitar);
    return res.status(204).end("bruh");
}
function destroy(req,res){
    
    let guitars = getAllData();

    let id = req.params.id;

    let filtered = guitars.filter((g)=>g.id!=id);
    if(filtered.length <= guitars.length){
        guitars = [...filtered];
        saveToFile(guitars);
        return res.status(200).json({success:true, deleted: id});
    }
    
    res.status(200).json({TypeError: "Nothing deleted"})
}
