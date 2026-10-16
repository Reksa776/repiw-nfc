import {test,expect} from '@playwright/test';

// Runs against the SECOND e2e server (port 3183), which is started WITHOUT
// PLAYWRIGHT_RESOLVER_ENABLED, i.e. the production default. This proves the global kill switch:
// with the flag off, no resolution can be requested and no browser work is possible.

const DISABLED_BASE='http://127.0.0.1:3183';

test('the resolver kill switch refuses new resolution requests',async({request})=>{
 const res=await request.post(`${DISABLED_BASE}/api/resolve`,{data:{url:'https://maps.app.goo.gl/HihE1JQdDmzBDCVC8'}});
 expect(res.status()).toBe(503);
 const body=await res.json();
 expect(body.error).toContain('belum aktif');
});

test('the kill switch cannot be bypassed with an admin-shaped payload or an official URL',async({request})=>{
 const adminShaped=await request.post(`${DISABLED_BASE}/api/resolve`,{data:{url:'https://search.google.com/local/writereview?placeid=ChIJQeGqDPodby4RQBEuhEv7Zjs',cardCode:'RP-0000000000'}});
 expect(adminShaped.status()).toBe(503);
});

test('resolution status lookups stay limited to well-formed tokens',async({request})=>{
 expect((await request.get(`${DISABLED_BASE}/api/resolve/short`)).status()).toBe(400);
 expect((await request.get(`${DISABLED_BASE}/api/resolve/${'a'.repeat(30)}`)).status()).toBe(404);
});
