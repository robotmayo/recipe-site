'use strict';
const crypto = require('crypto');
function MD5(txt){
  const m = crypto.createHash('md5');
  m.update(txt);
  return m.digest('hex');
}
module.exports = MD5;