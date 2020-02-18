function checkListener(listener) {
  if (typeof listener !== 'function') {
    const err = new Error(`The "listener" argument must be of type Function. Received type ${typeof listener}`);
    err.code = 'ERR_INVALID_ARG_TYPE';
    throw err;
  }
}

module.exports = checkListener