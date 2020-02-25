const util = require("util");

class ERR_UNHANDLED_ERROR extends Error {
  constructor(message) {
    const msg = util.format(`Unhandled error. (%O)`, message)
    super(msg);
    Error.captureStackTrace(this, ERR_UNHANDLED_ERROR);
    this.code = 'ERR_UNHANDLED_ERROR';
    this.context = message;
  }

  get name() {
    return `${super.name} [ERR_UNHANDLED_ERROR]`;
  }
}

module.exports = {
  ERR_UNHANDLED_ERROR
}