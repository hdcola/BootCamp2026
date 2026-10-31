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

async function procces(){
 let result = await times(2,6,2000)
 console.log(result)
 let result2 = await divide(result,3,4000)
 console.log(result2)
}

procces();