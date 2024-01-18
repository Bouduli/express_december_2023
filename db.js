const fs = require("fs");
const { resolve } = require("path");

module.exports = {saveToFile, getAllData, removeAllData,dirExists};

async function saveToFile(data,fileName = "guitars.json"){

    // fs.writeFileSync(fileName, JSON.stringify(data, null, 2));

    fs.writeFile(fileName, JSON.stringify(data,null,2), function(err){
        if(err) console.log(err);
    })

}

function getAllData(fileName="guitars.json"){

    return new Promise(function(resolve, reject){
        fs.readFile(fileName, function(err, data){
            if(err) return reject(err);
            
            resolve(JSON.parse(data));
        })

    })
}
function removeAllData(fileName,folder="uploads"){
    const path = `./${folder}/${fileName}`;
    return new Promise(function(resolve, reject){
        fs.rm(path, function(err){
            if (err) return reject(err);
            resolve({success: "true", })
        })
    })
}

// Techincally works, however current implementation of express.static to access the dir
// makes this unusable in its current state. 
//MAKE SURE THAT ./uploads/ EXIST BEFORE UPLOADING IMAGES
function dirExists(dir= "./uploads/"){
    return new Promise( function(resolve,reject){
        fs.access(dir, async function(err){
            
            if(err){
                console.log("@dirExists() : no directory of ", dir);
                fs.mkdir(dir, function(err){
                    if(err) console.log("@dirExists->mkdir() : Unable to create folder");
                });
                console.log("see if ./uploads is successfully created.");
                resolve({success: true})
            }
            resolve({success:true})
        })
    })
}
