async function times(a, b, delay = 2000) {
  return new Promise((resolve) =>
    setTimeout(() => {
      const result = a * b;
      resolve(result);
    }, delay),
  );
}



async function procces(){
    console.time("")
const [result1,result2] = await Promise.all([times(2, 3, 2000), times(4, 5, 2000)])
console.log(result1)
console.log(result2)
console.timeEnd("")
}

procces();