import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendInquiryAlert, sendInquiryConfirmation } from '@/lib/email';

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const required = ['companyName', 'contactPerson', 'email', 'phone', 'country', 'positionsNeeded', 'urgency'];
  for (const f of required) {
    if (!body[f]) return NextResponse.json({ error: `${f} is required` }, { status: 400 });
  }

  // Combine extra fields into message
  const messageParts: string[] = [];
  if (body.requiredSkills)         messageParts.push(`Required Skills: ${body.requiredSkills}`);
  if (body.additionalRequirements) messageParts.push(`Additional Requirements: ${body.additionalRequirements}`);
  if (body.message)                messageParts.push(`Message: ${body.message}`);
  if (body.contractDuration)       messageParts.push(`Contract Duration: ${body.contractDuration}`);
  if (body.accommodationProvided)  messageParts.push(`Accommodation: ${body.accommodationProvided}`);
  if (body.companySize)            messageParts.push(`Company Size: ${body.companySize}`);
  if (body.website)                messageParts.push(`Website: ${body.website}`);

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .insert({
      company_name:    body.companyName,
      contact_person:  body.contactPerson,
      email:           body.email,
      phone:           body.phone,
      country:         body.country,
      industry:        body.industry || body.targetIndustry,
      positions_needed: body.positionsNeeded,
      number_of_workers: body.numberOfWorkers ? parseInt(String(body.numberOfWorkers), 10) || null : null,
      urgency:         body.urgency,
      employment_type: body.employmentType,
      salary_range:    body.salaryRange,
      message:         messageParts.join('\n\n') || null,
      status:          'new',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  void sendInquiryAlert({
    companyName:     String(body.companyName),
    contactPerson:   String(body.contactPerson),
    email:           String(body.email),
    phone:           String(body.phone),
    country:         String(body.country),
    positionsNeeded: String(body.positionsNeeded),
    numberOfWorkers: body.numberOfWorkers ? parseInt(String(body.numberOfWorkers), 10) || null : null,
    urgency:         String(body.urgency),
    industry:        body.industry       ? String(body.industry)       : undefined,
    employmentType:  body.employmentType ? String(body.employmentType) : undefined,
    salaryRange:     body.salaryRange    ? String(body.salaryRange)    : undefined,
    message:         messageParts.join('\n\n') || undefined,
  });

  void sendInquiryConfirmation({
    email:           String(body.email),
    companyName:     String(body.companyName),
    contactPerson:   String(body.contactPerson),
    positionsNeeded: String(body.positionsNeeded),
    numberOfWorkers: body.numberOfWorkers ? parseInt(String(body.numberOfWorkers), 10) || null : null,
    urgency:         String(body.urgency),
    country:         String(body.country),
  });

  return NextResponse.json({ inquiry: data }, { status: 201 });
}
