'use strict';
const onceWrap = require('./onceWrap');
const checkListener = require('./checkListener');
const { ERR_UNHANDLED_ERROR } = require('./errors');

class EventEmitter {
  constructor() {
    this._events = Object.create(null);
    this._eventsCount = 0;
    this._maxListeners = undefined;
  }

  addListener(eventName, listener) {
    return this.on(eventName, listener);
  }

  emit(eventName, ...args) {
    const listeners = this._events[eventName];
    if (listeners === undefined) {
      if (eventName === 'error') {
        const error = args[0];
        
        if (error instanceof Error) throw error;

        const err = new ERR_UNHANDLED_ERROR(error);

        throw err; // Unhandled 'error' event
      }
      return false;
    }
    const copyListeners = [...listeners]
    for (const listener of copyListeners) {
      listener.apply(this, args);
    }

    return true;
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n)) {
      throw new RangeError(
        'The value of "n" is out of range. It must be a non-negative number. Received ' +
        n +
        '.'
      );
    }
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    if (this._maxListeners === undefined) {
      return EventEmitter.defaultMaxListeners;
    }
    return this._maxListeners;
  }

  listenerCount(eventName) {
    const events = this._events[eventName];
    return events === undefined ? 0 : events.length;
  }

  eventNames() {
    return Reflect.ownKeys(this._events);
  }

  listeners(eventName) {
    const listeners = this._events[eventName];
    return listeners === undefined ? [] : listeners;
  }

  off() {
    return this.removeListener(...arguments);
  }

  on(eventName, listener, prepend) {
    checkListener(listener);

    if (this._events[eventName] === undefined) {
      this._events[eventName] = [];
      this._eventsCount++;
    }
    const events = this._events[eventName];
    if (prepend) {
      events.unshift(listener);
    } else {
      events.push(listener);
    }

    // newListener
    if (eventName !== "newListener" && this._events["newListener"] !== undefined) {
      this.emit('newListener', eventName, listener);
    }

    // warn
    const maxListener = this.getMaxListeners(eventName);
    const eventLength = events.length;
    if (maxListener > 0 && eventLength > maxListener && !events.warned) {
      events.warned = true;
      // No error code for this since it is a Warning
      console.warn(`(node:${process.pid}) MaxListenersExceededWarning: Possible EventEmitter memory leak `
        + `detected. ${eventLength} ${String(eventName)} listeners added to [${this.constructor.name}].`
        + ` Use emitter.setMaxListeners() to increase limit`);
    }

    return this;
  }

  removeAllListeners(eventName) {
    const events = this._events;
    if (events === undefined) return this;

    // Not listening for removeListener, no need to emit
    if (events.removeListener === undefined) {
      if (arguments.length === 0) {
        this._events = Object.create(null);
        this._eventsCount = 0;
      } else if (events[eventName] !== undefined) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else
          delete events[eventName];
      }
      return this;
    }

    // Emit removeListener for all listeners on all events
    if (arguments.length === 0) {
      for (const key of Reflect.ownKeys(events)) {
        if (key === 'removeListener') continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this._events = Object.create(null);
      this._eventsCount = 0;
      return this;
    }

    const listeners = events[eventName];
    if (listeners !== undefined) {
      for (let i = listeners.length - 1; i >= 0; i--) {
        this.removeListener(eventName, listeners[i]);
      }
    }

    return this;
  }

  removeListener(eventName, listener) {
    checkListener(listener);

    const events = this._events;
    if (events.length === 0) return this;

    const list = events[eventName];
    if (list === undefined) return this;

    let index = -1;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener) {
        index = i;
        break;
      }
    }

    if (index < 0) return this;

    if (index === 0) {
      list.shift();
    } else {
      list.splice(index, 1);
    }

    if (events.removeListener !== undefined) {
      this.emit('removeListener', eventName, listener);
    }

    return this;
  }

  once(eventName, listener) {
    checkListener(listener);
    this.on(eventName, onceWrap(this, eventName, listener));
    return this;
  }

  prependListener(eventName, listener) {
    return this.on(eventName, listener, true);
  }

  prependOnceListener(eventName, listener) {
    checkListener(listener);
    this.prependListener(eventName, onceWrap(this, eventName, listener));
    return this;
  }

  rawListeners(eventName) {
    const events = this._events;
    if (events === undefined) return [];
    const listeners = events[eventName];
    if (listeners === undefined) return [];
    return [...listeners];
  }
}

let defaultMaxListeners = 10;
Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get() {
    return defaultMaxListeners;
  },
  set(arg) {
    if (typeof arg !== 'number' || arg < 0 || isNaN(arg)) {
      const error = new RangeError(
        'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
        arg +
        '.'
      );
      error.name = 'RangeError [ERR_OUT_OF_RANGE]'
      error.code = 'ERR_OUT_OF_RANGE'
      throw error
    }
    defaultMaxListeners = arg;
  },
});

module.exports = EventEmitter;