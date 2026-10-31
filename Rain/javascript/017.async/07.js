async function times(a, b, delay = 2000) {
  return new Promise((resolve) =>
    setTimeout(() => {
      const result = a * b;
      resolve(result);
    }, delay),
  );
}

 async function divide(a, b, delay = 2000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (b === 0) {
         throw new Error("can not be 0")
      } else {
        resolve(a / b);
      }
    }, delay);
  });
}
async function divide0(a, b, delay = 2000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (b === 0) {
         throw new Error("can not be 0")
      } else {
        resolve(a / b);
      }
    }, delay);
  });
}

async function procces(){
 let result = await times(3,5,1000)
 console.log(result)
 try{
 let result2 = await divide(result,2,2000)
 console.log(result2)
 let result3 = await divide0(result2,0,3000)
 console.log(result3)
 }catch(err){
console.error(err)
 }
}

procces();