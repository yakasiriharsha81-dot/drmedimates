/**
 * myHealthMate AI — Server-Side AI Service
 * Supports Real AI Provider (OpenAI, Gemini, Anthropic, Groq, Ollama) and Multilingual Demo Mode.
 * Strictly enforces non-diagnostic boundaries and preserves original clinical measurements.
 */

import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const SYSTEM_PROMPTS = {
  en: `You are myHealthMate AI, an empathetic, highly trained educational health companion.
Your mission is to explain complex clinical lab findings, medical terms, and physiological reference ranges in clear, accessible language.

CRITICAL SAFETY & GOVERNANCE RULES:
1. You are NOT a doctor and CANNOT diagnose any disease, illness, or condition.
2. NEVER prescribe, change, or recommend medication dosages.
3. If the user presents red-flag/emergency symptoms (acute chest pain, sudden shortness of breath, severe head injury, facial drooping), instruct them to call emergency medical services (911/108) immediately.
4. PRESERVE all numerical values, test names, and clinical units (e.g. 218 mg/dL, 24.2 ng/mL, 92 mg/dL) exactly as stated.
5. Provide helpful questions the user can review directly with their personal doctor.
6. Provide output in clear Markdown with bullet points where appropriate.`,

  te: `మీరు myHealthMate AI, విద్యాపరమైన ఆరోగ్య సహచరుడు.
క్లినికల్ ల్యాబ్ నివేదికలు, వైద్య నిబంధనలు మరియు సూచికలను సులభమైన తెలుగులో వివరించడమే మీ లక్ష్యం.

ముఖ్యమైన నియమాలు:
1. మీరు వైద్య నిర్ధారణ చేయలేరు.
2. ఎలాంటి మందులు లేదా మోతాదులను సూచించకూడదు.
3. తీవ్రమైన ఛాతీ నొప్పి, శ్వాస ఆడకపోవడం వంటి అత్యవసర లక్షణాలు ఉంటే, వెంటనే అత్యవసర వైద్య సేవలను (108) సంప్రదించమని చెప్పండి.
4. అసలు వైద్య విలువలు, యూనిట్లు (mg/dL, ng/mL) మరియు మందుల పేర్లను యథాతథంగా ఉంచండి.
5. సమాధానాన్ని స్పష్టమైన తెలుగులో, ఉపయోగకరమైన వైద్య చర్చా ప్రశ్నలతో అందించండి.`,

  hi: `आप myHealthMate AI हैं, एक सहानुभूतिपूर्ण और शिक्षित स्वास्थ्य साथी।
आपका उद्देश्य जटिल लैब रिपोर्टों, चिकित्सा शब्दावली और सामान्य श्रेणियों को सरल हिन्दी में समझाना है।

महत्वपूर्ण सुरक्षा नियम:
1. आप डॉक्टर नहीं हैं और कोई बीमारी का निदान नहीं कर सकते।
2. कभी भी दवा या उसकी खुराक की सिफारिश न करें।
3. आपातकालीन लक्षणों (जैसे सीने में तेज दर्द, सांस लेने में तकलीफ) पर तुरंत आपातकालीन सेवाओं (108/112) पर संपर्क करने का निर्देश दें।
4. सभी संख्यात्मक मान, परीक्षण नाम और इकाइयाँ (mg/dL, ng/mL) बिल्कुल सटीक और मूल रूप में रखें।
5. डॉक्टर से पूछने योग्य उपयोगी प्रश्नों के साथ सरल हिन्दी में उत्तर दें।`,

  ta: `நீங்கள் myHealthMate AI, ஒரு கல்விசார் சுகாதாரத் துணை உதவியாளர்.
மருத்துவ ஆய்வக முடிவுகள் மற்றும் உடல்நலக் குறியீடுகளை எளிய தமிழில் விளக்குவதே உங்கள் பணி.

முக்கிய விதிகள்:
1. நீங்கள் மருத்துவக் கண்டறிதல் செய்ய முடியாது.
2. எந்த மருந்துகளையும் பரிந்துரைக்கக் கூடாது.
3. மார்பு வலி, மூச்சுத் திணறல் போன்ற அவசர காலங்களில் உடனடியாக 108 ஐ அழைக்க அறிவுறுத்துங்கள்.
4. அசல் அளவீடுகள், அலகுகள் (mg/dL, ng/mL) மற்றும் மருந்துப் பெயர்களை மாற்றாமல் அப்படியே வைக்கவும்.
5. மருத்துவரிடம் கேட்க வேண்டிய கேள்விகளுடன் தெளிவான தமிழில் பதிலளிக்கவும்.`
};

