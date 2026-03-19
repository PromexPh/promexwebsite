import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Role } from '@/lib/types';

interface RegisterBody {
  email: string;
  password: string;
  full_name: string;
  role: Role;
  phone?: string;
  country?: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
}

export async function POST(req: NextRequest) {
  let body: RegisterBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, password, full_name, role } = body;

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'email, password, full_name, and role are required' }, { status: 400 });
  }

  if (!['candidate', 'employer'].includes(role)) {
    return NextResponse.json({ error: 'role must be candidate or employer' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const userId = authData.user.id;

  // Create profile
  const profileData: Record<string, unknown> = {
    id: userId,
    email,
    full_name,
    role,
  };

  if (body.phone) profileData.phone = body.phone;
  if (body.country) profileData.country = body.country;
  if (role === 'employer') {
    if (body.company_name) profileData.company_name = body.company_name;
    if (body.company_size) profileData.company_size = body.company_size;
    if (body.industry) profileData.industry = body.industry;
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert(profileData);

  if (profileError) {
    // Clean up the auth user if profile insert fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Sign in to get a session token
  // Return user info — client should call supabase.auth.signInWithPassword for a session
  return NextResponse.json(
    {
      message: 'Account created successfully',
      user: { id: userId, email, full_name, role },
    },
    { status: 201 }
  );
}
