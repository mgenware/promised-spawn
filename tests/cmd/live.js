function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

delay(200);
console.log('log 🏃‍♀️🏃‍♂️🏃');
delay(100);
console.error('error 🏃‍♀️🏃‍♂️🏃');
delay(200);
console.log('log 🏃‍♀️🏃‍♂️🏃');
delay(500);
console.error('error 🏃‍♀️🏃‍♂️🏃');
delay(200);
console.log('log 🏃‍♀️🏃‍♂️🏃');
delay(100);
console.error('error 🏃‍♀️🏃‍♂️🏃');
const args = process.argv.slice(2);
console.log(args);
if (args[0] === 'panic') {
  process.exit(100);
}
