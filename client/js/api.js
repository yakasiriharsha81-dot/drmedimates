/**
 * myHealthMate AI — Centralized API Client & Synthetic Demo Provider
 * 
 * Provides unified Fetch API requests to the Node/Express backend (/api/v1).
 * If the backend is unavailable or running standalone/offline, it seamlessly
 * activates a resilient in-memory synthetic demo provider so all features
 * (upload progress, lab analysis, timeline, chatbot) work out of the box!
 */

const API_BASE_URL = window.API_BASE_URL || '/api/v1';

// In-memory synthetic demo state (NO sensitive data in localStorage)
const demoState = {
  user: {
    id: 'usr_demo_patient_01',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    role: 'PATIENT',
    joinedAt: '2025-08-14'
  },
  reports: [
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
  ],
  analysisData: {
    rep_7482_cmp: {
      reportId: 'rep_7482_cmp',
      reportTitle: 'Comprehensive Metabolic & Lipid Panel',
      facility: 'MetroHealth Diagnostic Laboratory (Synthetic Demo)',
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
    }
  },
  historyEvents: [
    {
      id: 'hist_01',
      title: 'Comprehensive Metabolic Panel',
      category: 'Lab Work',
      date: '2026-01-15',
      provider: 'Dr. Evelyn Reed (Metro Internal Medicine)',
      notes: 'Routine annual laboratory testing. Discussed lipid panel trends.',
      status: 'Reviewed'
    },
    {
      id: 'hist_02',
      title: 'Cardiology Follow-up & ECG',
      category: 'Cardiology',
      date: '2025-12-10',
      provider: 'Dr. Marcus Vance (Heart & Vascular Institute)',
      notes: 'Normal sinus rhythm confirmed on 12-lead ECG. Resting HR 68 bpm.',
      status: 'Completed'
    },
    {
      id: 'hist_03',
      title: 'Annual Health Check & Vitals',
      category: 'Consultations',
      date: '2025-09-18',
      provider: 'Metro Primary Care Associates',
      notes: 'Blood pressure 118/76 mmHg. BMI 22.8. Vaccinations up to date.',
      status: 'Completed'
    },
    {
      id: 'hist_04',
      title: 'Chest X-Ray (Post-Respiratory Infection)',
      category: 'Imaging',
      date: '2025-05-22',
      provider: 'City Imaging Center',
      notes: 'Clear bilateral lung fields. No consolidation or pleural effusion.',
      status: 'Completed'
    }
  ],
  notifications: [
    {
      id: 'notif_01',
      title: 'Lab Analysis Ready',
      message: 'Educational analysis for Comprehensive Metabolic Panel is available.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 'notif_02',
      title: 'Appointment Reminder',
      message: 'Upcoming cardiology wellness check on March 15, 2026 at 10:00 AM.',
      time: '1 day ago',
      unread: false
    },
    {
      id: 'notif_03',
      title: 'Security Notice',
      message: 'New session started from authorized browser. Zero health data stored locally.',
      time: '3 days ago',
      unread: false
    }
  ]
};

