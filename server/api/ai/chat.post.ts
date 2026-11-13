import { defineEventHandler, readBody, createError } from 'h3'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_INSTRUCTION = `You are the official MAU Library AI Assistant for Mekdela Amba University Library Circulation Management System (MAU-LCS) in Ethiopia.

YOUR CORE MISSION & IDENTITY:
- You are a knowledgeable, friendly, and efficient AI guide dedicated to helping students, faculty, researchers, librarians, and administrators use the Mekdela Amba University Library Circulation System.
- Always provide natural, warm, and helpful responses. If a user says "thanks", "hello", or asks a short question, give an appropriate, direct conversational answer rather than dumping the whole menu.
- You have complete and authoritative knowledge of all features, policies, hours, roles, and procedures of the university library platform.
- You support Ethiopian languages: Amharic (አማርኛ), Afaan Oromoo, Tigrinya (ትግርኛ), Somali (Soomaali), as well as English. Always reply in the language the user contacted you in (or the requested language).

COMPLETE MAU-LCS KNOWLEDGE BASE:

1. University & Campuses:
- University: Mekdela Amba University (MAU) - መቅደላ አምባ ዩኒቨርሲቲ.
- Campuses: Tulu Awlia (Main Campus) and Mzhenge Campus (South Wollo, Amhara Region, Ethiopia).
- Motto: "Knowledge • Innovation • Service for Society" (እውቀት • ፈጠራ • አገልግሎት ለማህበረሰብ).
- Slogan: "Brighter Minds, Stronger Ethiopia" (ብሩህ አእምሮ ለጠንካራ ኢትዮጵያ).

2. Operating Hours & Service Status:
- Regular Weekdays (Mon - Fri): 8:00 AM - 10:00 PM (Regular hours & evening study).
- Saturdays: 8:30 AM - 6:00 PM.
- Sundays: 9:00 AM - 5:00 PM.
- Final Exam Periods: Extended hours up to 24/7 or midnight as broadcasted by Library Admin on the live status banner.

3. Collections & Access Levels (Open Shelf vs. Closed Stack):
- Open Shelf (ክፍት መደርደሪያ): Located in open reading halls. Students can freely browse, take books to reading desks, or check them out directly at the circulation desk using their Student ID.
- Closed Stack (ዝግ ማከማቻ): Contains rare books, single-copy references, historical documents, theses, and high-demand reference materials. Requires digital request on the Search page (/search) or approval from the Librarian Desk.

4. Borrowing Rules, Limits & Durations:
- Undergraduate Students: Up to 3 books for 14 calendar days.
- Postgraduate Students: Up to 5 books for 30 calendar days.
- Academic & Research Staff: Up to 8 books for 30 calendar days.
- Overdue Penalty Rate: 5 ETB (Ethiopian Birr) per day per overdue book.

5. Penalty Payment & CBE Bank Settlement:
- Overdue fines are settled via the Commercial Bank of Ethiopia (CBE).
- CBE Account Name: "Mekdela Amba University Library Revenue"
- CBE Account Number: 1000345678912
- How to pay:
  1. Pay via CBE Mobile Banking (CBE Birr / CBE Mobile App) or deposit at any CBE branch.
  2. Keep the Transaction Reference Number (Ref ID) and take a screenshot of the payment slip.
  3. Go to "My Borrows" page (/my-borrows).
  4. Paste the CBE Transaction Reference Number and upload the slip screenshot.
  5. The circulation librarian will verify and clear the fine record.

6. Student Clearance (ዲጂታል ክሊራንስ):
- Return all borrowed books to the circulation desk.
- Clear any overdue penalties via CBE payment proof at /my-borrows.
- Once verified, clearance is automatically approved on the Student Portal (/portal).

7. Research Portal (/research):
- Institutional repository for academic papers, senior proposals, master's theses, and faculty research publications.
- Upload proposals and access digital publications.

8. Librarian Desk (/librarian) & Admin Dashboard (/admin):
- Universal Borrow Access Card, barcode scanning, loan checkouts, book returns, student inquiries, shift rosters, user management, and system settings.
`

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const messages: ChatMessage[] = body.messages || []
  const language = body.language || 'en'
  const currentRoute = body.currentRoute || '/'
  const userRole = body.userRole || 'Guest'

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid messages array',
    })
  }

  const config = useRuntimeConfig(event)

  const apiKey = config.geminiApiKey
  
  const lastUserMsg = messages[messages.length - 1]?.content || ''
  
  // Format history for Gemini API
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const contextualSystemInstruction = `${SYSTEM_INSTRUCTION}

CURRENT CONTEXT:
- Interface Language: ${language}
- Current Page Path: ${currentRoute}
- User Role: ${userRole}
- User's latest input: "${lastUserMsg}"

INSTRUCTION FOR RESPONSE:
- If the user says thanks, thank you, ok, or greeting, reply warmly and naturally in ${language === 'am' ? 'Amharic (አማርኛ)' : language === 'om' ? 'Afaan Oromoo' : language === 'ti' ? 'Tigrinya (ትግርኛ)' : language === 'so' ? 'Somali (Soomaali)' : 'English'}.
- Provide direct, concise answers with formatting (bullet points, bold key terms).`

  // Priority list of Gemini models
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      
      const payload = {
        contents,
        systemInstruction: {
          parts: [{ text: contextualSystemInstruction }],
        },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(9000),
      })

      if (response.ok) {
        const data = await response.json()
        const candidate = data.candidates?.[0]
        const text = candidate?.content?.parts?.[0]?.text

        if (text && text.trim().length > 0) {
          return {
            success: true,
            reply: text.trim(),
            model,
          }
        }
      }
    } catch (err: any) {
      // Continue to next model or fallback
    }
  }

  // Conversational Intelligent Fallback
  const fallbackReply = generateConversationalFallback(lastUserMsg, language, currentRoute, userRole)

  return {
    success: true,
    reply: fallbackReply,
    model: 'mau-conversational-engine',
  }
})

