import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const doctors = [
  {
    email: 'dr.smith@example.com',
    password: 'Password123!',
    user_metadata: {
      full_name: 'Dr. John Smith',
      role: 'doctor',
      specialization: 'Cardiology',
      license_number: 'MD100001',
      phone: '+1 (555) 100-0001',
      username: 'drsmith'
    }
  },
  {
    email: 'dr.johnson@example.com',
    password: 'Password123!',
    user_metadata: {
      full_name: 'Dr. Emily Johnson',
      role: 'doctor',
      specialization: 'Endocrinology',
      license_number: 'MD100002',
      phone: '+1 (555) 100-0002',
      username: 'drjohnson'
    }
  },
  {
    email: 'dr.williams@example.com',
    password: 'Password123!',
    user_metadata: {
      full_name: 'Dr. Robert Williams',
      role: 'doctor',
      specialization: 'General Medicine',
      license_number: 'MD100003',
      phone: '+1 (555) 100-0003',
      username: 'drwilliams'
    }
  },
  {
    email: 'dr.brown@example.com',
    password: 'Password123!',
    user_metadata: {
      full_name: 'Dr. Lisa Brown',
      role: 'doctor',
      specialization: 'Orthopedics',
      license_number: 'MD100004',
      phone: '+1 (555) 100-0004',
      username: 'drbrown'
    }
  }
];

async function seedDoctors() {
  for (const doc of doctors) {
    const { data, error } = await supabase.auth.admin.createUser(doc);
    if (error) {
      console.error(`Error creating ${doc.user_metadata.full_name}:`, error.message);
    } else {
      console.log(`Created: ${doc.user_metadata.full_name}`, data);
    }
  }
  console.log('Doctor seeding complete.');
}

seedDoctors(); 