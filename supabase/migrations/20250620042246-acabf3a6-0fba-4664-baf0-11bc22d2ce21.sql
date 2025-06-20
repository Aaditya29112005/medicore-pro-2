
-- Create enum types for medical data
CREATE TYPE public.user_role AS ENUM ('doctor', 'admin', 'nurse');
CREATE TYPE public.patient_status AS ENUM ('stable', 'monitoring', 'treatment', 'critical', 'discharged');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.prescription_status AS ENUM ('active', 'completed', 'discontinued');
CREATE TYPE public.lab_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create user profiles table for doctors
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'doctor',
  specialization TEXT,
  license_number TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create diseases table with real medical data
CREATE TABLE public.diseases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icd_code TEXT,
  category TEXT NOT NULL,
  description TEXT,
  symptoms TEXT[],
  risk_factors TEXT[],
  treatment_options TEXT[],
  prognosis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  blood_type TEXT,
  allergies TEXT[],
  medical_history TEXT[],
  current_medications TEXT[],
  status patient_status NOT NULL DEFAULT 'stable',
  risk_level risk_level NOT NULL DEFAULT 'low',
  assigned_doctor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_diagnoses table
CREATE TABLE public.patient_diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  disease_id UUID NOT NULL REFERENCES public.diseases(id),
  diagnosed_by UUID NOT NULL REFERENCES public.profiles(id),
  diagnosis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  severity TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  type TEXT NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  chief_complaint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  instructions TEXT,
  status prescription_status NOT NULL DEFAULT 'active',
  prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_results table
CREATE TABLE public.lab_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  ordered_by UUID NOT NULL REFERENCES public.profiles(id),
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  result_value TEXT,
  reference_range TEXT,
  unit TEXT,
  status lab_status NOT NULL DEFAULT 'pending',
  ordered_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_date DATE,
  notes TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vitals table
CREATE TABLE public.vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature DECIMAL(4,1),
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  oxygen_saturation INTEGER,
  respiratory_rate INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for diseases (public read access)
CREATE POLICY "Anyone can view diseases" ON public.diseases
  FOR SELECT USING (true);

-- Create RLS policies for patients
CREATE POLICY "Doctors can view all patients" ON public.patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'nurse')
    )
  );

-- Create similar policies for other tables
CREATE POLICY "Doctors can view all diagnoses" ON public.patient_diagnoses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'nurse')
    )
  );

CREATE POLICY "Doctors can view all appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'nurse')
    )
  );

CREATE POLICY "Doctors can view all prescriptions" ON public.prescriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'nurse')
    )
  );

CREATE POLICY "Doctors can view all lab results" ON public.lab_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'nurse')
    )
  );

CREATE POLICY "Doctors can view all vitals" ON public.vitals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin', 'nurse')
    )
  );

-- Create trigger function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'doctor')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample disease data
INSERT INTO public.diseases (name, icd_code, category, description, symptoms, risk_factors, treatment_options, prognosis) VALUES
('Hypertension', 'I10', 'Cardiovascular', 'High blood pressure, often called the silent killer', 
 ARRAY['Headaches', 'Shortness of breath', 'Nosebleeds', 'Chest pain'], 
 ARRAY['Age', 'Family history', 'Obesity', 'Smoking', 'Excessive salt intake'],
 ARRAY['ACE inhibitors', 'Diuretics', 'Lifestyle changes', 'Regular exercise'],
 'Good with proper management and medication compliance'),

('Type 2 Diabetes', 'E11', 'Endocrine', 'Chronic condition affecting blood sugar regulation',
 ARRAY['Frequent urination', 'Excessive thirst', 'Blurred vision', 'Fatigue', 'Slow wound healing'],
 ARRAY['Obesity', 'Sedentary lifestyle', 'Family history', 'Age over 45'],
 ARRAY['Metformin', 'Insulin therapy', 'Diet modification', 'Regular monitoring'],
 'Manageable with proper care, regular monitoring required'),

('Migraine', 'G43', 'Neurological', 'Recurrent headaches with moderate to severe pain',
 ARRAY['Severe headache', 'Nausea', 'Vomiting', 'Light sensitivity', 'Sound sensitivity'],
 ARRAY['Stress', 'Hormonal changes', 'Certain foods', 'Sleep patterns'],
 ARRAY['Triptans', 'Pain relievers', 'Preventive medications', 'Lifestyle modifications'],
 'Good with proper trigger management and medication'),

('Coronary Artery Disease', 'I25', 'Cardiovascular', 'Narrowing of coronary arteries',
 ARRAY['Chest pain', 'Shortness of breath', 'Fatigue', 'Heart palpitations'],
 ARRAY['High cholesterol', 'Smoking', 'Diabetes', 'High blood pressure', 'Family history'],
 ARRAY['Statins', 'Blood thinners', 'Angioplasty', 'Bypass surgery', 'Lifestyle changes'],
 'Variable depending on severity and treatment compliance'),

('Asthma', 'J45', 'Respiratory', 'Chronic inflammatory airway disease',
 ARRAY['Wheezing', 'Coughing', 'Shortness of breath', 'Chest tightness'],
 ARRAY['Allergies', 'Family history', 'Environmental factors', 'Respiratory infections'],
 ARRAY['Inhaled corticosteroids', 'Bronchodilators', 'Allergy medications', 'Trigger avoidance'],
 'Excellent with proper management and medication compliance'),

('Osteoarthritis', 'M15', 'Musculoskeletal', 'Degenerative joint disease',
 ARRAY['Joint pain', 'Stiffness', 'Swelling', 'Reduced range of motion'],
 ARRAY['Age', 'Obesity', 'Joint injury', 'Genetics', 'Repetitive stress'],
 ARRAY['NSAIDs', 'Physical therapy', 'Weight management', 'Joint replacement'],
 'Progressive condition, symptoms manageable with treatment'),

('Depression', 'F32', 'Mental Health', 'Persistent mood disorder affecting daily functioning',
 ARRAY['Persistent sadness', 'Loss of interest', 'Fatigue', 'Sleep disturbances', 'Concentration problems'],
 ARRAY['Family history', 'Trauma', 'Chronic illness', 'Substance abuse', 'Stress'],
 ARRAY['Antidepressants', 'Psychotherapy', 'Lifestyle changes', 'Support groups'],
 'Good with appropriate treatment and support'),

('Pneumonia', 'J18', 'Respiratory', 'Infection causing inflammation in lung air sacs',
 ARRAY['Cough with phlegm', 'Fever', 'Chills', 'Difficulty breathing', 'Chest pain'],
 ARRAY['Age extremes', 'Smoking', 'Chronic diseases', 'Weakened immune system'],
 ARRAY['Antibiotics', 'Antiviral medications', 'Rest', 'Hydration', 'Oxygen therapy'],
 'Excellent with prompt treatment, may be serious in elderly or immunocompromised');
