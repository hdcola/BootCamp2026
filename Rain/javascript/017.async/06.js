
async function times(a, b, delay = 2000) {
  return new Promise((resolve) =>
    setTimeout(() => {
      const result = a * b;
      resolve(result);
    }, delay),
  );
}

async function counting(){
    const number = [1,2,3,4]
for(i = 0; i < number.length; i++){
let result1 = await times(number[i], 2, 2000)
console.log(result1)
}
}
counting()