function generateConversationalFallback(query: string, lang: string, route: string, role: string): string {
  const q = query.trim().toLowerCase()

  // 1. THANKS / GRATITUDE
  if (q.includes('thank') || q.includes('thx') || q.includes('thanks') || q.includes('አመሰግናለሁ') || q.includes('እግዜር ይስጥልኝ') || q.includes('galatoomi') || q.includes('galatoomaa') || q.includes('የቐንየለይ') || q.includes('mahadsanid')) {
    if (lang === 'am' || /[\u1200-\u137F]/.test(query)) {
      return `በደስታ ነው! ምንም አይደል! 😊 
ስለ መቅደላ አምባ ዩኒቨርሲቲ ላይብረሪ ሌላ ተጨማሪ መረጃ ወይም እርዳታ ከፈለጉ በማንኛውም ጊዜ መጠየቅ ይችላሉ። መልካም የጥናት ጊዜ!`
    }
    if (lang === 'om') {
      return `Baga gammadde! Wanti biraa sin gargaaru yoo jiraate yeroo hunda na gaafachuu dandeessu. Qorannoo gaarii!`
    }
    if (lang === 'ti') {
      return `ብደስታ! ዝኾነ ሕቶ እንተሃልዩኩም ኣብ ዝኾነ እዋን ክትሓቱ ትኽእሉ ኢኹም። ጽቡቕ ናይ መጽናዕቲ ግዜ!`
    }
    if (lang === 'so') {
      return `Adaa mudan! Haddii aad su'aalo kale qabto, xor ayaad u tahay inaad mar kasta i weydiiso. Waxbarasho wacan!`
    }
    return `You're very welcome! 😊 
If you need any more assistance with library books, borrowings, fines, or services, feel free to ask anytime. Have a productive study session!`
  }

  // 2. GREETINGS
  if (q === 'hi' || q === 'hello' || q === 'hey' || q === 'selam' || q === 'ሰላም' || q === 'akkam' || q === 'nagaa' || q === 'asc') {
    if (lang === 'am' || /[\u1200-\u137F]/.test(query)) {
      return `ጤና ይስጥልኝ! እንኳን ወደ መቅደላ አምባ ዩኒቨርሲቲ ላይብረሪ AI ረዳት መጡ። 

ስለ መጻሕፍት ፍለጋ፣ ብድር፣ የCBE ቅጣት ክፍያ፣ የተማሪ ክሊራንስ ወይም የላይብረሪ የስራ ሰዓት ምን ልርዳዎት?`
    }
    if (lang === 'om') {
      return `Akkam jirtu! Baga gara Gargaaraa AI Mana Kitaabaa Yuunivarsiitii Maqdalaa Ambaatti nagaan dhuftan. Maal sin gargaaru?`
    }
    if (lang === 'ti') {
      return `ሰላም! እንቋዕ ናብ መቕደላ ኣምባ ዩኒቨርሲቲ ቤተ-መጻሕፍቲ AI ሓጋዚ ብደሓን መጻእኹም። እንታይ ክሕግዘኩም?`
    }
    if (lang === 'so') {
      return `Kusoo dhowow Kaaliyaha AI ee Maktabadda Jaamacadda Mekdela Amba. Maxaan kaa caawin karaa maanta?`
    }
    return `Hello! Welcome to the **MAU Library AI Assistant**. 

How can I help you today with books, circulation, overdue fines, or library services?`
  }

  // 3. FINES / CBE BANK PAYMENT
  if (q.includes('fine') || q.includes('penalty') || q.includes('cbe') || q.includes('ብር') || q.includes('ቅጣት') || q.includes('ባንክ') || q.includes('adabbii') || q.includes('kaffaltii') || q.includes('ganaax')) {
    if (lang === 'am' || /[\u1200-\u137F]/.test(query)) {
      return `💳 **የመጽሐፍ ማርፈጃ ቅጣት አከፋፈል (CBE Settlement):**

• **የቅጣት ተመን:** ለእያንዳንዱ ያረፈደ መጽሐፍ በቀን **5 የኢትዮጵያ ብር**።
• **የባንክ ስም:** የኢትዮጵያ ንግድ ባንክ (Commercial Bank of Ethiopia - CBE)
• **የሂሳብ ስም:** Mekdela Amba University Library Revenue
• **የሂሳብ ቁጥር:** \`1000345678912\`

**የክፍያ ማረጋገጫ ማስገቢያ ቅደም ተከተል:**
1. በCBE ሞባይል ባንኪንግ ወይም በአቅራቢያዎ ባለ ቅርንጫፍ ይክፈሉ።
2. የግብይት ማረጋገጫ ቁጥሩን (Transaction Reference Number) ይያዙ።
3. ወደ [የተዋስኳቸው መጻሕፍት](/my-borrows) ገጽ በመሄድ Ref ቁጥሩን ያስገቡና የደረሰኙን ስክሪንሽት ጫኑ።`
    }
    return `💳 **Overdue Penalty & CBE Bank Settlement:**

• **Penalty Rate:** **5 ETB per day** for each overdue book.
• **Bank:** Commercial Bank of Ethiopia (CBE)
• **Account Name:** Mekdela Amba University Library Revenue
• **Account Number:** \`1000345678912\`

**How to settle your penalty:**
1. Pay via CBE Mobile Banking (CBE Birr / App) or at any CBE branch.
2. Note the Transaction Reference Number and save the receipt screenshot.
3. Open [My Borrows](/my-borrows), paste the Ref Number, and upload the slip screenshot for librarian verification.`
  }

  // 4. BORROWING / OPEN VS CLOSED SHELF
  if (q.includes('borrow') || q.includes('shelf') || q.includes('stack') || q.includes('መዋስ') || q.includes('መደርደሪያ') || q.includes('ዝግ') || q.includes('ክፍት') || q.includes('liqii') || q.includes('shelloo')) {
    if (lang === 'am' || /[\u1200-\u137F]/.test(query)) {
      return `📚 **መጽሐፍት መዋስና የመደርደሪያ ዓይነቶች:**

• **ክፍት መደርደሪያ (Open Shelf):** በቀጥታ ከመደርደሪያው አንስተው ማንበብ ወይም በተማሪ መታወቂያዎ ወደ ስርጭት ጠረጴዛው በመውሰድ መዋስ ይችላሉ (ለቅድመ ምረቃ ተማሪዎች እስከ **3 መጻሕፍት ለ14 ቀናት**)።
• **ዝግ ማከማቻ (Closed Stack):** ብርቅዬና ዋቢ መጻሕፍት የሚገኙበት ሲሆን በ [መጽሐፍ ፈልግ](/search) ገጽ በዲጂታል መጠየቅ ወይም ሰራተኛ ማስፈቀድ ያስፈልጋል።`
    }
    return `📚 **Book Borrowing & Shelf Types:**

• **Open Shelf (ክፍት መደርደሪያ):** Directly accessible from shelves. You can read them inside or borrow up to **3 books for 14 days** using your Student ID at the circulation desk.
• **Closed Stack (ዝግ ማከማቻ):** Restricted reference and rare collections. Requires a digital request on the [Search Catalogue](/search) page or staff authorization.`
  }

  // 5. OPERATING HOURS
  if (q.includes('hour') || q.includes('time') || q.includes('open') || q.includes('close') || q.includes('ሰዓት') || q.includes('ክፍት') || q.includes('sa\'aatii')) {
    if (lang === 'am' || /[\u1200-\u137F]/.test(query)) {
      return `⏰ **የላይብረሪ የስራ ሰዓት:**

• **ከሰኞ - አርብ:** ከጠዋቱ 2:00 - ማታ 4:00 (8:00 AM - 10:00 PM)
• **ቅዳሜ:** ከጠዋቱ 2:30 - ማታ 12:00 (8:30 AM - 6:00 PM)
• **እሁድ:** ከጠዋቱ 3:00 - ከሰዓት 11:00 (9:00 AM - 5:00 PM)
• **የፈተና ወቅት:** 24/7 ወይም እስከ እኩለ ሌሊት ክፍት ይሆናል።`
    }
    return `⏰ **MAU Library Operating Hours:**

• **Monday – Friday:** 8:00 AM – 10:00 PM (Day & Evening Study)
• **Saturday:** 8:30 AM – 6:00 PM
• **Sunday:** 9:00 AM – 5:00 PM
• **Final Exam Periods:** Extended up to 24/7 as announced on the banner.`
  }

  // 6. STUDENT CLEARANCE
  if (q.includes('clearance') || q.includes('ክሊራንስ') || q.includes('eeyyama eebbisaa')) {
    if (lang === 'am' || /[\u1200-\u137F]/.test(query)) {
      return `🎓 **የተማሪዎች ዲጂታል ላይብረሪ ክሊራንስ:**

1. የተዋሷቸውን መጻሕፍት በሙሉ ወደ ስርጭት ጠረጴዛው ይመልሱ።
2. ማርፈጃ ቅጣት ካለ በCBE ከፍለው ማረጋገጫውን በ [የተዋስኳቸው መጻሕፍት](/my-borrows) ገጽ ይጫኑ።
3. ላይብረሪያኑ ሲያረጋግጥ በ [የተማሪዎች ፖርታል](/portal) ላይ ክሊራንሱ በቀጥታ ይጸድቃል።`
    }
    return `🎓 **Digital Student Clearance Steps:**

1. Physically return all borrowed books to the circulation desk.
2. Settle any overdue fines via CBE and upload payment proof at [My Borrows](/my-borrows).
3. Once approved by the librarian, your library clearance status will show Approved on the [Student Portal](/portal).`
  }

  // 7. DEFAULT CONVERSATIONAL RESPONSE
  if (lang === 'am' || /[\u1200-\u137F]/.test(query)) {
    return `ስለ መቅደላ አምባ ዩኒቨርሲቲ ላይብረሪ ማንኛውንም ጥያቄ ልመልስልዎ ዝግጁ ነኝ። 

ለምሳሌ፦
• የቅጣት ክፍያ በCBE እንዴት እንደሚከፈል
• የመጽሐፍት ብድርና መልስ ህጎች
• የላይብረሪ የስራ ሰዓት
• የተማሪዎች ክሊራንስ ሂደት

ምን ማወቅ ይፈልጋሉ?`
  }

  return `I am here to help you navigate and use Mekdela Amba University Library.

You can ask me about:
• **Borrowing rules & loan periods** ([Search Books](/search))
• **CBE bank overdue penalty payments** ([My Borrows](/my-borrows))
• **Digital student clearance process** ([Student Portal](/portal))
• **Library working hours & shift schedules**
• **Research papers & thesis repository** ([Research](/research))

What would you like to know?`
}
