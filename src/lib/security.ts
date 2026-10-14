import crypto from 'node:crypto';
const sha256=(value:string)=>crypto.createHash('sha256').update(value).digest('hex');
const safeEqual=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y)};
export function hashActivationCode(code:string){const salt=crypto.randomBytes(16).toString('hex');return `scrypt$${salt}$${crypto.scryptSync(code.toUpperCase(),salt,64).toString('hex')}`}
export function verifyActivationCode(code:string,stored:string){
 if(stored.startsWith('scrypt$')){const [,salt,expected]=stored.split('$');if(!salt||!expected)return false;return safeEqual(crypto.scryptSync(code.toUpperCase(),salt,64).toString('hex'),expected)}
 // Existing cards used an unsalted SHA-256 digest; activation consumes the code and replaces this value.
 if(/^[a-f0-9]{64}$/i.test(stored))return safeEqual(stored,sha256(code.toUpperCase()));
 return false;
}
