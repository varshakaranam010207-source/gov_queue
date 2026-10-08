import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import {
  User,
  UserRole,
  Service,
  ServiceCenter,
  StaffProfile,
  Appointment,
  AppointmentStatus,
  Queue,
  QueueToken,
  QueueTokenStatus,
  Notification,
  AuditLog,
  AuditLogAction,
  AdminAnalyticsSummary
} from '../../shared/types.js';
import { DEMO_USERS } from '../../shared/constants.js';

// Pre-computed bcrypt hash for 'Demo@123'
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Demo@123', 10);

class DatabaseManager {
  private supabase: SupabaseClient | null = null;
  private isSupabaseConfigured = false;

  // In-memory persistent data store
  private users: (User & { password_hash: string })[] = [];
  private services: Service[] = [];
  private centers: ServiceCenter[] = [];
  private staffProfiles: StaffProfile[] = [];
  private queues: Queue[] = [];
  private tokens: QueueToken[] = [];
  private appointments: Appointment[] = [];
  private notifications: Notification[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.initSupabase();
    this.seedInMemory();
    this.seedDemoUsers().catch((err) => {
      console.warn('Initial demo users seeding encountered error:', err);
    });
  }

  private initSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('[project-ref]')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        });
        this.isSupabaseConfigured = true;
      } catch (err) {
        console.warn('Failed to initialize Supabase client, falling back to local database store:', err);
      }
    }
  }

  private seedInMemory() {
    // 1. Seed Demo Users
    this.users = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        full_name: DEMO_USERS.CITIZEN.full_name,
        email: DEMO_USERS.CITIZEN.email.toLowerCase(),
        phone: DEMO_USERS.CITIZEN.phone,
        password_hash: DEMO_PASSWORD_HASH,
        role: 'CITIZEN',
        created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        full_name: DEMO_USERS.STAFF.full_name,
        email: DEMO_USERS.STAFF.email.toLowerCase(),
        phone: DEMO_USERS.STAFF.phone,
        password_hash: DEMO_PASSWORD_HASH,
        role: 'STAFF',
        created_at: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        full_name: DEMO_USERS.ADMIN.full_name,
        email: DEMO_USERS.ADMIN.email.toLowerCase(),
        phone: DEMO_USERS.ADMIN.phone,
        password_hash: DEMO_PASSWORD_HASH,
        role: 'ADMIN',
        created_at: new Date(Date.now() - 3600000 * 24 * 90).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 2. Seed Centers
    this.centers = [
      {
        id: 'c1111111-1111-1111-1111-111111111111',
        name: 'District Collectorate & Civic Centre',
        address: 'Court Road, Civil Lines',
        district: 'Central District',
        state: 'Delhi',
        pincode: '110054',
        latitude: 28.6750,
        longitude: 77.2280,
        phone: '+91-11-23961122',
        active: true,
      },
      {
        id: 'c2222222-2222-2222-2222-222222222222',
        name: 'Regional Transport Office (RTO North)',
        address: 'Transport Bhawan, Mall Road',
        district: 'North Delhi',
        state: 'Delhi',
        pincode: '110007',
        latitude: 28.6920,
        longitude: 77.2110,
        phone: '+91-11-23814455',
        active: true,
      },
      {
        id: 'c3333333-3333-3333-3333-333333333333',
        name: 'Passport Seva Kendra (PSK Connaught)',
        address: 'Herald House, Bahadur Shah Zafar Marg',
        district: 'New Delhi',
        state: 'Delhi',
        pincode: '110002',
        latitude: 28.6304,
        longitude: 77.2405,
        phone: '+91-11-23219000',
        active: true,
      },
      {
        id: 'c4444444-4444-4444-4444-444444444444',
        name: 'Municipal Citizen Suvidha Kendra',
        address: 'Sector 12 Public Utility Complex, Dwarka',
        district: 'South West Delhi',
        state: 'Delhi',
        pincode: '110075',
        latitude: 28.5921,
        longitude: 77.0460,
        phone: '+91-11-28080033',
        active: true,
      },
      {
        id: 'c5555555-5555-5555-5555-555555555555',
        name: 'Sub-Divisional Revenue & Land Office',
        address: 'Tehsil Complex, Mehrauli',
        district: 'South Delhi',
        state: 'Delhi',
        pincode: '110030',
        latitude: 28.5244,
        longitude: 77.1855,
        phone: '+91-11-26642199',
        active: true,
      },
    ];

    // 3. Seed Services
    this.services = [
      {
        id: 's1111111-1111-1111-1111-111111111111',
        name: 'Aadhaar Enrolment & Biometric Update',
        description: 'New Aadhaar enrollment, mandatory biometric updates for age 5 and 15, mobile number linking, and demographic corrections.',
        category: 'Identity & Civil Status',
        department: 'Unique Identification Authority (UIDAI)',
        estimated_duration: 15,
        required_documents: [
          'Proof of Identity (POI) (Voter ID, Passport, or PAN)',
          'Proof of Address (POA) (Electricity bill, Rent agreement)',
          'Proof of Date of Birth (Birth certificate or 10th marksheet)',
          'Original Aadhaar Letter / Card (for biometric/mobile updates)',
        ],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's2222222-2222-2222-2222-222222222222',
        name: 'Fresh Passport & Renewal Application',
        description: 'Physical document verification, biometric data capture, counter photograph, and applicant interview for ordinary and tatkaal passports.',
        category: 'Passport & Travel Documents',
        department: 'Ministry of External Affairs (Consular & Passport)',
        estimated_duration: 25,
        required_documents: [
          'Matriculation Certificate or Birth Certificate (DOB proof)',
          'Aadhaar Card (Unlaminated POI & POA)',
          'Bank Passbook with running statement or Utility Bill (Address proof)',
          'Existing Original Passport with photocopies (for renewal)',
        ],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's3333333-3333-3333-3333-333333333333',
        name: 'Driving Licence & Learner Test Verification',
        description: 'Document scrutiny, biometric authentication, computerized learner road safety screening test, and permanent driving licence endorsement.',
        category: 'Transport & Driving Licensing',
        department: 'Regional Transport Authority (RTO / MoRTH)',
        estimated_duration: 20,
        required_documents: [
          'Form 1 & 1A Medical / Physical Fitness Self-declaration',
          'Form 2 Application Acknowledgement Slip',
          'Proof of Age & Address (Aadhaar / Passport / 10th Certificate)',
          'Valid Learner Licence Copy (for Permanent Driving Licence)',
        ],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's4444444-4444-4444-4444-444444444444',
        name: 'Income Certificate Issuance',
        description: 'Verification of annual family income for scholarships, governmental welfare subsidies, and fee concession schemes.',
        category: 'Certificates & Verification',
        department: 'Department of Revenue & Land Administration',
        estimated_duration: 15,
        required_documents: [
          'Salary Slip or Employer Certificate or Form 16 / ITR',
          'Notarized Affidavit of Family Income',
          'Ration Card / BPL Card / Electricity Bill',
          'Applicant Aadhaar Card',
        ],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's5555555-5555-5555-5555-555555555555',
        name: 'Caste & Community Certificate Verification',
        description: 'Scrutiny and issuance of SC/ST/OBC/EWS certificates for educational admissions, recruitments, and government quotas.',
        category: 'Certificates & Verification',
        department: 'Department of Revenue & Land Administration',
        estimated_duration: 20,
        required_documents: [
          'Paternal Blood Relative Caste Certificate (Father / Uncle / Brother)',
          'School Leaving Certificate showing Caste / Religion',
          'Proof of Residence of Family in State prior to cutoff year',
          'Applicant & Father Aadhaar Cards',
        ],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's6666666-6666-6666-6666-666666666666',
        name: 'Birth & Death Certificate Endorsement',
        description: 'Official registrar certified extract issuance and delayed name endorsement in the civil registry for institutional or home deliveries.',
        category: 'Civic & Municipal Services',
        department: 'Municipal Corporation Public Works & Health',
        estimated_duration: 15,
        required_documents: [
          'Hospital Discharge Summary / Institutional Birth Report',
          'Parents Identity Proofs (Aadhaar / Voter ID)',
          'Parents Marriage Certificate',
          'Prescribed Application Form signed by parents',
        ],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's7777777-7777-7777-7777-777777777777',
        name: 'Property & Conveyance Deed Registration',
        description: 'Biometric capture, stamp duty reconciliation, and sub-registrar verification of property conveyance, sale, lease, and gift deeds.',
        category: 'Revenue & Land Records',
        department: 'Department of Revenue & Land Administration',
        estimated_duration: 35,
        required_documents: [
          'Original Deed Document executed on stamp paper',
          'Challan / E-Stamp Certificate of Stamp Duty & Registration Fee',
          'NOC / Property Tax Clearance Certificate from Civic Body',
          'PAN Cards and Aadhaar of Buyer, Seller, and 2 Identifiers/Witnesses',
        ],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 's8888888-8888-8888-8888-888888888888',
        name: 'Senior Citizen Welfare Card & Pension Enrollment',
        description: 'Enrollment for the National Social Assistance Program (NSAP), state old age pension allowances, and senior citizen travel concession cards.',
        category: 'Social Welfare & Pensions',
        department: 'Department of Social Justice and Empowerment',
        estimated_duration: 15,
        required_documents: [
          'Age Proof (Aadhaar Card, Voter ID, or Birth Certificate showing 60+ years)',
          'Bank Passbook Linked with Aadhaar (Direct Benefit Transfer enabled)',
          'Income / Domicile Certificate',
          '2 Recent Passport Size Photographs',
        ],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 4. Staff Profiles
    this.staffProfiles = [
      {
        id: 'sp111111-1111-1111-1111-111111111111',
        user_id: '22222222-2222-2222-2222-222222222222',
        center_id: 'c1111111-1111-1111-1111-111111111111',
        employee_id: 'EMP-GOV-8492',
        designation: 'Senior Verification Officer',
        active: true,
      },
    ];

    // 5. Queues
    const todayStr = new Date().toISOString().split('T')[0];
    this.queues = [
      {
        id: 'q1111111-1111-1111-1111-111111111111',
        center_id: 'c1111111-1111-1111-1111-111111111111',
        service_id: 's1111111-1111-1111-1111-111111111111',
        queue_date: todayStr,
        current_number: 92,
        status: 'ACTIVE',
      },
    ];

    // 6. Tokens
    this.tokens = [
      {
        id: 't-serving-92',
        queue_id: 'q1111111-1111-1111-1111-111111111111',
        citizen_id: 'dummy-cit-92',
        token_number: 'A-092',
        status: 'SERVING',
        joined_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        called_at: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: 't-citizen-active',
        queue_id: 'q1111111-1111-1111-1111-111111111111',
        citizen_id: '11111111-1111-1111-1111-111111111111',
        token_number: 'A-104',
        status: 'WAITING',
        joined_at: new Date(Date.now() - 1800000).toISOString(),
        people_ahead: 11,
        estimated_wait_minutes: 24,
      },
    ];

    // Add intervening waiting tokens so people ahead matches
    for (let i = 93; i <= 103; i++) {
      this.tokens.push({
        id: `t-wait-${i}`,
        queue_id: 'q1111111-1111-1111-1111-111111111111',
        citizen_id: `dummy-cit-${i}`,
        token_number: `A-0${i < 100 ? '0' + i : i}`,
        status: 'WAITING',
        joined_at: new Date(Date.now() - 3600000 + i * 60000).toISOString(),
      });
    }

    // 7. Seed Appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    this.appointments = [
      {
        id: 'app-seed-001',
        booking_reference: 'GQ-2026-00124',
        citizen_id: '11111111-1111-1111-1111-111111111111',
        service_id: 's2222222-2222-2222-2222-222222222222', // Fresh Passport
        center_id: 'c3333333-3333-3333-3333-333333333333', // PSK Connaught
        appointment_date: tomorrowStr,
        start_time: '10:30',
        end_time: '10:55',
        status: 'BOOKED',
        notes: 'Tatkaal document verification counter appointment.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'app-seed-002',
        booking_reference: 'GQ-2026-00088',
        citizen_id: '11111111-1111-1111-1111-111111111111',
        service_id: 's1111111-1111-1111-1111-111111111111', // Aadhaar
        center_id: 'c1111111-1111-1111-1111-111111111111',
        appointment_date: todayStr,
        start_time: '11:00',
        end_time: '11:15',
        status: 'CHECKED_IN',
        queue_token_id: 't-citizen-active',
        notes: 'Biometric update for mobile authentication.',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 8. Seed Notifications
    this.notifications = [
      {
        id: 'n-1',
        user_id: '11111111-1111-1111-1111-111111111111',
        title: 'Appointment Confirmed (GQ-2026-00124)',
        message: 'Your passport application appointment is scheduled for tomorrow at 10:30 AM at Passport Seva Kendra (PSK Connaught).',
        type: 'APPOINTMENT_BOOKED',
        read: false,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'n-2',
        user_id: '11111111-1111-1111-1111-111111111111',
        title: 'Queue Token Generated: A-104',
        message: 'You have checked in at District Collectorate. Current serving number is A-092. Estimated wait: 24 minutes.',
        type: 'QUEUE_JOINED',
        read: false,
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'n-3',
        user_id: '11111111-1111-1111-1111-111111111111',
        title: 'Required Documents Reminder',
        message: 'Please ensure you carry original Aadhaar and utility bill for your upcoming verification.',
        type: 'APPOINTMENT_REMINDER',
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    // 9. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'al-1',
        user_id: '33333333-3333-3333-3333-333333333333',
        action: 'SERVICE_CREATED',
        entity_type: 'service',
        entity_id: 's1111111-1111-1111-1111-111111111111',
        metadata: { name: 'Aadhaar Enrolment & Biometric Update' },
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        user_name: DEMO_USERS.ADMIN.full_name,
        user_email: 'admin@govqueue.demo',
      },
      {
        id: 'al-2',
        user_id: '33333333-3333-3333-3333-333333333333',
        action: 'STAFF_ASSIGNED',
        entity_type: 'staff_profile',
        entity_id: 'sp111111-1111-1111-1111-111111111111',
        metadata: { employee_id: 'EMP-GOV-8492', center: 'District Collectorate' },
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        user_name: DEMO_USERS.ADMIN.full_name,
        user_email: 'admin@govqueue.demo',
      },
      {
        id: 'al-3',
        user_id: '11111111-1111-1111-1111-111111111111',
        action: 'APPOINTMENT_CREATED',
        entity_type: 'appointment',
        entity_id: 'app-seed-001',
        metadata: { reference: 'GQ-2026-00124', service: 'Fresh Passport & Renewal' },
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user_name: DEMO_USERS.CITIZEN.full_name,
        user_email: 'citizen@govqueue.demo',
      },
    ];
  }

  /**
   * Idempotently seeds demo users:
   * STAFF: staff@govqueue.demo (role: STAFF, full name: Demo Staff Officer)
   * ADMIN: admin@govqueue.demo (role: ADMIN, full name: Demo Chief Administrator)
   * CITIZEN: citizen@govqueue.demo (role: CITIZEN, full name: Demo Citizen)
   * Passwords securely hashed with bcrypt (salt rounds: 10) matching login verification.
   * Updates any existing records with wrong role/hash/name for development/demo mode.
   */
  async seedDemoUsers(): Promise<void> {
    const demoAccounts = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        full_name: DEMO_USERS.CITIZEN.full_name,
        email: DEMO_USERS.CITIZEN.email.toLowerCase().trim(),
        password: DEMO_USERS.CITIZEN.password,
        role: 'CITIZEN' as UserRole,
        phone: DEMO_USERS.CITIZEN.phone,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        full_name: DEMO_USERS.STAFF.full_name,
        email: DEMO_USERS.STAFF.email.toLowerCase().trim(),
        password: DEMO_USERS.STAFF.password,
        role: 'STAFF' as UserRole,
        phone: DEMO_USERS.STAFF.phone,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        full_name: DEMO_USERS.ADMIN.full_name,
        email: DEMO_USERS.ADMIN.email.toLowerCase().trim(),
        password: DEMO_USERS.ADMIN.password,
        role: 'ADMIN' as UserRole,
        phone: DEMO_USERS.ADMIN.phone,
      },
    ];

    for (const demo of demoAccounts) {
      const normEmail = demo.email.toLowerCase().trim();
      const existingInMemory = this.users.find(u => u.email.toLowerCase().trim() === normEmail);
      const targetHash = bcrypt.hashSync(demo.password, 10);

      if (existingInMemory) {
        const isMatch = bcrypt.compareSync(demo.password, existingInMemory.password_hash);
        if (!isMatch || existingInMemory.role !== demo.role || existingInMemory.full_name !== demo.full_name) {
          existingInMemory.password_hash = targetHash;
          existingInMemory.role = demo.role;
          existingInMemory.full_name = demo.full_name;
          existingInMemory.phone = demo.phone;
          existingInMemory.updated_at = new Date().toISOString();
        }
      } else {
        this.users.push({
          id: demo.id,
          full_name: demo.full_name,
          email: normEmail,
          phone: demo.phone,
          password_hash: targetHash,
          role: demo.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Sync Supabase PostgreSQL if configured
      if (this.isSupabaseConfigured && this.supabase) {
        try {
          const { data: remoteUser, error } = await this.supabase
            .from('users')
            .select('id, email, password_hash, role, full_name')
            .eq('email', normEmail)
            .maybeSingle();

          if (!error && remoteUser) {
            const isRemoteMatch = remoteUser.password_hash ? bcrypt.compareSync(demo.password, remoteUser.password_hash) : false;
            if (!isRemoteMatch || remoteUser.role !== demo.role || remoteUser.full_name !== demo.full_name) {
              await this.supabase
                .from('users')
                .update({
                  full_name: demo.full_name,
                  password_hash: targetHash,
                  role: demo.role,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', remoteUser.id);
            }
          } else if (!error && !remoteUser) {
            await this.supabase
              .from('users')
              .insert({
                id: demo.id,
                full_name: demo.full_name,
                email: normEmail,
                phone: demo.phone,
                password_hash: targetHash,
                role: demo.role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
          }
        } catch (supaErr) {
          console.warn(`[Seed] Supabase demo user sync notice for ${normEmail}:`, supaErr);
        }
      }
    }

    console.log('Demo users seeded successfully.');
  }

  // --- Users ---
  async getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    const norm = email.toLowerCase().trim();
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', norm)
        .maybeSingle();
      if (!error && data) return data;
    }
    const found = this.users.find(u => u.email.toLowerCase() === norm);
    return found ? { ...found } : null;
  }

  async getUserById(id: string): Promise<User | null> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('users')
        .select('id, full_name, email, phone, role, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data;
    }
    const u = this.users.find(x => x.id === id);
    if (!u) return null;
    const { password_hash, ...safe } = u;
    return safe;
  }

  async createUser(data: { full_name: string; email: string; phone: string; password_hash: string; role?: UserRole }): Promise<User> {
    const newUser: User & { password_hash: string } = {
      id: crypto.randomUUID(),
      full_name: data.full_name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      password_hash: data.password_hash,
      role: data.role || 'CITIZEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isSupabaseConfigured && this.supabase) {
      const { data: inserted, error } = await this.supabase
        .from('users')
        .insert(newUser)
        .select('id, full_name, email, phone, role, created_at, updated_at')
        .single();
      if (!error && inserted) return inserted;
    }

    this.users.push(newUser);
    const { password_hash, ...safe } = newUser;
    return safe;
  }

  async getUsers(roleFilter?: UserRole, search?: string): Promise<User[]> {
    let list = this.users.map(({ password_hash, ...safe }) => safe);
    if (roleFilter) {
      list = list.filter(u => u.role === roleFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list;
  }

  async updateUserRole(userId: string, newRole: UserRole, adminId: string): Promise<User | null> {
    const u = this.users.find(x => x.id === userId);
    if (!u) return null;
    const oldRole = u.role;
    u.role = newRole;
    u.updated_at = new Date().toISOString();

    await this.createAuditLog(
      adminId,
      'ROLE_CHANGED',
      'user',
      userId,
      { oldRole, newRole, targetUser: u.email }
    );

    const { password_hash, ...safe } = u;
    return safe;
  }

  // --- Services ---
  async getServices(): Promise<Service[]> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('services')
        .select('*')
        .order('name');
      if (!error && data) return data;
    }
    return [...this.services];
  }

  async getServiceById(id: string): Promise<Service | null> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data;
    }
    return this.services.find(s => s.id === id) || null;
  }

  async createService(data: Omit<Service, 'id' | 'created_at' | 'updated_at'>, adminId: string): Promise<Service> {
    const newService: Service = {
      id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.services.push(newService);

    await this.createAuditLog(adminId, 'SERVICE_CREATED', 'service', newService.id, { name: newService.name });
    return newService;
  }

  async updateService(id: string, data: Partial<Service>, adminId: string): Promise<Service | null> {
    const s = this.services.find(x => x.id === id);
    if (!s) return null;
    Object.assign(s, data, { updated_at: new Date().toISOString() });

    await this.createAuditLog(adminId, 'SERVICE_UPDATED', 'service', id, { name: s.name, changes: data });
    return s;
  }

  // --- Centers ---
  async getCenters(): Promise<ServiceCenter[]> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('service_centers')
        .select('*')
        .order('name');
      if (!error && data) return data;
    }
    return [...this.centers];
  }

  async getCenterById(id: string): Promise<ServiceCenter | null> {
    if (this.isSupabaseConfigured && this.supabase) {
      const { data, error } = await this.supabase
        .from('service_centers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data;
    }
    return this.centers.find(c => c.id === id) || null;
  }

  async createCenter(data: Omit<ServiceCenter, 'id'>, adminId: string): Promise<ServiceCenter> {
    const newCenter: ServiceCenter = {
      id: crypto.randomUUID(),
      ...data,
    };
    this.centers.push(newCenter);

    await this.createAuditLog(adminId, 'CENTER_CREATED', 'service_center', newCenter.id, { name: newCenter.name });
    return newCenter;
  }

  async updateCenter(id: string, data: Partial<ServiceCenter>, adminId: string): Promise<ServiceCenter | null> {
    const c = this.centers.find(x => x.id === id);
    if (!c) return null;
    Object.assign(c, data);

    await this.createAuditLog(adminId, 'CENTER_UPDATED', 'service_center', id, { name: c.name, changes: data });
    return c;
  }

  // --- Appointments ---
  async getAppointments(filters?: { citizenId?: string; centerId?: string; date?: string }): Promise<Appointment[]> {
    let list = [...this.appointments];

    if (filters?.citizenId) {
      list = list.filter(a => a.citizen_id === filters.citizenId);
    }
    if (filters?.centerId) {
      list = list.filter(a => a.center_id === filters.centerId);
    }
    if (filters?.date) {
      list = list.filter(a => a.appointment_date === filters.date);
    }

    return list.map(a => this.enrichAppointment(a));
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const a = this.appointments.find(x => x.id === id || x.booking_reference === id);
    return a ? this.enrichAppointment(a) : null;
  }

  private enrichAppointment(a: Appointment): Appointment {
    const service = this.services.find(s => s.id === a.service_id);
    const center = this.centers.find(c => c.id === a.center_id);
    const citizen = this.users.find(u => u.id === a.citizen_id);
    const token = a.queue_token_id ? this.tokens.find(t => t.id === a.queue_token_id) : undefined;

    return {
      ...a,
      service,
      center,
      citizen: citizen ? { id: citizen.id, full_name: citizen.full_name, email: citizen.email, phone: citizen.phone, role: citizen.role, created_at: citizen.created_at, updated_at: citizen.updated_at } : undefined,
      queue_token: token,
    };
  }

  async isSlotBooked(centerId: string, serviceId: string, date: string, startTime: string): Promise<boolean> {
    return this.appointments.some(
      a =>
        a.center_id === centerId &&
        a.appointment_date === date &&
        a.start_time === startTime &&
        a.status !== 'CANCELLED'
    );
  }

  async createAppointment(data: {
    citizen_id: string;
    service_id: string;
    center_id: string;
    appointment_date: string;
    start_time: string;
    notes?: string;
  }): Promise<Appointment> {
    // Generate Booking Reference (e.g., GQ-2026-00125)
    const count = this.appointments.length + 125;
    const bookingReference = `GQ-2026-${count.toString().padStart(5, '0')}`;

    // Calculate end time (duration from service or default 20 mins)
    const s = this.services.find(x => x.id === data.service_id);
    const duration = s?.estimated_duration || 20;
    const [hours, minutes] = data.start_time.split(':').map(Number);
    const endMinutes = minutes + duration;
    const endHours = hours + Math.floor(endMinutes / 60);
    const remMin = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${remMin.toString().padStart(2, '0')}`;

    const newAppt: Appointment = {
      id: crypto.randomUUID(),
      booking_reference: bookingReference,
      citizen_id: data.citizen_id,
      service_id: data.service_id,
      center_id: data.center_id,
      appointment_date: data.appointment_date,
      start_time: data.start_time,
      end_time: endTime,
      status: 'BOOKED',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.appointments.unshift(newAppt);

    // Create Audit Log
    await this.createAuditLog(
      data.citizen_id,
      'APPOINTMENT_CREATED',
      'appointment',
      newAppt.id,
      { bookingReference, date: data.appointment_date, time: data.start_time }
    );

    // Create Notification
    await this.createNotification(
      data.citizen_id,
      `Appointment Confirmed (${bookingReference})`,
      `Your appointment for ${s?.name || 'Government Service'} has been scheduled on ${data.appointment_date} at ${data.start_time}.`,
      'APPOINTMENT_BOOKED'
    );

    return this.enrichAppointment(newAppt);
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus, userId: string): Promise<Appointment | null> {
    const a = this.appointments.find(x => x.id === id);
    if (!a) return null;
    const oldStatus = a.status;
    a.status = status;
    a.updated_at = new Date().toISOString();

    if (status === 'CANCELLED') {
      await this.createAuditLog(userId, 'APPOINTMENT_CANCELLED', 'appointment', id, { oldStatus, reference: a.booking_reference });
      await this.createNotification(
        a.citizen_id,
        `Appointment Cancelled (${a.booking_reference})`,
        `Your appointment scheduled for ${a.appointment_date} has been cancelled.`,
        'APPOINTMENT_CANCELLED'
      );
    }

    return this.enrichAppointment(a);
  }

  // --- Queues & Tokens ---
  async getQueues(centerId?: string, date?: string): Promise<Queue[]> {
    let list = [...this.queues];
    if (centerId) list = list.filter(q => q.center_id === centerId);
    if (date) list = list.filter(q => q.queue_date === date);
    return list.map(q => ({
      ...q,
      center: this.centers.find(c => c.id === q.center_id),
      service: this.services.find(s => s.id === q.service_id),
    }));
  }

  async getQueueTokens(filters?: { queueId?: string; status?: QueueTokenStatus; citizenId?: string }): Promise<QueueToken[]> {
    let list = [...this.tokens];
    if (filters?.queueId) list = list.filter(t => t.queue_id === filters.queueId);
    if (filters?.status) list = list.filter(t => t.status === filters.status);
    if (filters?.citizenId) list = list.filter(t => t.citizen_id === filters.citizenId);

    return list.map(t => this.enrichToken(t));
  }

  async getCitizenActiveToken(citizenId: string): Promise<QueueToken | null> {
    const token = this.tokens.find(
      t => t.citizen_id === citizenId && (t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'SERVING')
    );
    return token ? this.enrichToken(token) : null;
  }

  private enrichToken(t: QueueToken): QueueToken {
    const q = this.queues.find(queue => queue.id === t.queue_id);
    const service = q ? this.services.find(s => s.id === q.service_id) : undefined;
    const center = q ? this.centers.find(c => c.id === q.center_id) : undefined;
    const citizen = this.users.find(u => u.id === t.citizen_id);

    // Calculate dynamic people ahead if waiting
    let peopleAhead = 0;
    if (t.status === 'WAITING' && q) {
      const waitingTokensBefore = this.tokens.filter(
        other => other.queue_id === t.queue_id && other.status === 'WAITING' && new Date(other.joined_at) < new Date(t.joined_at)
      );
      peopleAhead = waitingTokensBefore.length;
    }

    const avgMinutesPerPerson = service?.estimated_duration ? Math.min(service.estimated_duration, 15) : 10;
    const estWait = peopleAhead * avgMinutesPerPerson;

    return {
      ...t,
      people_ahead: peopleAhead,
      estimated_wait_minutes: estWait,
      service,
      center,
      queue: q,
      citizen: citizen ? { id: citizen.id, full_name: citizen.full_name, email: citizen.email, phone: citizen.phone, role: citizen.role, created_at: citizen.created_at, updated_at: citizen.updated_at } : undefined,
    };
  }

  async joinQueue(data: { citizen_id: string; center_id: string; service_id: string; appointment_id?: string | null }): Promise<QueueToken> {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Find or create queue for today
    let queue = this.queues.find(
      q => q.center_id === data.center_id && q.service_id === data.service_id && q.queue_date === todayStr
    );

    if (!queue) {
      queue = {
        id: crypto.randomUUID(),
        center_id: data.center_id,
        service_id: data.service_id,
        queue_date: todayStr,
        current_number: 100,
        status: 'ACTIVE',
      };
      this.queues.push(queue);
    }

    // Determine next token number
    const queueTokensToday = this.tokens.filter(t => t.queue_id === queue!.id);
    const nextSeq = 100 + queueTokensToday.length + 1;
    const servicePrefix = 'A'; // or derived from service code
    const tokenNumber = `${servicePrefix}-${nextSeq}`;

    const newToken: QueueToken = {
      id: crypto.randomUUID(),
      queue_id: queue.id,
      appointment_id: data.appointment_id || null,
      citizen_id: data.citizen_id,
      token_number: tokenNumber,
      status: 'WAITING',
      joined_at: new Date().toISOString(),
    };

    this.tokens.push(newToken);

    // If linked to an appointment, update appointment status to CHECKED_IN
    if (data.appointment_id) {
      const appt = this.appointments.find(a => a.id === data.appointment_id);
      if (appt) {
        appt.status = 'CHECKED_IN';
        appt.queue_token_id = newToken.id;
        appt.updated_at = new Date().toISOString();
      }
    }

    await this.createNotification(
      data.citizen_id,
      `Queue Joined: Token ${tokenNumber}`,
      `You are in queue. Track your status on the Live Queue dashboard.`,
      'QUEUE_JOINED'
    );

    return this.enrichToken(newToken);
  }

  async updateTokenStatus(tokenId: string, status: QueueTokenStatus, staffUserId: string): Promise<QueueToken | null> {
    const token = this.tokens.find(t => t.id === tokenId);
    if (!token) return null;

    token.status = status;
    if (status === 'CALLED') {
      token.called_at = new Date().toISOString();
      const q = this.queues.find(queue => queue.id === token.queue_id);
      if (q) {
        // extract numeric part
        const num = parseInt(token.token_number.replace(/\D/g, ''), 10);
        if (!isNaN(num)) q.current_number = num;
      }
      await this.createAuditLog(staffUserId, 'QUEUE_TOKEN_CALLED', 'queue_token', tokenId, { token: token.token_number });
      await this.createNotification(
        token.citizen_id,
        `Token Called! ${token.token_number}`,
        `Your token ${token.token_number} has been called. Please proceed to the service counter immediately.`,
        'TOKEN_CALLED'
      );
    } else if (status === 'COMPLETED') {
      token.completed_at = new Date().toISOString();
      await this.createAuditLog(staffUserId, 'QUEUE_TOKEN_COMPLETED', 'queue_token', tokenId, { token: token.token_number });
      await this.createNotification(
        token.citizen_id,
        `Service Completed`,
        `Thank you for using GovQueue AI. Your appointment for token ${token.token_number} is completed.`,
        'APPOINTMENT_COMPLETED'
      );
      if (token.appointment_id) {
        const appt = this.appointments.find(a => a.id === token.appointment_id);
        if (appt) {
          appt.status = 'COMPLETED';
          appt.updated_at = new Date().toISOString();
        }
      }
    } else if (status === 'NO_SHOW') {
      await this.createAuditLog(staffUserId, 'QUEUE_TOKEN_NO_SHOW', 'queue_token', tokenId, { token: token.token_number });
      if (token.appointment_id) {
        const appt = this.appointments.find(a => a.id === token.appointment_id);
        if (appt) {
          appt.status = 'NO_SHOW';
          appt.updated_at = new Date().toISOString();
        }
      }
    }

    return this.enrichToken(token);
  }

  // --- Notifications ---
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const n = this.notifications.find(x => x.id === id && x.user_id === userId);
    if (!n) return false;
    n.read = true;
    return true;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    this.notifications.filter(n => n.user_id === userId).forEach(n => (n.read = true));
    return true;
  }

  async createNotification(userId: string, title: string, message: string, type: Notification['type']): Promise<Notification> {
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  // --- Audit Logs ---
  async createAuditLog(
    userId: string | null,
    action: AuditLogAction,
    entityType: string,
    entityId: string,
    metadata: Record<string, any> = {}
  ): Promise<AuditLog> {
    const user = userId ? this.users.find(u => u.id === userId) : null;
    const log: AuditLog = {
      id: crypto.randomUUID(),
      user_id: userId || 'system',
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
      user_name: user?.full_name || 'System / Personnel',
      user_email: user?.email || 'system@govqueue.internal',
    };
    this.auditLogs.unshift(log);
    return log;
  }

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    return this.auditLogs.slice(0, limit);
  }

  // --- Staff Profiles ---
  async getStaffProfiles(): Promise<StaffProfile[]> {
    return this.staffProfiles.map(sp => ({
      ...sp,
      user: this.users.find(u => u.id === sp.user_id),
      center: this.centers.find(c => c.id === sp.center_id),
    }));
  }

  async assignStaffProfile(data: {
    user_id: string;
    center_id: string;
    employee_id: string;
    designation: string;
  }, adminId: string): Promise<StaffProfile> {
    let profile = this.staffProfiles.find(sp => sp.user_id === data.user_id);
    if (profile) {
      Object.assign(profile, data, { active: true });
    } else {
      profile = {
        id: crypto.randomUUID(),
        ...data,
        active: true,
      };
      this.staffProfiles.push(profile);
    }

    // Ensure user role is updated to STAFF if not already
    const u = this.users.find(x => x.id === data.user_id);
    if (u && u.role === 'CITIZEN') {
      u.role = 'STAFF';
    }

    await this.createAuditLog(adminId, 'STAFF_ASSIGNED', 'staff_profile', profile.id, data);
    return {
      ...profile,
      user: this.users.find(u => u.id === profile!.user_id),
      center: this.centers.find(c => c.id === profile!.center_id),
    };
  }

  // --- Analytics ---
  async getAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppts = this.appointments.filter(a => a.appointment_date === todayStr);
    const completedAppts = this.appointments.filter(a => a.status === 'COMPLETED');
    const noShowAppts = this.appointments.filter(a => a.status === 'NO_SHOW');

    const totalCalculated = this.appointments.length;
    const noShowRate = totalCalculated > 0 ? (noShowAppts.length / totalCalculated) * 100 : 4.5;

    // Generate trend of past 7 days
    const past7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const count = this.appointments.filter(a => a.appointment_date === ds).length || (8 + (i * 3) % 11);
      past7Days.push({ date: ds, count });
    }

    // Service popularity
    const serviceCounts: Record<string, { count: number; category: string }> = {};
    this.services.forEach(s => {
      serviceCounts[s.name] = { count: 12 + (s.name.length % 15), category: s.category };
    });

    const servicePopularity = Object.entries(serviceCounts).map(([name, val]) => ({
      name,
      count: val.count,
      category: val.category,
    }));

    // Center performance
    const centerPerformance = this.centers.map(c => ({
      name: c.name,
      appointments: 45 + (c.name.length % 30),
      avg_wait: 18 + (c.name.length % 10),
    }));

    return {
      total_users: this.users.length + 1840,
      citizens_count: this.users.filter(u => u.role === 'CITIZEN').length + 1810,
      staff_count: this.users.filter(u => u.role === 'STAFF').length + 26,
      today_appointments: todayAppts.length + 38,
      active_queues: this.queues.length + 8,
      completed_appointments_total: completedAppts.length + 1420,
      average_wait_minutes: 22,
      noshow_rate_percentage: parseFloat(noShowRate.toFixed(1)),
      appointments_by_day: past7Days,
      queue_volume_by_hour: [
        { hour: '09:00', count: 14 },
        { hour: '10:00', count: 28 },
        { hour: '11:00', count: 35 },
        { hour: '12:00', count: 26 },
        { hour: '14:00', count: 22 },
        { hour: '15:00', count: 19 },
        { hour: '16:00', count: 12 },
      ],
      service_popularity: servicePopularity,
      center_performance: centerPerformance,
    };
  }
}

export const db = new DatabaseManager();
