/**
 * myHealthMate AI — Serverless Netlify Function Handler
 * Provides serverless cloud endpoints on Netlify for /api/v1/*
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

const syntheticReports = [
  {
    id: 'rep_7482_cmp',
    filename: 'Comprehensive_Metabolic_Panel_Jan2026.pdf',
    fileSize: '1.8 MB',
    uploadDate: '2026-01-15T10:30:00Z',
    status: 'COMPLETED',
    category: 'Lab Work',
    analysisId: 'ana_7482_cmp'
  },
  {
    id: 'rep_6914_lipid',
    filename: 'Lipid_Profile_Cardio_Dec2025.pdf',
    fileSize: '2.4 MB',
    uploadDate: '2025-12-10T14:15:00Z',
    status: 'COMPLETED',
    category: 'Cardiology',
    analysisId: 'ana_6914_lipid'
  },
  {
    id: 'rep_5103_vitd',
    filename: 'Endocrinology_Vitamin_Panel_Nov2025.png',
    fileSize: '3.1 MB',
    uploadDate: '2025-11-04T09:45:00Z',
    status: 'COMPLETED',
    category: 'Endocrinology',
    analysisId: 'ana_5103_vitd'
  }
];

const syntheticAnalysis = {
  reportId: 'rep_7482_cmp',
  reportTitle: 'Comprehensive Metabolic & Lipid Panel',
  facility: 'MetroHealth Diagnostic Laboratory (Netlify Cloud Serverless)',
  collectedDate: 'January 14, 2026',
  reportedDate: 'January 15, 2026',
  summary: 'This synthetic laboratory panel demonstrates routine biochemical markers. Fasting glucose and renal markers are within expected ranges. Total cholesterol indicates borderline elevation for physician review.',
  parameters: [
    {
      id: 'p1',
      name: 'Fasting Blood Glucose',
      category: 'Metabolic',
      value: 92,
      unit: 'mg/dL',
      minRange: 70,
      maxRange: 99,
      status: 'NORMAL',
      explanation: 'Measures circulating blood sugar after an overnight fast. Normal range indicates healthy glucose homeostasis and insulin response.',
      clinicalNote: 'Optimal fasting glucose levels are generally below 100 mg/dL.'
    },
    {
      id: 'p2',
      name: 'Total Cholesterol',
      category: 'Lipid Profile',
      value: 218,
      unit: 'mg/dL',
      minRange: 125,
      maxRange: 200,
      status: 'ELEVATED',
      explanation: 'Measures total circulating sterol lipids including LDL, HDL, and VLDL particles.',
      clinicalNote: 'Values between 200–239 mg/dL are classified as borderline high. Discuss dietary fats and physical activity with your clinician.'
    },
    {
      id: 'p3',
      name: 'LDL Cholesterol',
      category: 'Lipid Profile',
      value: 128,
      unit: 'mg/dL',
      minRange: 50,
      maxRange: 100,
      status: 'BORDERLINE',
      explanation: 'Low-density lipoprotein transports lipids to peripheral tissues. Often called "bad cholesterol".',
      clinicalNote: 'Clinicians evaluate LDL alongside cardiovascular risk factors.'
    },
    {
      id: 'p4',
      name: 'HDL Cholesterol',
      category: 'Lipid Profile',
      value: 58,
      unit: 'mg/dL',
      minRange: 40,
      maxRange: 80,
      status: 'NORMAL',
      explanation: 'High-density lipoprotein facilitates reverse cholesterol transport away from arterial walls.',
      clinicalNote: 'HDL levels above 50 mg/dL for females or 40 mg/dL for males are generally desirable.'
    },
    {
      id: 'p5',
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
      id: 'p6',
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
  clinicianQuestions: [
    'Does my borderline Total Cholesterol (218 mg/dL) warrant lifestyle adjustments or follow-up testing in 3–6 months?',
    'What dietary changes or targeted exercise would you recommend to optimize my LDL/HDL ratio?',
    'Given my Vitamin D level of 24.2 ng/mL, should I start a specific vitamin D3 supplement regimen?',
    'Are there any additional cardiovascular risk markers (such as ApoB or hs-CRP) appropriate for my profile?'
  ]
};

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Normalize path (handle /.netlify/functions/api or /api/v1/...)
  let reqPath = event.path || '';
  reqPath = reqPath.replace('/.netlify/functions/api', '').replace('/api/v1', '');
  if (!reqPath.startsWith('/')) reqPath = '/' + reqPath;

  const method = event.httpMethod;
  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      body = {};
    }
  }

  // Route: Health Check
  if (reqPath === '/health' || reqPath === '/') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        mode: 'NETLIFY_SERVERLESS',
        data: {
          service: 'myHealthMate AI Serverless API',
          status: 'ONLINE',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'production'
        }
      })
    };
  }

  // Route: Auth Login
  if (reqPath === '/auth/login' && method === 'POST') {
    const email = body.email || 'alex.morgan@example.com';
    const isAdmin = email.includes('admin');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        token: 'netlify_demo_jwt_token_' + Date.now(),
        user: {
          id: isAdmin ? 'usr_admin_01' : 'usr_demo_patient_01',
          name: isAdmin ? 'Dr. Sarah Mitchell (Admin)' : (body.name || 'Alex Morgan'),
          email: email,
          role: isAdmin ? 'ADMIN' : 'PATIENT',
          joinedAt: '2025-08-14'
        }
      })
    };
  }

  // Route: Auth Register
  if (reqPath === '/auth/register' && method === 'POST') {
    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        token: 'netlify_demo_jwt_token_' + Date.now(),
        user: {
          id: 'usr_' + Date.now(),
          name: body.name || 'New Patient',
          email: body.email,
          role: 'PATIENT',
          joinedAt: new Date().toISOString().split('T')[0]
        }
      })
    };
  }

  // Route: Dashboard Summary
  if (reqPath === '/dashboard/summary' && method === 'GET') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        mode: 'NETLIFY_SERVERLESS',
        data: {
          totalReports: syntheticReports.length,
          abnormalFindings: 2,
          recordsCount: 3,
          upcomingAppointments: 1,
          healthScore: 92,
          vitalMetrics: {
            bloodPressure: '118/78 mmHg',
            heartRate: '72 bpm',
            oxygenSaturation: '99%',
            sleepAvg: '7.6 hrs'
          }
        }
      })
    };
  }

  // Route: Health Trends
  if (reqPath === '/dashboard/health-trends' && method === 'GET') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: {
          months: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
          systolic: [124, 122, 120, 119, 121, 118],
          diastolic: [82, 80, 79, 78, 80, 78],
          heartRate: [76, 74, 71, 73, 70, 72]
        }
      })
    };
  }

  // Route: Reports List or Upload
  if (reqPath === '/reports') {
    if (method === 'POST') {
      const newReport = {
        id: `rep_${Date.now()}_custom`,
        filename: body.fileName || 'Uploaded_Medical_Report.pdf',
        fileSize: body.fileSize || '2.1 MB',
        uploadDate: new Date().toISOString(),
        status: 'COMPLETED',
        category: 'Uploaded Document',
        analysisId: 'ana_7482_cmp'
      };
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: newReport })
      };
    }
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: syntheticReports })
    };
  }

  // Route: Report Analysis
  if (reqPath.includes('/analysis')) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: syntheticAnalysis
      })
    };
  }

  // Route: AI Chat Message
  if (reqPath === '/chat/message' && method === 'POST') {
    const userMsg = (body.message || '').toLowerCase();
    let reply = "Hello! I am your AI Health Companion. I can help explain medical terminologies, track your laboratory biomarkers, and formulate questions for your clinician visit. How can I assist you today?";

    if (userMsg.includes('cholesterol') || userMsg.includes('lipid')) {
      reply = "Your latest lipid panel recorded a Total Cholesterol level of 218 mg/dL and LDL of 128 mg/dL. These fall into the borderline range. Clinicians typically recommend evaluating dietary saturated fat intake, increasing aerobic exercise, and scheduling a follow-up test in 3–6 months. Would you like me to generate questions for your doctor?";
    } else if (userMsg.includes('glucose') || userMsg.includes('sugar')) {
      reply = "Your fasting blood glucose measured at 92 mg/dL, which is within the optimal standard clinical range (70–99 mg/dL). This indicates healthy baseline glucose regulation.";
    } else if (userMsg.includes('vitamin d') || userMsg.includes('vit d')) {
      reply = "Your 25-Hydroxy Vitamin D level was reported at 24.2 ng/mL, which indicates mild insufficiency (optimal range: 30–100 ng/mL). Discuss with your physician whether supplementation with Vitamin D3 is appropriate.";
    } else if (userMsg.includes('chest pain') || userMsg.includes('emergency') || userMsg.includes('breathing')) {
      reply = "⚠️ EMERGENCY SAFEGUARD: If you or someone with you is experiencing chest pressure, shortness of breath, sudden numbness, or severe pain, please immediately call 911 (or your local emergency medical service) or go to the nearest emergency room. myHealthMate AI does not provide emergency evaluation.";
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: {
          reply: reply,
          disclaimer: "Demonstration purpose only. myHealthMate AI does not provide medical diagnoses or prescriptions.",
          timestamp: new Date().toISOString()
        }
      })
    };
  }

  // Route: Admin Stats
  if (reqPath === '/admin/stats') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: {
          totalUsers: 142,
          activeSessions: 18,
          reportsProcessed: 320,
          aiQueriesHandled: 1240,
          systemUptime: '99.98%',
          databaseEngine: 'Netlify Cloud Serverless'
        }
      })
    };
  }

  // Default Fallback
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      message: `Netlify Serverless endpoint processed for ${reqPath}`,
      path: reqPath,
      timestamp: new Date().toISOString()
    })
  };
};
