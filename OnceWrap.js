function onceWrapper() {
  this.target.removeListener(this.eventName, this.wrapFn);
  return this.listener.apply(this.target, arguments);
}

/**
 * @param {Object} target 
 * @param {String} eventName 
 * @param {Function} listener 
 */
function onceWrap(target, eventName, listener) {
  const context = { wrapFn: undefined, target, eventName, listener };
  const wrapped = onceWrapper.bind(context);
  wrapped.listener = listener;
  context.wrapFn = wrapped;
  return wrapped;
}

module.exports = onceWrap;