const EventEmitter = require('../EventEmitter');

const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.once('foo', () => console.log('c'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
myEE.emit('foo');