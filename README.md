# javascript-helper
Collection of Javascript functions to simplify process.

```javascript
/**
 * Simplified version of setting data if its valid.
 * @param  {...any} arr 
 * @returns {any|false}
 */
export function or(...arr){
  return arr.find(e=>!!e) || false;
}

/**
 * Make sure that everything is valid before it returns true
 * @param  {...any} arr 
 * @returns {boolean}
 */
export function and(...arr){
  return arr.find(e=>!!e);
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
    if(typeof _ === 'object' && !Array.isArray(_))
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

/**
 * Encode text to Uint8Array. (Works better than TextEncoder())
 */
export function encode(str){
  return new Uint8Array(str.split('').map(e=>e.charCodeAt(0)));
}

/**
 * Decode buffer to string
 */
 export function decode(buffer){
  return Array.from(new Uint8Array(buffer), e=>String.fromCharCode(e)).join('');
 }

/**
 * Generate random text 
 */
 export function random(len){
  return Array.from(crypto.getRandomValues(new Uint8Array(len))).map(e=>e.toString(16).padStart(2, '0')).join('');
 }
 
 /**
  * Generate VAPID Key
  */
  export async function generateVapidKey(){
    function bin2hex(str){
      let _ = '',i = 0;
      for(; i < str.length; i++)
        _+= str[i].charCodeAt().toString(16).padStart(2, '0');
      return _;
    }

    function hex2bin(str){
      let _ = '', i = 0;
      for(; i < str.length; i+=2)
        _+= String.fromCharCode(parseInt(str.substr(i,2), 16));
      return _;
    }
    
    function swap(str, to_underscore = false){
      return to_underscore ? 
        str.replace(/(\+|\/)/g, e=>e === '+' ? '-' : '_') : 
        str.replace(/(\-|_)/g, e=>e === '-' ? '+' : '/'); 
    }
    
    function JWK2Key(jwk){
      let {x,y,d} = jwk;

      if(d){
        d = d.replace(/(-|_)/g, e=>e == '-' ? '+' : '/');
        d = bin2hex(atob(d)).padStart(64, '0');
        return btoa(hex2bin(d)).replace(/=/g, '');
      }
      else{
        x = x.replace(/(-|_)/g, e=>e == '-' ? '+' : '/');
        y = y.replace(/(-|_)/g, e=>e == '-' ? '+' : '/');
        x = bin2hex(atob(x)).padStart(64, '0');
        y = bin2hex(atob(y)).padStart(64, '0');
        return (btoa(hex2bin('04' + x + y))).replace(/=/g, '');
      }
    }
    const {subtle} = crypto;
    const elliptic_crv = {
      name : 'ECDSA',
      namedCurve : 'P-256'
    };
    const {privateKey, publicKey} = await subtle.generateKey(elliptic_crv, true, ['sign', 'verify']);
    let private_jwk = await subtle.exportKey('jwk', privateKey);
    let public_jwk = await subtle.exportKey('jwk', publicKey);
        
    return {privateKey: JWK2Key(private_jwk), publicKey : JWK2Key(public_jwk)}    
  }
```
