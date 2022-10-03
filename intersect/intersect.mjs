function isObject(obj) {
  return (obj && typeof obj === 'object' && !Array.isArray(obj));
}

function deepIntersect(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        deepIntersect(target[key], source[key]);
      } else {
        delete target[key]
      }
    }
  }
  return deepIntersect(target, ...sources);
}

const cleanObject = function (object) {
  Object
    .entries(object)
    .forEach(([k, v]) => {
      if (v && typeof v === 'object')
        cleanObject(v);
      if (v &&
        typeof v === 'object' &&
        !Object.keys(v).length ||
        v === null ||
        v === undefined ||
        v.length === 0
      ) {
        if (Array.isArray(object))
          object.splice(k, 1);
        else if (!(v instanceof Date))
          delete object[k];
      }
    });
  return object;
}



import fs from 'fs';

const old = './old'
const nw = './new'
const ot = './output'
if (!fs.existsSync(ot)) {
  fs.mkdirSync(ot)
}
if (fs.existsSync(old)) {
  fs.readdirSync(old).map((file) => {
    const ojson = JSON.parse(fs.readFileSync(old + '/' + file, { encoding: 'utf8' }))
    const njson = JSON.parse(fs.readFileSync(nw + '/' + file, { encoding: 'utf8' }))
    const out = cleanObject(deepIntersect(njson, ojson))
    fs.writeFileSync(ot + '/' + file, JSON.stringify(out, undefined, 2))
  })
}