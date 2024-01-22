const {saveToFile, getAllData, removeAllData, dirExists} = require("./db");
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
    const IS_CLIENT = req.body.client ?? true;

    

    try {
        let files = req.files ? handleFiles(req.files.myFiles) : false;
        console.log("@files create: ",files);
        
        let guitars = await getAllData();

        let {title} = req.body;
        if(!title ) return res.status(400).json({error: "bad data"});
        let id = uniqid();
        let g = {title, id, user: req.user, files};
        
        guitars = [g,...guitars];

        await saveToFile(guitars);
        if(IS_CLIENT) return res.status(200).json(g);
        return res.redirect("/");
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
    const IS_CLIENT = req.body.client ?? true;
    
    try {
        let guitars = await getAllData();
        let id = req.params.id;

        //for removal of images
        let guitarToRemove = guitars.find(g=>g.id==id);

        console.log("guitar to remove: ", guitarToRemove);
        let filtered = guitars.filter((g)=>g.id!=id);
        guitars = [...filtered];
        if(filtered.length <= guitars.length){
            saveToFile(guitars);
            if(guitarToRemove.files.length){
                guitarToRemove.files.forEach(async(f)=>{
                    await removeAllData(f);
                });
                
            }
            return res.status(200).json({success:true, message: "deleted", id});
        }
        if(IS_CLIENT) return res.status(200).json({error:"nothing deleted"});
        return res.redirect("/");
    
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}

function handleFiles(files, folder="uploads"){
    

    if(!files.length) files = [files];
    console.log("files @ handleFiles() : ", files);
    // await dirExists();
    
    return files.map(f=>{
        let ext = f.name.split(".").pop();
        let name = uniqid() + "." + ext;
        name = name.toLowerCase();
        f.mv( folder+"/"+ name);
        return name;
    });
}

