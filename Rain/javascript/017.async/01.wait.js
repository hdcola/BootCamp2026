function promises(ms){
    return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            resolve(console.log("e"))
        } ,ms)
    })
}

async function time(){
    await promises(1000)
}

 time()

 