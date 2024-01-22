module.exports = {fileCount, fileSize, fileType};


function fileCount(MAX_COUNT=5){

    return async function(req,res,next){
        try{
            console.log("reached fileCount()");
            if(!req.files) return next();

            console.log("@fileCount(): ", req.files);
            
            // If myFiles object is not an array - then it cannot be looped over further down the mw pipeline.
            // And this makes coding the other mw's easier if files are stored in an array, no matter the count.  
            if(!req.files.myFiles.length){
                console.log("length", req.files.myFiles.length);
                
                req.files.myFiles = [req.files.myFiles];
                
                console.log("length", req.files.myFiles.length);
            }

            if(req.files.myFiles.length > MAX_COUNT) return res.status(413).json({success:false, error: "Too many files", number_of_files: req.files.myFiles.length});
            next();
        }
        catch(err){
            return res.status(500).json(err);
        }
    }
    
}

/**
 * Middleware that ensures that files exist, that they are stored correctly in the request, and that they follow a aggreed upon max-size.
 * @param {object} req - Request
 * @param {object} res - Response
 * @param {Function} next - Next function
 */
function fileSize(MAX_SIZE_OF_FILES= 200000000){
    return async function (req,res,next){ 
        try{
            if(!req.files) return next();
            
            console.log("@fileSize(): ", req.files);
            const faulty_files = req.files.myFiles.filter(f=>f.size>MAX_SIZE_OF_FILES).map(f=>f.name);
            if(faulty_files.length) return res.status(413).json({success:false, error: "Some files were too large", files: faulty_files});
            
            next();
        }
        catch(err){
            return res.status(500).json(err);
        }
}
}
function fileType(extensions){

    return async function(req,res,next){
        try{
            if(!req.files) return next();
            
    
            console.log("@fileType(): ", req.files.myFiles);
            
    
            /* //Implementation where ALL files must be valid in order to proceed.
            req.files.myFiles.forEach(f => {
                //  if condition is met, then the file fails and a status code can be sent. 
                if( /image/.exec(f.mimetype) ) return res.status(415).json({success:false, error: "Format not supported", file_name: f.name});
            });*/
    
            
            let faulty_files = req.files.myFiles.filter(f=>{
                let extension = f.name.split(".").pop().toLowerCase();
                return !(/image/.exec(f.mimetype) && extensions.filter(e => e == extension).length);
            }).map(f=>f.name);

            if(faulty_files.length) {
                console.log("Faulty @fileType: ",faulty_files)
                return res.status(400).json({success:false, error: "Format not supported on some images", files:faulty_files, allowed_extensions: extensions});
            }
            return next();
        }
        catch(err){
            console.log("err @ filetype", err);
            return res.status(500).json(err);
        }
    
    }
}
