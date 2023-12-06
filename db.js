const fs = require("fs")

module.exports = {saveToFile, getAllData};

function saveToFile(data,fileName = "guitars.json"){

    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));


}

function getAllData(fileName="guitars.json"){

    return JSON.parse(fs.readFileSync(fileName));
}