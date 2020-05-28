function onceWrapper() {
  this.target.removeListener(this.type, this.wrapFn);
  return this.listener.apply(this.target, arguments);
}

/**
 * @param {Object} target 
 * @param {String} eventName 
 * @param {Function} listener 
 */
function onceWrap(target, type, listener) {
  const state = { wrapFn: undefined, target, type, listener };
  const wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

module.exports = onceWrap;