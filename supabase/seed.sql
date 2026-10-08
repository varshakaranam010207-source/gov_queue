-- ============================================================================
-- GOVQUEUE AI - Supabase PostgreSQL Seed Data
-- Realistic Indian Public Administration Service Catalog & Demo Accounts
-- ============================================================================

-- Seed Demo Users (bcrypt hash for: Demo@123)
-- Password hash: $2a$10$PE8q7LVHaGNuWv.x67R0gOGLUoHZrdZExC3paSnCIZrzktNnfqj3C
INSERT INTO users (id, full_name, email, phone, password_hash, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo Citizen', 'citizen@govqueue.demo', '9876543210', '$2a$10$PE8q7LVHaGNuWv.x67R0gOGLUoHZrdZExC3paSnCIZrzktNnfqj3C', 'CITIZEN'),
  ('22222222-2222-2222-2222-222222222222', 'Demo Staff Officer', 'staff@govqueue.demo', '9876543211', '$2a$10$PE8q7LVHaGNuWv.x67R0gOGLUoHZrdZExC3paSnCIZrzktNnfqj3C', 'STAFF'),
  ('33333333-3333-3333-3333-333333333333', 'Demo Chief Administrator', 'admin@govqueue.demo', '9876543212', '$2a$10$PE8q7LVHaGNuWv.x67R0gOGLUoHZrdZExC3paSnCIZrzktNnfqj3C', 'ADMIN')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

-- Seed Service Centers
INSERT INTO service_centers (id, name, address, district, state, pincode, latitude, longitude, phone, active)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'District Collectorate & Civic Centre', 'Court Road, Civil Lines', 'Central District', 'Delhi', '110054', 28.6750, 77.2280, '+91-11-23961122', true),
  ('c2222222-2222-2222-2222-222222222222', 'Regional Transport Office (RTO North)', 'Transport Bhawan, Mall Road', 'North Delhi', 'Delhi', '110007', 28.6920, 77.2110, '+91-11-23814455', true),
  ('c3333333-3333-3333-3333-333333333333', 'Passport Seva Kendra (PSK Connaught)', 'Herald House, Bahadur Shah Zafar Marg', 'New Delhi', 'Delhi', '110002', 28.6304, 77.2405, '+91-11-23219000', true),
  ('c4444444-4444-4444-4444-444444444444', 'Municipal Citizen Suvidha Kendra', 'Sector 12 Public Utility Complex', 'South West Delhi', 'Delhi', '110075', 28.5921, 77.0460, '+91-11-28080033', true),
  ('c5555555-5555-5555-5555-555555555555', 'Sub-Divisional Revenue & Land Office', 'Tehsil Complex, Mehrauli', 'South Delhi', 'Delhi', '110030', 28.5244, 77.1855, '+91-11-26642199', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Staff Profile
INSERT INTO staff_profiles (id, user_id, center_id, employee_id, designation, active)
VALUES
  ('sp111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'EMP-GOV-8492', 'Senior Verification Officer', true)
ON CONFLICT (user_id) DO NOTHING;

-- Seed Services
INSERT INTO services (id, name, description, category, department, estimated_duration, required_documents, active)
VALUES
  (
    's1111111-1111-1111-1111-111111111111',
    'Aadhaar Enrolment & Biometric Update',
    'New Aadhaar enrollment, mandatory biometric updates for age 5/15, mobile number and address corrections.',
    'Identity & Civil Status',
    'Unique Identification Authority (UIDAI)',
    15,
    '["Proof of Identity (POI)", "Proof of Address (POA)", "Proof of Date of Birth (DOB)", "Original Aadhaar (if update)"]'::jsonb,
    true
  ),
  (
    's2222222-2222-2222-2222-222222222222',
    'Fresh Passport & Renewal Application',
    'Document verification, biometrics capture, and interview for standard and tatkaal passports.',
    'Passport & Travel Documents',
    'Ministry of External Affairs (Consular & Passport)',
    25,
    '["Birth Certificate or Matriculation Marksheet", "Aadhaar Card", "Current Address Proof (Utility Bill / Bank Passbook)", "Existing Passport (for renewal)"]'::jsonb,
    true
  ),
  (
    's3333333-3333-3333-3333-333333333333',
    'Driving Licence & Learner Test Verification',
    'Biometric capture, computerized learner screening test, and permanent driving licence endorsement.',
    'Transport & Driving Licensing',
    'Regional Transport Authority (RTO / MoRTH)',
    20,
    '["Form 1 Physical Fitness Self-declaration", "Form 2 Application", "Age Proof (10th Certificate / Birth Certificate)", "Address Proof", "Learner Licence (for Permanent DL)"]'::jsonb,
    true
  ),
  (
    's4444444-4444-4444-4444-444444444444',
    'Income Certificate Issuance',
    'Verification of family income for scholarships, government welfare schemes, and quota reservations.',
    'Certificates & Verification',
    'Department of Revenue & Land Administration',
    15,
    '["Salary Slip or Form 16 / ITR", "Affidavit of Annual Family Income", "Ration Card or BPL Card", "Applicant Identity Proof"]'::jsonb,
    true
  ),
  (
    's5555555-5555-5555-5555-555555555555',
    'Caste & Community Certificate Verification',
    'Scrutiny and issuance of SC/ST/OBC/EWS certificates for educational admissions and recruitment.',
    'Certificates & Verification',
    'Department of Revenue & Land Administration',
    20,
    '["Paternal Blood Relative Caste Certificate", "School Leaving Certificate showing Caste", "Residence Proof of State (since 1950/1993)", "Aadhaar Card"]'::jsonb,
    true
  ),
  (
    's6666666-6666-6666-6666-666666666666',
    'Birth & Death Certificate Endorsement',
    'Official extract issuance and name inclusion in the civil registry for institutional and home births.',
    'Civic & Municipal Services',
    'Municipal Corporation Public Works & Health',
    15,
    '["Hospital Discharge Summary / Birth Report", "Parents Identity Proofs (Aadhaar / Voter ID)", "Marriage Certificate of Parents", "Application Form"]'::jsonb,
    true
  ),
  (
    's7777777-7777-7777-7777-777777777777',
    'Property & Conveyance Deed Registration',
    'Biometrics capture, stamp duty reconciliation, and sub-registrar verification of sale and gift deeds.',
    'Revenue & Land Records',
    'Department of Revenue & Land Administration',
    35,
    '["Original Sale Deed / Agreement", "NOC from Civic Body", "Challan of Stamp Duty & Registration Fee Paid", "PAN Cards of Buyer, Seller, and 2 Witnesses"]'::jsonb,
    true
  ),
  (
    's8888888-8888-8888-8888-888888888888',
    'Senior Citizen Welfare Card & Pension Enrollment',
    'Enrollment for National Social Assistance Program (NSAP), state pension schemes, and bus pass concessions.',
    'Social Welfare & Pensions',
    'Department of Social Justice and Empowerment',
    15,
    '["Age Proof (Aadhaar / Voter ID showing 60+ years)", "Bank Passbook Linked with Aadhaar", "Domicile Certificate", "Passport Size Photographs"]'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Map Center Services
INSERT INTO service_center_services (center_id, service_id)
SELECT c.id, s.id FROM service_centers c CROSS JOIN services s
ON CONFLICT DO NOTHING;
