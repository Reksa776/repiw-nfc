import {describe,expect,it} from 'vitest';
import {hashActivationCode,verifyActivationCode} from '../src/lib/security';
import {validReviewURL,generateSchema,activationSchema} from '../src/lib/validation';
import {createHash} from 'node:crypto';

describe('activation code hashing',()=>{
 it('stores a salted scrypt hash and verifies it case-insensitively',()=>{const hash=hashActivationCode('a1b2c3d4e5f6');expect(hash.startsWith('scrypt$')).toBe(true);expect(verifyActivationCode('A1B2C3D4E5F6',hash)).toBe(true);expect(verifyActivationCode('000000000000',hash)).toBe(false)});
 it('accepts a legacy SHA-256 digest for one-time migration',()=>{const old=createHash('sha256').update('AB12CD34EF56').digest('hex');expect(verifyActivationCode('ab12cd34ef56',old)).toBe(true);expect(verifyActivationCode('different',old)).toBe(false)});
});
describe('input policy',()=>{
 it('accepts HTTPS Google review destinations and rejects unsafe hosts',()=>{expect(validReviewURL('https://g.page/r/example/review')).toBe(true);expect(validReviewURL('https://maps.app.goo.gl/example')).toBe(true);expect(validReviewURL('http://google.com')).toBe(false);expect(validReviewURL('https://google.com.attacker.example/review')).toBe(false);expect(validReviewURL('https://user:pass@google.com')).toBe(false)});
 it('bounds generation batches and validates activation shape',()=>{expect(generateSchema.safeParse({count:100}).success).toBe(true);expect(generateSchema.safeParse({count:101}).success).toBe(false);expect(activationSchema.safeParse({code:'RP-1234567890',activationCode:'1234567890AB',reviewURL:'https://g.page/r/x'}).success).toBe(true)});
});
