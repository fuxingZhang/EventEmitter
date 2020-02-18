const EventEmitter = require('../EventEmitter');

const myEE = new EventEmitter();
const sym = Symbol('symbol');

const fn = () => { }
myEE.on('removeListener', (...args) => {
  console.log(args, args[0] === sym, args[1] === fn)
  console.log('removeListener')
});

myEE.on(sym, fn);
myEE.removeAllListeners()