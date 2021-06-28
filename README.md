# javascript-helper
Collection of Javascript functions to simplify process.

```javascript
/**
 * Simplified version of setting data if its valid.
 * @param  {...any} arr 
 * @returns {any|false}
 */
export function or(...arr){
  for(let k of arr) return !!k ? k : false
}

/**
 * Traverse the structure of an object and returns all keys whether it's null or not 
 * @param {Object} object an object to traverse
 * @returns {Array} the result of all the keys in the object
 */
export function traverse(object, key = ''){
  if(!object) return [key]
  return Object.keys(object).reduce((p,c)=>{
    const _ = object[c];
    if(typeof _ === 'object')
      p.push(...traverse(_, [key, c].filter(Boolean).join('.')));
    else 
      p.push([key,c].filter(Boolean).join('.'))
    return p;
  }, []);
}

/**
 * Traverse the object and return the values of the object based on arr
 * @param {Object} object an object to traverse 
 * @param  {...any|Array} arr a spread operator or an array to get the key
 * @returns {Array} the result of all the values specified in arr
 */
export function traverseValue(object, ...arr){
  return (Array.isArray(arr) ? arr.flat() : arr).reduce((p,c)=>{
    const _ = c.split('.');
    let value = object;
    while((value = value[_.shift()]) && _.length > 0);
    p.push(value);
    return p;
  }, []);
}



```
