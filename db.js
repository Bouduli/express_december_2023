const fs = require("fs");
const { resolve } = require("path");

module.exports = {saveToFile, getAllData};

async function saveToFile(data,fileName = "guitrs.json"){

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
