import { GoogleGenAI } from '@google/genai';
import { db } from './db.js';

export interface GovGuideResponse {
  answer: string;
  sources: string[];
  suggestions: string[];
}

export async function askGovGuideAI(query: string, serviceId?: string | null): Promise<GovGuideResponse> {
  const services = await db.getServices();
  const centers = await db.getCenters();

  // Context preparation from database catalog
  const catalogContext = services.map(s => `
Service: ${s.name}
Department: ${s.department}
Category: ${s.category}
Estimated Duration: ${s.estimated_duration} minutes
Required Documents:
${s.required_documents.map(d => ` - ${d}`).join('\n')}
Description: ${s.description}
`).join('\n---\n');

  const centersContext = centers.map(c => `
Center: ${c.name}
Address: ${c.address}, ${c.district}, ${c.state} - ${c.pincode}
Phone: ${c.phone}
`).join('\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10 && !apiKey.includes('your_gemini_api_key')) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const systemPrompt = `You are "GovGuide AI", the official intelligent assistant for GovQueue AI (National Citizen Appointments and Queue Platform).
Your role is to guide citizens regarding government services, required documents, eligibility, appointment booking procedures, and queue navigation in India.

CRITICAL RULES:
1. Ground your answers strictly in the provided Service Catalog and Centers data below.
2. If specific official criteria (e.g., precise government application fees or state-specific statutory deadlines) are not in the provided data, state clearly that they must verify with the relevant department.
3. NEVER fabricate government policies, rules, fees, or penalties.
4. Be empathetic, polite, concise, structured, and easy to read (use bullet points for required documents).
5. Always end your advice with: "Please verify current requirements with the relevant government department."
6. Respond with valid JSON matching this format:
{
  "answer": "Clear markdown answer...",
  "sources": ["List of referenced official departments or services"],
  "suggestions": ["3 relevant follow-up questions the citizen might ask"]
}

SERVICE CATALOG DATA:
${catalogContext}

OFFICIAL SERVICE CENTERS:
${centersContext}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nCitizen Query: "${query}"\nProvide only the raw JSON response.` }] }
        ],
      });

      const text = response.text || '';
      // Extract json from markdown backticks if wrapped
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.answer && Array.isArray(parsed.sources) && Array.isArray(parsed.suggestions)) {
          return {
            answer: parsed.answer,
            sources: parsed.sources,
            suggestions: parsed.suggestions,
          };
        }
      }
    } catch (err: any) {
      console.warn('Gemini API invocation failed, transitioning safely to contextual fallback:', err?.message || err);
    }
  }

  // Graceful, authoritative fallback grounded in local catalog
  return generateCatalogFallback(query, services, centers, serviceId);
}

function generateCatalogFallback(query: string, services: any[], centers: any[], serviceId?: string | null): GovGuideResponse {
  const q = query.toLowerCase();

  let matchedService = serviceId ? services.find(s => s.id === serviceId) : null;
  if (!matchedService) {
    if (q.includes('passport')) matchedService = services.find(s => s.name.toLowerCase().includes('passport'));
    else if (q.includes('aadhaar') || q.includes('uidai') || q.includes('biometric')) matchedService = services.find(s => s.name.toLowerCase().includes('aadhaar'));
    else if (q.includes('licence') || q.includes('license') || q.includes('driving') || q.includes('rto')) matchedService = services.find(s => s.name.toLowerCase().includes('driving'));
    else if (q.includes('income')) matchedService = services.find(s => s.name.toLowerCase().includes('income'));
    else if (q.includes('caste') || q.includes('obc') || q.includes('sc') || q.includes('st') || q.includes('community')) matchedService = services.find(s => s.name.toLowerCase().includes('caste'));
    else if (q.includes('birth') || q.includes('death')) matchedService = services.find(s => s.name.toLowerCase().includes('birth'));
    else if (q.includes('property') || q.includes('deed') || q.includes('registry') || q.includes('land')) matchedService = services.find(s => s.name.toLowerCase().includes('property'));
    else if (q.includes('pension') || q.includes('senior') || q.includes('welfare')) matchedService = services.find(s => s.name.toLowerCase().includes('senior'));
  }

  if (matchedService) {
    const docList = matchedService.required_documents.map((d: string) => `* **${d}**`).join('\n');
    const answer = `### Information for **${matchedService.name}**

**Department:** ${matchedService.department}  
**Category:** ${matchedService.category}  
**Estimated Counter Duration:** ~${matchedService.estimated_duration} minutes

#### Mandatory Required Documents:
${docList}

#### How to Proceed:
1. Ensure all original copies of the documents listed above are ready.
2. Select your preferred Service Center from the catalog.
3. Reserve an appointment slot or obtain a digital queue token on the day of your visit.

*Please verify current requirements with the relevant government department.*`;

    return {
      answer,
      sources: [matchedService.department, matchedService.name],
      suggestions: [
        `Which service centers provide ${matchedService.name}?`,
        `How do I book an appointment for this service?`,
        `What is the average queue wait time today?`,
      ],
    };
  }

  if (q.includes('center') || q.includes('location') || q.includes('where') || q.includes('office')) {
    const centerList = centers.slice(0, 4).map(c => `* **${c.name}**\n  *Address:* ${c.address}, ${c.district} (${c.pincode})\n  *Phone:* ${c.phone}`).join('\n\n');
    return {
      answer: `### Available Government Service Centers

GovQueue AI connects you to certified administrative facilitation centres:

${centerList}

You can choose your nearest center while reserving your appointment on the platform.

*Please verify current requirements with the relevant government department.*`,
      sources: ['National Facilitation Directory', 'District Administrative Offices'],
      suggestions: [
        'How early should I arrive before my appointment?',
        'Can I walk in without a pre-booked appointment?',
        'What documents are needed for Aadhaar updates?',
      ],
    };
  }

  if (q.includes('queue') || q.includes('wait') || q.includes('token') || q.includes('how long')) {
    return {
      answer: `### Live Queue & Token Information

With GovQueue AI, you can track live counter progression directly from your phone:

* **Token System:** Once you arrive or check in online, you will receive a digital token (e.g., \`A-104\`).
* **Live Status:** The system displays the currently serving number and how many citizens are ahead of you in real-time.
* **Estimated Wait:** Calculated dynamically based on counter processing rates (typically 15–25 minutes per citizen).
* **Counter Notification:** You will receive an SMS and dashboard notification as soon as your token is called.

*Please verify current requirements with the relevant government department.*`,
      sources: ['GovQueue AI Real-Time Telemetry', 'Citizen Service Charter'],
      suggestions: [
        'How do I join the queue today?',
        'What documents do I need for a passport appointment?',
        'How do I cancel or reschedule an appointment?',
      ],
    };
  }

  return {
    answer: `### GovQueue AI Citizen Guidance

Welcome! I can assist you with information about government services, mandatory document checklists, service center locations, and queue schedules.

Here are the key services currently available on GovQueue AI:
* **Identity:** Aadhaar Enrolment & Biometric Updates
* **Travel:** Fresh Passport & Renewal Applications
* **Transport:** Driving Licence & Learner Test Verification
* **Certificates:** Income Certificates, Caste/Community Verification, Birth Certificates
* **Revenue:** Property & Conveyance Deed Registration
* **Welfare:** Senior Citizen Cards & Pension Schemes

You can ask me questions like:
* *"What documents do I need for a passport appointment?"*
* *"How do I apply for an income certificate?"*
* *"Which center provides driving licence services?"*

*Please verify current requirements with the relevant government department.*`,
    sources: ['National Government Services Portal', 'Citizen Facilitation Guidelines'],
    suggestions: [
      'What documents do I need for a passport appointment?',
      'How do I apply for an income certificate?',
      'Which center provides driving licence services?',
    ],
  };
}
