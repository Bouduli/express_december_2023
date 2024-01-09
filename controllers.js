const {saveToFile, getAllData} = require("./db");
const uniqid = require("uniqid");

module.exports={guitars:{update, index, show, create, destroy}};

async function update(req,res){
    try {
        let guitars = getAllData();
    
        let guitar = guitars.find(g=>g.id == req.params.id);
    
        if(!guitar) return res.status(400).json({error: "not present"});
        
        let {title} = req.body;
        
        if(!guitar) return res.status(400).json({error: "bad data"});
        
        
        guitar.title = title;
    
        saveToFile(guitars);
    
        res.status(200).json(guitar); 
    } catch (error) {
        res.status(500).json(error);   
    }

}

async function index(req,res){
    try {
        let guitars = await getAllData();
        res.json(guitars);
    } catch (error) {
        res.status(500).json(error);
    }
}

async function create(req,res){

    try {
        let guitars = await getAllData();

        let {title} = req.body;
        if(!title ) return res.status(400).json({error: "bad data"});
        let id = uniqid();
    
        let g = {title, id};
        guitars.push(g);

        guitars = [g,...guitars];

        saveToFile(guitars);

        res.status(200).json(g);
    } catch (error) {
        res.status(500).json(error);
    }
}

async function show(req,res){
    try {
        let guitars = await getAllData();
        let id = req.params.id;
    
        let guitar = guitars.find(g=>g.id==id);
    
        if(guitar) return res.status(200).json(guitar);
        return res.status(204).end("bruh");
    } catch (error) {
        return res.status(500).json(error)
    }
}
async function destroy(req,res){
    
    try {
        let guitars = await getAllData();

        let id = req.params.id;
        
        let filtered = guitars.filter((g)=>g.id!=id);
        guitars = [...filtered];
        if(filtered.length <= guitars.length){
            saveToFile(guitars);
            return res.status(200).json({success:true, deleted: id});
        }
        return res.status(200).json({error:"nothing deleted"});
    
    } catch (error) {
        res.status(500).json(error);
    }
}