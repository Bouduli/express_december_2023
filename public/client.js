console.log("Loaded from client.js");

// Add listener to guitarContainer
if(document.querySelector(".guitarContainer")){
    document.querySelector(".guitarContainer")
    .addEventListener("click", async (ev)=>{
        ev.preventDefault();
        console.log("link clicked");

        if(ev.target.dataset.type){
            
            console.log("datatype: " , ev.target.dataset.type);
            if(ev.target.dataset.type == "delete"){

                await deleteGuitar(ev.target.href);
            }
            // etc. etc.
            if(ev.target.dataset.type == "update") {

            }
        }
    });
}

async function deleteGuitar(href){
    console.log("href: ",href);

    let response = await fetch(href, {
        method: "DELETE",

    });
    response = await response.json();
    if(response.id) document.getElementById(response.id).remove();
}

// document.querySelector("#createGuitar").addEventListener("submit", handleCreate);
// async function handleCreate(ev){
//     ev.preventDefault();


//     let data  = new FormData(ev.target);
//     console.log(ev.target.client);
     
//     let response = await fetch("/guitars", {
//         method: "POST",
//         credentials: "include",
//         body: data,

//     });

//     response = await response.text();
//     console.log(response);


// }