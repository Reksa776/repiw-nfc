import { NextResponse } from 'next/server';
import { demo } from '@/lib/db';
import { safeBaseURL } from '@/lib/validation';
export const runtime='nodejs';
export async function GET(){return NextResponse.json({demo,base:safeBaseURL(),adminURL:'/admin',flowURL:'/flow-preview'},{headers:{'Cache-Control':'no-store'}})}
