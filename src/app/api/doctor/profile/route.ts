import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken, DOCTOR_COOKIE_NAME } from '@/lib/doctor-auth';
import { supabase } from '@/lib/supabase';

// PUT: Update doctor's profile fields
export async function PUT(req: NextRequest) {
  const token = req.cookies.get(DOCTOR_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await verifyDoctorToken(token);
  if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  try {
    const { name, specialization, hospitalName, phone, city, bio, licenseId, organizationId } = await req.json();

    if (!name || !specialization || !hospitalName || !licenseId) {
      return NextResponse.json({ error: 'Name, specialization, hospital, and license ID are required.' }, { status: 400 });
    }

    const { data: doctor, error } = await supabase
      .from('doctors')
      .update({
        name,
        specialization,
        hospital_name: hospitalName,
        phone: phone || null,
        city: city || null,
        bio: bio || null,
        license_id: licenseId,
        organization_id: organizationId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.doctorId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        hospitalName: doctor.hospital_name,
        phone: doctor.phone,
        city: doctor.city,
        bio: doctor.bio,
        licenseId: doctor.license_id,
        organizationId: doctor.organization_id,
        isApproved: doctor.is_approved,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed.' }, { status: 400 });
  }
}
