'use strict';
function isEmptyValues(obj) {
  const keys = Object.keys(obj);
  if (keys.length === 0) return true;
  let isEmpty = true;

  keys.forEach(key => {
    if (obj[key] !== undefined)
      isEmpty = false;
  });
  return isEmpty;
}

exports.isEmptyValues = isEmptyValues;
