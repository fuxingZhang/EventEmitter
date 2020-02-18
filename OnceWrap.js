class OnceWrap {
  constructor(target, eventName, listener) {
    this.fired = false;
    this.wrapFn = this.onceWrapper.bind(this);
    this.target = target;
    this.eventName = eventName;
    this.listener = listener;
  }

  onceWrapper() {
    if (this.fired) return;
    this.target.removeListener(this.eventName, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0) return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

/**
 * @param {Object} target 
 * @param {String} eventName 
 * @param {Function} listener 
 */
function onceWrap(target, eventName, listener) {
  return new OnceWrap(target, eventName, listener).wrapFn;
}

module.exports = onceWrap;