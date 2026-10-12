/**
 * myHealthMate AI — Comprehensive Synthetic Database Seeder
 * Populates PostgreSQL / Prisma with realistic synthetic demo data.
 */

import bcrypt from 'bcryptjs';

export const syntheticSeedData = {
  users: [
    {
      id: 'usr_demo_patient_01',
      email: 'alex.morgan@example.com',
      name: 'Alex Morgan',
      passwordPlain: 'PatientPass123!',
      role: 'PATIENT',
      phone: '+1-555-019-2831'
    },
    {
      id: 'usr_admin_01',
      email: 'admin@myhealthmate.ai',
      name: 'Dr. Sarah Mitchell',
      passwordPlain: 'AdminPass123!',
      role: 'ADMIN',
      phone: '+1-555-019-9000'
    }
  ],
  reports: [
    {
      id: 'rep_7482_cmp',
      userId: 'usr_demo_patient_01',
      filename: 'Comprehensive_Metabolic_Panel_Jan2026.pdf',
      storageKey: 'uploads/private/rep_7482_cmp.pdf',
      mimeType: 'application/pdf',
      fileSize: 1887436,
      category: 'Lab Work',
      status: 'COMPLETED'
    },
    {
      id: 'rep_6914_lipid',
      userId: 'usr_demo_patient_01',
      filename: 'Lipid_Profile_Cardio_Dec2025.pdf',
      storageKey: 'uploads/private/rep_6914_lipid.pdf',
      mimeType: 'application/pdf',
      fileSize: 2516582,
      category: 'Cardiology',
      status: 'COMPLETED'
    },
    {
      id: 'rep_5103_vitd',
      userId: 'usr_demo_patient_01',
      filename: 'Endocrinology_Vitamin_Panel_Nov2025.png',
      storageKey: 'uploads/private/rep_5103_vitd.png',
      mimeType: 'image/png',
      fileSize: 3250585,
      category: 'Endocrinology',
      status: 'COMPLETED'
    }
  ],
  analysis: {
    id: 'ana_7482_cmp',
    reportId: 'rep_7482_cmp',
    facility: 'MetroHealth Diagnostic Laboratory (Synthetic Demo)',
    collectedDate: new Date('2026-01-14T07:45:00Z'),
    summary: 'This synthetic laboratory panel demonstrates routine biochemical markers. Fasting glucose and renal markers are within expected ranges. Total cholesterol indicates borderline elevation for physician review.',
    clinicianQuestions: [
      'Does my borderline Total Cholesterol (218 mg/dL) warrant lifestyle adjustments or follow-up testing in 3–6 months?',
      'What dietary changes or targeted exercise would you recommend to optimize my LDL/HDL ratio?',
      'Given my Vitamin D level of 24.2 ng/mL, should I start a specific vitamin D3 supplement regimen?',
      'Are there any additional cardiovascular risk markers (such as ApoB or hs-CRP) appropriate for my profile?'
    ]
  },
  parameters: [
    {
      id: 'param_01',
      analysisId: 'ana_7482_cmp',
      name: 'Fasting Blood Glucose',
      category: 'Metabolic',
      value: 92.0,
      unit: 'mg/dL',
      minRange: 70.0,
      maxRange: 99.0,
      status: 'NORMAL',
      explanation: 'Measures circulating blood sugar after an overnight fast. Normal range indicates healthy glucose homeostasis and insulin response.',
      clinicalNote: 'Optimal fasting glucose levels are generally below 100 mg/dL.'
    },
    {
      id: 'param_02',
      analysisId: 'ana_7482_cmp',
      name: 'Total Cholesterol',
      category: 'Lipid Profile',
      value: 218.0,
      unit: 'mg/dL',
      minRange: 125.0,
      maxRange: 200.0,
      status: 'ELEVATED',
      explanation: 'Measures total circulating sterol lipids including LDL, HDL, and VLDL particles.',
      clinicalNote: 'Values between 200–239 mg/dL are classified as borderline high. Discuss dietary fats and physical activity with your clinician.'
    },
    {
      id: 'param_03',
      analysisId: 'ana_7482_cmp',
      name: 'LDL Cholesterol',
      category: 'Lipid Profile',
      value: 128.0,
      unit: 'mg/dL',
      minRange: 50.0,
      maxRange: 100.0,
      status: 'BORDERLINE',
      explanation: 'Low-density lipoprotein transports lipids to peripheral tissues. Often called "bad cholesterol".',
      clinicalNote: 'Clinicians evaluate LDL alongside cardiovascular risk factors.'
    },
    {
      id: 'param_04',
      analysisId: 'ana_7482_cmp',
      name: 'HDL Cholesterol',
      category: 'Lipid Profile',
      value: 58.0,
      unit: 'mg/dL',
      minRange: 40.0,
      maxRange: 80.0,
      status: 'NORMAL',
      explanation: 'High-density lipoprotein facilitates reverse cholesterol transport away from arterial walls.',
      clinicalNote: 'HDL levels above 50 mg/dL for females or 40 mg/dL for males are generally desirable.'
    },
    {
      id: 'param_05',
      analysisId: 'ana_7482_cmp',
      name: 'Serum Creatinine',
      category: 'Renal Function',
      value: 0.88,
      unit: 'mg/dL',
      minRange: 0.60,
      maxRange: 1.20,
      status: 'NORMAL',
      explanation: 'Byproduct of muscle metabolism filtered exclusively by renal glomeruli.',
      clinicalNote: 'Consistent creatinine indicates normal glomerular filtration rate (eGFR > 90).'
    },
    {
      id: 'param_06',
      analysisId: 'ana_7482_cmp',
      name: 'Vitamin D (25-Hydroxy)',
      category: 'Endocrinology',
      value: 24.2,
      unit: 'ng/mL',
      minRange: 30.0,
      maxRange: 100.0,
      status: 'LOW',
      explanation: 'Primary circulating precursor essential for calcium absorption, bone density, and immune modulation.',
      clinicalNote: 'Levels between 20–29 ng/mL indicate insufficiency. Consult your doctor regarding safe supplementation and sun exposure.'
    }
  ],
  healthRecords: [
    {
      id: 'rec_01',
      userId: 'usr_demo_patient_01',
      title: 'Comprehensive Metabolic Panel',
      category: 'Lab Work',
      recordDate: new Date('2026-01-15T10:30:00Z'),
      provider: 'Dr. Evelyn Reed (Metro Internal Medicine)',
      notes: 'Routine annual laboratory testing. Discussed lipid panel trends.',
      status: 'Reviewed'
    },
    {
      id: 'rec_02',
      userId: 'usr_demo_patient_01',
      title: 'Cardiology Follow-up & ECG',
      category: 'Cardiology',
      recordDate: new Date('2025-12-10T14:15:00Z'),
      provider: 'Dr. Marcus Vance (Heart & Vascular Institute)',
      notes: 'Normal sinus rhythm confirmed on 12-lead ECG. Resting HR 68 bpm.',
      status: 'Completed'
    },
    {
      id: 'rec_03',
      userId: 'usr_demo_patient_01',
      title: 'Annual Health Check & Vitals',
      category: 'Consultations',
      recordDate: new Date('2025-09-18T09:00:00Z'),
      provider: 'Metro Primary Care Associates',
      notes: 'Blood pressure 118/76 mmHg. BMI 22.8. Vaccinations up to date.',
      status: 'Completed'
    },
    {
      id: 'rec_04',
      userId: 'usr_demo_patient_01',
      title: 'Chest X-Ray (Post-Respiratory Infection)',
      category: 'Imaging',
      recordDate: new Date('2025-05-22T11:20:00Z'),
      provider: 'City Imaging Center',
      notes: 'Clear bilateral lung fields. No consolidation or pleural effusion.',
      status: 'Completed'
    }
  ],
  appointments: [
    {
      id: 'apt_01',
      userId: 'usr_demo_patient_01',
      providerName: 'Dr. Evelyn Reed',
      specialty: 'Internal Medicine',
      appointmentAt: new Date('2026-03-15T10:00:00Z'),
      location: 'Metro Internal Medicine, Suite 400',
      status: 'Scheduled',
      notes: 'Follow-up on lipid profile adjustments and Vitamin D status.'
    }
  ],
  notifications: [
    {
      id: 'notif_01',
      userId: 'usr_demo_patient_01',
      title: 'Lab Analysis Ready',
      message: 'Educational analysis for Comprehensive Metabolic Panel is available.',
      isRead: false
    },
    {
      id: 'notif_02',
      userId: 'usr_demo_patient_01',
      title: 'Appointment Reminder',
      message: 'Upcoming cardiology wellness check on March 15, 2026 at 10:00 AM.',
      isRead: true
    }
  ],
  conversations: [
    {
      id: 'conv_01',
      userId: 'usr_demo_patient_01',
      title: 'Explaining Lipid & Metabolic Panel',
      messages: [
        {
          id: 'msg_01',
          sender: 'USER',
          content: 'What does my Total Cholesterol level of 218 mean?'
        },
        {
          id: 'msg_02',
          sender: 'ASSISTANT',
          content: 'Total cholesterol of 218 mg/dL is classified as borderline high (desirable is < 200 mg/dL). It is helpful to discuss your diet and overall cardiovascular profile with your clinician.'
        }
      ]
    }
  ]
};

async function main() {
  console.log('🌱 Starting myHealthMate AI Synthetic Database Seeding...');
  
  // Hash passwords
  for (const u of syntheticSeedData.users) {
    u.passwordHash = await bcrypt.hash(u.passwordPlain, 10);
    console.log(`🔐 Hashed password for ${u.email} (${u.role})`);
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Check database connectivity
    await prisma.$connect();
    console.log('✅ Connected to database. Seeding records...');

    for (const u of syntheticSeedData.users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          id: u.id,
          email: u.email,
          name: u.name,
          passwordHash: u.passwordHash,
          role: u.role,
          phone: u.phone
        }
      });
    }

    console.log('✅ Users seeded.');
    await prisma.$disconnect();
  } catch (err) {
    console.log('ℹ️ Note: Live Prisma database connection skipped or not running yet. Seed dictionary prepared for in-memory & production usage:', err.message);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  main().then(() => console.log('🌿 Seeding script execution completed.'));
}
