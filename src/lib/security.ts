import crypto from 'node:crypto';
const sha256=(value:string)=>crypto.createHash('sha256').update(value).digest('hex');
const safeEqual=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y)};
function activationEncryptionKey(){const secret=process.env.ACTIVATION_CODE_ENCRYPTION_KEY||process.env.SESSION_SECRET;if(!secret||Buffer.byteLength(secret)<32)throw new Error('Set ACTIVATION_CODE_ENCRYPTION_KEY or a 32-byte SESSION_SECRET to protect stored activation codes.');return Buffer.from(crypto.hkdfSync('sha256',Buffer.from(secret),'repiw-activation-codes-v1','card-code-encryption',32));}
export function encryptActivationCode(code:string){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',activationEncryptionKey(),iv);const encrypted=Buffer.concat([cipher.update(code.toUpperCase(),'utf8'),cipher.final()]);return `v1:${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${encrypted.toString('base64url')}`;}
export function decryptActivationCode(value:string){const [version,iv,tag,payload]=value.split(':');if(version!=='v1'||!iv||!tag||!payload)throw new Error('Stored activation code has an unsupported format.');const decipher=crypto.createDecipheriv('aes-256-gcm',activationEncryptionKey(),Buffer.from(iv,'base64url'));decipher.setAuthTag(Buffer.from(tag,'base64url'));return Buffer.concat([decipher.update(Buffer.from(payload,'base64url')),decipher.final()]).toString('utf8');}
export function hashActivationCode(code:string){const salt=crypto.randomBytes(16).toString('hex');return `scrypt$${salt}$${crypto.scryptSync(code.toUpperCase(),salt,64).toString('hex')}`}
export function verifyActivationCode(code:string,stored:string){
 if(stored.startsWith('scrypt$')){const [,salt,expected]=stored.split('$');if(!salt||!expected)return false;return safeEqual(crypto.scryptSync(code.toUpperCase(),salt,64).toString('hex'),expected)}
 // Existing cards used an unsalted SHA-256 digest; activation consumes the code and replaces this value.
 if(/^[a-f0-9]{64}$/i.test(stored))return safeEqual(stored,sha256(code.toUpperCase()));
 return false;
}