export const api = {
  isDemoMode: true,

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      // Graceful fallback to synthetic demo provider
      console.warn(`[myHealthMate AI] Real API at ${endpoint} unavailable, using Synthetic Demo Engine:`, err.message);
      return this.handleDemoFallback(endpoint, options);
    }
  },

  async handleDemoFallback(endpoint, options) {
    // Artificial small latency to simulate authentic network processing
    await new Promise(res => setTimeout(res, 220));

    if (endpoint === '/dashboard/summary') {
      return {
        success: true,
        mode: 'DEMO_SYNTHETIC',
        data: {
          totalReports: demoState.reports.length,
          abnormalFindings: 2,
          recordsCount: demoState.historyEvents.length,
          upcomingAppointments: 1,
          healthScore: 92,
          vitalMetrics: {
            bloodPressure: '118/78 mmHg',
            heartRate: '72 bpm',
            oxygenSaturation: '99%',
            sleepAvg: '7.6 hrs'
          }
        }
      };
    }

    if (endpoint === '/dashboard/health-trends') {
      return {
        success: true,
        mode: 'DEMO_SYNTHETIC',
        data: {
          months: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
          systolic: [124, 122, 120, 119, 121, 118],
          diastolic: [82, 80, 79, 78, 80, 78],
          heartRate: [76, 74, 71, 73, 70, 72]
        }
      };
    }

    if (endpoint === '/reports') {
      if (options.method === 'POST') {
        const newReport = {
          id: `rep_${Date.now()}_custom`,
          filename: options.fileName || 'Uploaded_Medical_Report.pdf',
          fileSize: options.fileSize || '2.1 MB',
          uploadDate: new Date().toISOString(),
          status: 'COMPLETED',
          category: 'Uploaded Document',
          analysisId: 'ana_7482_cmp'
        };
        demoState.reports.unshift(newReport);
        return { success: true, mode: 'DEMO_SYNTHETIC', data: newReport };
      }
      return { success: true, mode: 'DEMO_SYNTHETIC', data: demoState.reports };
    }

    if (endpoint.startsWith('/reports/') && endpoint.endsWith('/analysis')) {
      const reportId = endpoint.split('/')[2];
      const analysis = demoState.analysisData[reportId] || demoState.analysisData['rep_7482_cmp'];
      return { success: true, mode: 'DEMO_SYNTHETIC', data: analysis };
    }

    if (endpoint === '/health-history') {
      return { success: true, mode: 'DEMO_SYNTHETIC', data: demoState.historyEvents };
    }

    if (endpoint === '/notifications') {
      return { success: true, mode: 'DEMO_SYNTHETIC', data: demoState.notifications };
    }

    if (endpoint === '/chat/conversations') {
      if (options.method === 'POST') {
        const body = options.body ? JSON.parse(options.body) : {};
        const newConv = {
          id: `conv_${Date.now()}`,
          title: body.title || 'New Health Consultation',
          messageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        demoState.conversations = demoState.conversations || [];
        demoState.conversations.unshift(newConv);
        return { success: true, mode: 'DEMO_SYNTHETIC', data: newConv };
      }

      if (!demoState.conversations) {
        demoState.conversations = [
          { id: 'conv_1', title: 'Explaining Lipid & Metabolic Panel', messageCount: 2, createdAt: new Date().toISOString(), updatedAt: 'Today' },
          { id: 'conv_2', title: 'Questions on Vitamin D Insufficiency', messageCount: 2, createdAt: new Date().toISOString(), updatedAt: '3 days ago' },
          { id: 'conv_3', title: 'Blood Pressure Guidelines Overview', messageCount: 2, createdAt: new Date().toISOString(), updatedAt: '2 weeks ago' }
        ];
      }
      return { success: true, mode: 'DEMO_SYNTHETIC', data: demoState.conversations };
    }

    if (endpoint.startsWith('/chat/conversations/') && endpoint.endsWith('/messages')) {
      const convId = endpoint.split('/')[3];
      demoState.messages = demoState.messages || {};
      const msgs = demoState.messages[convId] || [
        { id: 'm1', sender: 'USER', content: 'What does borderline cholesterol mean?', createdAt: new Date().toISOString() },
        { id: 'm2', sender: 'ASSISTANT', content: 'Borderline cholesterol (200–239 mg/dL) indicates lipid concentrations slightly above desirable ranges for physician review.', createdAt: new Date().toISOString() }
      ];
      return { success: true, mode: 'DEMO_SYNTHETIC', data: { conversationId: convId, messages: msgs } };
    }

    if (endpoint.startsWith('/chat/conversations/') && options.method === 'DELETE') {
      const convId = endpoint.split('/')[3];
      if (demoState.conversations) {
        demoState.conversations = demoState.conversations.filter(c => c.id !== convId);
      }
      return { success: true, mode: 'DEMO_SYNTHETIC', data: null };
    }

    // Default response
    return { success: true, mode: 'DEMO_SYNTHETIC', data: {} };
  },

  // Full Conversation Lifecycle & Chat Operations
  async getChatConversations() {
    return await this.request('/chat/conversations');
  },

  async createChatConversation(title) {
    return await this.request('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  },

  async getChatMessages(conversationId) {
    return await this.request(`/chat/conversations/${conversationId}/messages`);
  },

  async deleteChatConversation(conversationId) {
    return await this.request(`/chat/conversations/${conversationId}`, {
      method: 'DELETE'
    });
  },

  async sendChatMessage(message, conversationId = null, language = 'en') {
    const payload = { message, conversationId, language };

    try {
      const res = await this.request('/chat/message', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res && res.data) {
        return res.data;
      }
      if (res && res.reply) {
        return res;
      }
    } catch (e) {
      console.warn('[api] Failed to reach /chat/message on backend, running in-memory engine:', e.message);
    }

    // Fallback simulation with language awareness
    await new Promise(r => setTimeout(r, 550));
    const lower = (message || '').toLowerCase();

    // Check emergency
    const emergencyKw = ['chest pain', 'heart attack', 'shortness of breath', 'cannot breathe', 'ఛాతీ నొప్పి', 'सीने में दर्द', 'மார்பு வலி'];
    if (emergencyKw.some(kw => lower.includes(kw))) {
      const alerts = {
        en: '🚨 **CRITICAL MEDICAL EMERGENCY ALERT:** If you are experiencing chest pain, difficulty breathing, or severe dizziness, please **call emergency medical services (e.g. 911/108) immediately**.',
        te: '🚨 **అత్యవసర వైద్య హెచ్చరిక:** మీకు తీవ్రమైన ఛాతీ నొప్పి లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉంటే, వెంటనే **అత్యవసర వైద్య సేవలను (108) సంప్రదించండి**.',
        hi: '🚨 **गंभीर आपातकालीन चिकित्सा सूचना:** यदि आपको सीने में तेज दर्द या सांस लेने में तकलीफ हो रही है, तो कृपया **तुरंत आपातकालीन सेवाओं (108/112) को कॉल करें**।',
        ta: '🚨 **அவசர மருத்துவ எச்சரிக்கை:** உங்களுக்கு கடுமையான மார்பு வலி அல்லது மூச்சுத் திணறல் ஏற்பட்டால், தயவுசெய்து **உடனடியாக 108 ஐ அழைக்கவும்**.'
      };
      return {
        reply: alerts[language] || alerts.en,
        isEmergencyAlert: true,
        mode: 'DEMO_SYNTHETIC'
      };
    }

    // Standard responses in current language
    let replyText = '';
    if (language === 'te') {
      replyText = `### విద్యాపరమైన సమాధానం (డెమో)\n\nమీ ప్రశ్న: "${message}".\n\nరక్త పరీక్షలు మరియు ఆరోగ్య సంకేతాలను అర్థం చేసుకోవడానికి మీ పూర్తి రిపోర్టును సమీక్షించండి మరియు వైద్యుడిని సంప్రదించండి.\n\n*గమనిక: విద్యా ప్రదర్శన మాత్రమే.*`;
    } else if (language === 'hi') {
      replyText = `### शैक्षिक विश्लेषण (डेमो)\n\nआपका प्रश्न: "${message}"।\n\nकिसी भी जांच रिपोर्ट को व्यक्तिगत स्वास्थ्य इतिहास के संदर्भ में ही समझा जाता है। निश्चित सलाह के लिए डॉक्टर से संपर्क करें।\n\n*नोट: केवल शैक्षिक प्रदर्शन।*`;
    } else if (language === 'ta') {
      replyText = `### கல்விசார் விளக்கம் (மாதிரி)\n\nஉங்கள் கேள்வி: "${message}".\n\nஆய்வக முடிவுகள் தனிநபரின் உடல்நிலை மற்றும் வாழ்க்கை முறையின் அடிப்படையிலேயே தீர்மானிக்கப்படுகின்றன.\n\n*குறிப்பு: மாதிரி விளக்க முறை மட்டுமே.*`;
    } else {
      if (lower.includes('cholesterol') || lower.includes('lipid')) {
        replyText = `### Understanding Your Lipid Profile (Educational Demo)\n\n• **Total Cholesterol (218 mg/dL):** In standard clinical guidelines, levels below 200 mg/dL are desirable. Values between **200–239 mg/dL are classified as borderline high**.\n• **LDL Cholesterol (128 mg/dL):** Elevated LDL warrants cardiovascular lifestyle review.\n• **HDL Cholesterol (58 mg/dL):** Above 50 mg/dL is protective for cardiovascular health.\n\n**Doctor Discussion Points:**\n1. What dietary adjustments do you recommend for my cholesterol?\n2. Should we repeat this lipid test in 3–6 months?`;
      } else {
        replyText = `### AI Health Companion Review (Demo)\n\nRegarding: "${message}".\n\nAll biomarkers should be reviewed alongside clinical symptoms and family history.\n\n**Next Steps:**\n1. Check your extracted parameters under **Report Analysis**.\n2. Review our tailored Clinician Discussion Guide.\n3. Consult your physician for medical decisions.`;
      }
    }

    return {
      reply: replyText,
      isEmergencyAlert: false,
      mode: 'DEMO_SYNTHETIC',
      provider: 'Synthetic Educational Engine'
    };
  }
};
