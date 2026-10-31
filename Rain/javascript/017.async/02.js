
 function times(a, b, delay = 2000) {
  return new Promise((resolve) =>
    setTimeout(() => {
      const result = a * b;
      resolve(result);
    }, delay),
  );
}

 function divide(a, b, delay = 2000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (b === 0) {
        reject("can't divide 0");
      } else {
        resolve(a / b);
      }
    }, delay);
  });
}

async function calculate(){
 let result = await times(2,3,2000)
 console.log(result)
 let result2 = await divide(result,3,4000)
 console.log(result2)
}

calculate();