export const aiService = {
  isRealAIConfigured() {
    return Boolean(config.ai.enabled && config.ai.apiKey && config.ai.provider !== 'demo');
  },

  getProviderInfo() {
    if (this.isRealAIConfigured()) {
      return {
        mode: 'REAL_AI',
        provider: config.ai.provider,
        model: config.ai.model || 'gpt-4o-mini'
      };
    }
    return {
      mode: 'DEMO_SYNTHETIC',
      provider: 'Synthetic Educational Engine',
      model: 'myHealthMate-Demo-v1'
    };
  },

  async generateChatResponse(userMessage, conversationHistory = [], language = 'en') {
    const lang = ['en', 'te', 'hi', 'ta'].includes(language) ? language : 'en';
    const lower = (userMessage || '').toLowerCase();

    // 1. Emergency Safety Filter (Triaged immediately across languages)
    const emergencyKeywords = [
      'chest pain', 'heart attack', 'cannot breathe', 'difficulty breathing', 'shortness of breath',
      'stroke', 'unconscious', 'severe bleeding', 'seizure', 'suicide',
      'ఛాతీ నొప్పి', 'గుండెపోటు', 'శ్వాస ఆడటం లేదు',
      'सीने में दर्द', 'हार्ट अटैक', 'सांस नहीं आ रही',
      'மார்பு வலி', 'மாரடைப்பு', 'மூச்சு விட முடியவில்லை'
    ];

    const hasEmergency = emergencyKeywords.some(kw => lower.includes(kw));
    if (hasEmergency) {
      return this.getEmergencyResponse(lang);
    }

    // 2. Real AI Provider Branch
    if (this.isRealAIConfigured()) {
      try {
        return await this.callRealAIProvider(userMessage, conversationHistory, lang);
      } catch (err) {
        logger.error(`[AI Service] Real provider (${config.ai.provider}) failed:`, err);
        // Do NOT invent fake success. Return transparent error with retry ability.
        return {
          reply: `⚠️ **AI Provider Communication Error:** Unable to reach the configured AI model (${config.ai.provider}). Details: ${err.message}. Please verify your API key or network connection and retry.`,
          isEmergencyAlert: false,
          isError: true,
          mode: 'REAL_AI_FAILED',
          provider: config.ai.provider
        };
      }
    }

    // 3. Demo Mode Branch (Transparent, helpful, and multilingual)
    return this.generateMultilingualDemoResponse(userMessage, lang);
  },

  async callRealAIProvider(userMessage, conversationHistory, lang) {
    const systemPrompt = SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en;
    const provider = (config.ai.provider || 'openai').toLowerCase();

    if (provider === 'openai' || provider === 'groq' || provider === 'together') {
      const endpoint = process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-8).map(m => ({
          role: m.sender === 'USER' ? 'user' : 'assistant',
          content: m.content
        })),
        { role: 'user', content: userMessage }
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.ai.apiKey}`
        },
        body: JSON.stringify({
          model: config.ai.model || 'gpt-4o-mini',
          messages,
          temperature: 0.3,
          max_tokens: 800
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'No response returned from model.';

      return {
        reply,
        isEmergencyAlert: false,
        isError: false,
        mode: 'REAL_AI',
        provider: config.ai.provider,
        model: config.ai.model
      };
    }

    if (provider === 'gemini') {
      const model = config.ai.model || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.ai.apiKey}`;

      const contents = [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }] }
      ];

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API Error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from Gemini.';

      return {
        reply,
        isEmergencyAlert: false,
        isError: false,
        mode: 'REAL_AI',
        provider: 'gemini',
        model
      };
    }

    throw new Error(`Unsupported AI provider: ${provider}`);
  },

  getEmergencyResponse(lang) {
    const responses = {
      en: {
        reply: '🚨 **CRITICAL MEDICAL EMERGENCY ALERT / URGENT MEDICAL NOTICE:** If you are experiencing chest pain, severe shortness of breath, sudden numbness, or acute trauma, please **call emergency medical services (e.g. 911 or local emergency number) immediately** or proceed to the nearest emergency department. Do not rely on AI tools during acute medical emergencies.',
        disclaimer: 'Seek prompt emergency clinical care immediately.'
      },
      te: {
        reply: '🚨 **అత్యవసర వైద్య హెచ్చరిక:** మీకు తీవ్రమైన ఛాతీ నొప్పి, శ్వాస తీసుకోవడంలో తీవ్రమైన ఇబ్బంది లేదా ఆకస్మిక బలహీనత ఉంటే, దయచేసి **వెంటనే అత్యవసర వైద్య సేవలను (108 లేదా సమీప ఆసుపత్రి) సంప్రదించండి**. అత్యవసర సమయాల్లో AI సాధనాలపై ఆధారపడవద్దు.',
        disclaimer: 'వెంటనే అత్యవసర వైద్య సహాయం పొందండి.'
      },
      hi: {
        reply: '🚨 **गंभीर आपातकालीन चिकित्सा सूचना:** यदि आपको सीने में तेज दर्द, सांस लेने में अत्यधिक कठिनाई, या अचानक सुन्नता महसूस हो रही है, तो कृपया **तुरंत आपातकालीन चिकित्सा सेवाओं (108 या 112) को कॉल करें** अथवा नजदीकी अस्पताल जाएं। आपात स्थिति में AI पर निर्भर न रहें।',
        disclaimer: 'तत्काल आपातकालीन चिकित्सा सहायता प्राप्त करें।'
      },
      ta: {
        reply: '🚨 **அவசர மருத்துவ எச்சரிக்கை:** உங்களுக்கு கடுமையான மார்பு வலி, தீவிர மூச்சுத் திணறல் அல்லது திடீர் பலவீனம் ஏற்பட்டால், தயவுசெய்து **உடனடியாக அவசர சேவைகளை (108) அழைக்கவும்** அல்லது மருத்துவமனைக்குச் செல்லவும். அவசர காலங்களில் AI கருவிகளை நம்ப வேண்டாம்.',
        disclaimer: 'உடனடி அவசர மருத்துவ உதவியை நாடுங்கள்.'
      }
    };

    const res = responses[lang] || responses.en;
    return {
      reply: res.reply,
      isEmergencyAlert: true,
      isError: false,
      mode: this.isRealAIConfigured() ? 'REAL_AI' : 'DEMO_SYNTHETIC',
      provider: config.ai.provider
    };
  },

  generateMultilingualDemoResponse(message, lang) {
    const lower = message.toLowerCase();

    // English responses
    if (lang === 'en') {
      if (lower.includes('cholesterol') || lower.includes('lipid')) {
        return {
          reply: `### Understanding Your Lipid Profile (Educational Demo)\n\n• **Total Cholesterol (218 mg/dL):** In standard clinical reference intervals, values below 200 mg/dL are desirable, while **200–239 mg/dL is categorized as borderline high**.\n• **LDL ("Bad") Cholesterol (128 mg/dL):** Elevated LDL can contribute to arterial plaque accumulation over time.\n• **HDL ("Good") Cholesterol (58 mg/dL):** Above 50 mg/dL is favorable for reverse cholesterol transport.\n\n**Suggested Questions for Your Clinician:**\n1. What dietary adjustments (e.g. increasing soluble fiber, decreasing saturated fats) do you recommend for my cardiovascular profile?\n2. Would you recommend repeating a fasting lipid panel in 3–6 months to monitor trends?\n\n*Note: Demo simulation mode. No external AI API key is configured.*`,
          isEmergencyAlert: false,
          mode: 'DEMO_SYNTHETIC'
        };
      }
      if (lower.includes('vitamin d')) {
        return {
          reply: `### Vitamin D (25-Hydroxy) Educational Overview\n\n• **Extracted Level (24.2 ng/mL):** Common biological reference intervals define 30.0 to 100.0 ng/mL as optimal. Values between **20 and 29 ng/mL are typically classified as insufficient**.\n• **Biological Role:** Essential for intestinal calcium absorption, skeletal bone mineral density, and immune modulation.\n\n**Clinician Discussion Points:**\n• Inquire whether an over-the-counter or prescription Vitamin D3 (Cholecalciferol) regimen is appropriate for you.\n• Discuss dietary sources (fortified milk, fatty fish, egg yolks) and safe daylight exposure.\n\n*Note: Demo simulation mode. No external AI API key is configured.*`,
          isEmergencyAlert: false,
          mode: 'DEMO_SYNTHETIC'
        };
      }
      return {
        reply: `### AI Health Companion Educational Review\n\nThank you for asking about: "${message}".\n\nIn medical practice, lab findings and biological markers are always interpreted in context with your individual medical history, physical symptoms, and lifestyle factors.\n\n**Recommended Next Steps:**\n1. Review your extracted biomarker parameters under the **Report Analysis** view.\n2. Note any discussion points from our Clinician Discussion Guide.\n3. Consult your primary physician for definitive medical interpretation.\n\n*Note: Demo simulation mode. No external AI API key is configured.*`,
        isEmergencyAlert: false,
        mode: 'DEMO_SYNTHETIC'
      };
    }

    // Telugu responses (తెలుగు)
    if (lang === 'te') {
      if (lower.includes('cholesterol') || lower.includes('కొలెస్ట్రాల్') || lower.includes('లిపిడ్')) {
        return {
          reply: `### మీ లిపిడ్ ప్రొఫైల్ విశ్లేషణ (విద్యా ప్రదర్శన)\n\n• **టోటల్ కొలెస్ట్రాల్ (218 mg/dL):** ప్రామాణిక వైద్య సూచికల ప్రకారం, 200 mg/dL కంటే తక్కువ ఉండటం ఉత్తమం. **200–239 mg/dL సరిహద్దులో (Borderline High)** ఉన్నట్లుగా వర్గీకరించబడుతుంది.\n• **LDL ("చెడు") కొలెస్ట్రాల్ (128 mg/dL):** ఇది రక్తనాళాలలో కొవ్వు పేరుకుపోవడానికి కారణం కావచ్చు.\n• **HDL ("మంచి") కొలెస్ట్రాల్ (58 mg/dL):** 50 mg/dL కంటే ఎక్కువ ఉండటం గుండె ఆరోగ్యానికి మంచిది.\n\n**వైద్యుడితో చర్చించవలసిన ముఖ్యమైన ప్రశ్నలు:**\n1. నా కొలెస్ట్రాల్ స్థాయిని తగ్గించడానికి ఏ ఆహారపు అలవాట్లను మార్చుకోవాలి?\n2. 3 నుండి 6 నెలల్లో మళ్లీ లిపిడ్ పరీక్ష చేయించుకోవాలా?\n\n*గమనిక: డెమో మోడ్. నిజమైన AI కీ కాన్ఫిగర్ చేయబడలేదు.*`,
          isEmergencyAlert: false,
          mode: 'DEMO_SYNTHETIC'
        };
      }
      if (lower.includes('vitamin d') || lower.includes('విటమిన్')) {
        return {
          reply: `### విటమిన్ D (25-Hydroxy) సమాచారం\n\n• **మీ విలువ (24.2 ng/mL):** సాధారణంగా 30.0 నుండి 100.0 ng/mL సరైన స్థాయిగా పరిగణించబడుతుంది. **20 నుండి 29 ng/mL ఉండటం స్వల్ప లోపాన్ని (Insufficiency)** సూచిస్తుంది.\n• **ప్రాముఖ్యత:** ఎముకల బలం, రోగనిరోధక శక్తి మరియు కాల్షియం శోషణకు విటమిన్ D ఎంతో అవసరం.\n\n**డాక్టర్‌ను అడగవలసిన ప్రశ్నలు:**\n• విటమిన్ D3 సప్లిమెంట్స్ తీసుకోవడం మంచిదా? సరైన మోతాదు ఏమిటి?\n• ఉదయం ఎండలో ఎంత సమయం గడపాలి?\n\n*గమనిక: డెమో మోడ్. విద్యా ప్రదర్శన మాత్రమే.*`,
          isEmergencyAlert: false,
          mode: 'DEMO_SYNTHETIC'
        };
      }
      return {
        reply: `### AI ఆరోగ్య సహచర సమీక్ష\n\nమీ ప్రశ్న: "${message}".\n\nవైద్య రంగంలో, రక్త పరీక్ష ఫలితాలు మరియు లక్షణాలను మీ వ్యక్తిగత ఆరోగ్య చరిత్రను బట్టి మాత్రమే విశ్లేషించాలి.\n\n**సూచించబడిన తదుపరి చర్యలు:**\n1. **రిపోర్ట్ విశ్లేషణ** విభాగంలో మీ పూర్తి పారామితులను సమీక్షించండి.\n2. మీ వైద్యుడితో చర్చించడానికి సిద్ధం చేసిన ప్రశ్నల మార్గదర్శినిని ఉపయోగించండి.\n3. ఖచ్చితమైన నిర్ధారణ కోసం మీ ప్రాథమిక వైద్యుడిని సంప్రదించండి.\n\n*గమనిక: డెమో సిమ్యులేషన్ మోడ్.*`,
        isEmergencyAlert: false,
        mode: 'DEMO_SYNTHETIC'
      };
    }

    // Hindi responses (हिन्दी)
    if (lang === 'hi') {
      if (lower.includes('cholesterol') || lower.includes('कोलेस्ट्रॉल') || lower.includes('लिपिड')) {
        return {
          reply: `### आपके लिपिड प्रोफाइल का शैक्षिक विश्लेषण (डेमो)\n\n• **कुल कोलेस्ट्रॉल (218 mg/dL):** मानक संदर्भ सीमाओं के अनुसार, 200 mg/dL से कम मान वांछनीय है। **200–239 mg/dL को सीमावर्ती उच्च (Borderline High)** माना जाता है।\n• **LDL ("खराब") कोलेस्ट्रॉल (128 mg/dL):** इसका बढ़ा हुआ स्तर धमनियों के स्वास्थ्य को प्रभावित कर सकता है।\n• **HDL ("अच्छा") कोलेस्ट्रॉल (58 mg/dL):** 50 mg/dL से अधिक मान हृदय सुरक्षा के लिए सकारात्मक है।\n\n**डॉक्टर से पूछने योग्य प्रश्न:**\n1. क्या मुझे आहार में वसा कम करने और फाइबर बढ़ाने की आवश्यकता है?\n2. क्या 3–6 महीने बाद दोबारा लिपिड प्रोफाइल जांच करानी चाहिए?\n\n*नोट: डेमो सिमुलेशन मोड। कोई बाहरी AI API कुंजी कॉन्फ़िगर नहीं है।*`,
          isEmergencyAlert: false,
          mode: 'DEMO_SYNTHETIC'
        };
      }
      return {
        reply: `### AI स्वास्थ्य साथी समीक्षा\n\nआपके प्रश्न: "${message}" के संदर्भ में:\n\nचिकित्सा पद्धति में, किसी भी जांच रिपोर्ट को व्यक्तिगत स्वास्थ्य इतिहास, उम्र और जीवनशैली के संदर्भ में ही समझा जाता है।\n\n**सिफारिशें:**\n1. **रिपोर्ट विश्लेषण** टैब में अपने पूरे मापदंडों की जांच करें।\n2. डॉक्टर चर्चा गाइड में दिए गए प्रश्नों को अपने चिकित्सक के साथ साझा करें।\n3. चिकित्सीय सलाह और उपचार के लिए हमेशा प्रमाणित डॉक्टर से मिलें।\n\n*नोट: डेमो सिमुलेशन मोड।*`,
        isEmergencyAlert: false,
        mode: 'DEMO_SYNTHETIC'
      };
    }

    // Tamil responses (தமிழ்)
    if (lang === 'ta') {
      if (lower.includes('cholesterol') || lower.includes('கொலஸ்ட்ரால்') || lower.includes('லிப்பிட்')) {
        return {
          reply: `### கொலஸ்ட்ரால் பரிசோதனை விளக்கம் (மாதிரி கல்வித் தகவல்)\n\n• **மொத்த கொலஸ்ட்ரால் (218 mg/dL):** மருத்துவக் குறிப்பு வரம்பின்படி, 200 mg/dL க்கு குறைவாக இருப்பது சிறந்தது. **200–239 mg/dL என்பது எல்லைக்கோட்டு உயர்வாகக் (Borderline High)** கருதப்படுகிறது.\n• **LDL ("கெட்ட") கொலஸ்ட்ரால் (128 mg/dL):** இது இரத்தக் குழாய்களில் படிவுகளை ஏற்படுத்த வாய்ப்புள்ளது.\n• **HDL ("நல்ல") கொலஸ்ட்ரால் (58 mg/dL):** 50 mg/dL க்கு மேல் இருப்பது இதயத்திற்கு நல்லது.\n\n**மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்:**\n1. கொலஸ்ட்ராலைக் குறைக்க என்ன உணவு மாற்றங்களைச் செய்ய வேண்டும்?\n2. 3–6 மாதங்களில் மீண்டும் இந்த பரிசோதனையை செய்ய வேண்டுமா?\n\n*குறிப்பு: மாதிரி விளக்க முறை. உண்மையான AI API விசை கட்டமைக்கப்படவில்லை.*`,
          isEmergencyAlert: false,
          mode: 'DEMO_SYNTHETIC'
        };
      }
      return {
        reply: `### AI சுகாதாரத் துணை விளக்கம்\n\nஉங்கள் கேள்வி: "${message}".\n\nமருத்துவ நடைமுறையில், ஆய்வக முடிவுகள் தனிநபரின் உடல்நிலை மற்றும் வாழ்க்கை முறையின் அடிப்படையிலேயே தீர்மானிக்கப்படுகின்றன.\n\n**அடுத்த கட்ட நடவடிக்கைகள்:**\n1. **அறிக்கை பகுப்பாய்வு** பக்கத்தில் உங்கள் முழு முடிவுகளையும் பார்வையிடுங்கள்.\n2. மருத்துவரிடம் கேட்க வேண்டிய கேள்விகளை குறித்துக் கொள்ளுங்கள்.\n3. விரிவான மருத்துவ ஆலோசனைக்கு மருத்துவரை அணுகவும்.\n\n*குறிப்பு: மாதிரி விளக்க முறை.*`,
        isEmergencyAlert: false,
        mode: 'DEMO_SYNTHETIC'
      };
    }

    return {
      reply: `Educational Review: "${message}". Always review lab telemetry with your physician.`,
      isEmergencyAlert: false,
      mode: 'DEMO_SYNTHETIC'
    };
  }
};
