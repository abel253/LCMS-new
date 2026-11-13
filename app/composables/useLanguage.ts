import { ref, computed } from 'vue';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export const ETHIOPIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Global' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', region: 'ኢትዮጵያ' },
  { code: 'om', name: 'Afaan Oromoo', nativeName: 'Afaan Oromoo', flag: '🇪🇹', region: 'Oromia' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇹', region: 'Tigray' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', flag: '🇸🇴', region: 'Somali' },
];

// Comprehensive Universal Translation Dictionary covering ALL Public & Role Pages
export const PHRASE_MAP: Record<string, Record<string, string>> = {
  // ── Navigation & Header ──
  'Home': { am: 'ዋና ገጽ', om: 'Fuula Duraa', ti: 'መበገሲ ገጽ', so: 'Bogga Hore' },
  'About': { am: 'ስለ እኛ', om: 'Waa\'ee Keenya', ti: 'ብዛዕባና', so: 'Nagu Saabsan' },
  'Search Books': { am: 'መጽሐፍ ፈልግ', om: 'Kitaaba Barbaadi', ti: 'መጽሓፍ ድለዩ', so: 'Raadi Buugaag' },
  'My Borrows': { am: 'የተዋስኳቸው መጻሕፍት', om: 'Liqii Koo', ti: 'ዝተለቃሕክዎም', so: 'Amaahdayda' },
  'Research': { am: 'ምርምርና ጥናት', om: 'Qorannoo', ti: 'ምርምር', so: 'Cilmi Baaris' },
  'Student Portal': { am: 'የተማሪዎች ፖርታል', om: 'Balbala Barattootaa', ti: 'ናይ ተምሃሮ መርበብ', so: 'Albaabka Ardayda' },
  'Contact & Help': { am: 'አግኙንና እርዳታ', om: 'Nu Qunnamaa', ti: 'ርኸቡና', so: 'Nala Soo Xiriir' },
  'Contact': { am: 'አግኙን', om: 'Nu Qunnamaa', ti: 'ርኸቡና', so: 'Nala Soo Xiriir' },
  'Admin': { am: 'አስተዳዳሪ', om: 'Bulchaa', ti: 'መተሓዳደሪ', so: 'Maamulaha' },
  'Librarian': { am: 'ላይብረሪያን', om: 'Hojjetaa Mana Kitaabaa', ti: 'ሓላፊ ቤተ-መጻሕፍቲ', so: 'Maktabadle' },
  'Student': { am: 'ተማሪ', om: 'Barataa', ti: 'ተምሃራይ', so: 'Arday' },
  'Sign In': { am: 'ግባ', om: 'Seeni', ti: 'እቶ', so: 'Gal' },
  'Sign Out': { am: 'ውጣ', om: 'Ba\'i', ti: 'ውጻእ', so: 'Ka Bax' },
  'Log Out': { am: 'ውጣ', om: 'Ba\'i', ti: 'ውጻእ', so: 'Ka Bax' },
  'Search books, author, ISBN...': { am: 'መጻሕፍትን፣ ደራሲን፣ ISBN ፈልግ...', om: 'Kitaaba, barreessaa, ISBN barbaadi...', ti: 'መጻሕፍቲ፣ ደራሲ፣ ISBN ድለዩ...', so: 'Raadi buugaag, qoraa, ISBN...' },
  'searchPlaceholder': { am: 'መጻሕፍትን፣ ደራሲን፣ ISBN ፈልግ...', om: 'Kitaaba, barreessaa, ISBN barbaadi...', ti: 'መጻሕፍቲ፣ ደራሲ፣ ISBN ድለዩ...', so: 'Raadi buugaag, qoraa, ISBN...' },
  'Open': { am: 'ክፍት', om: 'Banaa', ti: 'ክፉት', so: 'Furan' },
  'Closed': { am: 'ዝግ', om: 'Cufaa', ti: 'ዕጹው', so: 'Xiran' },
  'Notice': { am: 'ማስታወቂያ', om: 'Beeksisa', ti: 'ምልክታ', so: 'Ogeysiis' },
  'View Site': { am: 'ጣቢያውን እይ', om: 'Weebsaayitii Ilaali', ti: 'መርበብ ርአ', so: 'Eeg Saytka' },
  'Apply Now': { am: 'አሁን ያመልክቱ', om: 'Amma Galmaa\'aa', ti: 'ሕጂ ኣመልክቱ', so: 'Hadda Codso' },
  'Explore Catalog': { am: 'ካታሎጉን ያስሱ', om: 'Kaatalaagii Qoradhaa', ti: 'ካታሎግ ዳህስሱ', so: 'Baar Buugaagta' },

  // ── University Branding & Motto ──
  'Mekdela Amba University': { am: 'መቅደላ አምባ ዩኒቨርሲቲ', om: 'Yuunivarsiitii Maqdalaa Ambaa', ti: 'መቕደላ ኣምባ ዩኒቨርሲቲ', so: 'Jaamacadda Mekdela Amba' },
  'Knowledge • Innovation • Service for Society': { am: 'እውቀት • ፈጠራ • አገልግሎት ለማህበረሰብ', om: 'Beekumsa • Kalaqa • Tajaajila Hawaasaaf', ti: 'ፍልጠት • ምህዞ • ኣገልግሎት ንሕብረተሰብ', so: 'Aqoonta • Hal-abuurka • Adeegga Bulshada' },
  'Welcome to Mekdela Amba University': { am: 'ወደ መቅደላ አምባ ዩኒቨርሲቲ እንኳን ደህና መጡ', om: 'Baga Gara Yuunivarsiitii Maqdalaa Ambaatti Nagaan Dhuftan', ti: 'እንቋዕ ናብ መቕደላ ኣምባ ዩኒቨርሲቲ ብደሓን መጻእኹም', so: 'Ku Soo Dhowow Jaamacadda Mekdela Amba' },
  'Excellence in Education, Research and Innovation': { am: 'በትምህርት፣ ምርምርና ፈጠራ የላቀ ብቃት', om: 'Barnoota, Qorannoo fi Kalaqa Keessatti Gahumsa', ti: 'ኣብ ትምህርቲ፣ ምርምርን ምህዞን ብሉጽነት', so: 'Heer Sare ee Waxbarashada, Cilmi-baarista iyo Hal-abuurka' },
  'Brighter Minds Stronger Ethiopia': { am: 'ብሩህ አእምሮ ለጠንካራ ኢትዮጵያ', om: 'Sammuu Qaroome Itoophiyaa Cimoof', ti: 'ብሩህ ኣእምሮ ንሓያል ኢትዮጵያ', so: 'Maskax Fariid ah Itoobiya Xooggan' },
  'Library Circulation & Information Management System': { am: 'የላይብረሪ ስርጭት እና የመረጃ አስተዳደር ሲስተም', om: 'Sirna Tajaajila Liqii fi Bulchiinsa Odeeffannoo Mana Kitaabaa', ti: 'ስርዓት ምሕደራ ሓበሬታን ልቓሕን ቤተ-መጻሕፍቲ', so: 'Nidaamka Wareegga Maktabadda iyo Maamulka Xogta' },
  'Mekdela Amba University Library': { am: 'የመቅደላ አምባ ዩኒቨርሲቲ ቤተ-መጻሕፍት', om: 'Mana Kitaabaa Yuunivarsiitii Maqdalaa Ambaa', ti: 'ቤተ-መጻሕፍቲ መቕደላ ኣምባ ዩኒቨርሲቲ', so: 'Maktabadda Jaamacadda Mekdela Amba' },
  'Library Service Hours & Operating Status': { am: 'የላይብረሪ የስራ ሰዓትና ወቅታዊ ሁኔታ', om: 'Sa\'aatii Tajaajila Mana Kitaabaa fi Haala Hojii', ti: 'ሰዓታት ኣገልግሎት ቤተ-መጻሕፍትን ኩነታትን', so: 'Saacadaha Shaqada iyo Xaaladda Maktabadda' },
  'Update Status / Broadcast Notice': { am: 'ሁኔታውን አዘምን / ማስታወቂያ አስተላልፍ', om: 'Haala Hojii Haaromsi / Beeksisa Dabarisi', ti: 'ኩነታት ኣዘምን / ምልክታ ኣመሓላልፍ', so: 'Cusbooneysii Xaaladda / Gudbi Ogeysiis' },

  // ── Search & Catalogue Page ──
  'Catalogue Holdings': { am: 'የመጻሕፍት ማውጫና ይዞታ', om: 'Waa\'ee Qabeenya Kitaabaa', ti: 'መዝገብ መጻሕፍቲ', so: 'Liiska Buugaagta Maktabadda' },
  'Displaying': { am: 'እየታየ ያለው', om: 'Kan Agarsiifamu', ti: 'ዝርከብ ዘሎ', so: 'Muujinaya' },
  'volumes': { am: 'ቅጾች', om: 'jildiiwwan', ti: 'ጥራዛት', so: 'mugyo' },
  'Access Level:': { am: 'የመዳረሻ ደረጃ:', om: 'Sadarkaa Eeyyamaa:', ti: 'ደረጃ ምድላው:', so: 'Heerka Gelitaanka:' },
  'All': { am: 'ሁሉም', om: 'Hunda', ti: 'ኩሉ', so: 'Dhammaan' },
  'Open Shelf': { am: 'ክፍት መደርደሪያ', om: 'Shelloo Banaa', ti: 'ክፉት መደብር', so: 'Khaanad Furan' },
  'Closed Stack': { am: 'ዝግ ማከማቻ', om: 'Kuusaa Cufaa', ti: 'ዕጹው መኽዘን', so: 'Bakhaar Xiran' },
  'Available Only': { am: 'ያሉትን ብቻ', om: 'Kan Qophaa\'e Qofa', ti: 'ዘለዉ ጥራይ', so: 'Kuwa Diyaar Ah Qura' },
  'Sort: Title (A-Z)': { am: 'አደራድር: ርዕስ (A-Z)', om: 'Qindeessi: Mata Duree (A-Z)', ti: 'ኣሰላልፍ: ኣርእስቲ (A-Z)', so: 'Kala Horreeji: Cinwaanka (A-Z)' },
  'Reset': { am: 'ዳግም ጀምር', om: 'Haaromsi', ti: 'ዳግማይ ጀምር', so: 'Dib u Bilow' },
  'Open = Walk to Shelf': { am: 'ክፍት = በቀጥታ ከመደርደሪያው ውሰድ', om: 'Banaa = Shelloo irraa Fudhadhu', ti: 'ክፉት = ብቐጥታ ካብ መደብር ውሰድ', so: 'Furan = Si Toos Ah U Soo Qaado' },
  'Closed = Request from Staff': { am: 'ዝግ = ከሰራተኛ ጠይቅ', om: 'Cufaa = Hojjetaa Gaafadhu', ti: 'ዕጹው = ካብ ሰራሕተኛ ሕተት', so: 'Xiran = Weydii Shaqaalaha' },
  'View Details': { am: 'ዝርዝሩን እይ', om: 'Bal\'ina Ilaali', ti: 'ዝርዝር ርአ', so: 'Eeg Faahfaahinta' },
  'Borrow / Reserve (Open Shelf)': { am: 'ተዋስ / ያዝ (ክፍት መደርደሪያ)', om: 'Liqeeffadhu / Qabadhu (Shelloo Banaa)', ti: 'ተለቓሕ / ሓዝ (ክፉት መደብር)', so: 'Amaaho / Qabso (Khaanad Furan)' },
  'Borrow / Reserve (Closed Stack)': { am: 'ተዋስ / ጠይቅ (ዝግ ማከማቻ)', om: 'Liqeeffadhu / Gaafadhu (Kuusaa Cufaa)', ti: 'ተለቓሕ / ሕተት (ዕጹው መኽዘን)', so: 'Amaaho / Weydii (Bakhaar Xiran)' },
  'Shelf:': { am: 'መደርደሪያ:', om: 'Shelloo:', ti: 'መደብር:', so: 'Khaanad:' },
  'Author:': { am: 'ደራሲ:', om: 'Barreessaa:', ti: 'ደራሲ:', so: 'Qoraa:' },
  'Call:': { am: 'የጥሪ ቁጥር:', om: 'Lakkoofsa Waamichaa:', ti: 'መለለዪ ቊጽሪ:', so: 'Lambarka Wicitaanka:' },
  'available': { am: 'ይገኛሉ', om: 'argama', ti: 'ይርከቡ', so: 'diyaar ah' },
  'Ground Floor Open': { am: 'ምድር ቤት ክፍት', om: 'Dachee Irra Banaa', ti: 'ምድሪ ቤት ክፉት', so: 'Dabaqa Hoose Furan' },
  'Ground Circulation': { am: 'የምድር ቤት ስርጭት', om: 'Tajaajila Liqii Dachee', ti: 'ምድሪ ቤት ስርጭት', so: 'Wareegga Dabaqa Hoose' },
  'Business & Economics': { am: 'ቢዝነስና ኢኮኖሚክስ', om: 'Daldala fi Diinagdee', ti: 'ቢዝነስን ኢኮኖሚክስን', so: 'Ganacsiga iyo Dhaqaalaha' },
  'Social Sciences & Humanities': { am: 'ማህበራዊ ሳይንስና ሂውማኒቲስ', om: 'Saayinsii Hawaasaa fi Namoomaa', ti: 'ማሕበራዊ ሳይንስን ሂዩማኒቲስን', so: 'Sayniska Bulshada iyo Aadanimada' },
  'Publication Year': { am: 'የታተመበት ዓመት', om: 'Bara Maxxansaa', ti: 'ዝተሓትመሉ ዓመት', so: 'Sanadka Daabacaadda' },
  'Edition': { am: 'ዕትም', om: 'Maxxansa', ti: 'ሕታም', so: 'Daabacaad' },
  'Publisher': { am: 'አሳታሚ', om: 'Maxxansaa', ti: 'ኣሳታሚ', so: 'Madbacadda' },
  'Subject Category': { am: 'የትምህርት ዘርፍ', om: 'Gosa Barnootaa', ti: 'ዓይነት ትምህርቲ', so: 'Qaybta Mawduuca' },
  'Total Copies': { am: 'ጠቅላላ ቅጾች', om: 'Waliigala Koppiiwwanii', ti: 'ሓፈሻዊ ቅዳሓት', so: 'Wadarta Nuqullada' },
  'Available Copies': { am: 'ያሉ ቅጾች', om: 'Koppiiwwan Argaman', ti: 'ዘለዉ ቅዳሓት', so: 'Nuqullada Diyaar Ah' },
  'Barcode': { am: 'ባርኮድ', om: 'Baarkoodii', ti: 'ባርኮድ', so: 'Koodhka Barcode' },

  // ── Librarian Desk & Circulation ──
  'Librarian Desk • Circulation & Stacks': { am: 'የላይብረሪያን ጠረጴዛ • ስርጭትና ማከማቻ', om: 'Teessoo Hojjetaa • Liqii fi Kuusaa', ti: 'መደብር ሓላፊ • ልቓሕን መኽዘንን', so: 'Miiska Maktabadlaha • Wareegga iyo Kaydka' },
  'LIBRARIAN CIRCULATION DESK': { am: 'የላይብረሪያን የስርጭት ጠረጴዛ', om: 'TEESSOO LIQII HOJJETAA', ti: 'ናይ ልቓሕ መደብር ሓላፊ', so: 'MIISKA WAREEGGA MAKTABADDA' },
  'TODAY\'S SHIFT DUTY': { am: 'የዛሬው የስራ ፈረቃ ግዴታ', om: 'GAHEE HOJII HAR\'AA', ti: 'ናይ ሎሚ ናይ ፈረቓ ግዴታ', so: 'WAAJIBAADKA SHAQADA MAANTA' },
  'Universal Cross-Shift Loan Access Active': { am: 'የጋራ የፈረቃ ብድር አገልግሎት ክፍት ነው', om: 'Tajaajilli Liqii Cimee Hojjechaa Jira', ti: 'ናይ ሓባር ልቓሕ ኣገልግሎት ክፉት እዩ', so: 'Adeegga Amaahda Guud Waa Shaqeynayaa' },
  'On Duty: Circulation Desk Officer': { am: 'በስራ ላይ: የብድር አገልግሎት ኦፊሰር', om: 'Hojii Irra: Ofisara Teessoo Liqii', ti: 'ኣብ ስራሕ: ኦፊሰር ልቓሕ', so: 'Shaqada Ku Jira: Sarkaalka Miiska Amaahda' },
  'Universal student clearance and book return access open for all library staff': { am: 'የተማሪዎች ክሊራንስ እና የመጽሐፍ መልስ አገልግሎት ለሁሉም ሰራተኞች ክፍት ነው', om: 'Eeyyami barattootaa fi deebisuun kitaabaa hojjettoota hundaaf banaadha', ti: 'ናይ ተምሃሮ ክሊራንስን ምምላስ መጻሕፍትን ንኹሉ ሰራሕተኛ ክፉት እዩ', so: 'Bixinta ardayda iyo soo celinta buugaagtu waxay u furan tahay dhammaan shaqaalaha' },
  'Shift Roster': { am: 'የስራ ፈረቃ ዝርዝር', om: 'Tarree Gahee Hojii', ti: 'ናይ ስራሕ ፈረቓ ዝርዝር', so: 'Liiska Shaqada' },
  'Universal Loan Lookup': { am: 'አጠቃላይ የብድር ፍለጋ', om: 'Barbaacha Liqii Waliigalaa', ti: 'ሓፈሻዊ ናይ ልቓሕ ድሌት', so: 'Baaritaanka Amaahda Guud' },
  'Book Returns': { am: 'የመጽሐፍ መልሶች', om: 'Kitaaba Deebisuu', ti: 'ምምላስ መጻሕፍቲ', so: 'Soo Celinta Buugaagta' },
  'Student Inquiries': { am: 'የተማሪዎች ጥያቄዎች', om: 'Gaaffiiwwan Barattootaa', ti: 'ናይ ተምሃሮ ሕቶታት', so: 'Weydiimaha Ardayda' },
  'Closed Shelf Approvals': { am: 'የዝግ መደርደሪያ ፈቃዶች', om: 'Eeyyama Shelloo Cufaa', ti: 'ፍቓድ ዕጹው መደብር', so: 'Oggolaanshaha Khaanadda Xiran' },
  'Shift Schedule & Duty': { am: 'የስራ ፈረቃ ፕሮግራም', om: 'Sagantaa Hojii fi Gahee', ti: 'ናይ ፈረቓ ሰሌዳን ግዴታን', so: 'Jadwalka Shaqada' },
  'Loans & Checkouts': { am: 'ብድሮችና ስርጭት', om: 'Liqiiwwan fi Baasii', ti: 'ልቓሕን ምዕዳልን', so: 'Amaahda iyo Bixinta' },
  'Confirm & Return Book Back (መጽሐፉን ተቀብለህ አስገባ)': { am: 'Confirm & Return Book Back (መጽሐፉን ተቀብለህ አስገባ)', om: 'Mirkaneessi & Kitaaba Deebisi (Hojii Xumuri)', ti: 'ኣረጋግጽ & መጽሓፍ ተቐበል (ምምላስ ወደእ)', so: 'Xaqiiji & Buugga Dib u Qabo' },
  'Return Book': { am: 'መጽሐፉን አስገባ', om: 'Kitaaba Deebisi', ti: 'መጽሓፍ ምለስ', so: 'Soo Celi Buugga' },
  'TOTAL': { am: 'ጠቅላላ', om: 'Waliigala', ti: 'ሓፈሻዊ', so: 'Wadarta' },
  'UNREAD': { am: 'ያልተነበበ', om: 'Kan Hin Dubbifamin', ti: 'ዘይተነበበ', so: 'Aan La Akhriyin' },
  'RESOLVED': { am: 'ምላሽ የተሰጠው', om: 'Kan Furmaata Argate', ti: 'ዝተፈትሐ', so: 'La Xalliyay' },
  'ESCALATED': { am: 'ወደ አድሚን የተላለፈ', om: 'Gara Bulchaatti Kan Darbe', ti: 'ናብ ኣድሚን ዝተመሓላለፈ', so: 'Loo Gudbiyay Maamulka' },

  // ── Admin Dashboard & Tabs ──
  'MAU-LCS Admin Dashboard': { am: 'የMAU-LCS አድሚን ዳሽቦርድ', om: 'Daashboordii Bulchiinsa MAU-LCS', ti: 'ዳሽቦርድ ኣድሚን MAU-LCS', so: 'Daaqadda Maamulka MAU-LCS' },
  'Manage the library, track activities and provide better services.': { am: 'ላይብረሪውን ያስተዳድሩ፣ እንቅስቃሴዎችን ይከታተሉ እንዲሁም የተሻለ አገልግሎት ይስጡ።', om: 'Mana kitaabaa bulchi, sochiilee hordofi, tajaajila gaarii kenni.', ti: 'ቤተ-መጻሕፍቲ ኣመሓድር፣ ንጥፈታት ተኸታተል፣ ዝሓሸ ኣገልግሎት ሃብ።', so: 'Maamul maktabadda, la soco dhaqdhaqaaqyada, bixina adeeg fiican.' },
  'Dashboard': { am: 'ዳሽቦርድ', om: 'Daashboordii', ti: 'ዳሽቦርድ', so: 'Daaqadda Maamulka' },
  'Books Management': { am: 'የመጻሕፍት አስተዳደር', om: 'Bulchiinsa Kitaabotaa', ti: 'ምምሕዳር መጻሕፍቲ', so: 'Maamulka Buugaagta' },
  'Users Management': { am: 'የተጠቃሚዎች አስተዳደር', om: 'Bulchiinsa Fayyadamtootaa', ti: 'ምምሕዳር ተጠቀምቲ', so: 'Maamulka Isticmaalayaasha' },
  'Total Loans': { am: 'ጠቅላላ ብድሮች', om: 'Waliigala Liqiiwwanii', ti: 'ሓፈሻዊ ልቓሕ', so: 'Wadarta Amaahda' },
  'Active Borrowers': { am: 'ወቅታዊ ተዋሾች', om: 'Liqeefattoota Yeroo Ammaa', ti: 'ተለቃሕቲ', so: 'Dadka Amaahda Haysta' },
  'Overdue Items': { am: 'ያረፈዱ መጻሕፍት', om: 'Kan Yeroon Darbe', ti: 'ዝደንጐዩ መጻሕፍቲ', so: 'Buugaagta Dib u Dhacay' },
  'Returned Today': { am: 'ዛሬ የተመለሱ', om: 'Har\'a Kan Deebi\'e', ti: 'ሎሚ ዝተመለሱ', so: 'Maanta La Soo Celiyay' },
  'Helpdesk & Escalations': { am: 'እርዳታና ወደ አድሚን ማስተላለፍ', om: 'Deeggarsa fi Gara Bulchaatti Dabarisuu', ti: 'ሓገዝን ናብ ኣድሚን ምሕላፍን', so: 'Gargaarka iyo Gudbinta Maamulka' },
  'System Settings': { am: 'የሲስተም ቅንብሮች', om: 'Qindaa\'ina Sirnaa', ti: 'ናይ ስርዓት ምዕራይ', so: 'Hagaajinta Nidaamka' },
  'Reports & Analytics': { am: 'ሪፖርትና ትንተና', om: 'Gabaasa fi Xiinxala', ti: 'ጸብጻብን ትንተናን', so: 'Warbixinnada iyo Falanqaynta' },
  'Research & Proposals': { am: 'ምርምርና ጥናቶች', om: 'Qorannoo fi Yaada Piroppoozaala', ti: 'ምርምርን ፕሮፖዛልን', so: 'Cilmi-baarista iyo Soo-jeedimaha' },
  'Staff Video Meetings': { am: 'የሰራተኞች የቪዲዮ ስብሰባ', om: 'Walga\'ii Viidiyoo Hojjettootaa', ti: 'ናይ ሰራሕተኛታት ቪድዮ ኣኼባ', so: 'Kulamada Muuqaalka ee Shaqaalaha' },
  'Add New Book': { am: 'አዲስ መጽሐፍ ጨምር', om: 'Kitaaba Haaraa Dabali', ti: 'ሓዱሽ መጽሓፍ ወስኽ', so: 'Ku Dar Buug Cusub' },
  'Add New User': { am: 'አዲስ ተጠቃሚ ጨምር', om: 'Fayyadamaa Haaraa Dabali', ti: 'ሓዱሽ ተጠቃሚ ወስኽ', so: 'Ku Dar Isticmaale Cusub' },

  // ── Student Portal & Profile & My Borrows ──
  'Student Dashboard': { am: 'የተማሪ ዳሽቦርድ', om: 'Daashboordii Barataa', ti: 'ዳሽቦርድ ተምሃራይ', so: 'Daaqadda Ardayda' },
  'Patron Profile': { am: 'የተጠቃሚ ፕሮፋይል', om: 'Piroofaayilii Fayyadamaa', ti: 'ፕሮፋይል ተጠቃሚ', so: 'Xogta Isticmaalaha' },
  'Active Library Membership • Eligible to Borrow': { am: 'ንቁ የላይብረሪ አባልነት • ለመዋስ ብቁ', om: 'Miseensa Mana Kitaabaa Hojjechaa Jiru • Liqeeffachuuf Gahumsa Qaba', ti: 'ንቑሕ ኣባልነት ቤተ-መጻሕፍቲ • ንምልቃሕ ብቑዕ', so: 'Xubinnimada Maktabadda ee Shaqaynaysa • U Qalanta Amaahda' },
  'My Active Borrows': { am: 'ወቅታዊ የብድር መጻሕፍቶቼ', om: 'Liqiiwwan Koo Ammaa', ti: 'ናተይ ናይ ልቓሕ መጻሕፍቲ', so: 'Buugaagta Iigu Jira Amaahda' },
  'Remove Photo': { am: 'ፎቶ አስወግድ', om: 'Suuraa Haqi', ti: 'ስእሊ ኣልግስ', so: 'Tirtir Sawirka' },
  'Upload Profile Picture': { am: 'የፕሮፋይል ፎቶ ጫን', om: 'Suuraa Piroofaayilii Olfe\'i', ti: 'ስእሊ ፕሮፋይል ጸዓን', so: 'Soo Geli Sawirka Profile-ka' },
  'General Academic Department': { am: 'አጠቃላይ የትምህርት ክፍል', om: 'Kutaa Barnootaa Waliigalaa', ti: 'ሓፈሻዊ ክፍሊ ትምህርቲ', so: 'Waaxda Waxbarashada Guud' },
  'CBE Bank Account for Fine Settlement': { am: 'የኢትዮጵያ ንግድ ባንክ የቅጣት ክፍያ ሂሳብ', om: 'Herrega Baankii Daldala Itoophiyaa Adabbii Kaffaluuf', ti: 'ናይ ኢትዮጵያ ንግዲ ባንክ ሕሳብ ቕጽዓት ንምኽፋል', so: 'Koontada Bangiga Ganacsiga Itoobiya ee Lacag-bixinta Garka' },
  'Commercial Bank of Ethiopia (CBE)': { am: 'የኢትዮጵያ ንግድ ባንክ (CBE)', om: 'Baankii Daldala Itoophiyaa (CBE)', ti: 'ንግዲ ባንኪ ኢትዮጵያ (CBE)', so: 'Bangiga Ganacsiga Itoobiya (CBE)' },
  'Mekdela Amba University Library Revenue': { am: 'የመቅደላ አምባ ዩኒቨርሲቲ ላይብረሪ ገቢ', om: 'Galii Mana Kitaabaa Yuunivarsiitii Maqdalaa Ambaa', ti: 'ኣታዊ ቤተ-መጻሕፍቲ መቕደላ ኣምባ ዩኒቨርሲቲ', so: 'Dakhliga Maktabadda Jaamacadda Mekdela Amba' },
  'CBE TRANSACTION REFERENCE NUMBER *': { am: 'የCBE የግብይት ማረጋገጫ ቁጥር (Ref Number) *', om: 'LAKKOOFSA DABARSAA CBE (Ref Number) *', ti: 'ናይ CBE መረጋገጺ ቊጽሪ (Ref Number) *', so: 'LAMBARKA TIXRAACA CBE (Ref Number) *' },
  'UPLOAD PAYMENT SLIP SCREENSHOT': { am: 'የክፍያ ደረሰኝ ስክሪንሽት ጫን', om: 'Waraqaa Kaffaltii Olfe\'aa (Upload)', ti: 'ናይ ክፍሊት ደረሰኝ ስክሪንሾት ጸዓኑ', so: 'Soo Geli Sawirka Rasiidka Lacag-bixinta' },
  'Submit Penalty Payment Proof': { am: 'የቅጣት ክፍያ ማረጋገጫውን አስገባ', om: 'Ragaa Kaffaltii Adabbii Galchi', ti: 'ናይ ቕጽዓት ክፍሊት መረጋገጺ ኣእቱ', so: 'Gudbi Caddeynta Lacag-bixinta Garka' },
  'Copy Account Number': { am: 'የሂሳብ ቁጥሩን ኮፒ አድርግ', om: 'Lakkoofsa Herregaa Waraabi', ti: 'ቊጽሪ ሕሳብ ቅዳሕ', so: 'Koobi Garay Lambarka Koontada' },
  'Clearance Status': { am: 'የክሊራንስ ሁኔታ', om: 'Haala Eeyyama Eebbisaa', ti: 'ኩነታት ክሊራንስ', so: 'Xaaladda Fasaxa' },
  'Digital Student Clearance': { am: 'የተማሪዎች ዲጂታል ክሊራንስ', om: 'Eeyyama Dijitaalaa Barattootaa', ti: 'ዲጂታል ክሊራንስ ተምሃሮ', so: 'Fasaxa Dijitaalka ah ee Ardayda' },
  'Clearance Approved': { am: 'ክሊራንስ ጸድቋል', om: 'Eeyyami Mirkanaa\'eera', ti: 'ክሊራንስ ጸዲቑ', so: 'Fasaxii Waa La Oggolaaday' },
  'Clearance Pending': { am: 'ክሊራንስ በመጠባበቅ ላይ', om: 'Eeyyami Eeggachaa Jira', ti: 'ክሊራንስ ኣብ ምጽባይ', so: 'Fasaxu Wuxuu Ku Jiraa Sugitaan' },

  // ── Research Portal ──
  'Academic Papers & Publications': { am: 'የአካዳሚክ ጥናታዊ ጽሑፎችና ህትመቶች', om: 'Waraqaalee Qorannoo fi Maxxansawwan', ti: 'ናይ ትምህርቲ ምርምር ጽሑፋት', so: 'Waraaqaha Cilmi-baarista iyo Daabacadaha' },
  'Submit Research Proposal': { am: 'የምርምር ፕሮፖዛል አስገባ', om: 'Yaada Piroppoozaala Galchi', ti: 'ናይ ምርምር ፕሮፖዛል ኣእቱ', so: 'Gudbi Soo-jeedinta Cilmi-baarista' },
  'Thesis Archive': { am: 'የቴሲስ ማህደር', om: 'Kuusaa Tiisisiitii', ti: 'መዝገብ ተሲስ', so: 'Kaydka Cilmi-baarista' },
  'College': { am: 'ኮሌጅ', om: 'Kolejjii', ti: 'ኮሌጅ', so: 'Kuliyadda' },
  'Department': { am: 'የትምህርት ክፍል', om: 'Kutaa Barnootaa', ti: 'ክፍሊ ትምህርቲ', so: 'Waaxda' },
  'Document Type': { am: 'የሰነድ አይነት', om: 'Gosa Galmee', ti: 'ዓይነት ሰነድ', so: 'Nooca Dukumintiga' },
  'Proposal': { am: 'ፕሮፖዛል', om: 'Piroppoozaala', ti: 'ፕሮፖዛል', so: 'Soo-jeedin' },
  'Thesis': { am: 'ቴሲስ', om: 'Tiisisii', ti: 'ተሲስ', so: 'Cilmi-baaris Qalin-jabin' },
  'Download PDF': { am: 'PDF አውርድ', om: 'PDF Buufadhu', ti: 'PDF ኣውርድ', so: 'Soo Dejiso PDF' },

  // ── Common Actions & Buttons ──
  'Save': { am: 'አስቀምጥ', om: 'Oolchi', ti: 'ኣቐምጥ', so: 'Kaydi' },
  'Cancel': { am: 'ሰርዝ', om: 'Dhiisi', ti: 'ሰርዝ', so: 'Jooji' },
  'Confirm': { am: 'አረጋግጥ', om: 'Mirkaneessi', ti: 'ኣረጋግጽ', so: 'Xaqiiji' },
  'Delete': { am: 'አጥፋ', om: 'Haqi', ti: 'ኣጥፍእ', so: 'Tirtir' },
  'Edit': { am: 'አስተካክል', om: 'Gulaali', ti: 'ኣዐሪ', so: 'Wax Ka Beddel' },
  'Update': { am: 'አዘምን', om: 'Haaromsi', ti: 'ኣዘምን', so: 'Cusbooneysii' },
  'Add': { am: 'ጨምር', om: 'Dabali', ti: 'ወስኽ', so: 'Ku Dar' },
  'Close': { am: 'ዝጋ', om: 'Cufi', ti: 'ዕጾ', so: 'Xir' },
  'Submit': { am: 'አስገባ', om: 'Galchi', ti: 'ኣእቱ', so: 'Gudbi' },
  'Search': { am: 'ፈልግ', om: 'Barbaadi', ti: 'ድለ', so: 'Raadi' },
  'Filter': { am: 'አጣራ', om: 'Gingilchi', ti: 'ኣጻሪ', so: 'Kala Saar' },
  'Clear': { am: 'አጽዳ', om: 'Qulqulleessi', ti: 'ኣጽሪ', so: 'Nadiifi' },
  'Loading': { am: 'እየጫነ ነው...', om: 'Fe\'aa Jira...', ti: 'ይጽዕን ኣሎ...', so: 'Waa La Soo Wado...' },
  'Back': { am: 'ተመለስ', om: 'Deebi\'i', ti: 'ተመለስ', so: 'Dib u Noqo' },
  'Next': { am: 'ቀጣይ', om: 'Itti Aanu', ti: 'ቀጻሊ', so: 'Ku Xiga' },
  'Previous': { am: 'ቀዳሚ', om: 'Kan Duraa', ti: 'ዝሓለፈ', so: 'Kii Hore' },
  'Actions': { am: 'ተግባራት', om: 'Tarkaanfiiwwan', ti: 'ተግባራት', so: 'Tallaabooyinka' },
  'Status': { am: 'ሁኔታ', om: 'Haala', ti: 'ኩነታት', so: 'Xaaladda' },
  'Role': { am: 'ሚና', om: 'Gahee', ti: 'ተራ', so: 'Doorka' },
  'Date': { am: 'ቀን', om: 'Guyyaa', ti: 'ዕለት', so: 'Taariikhda' },
  'Due Date': { am: 'የመመለሻ ቀን', om: 'Guyyaa Deebii', ti: 'ዕለት ምምላስ', so: 'Taariikhda Soo Celinta' },
  'Borrow Date': { am: 'የተዋሱበት ቀን', om: 'Guyyaa Liqeeffame', ti: 'ዕለት ልቓሕ', so: 'Taariikhda Amaahda' },
  'Return Date': { am: 'የተመለሰበት ቀን', om: 'Guyyaa Deebi\'e', ti: 'ዝተመለሰሉ ዕለት', so: 'Taariikhda La Soo Celiyay' },
  'Success': { am: 'ተሳክቷል', om: 'Milkaa\'eera', ti: 'ተዓዊቱ', so: 'Waa Guulaysatay' },
  'Error': { am: 'ስህተት', om: 'Dogoggora', ti: 'ጌጋ', so: 'Khalad' },
  'Warning': { am: 'ማስጠንቀቂያ', om: 'Akeekkachiisa', ti: 'መጠንቀቕታ', so: 'Digniin' },
  'Active': { am: 'ንቁ', om: 'Hojjechaa Jira', ti: 'ንቑሕ', so: 'Shaqaynaya' },
  'Inactive': { am: 'ቦዘኔ', om: 'Dhaabbateera', ti: 'ዘይንቑሕ', so: 'Aan Shaqaynayn' },
  'Pending': { am: 'በመጠባበቅ ላይ', om: 'Eeggachaa Jira', ti: 'ኣብ ምጽባይ', so: 'Sugaya' },
  'Approved': { am: 'ጸድቋል', om: 'Mirkanaa\'eera', ti: 'ጸዲቑ', so: 'La Oggolaaday' },
  'Rejected': { am: 'ተቀባይነት አላገኘም', om: 'Kufaa Ta\'eera', ti: 'ተነጺጉ', so: 'La Diiday' },
  'Overdue': { am: 'ያረፈደ', om: 'Yeroon Darbe', ti: 'ዝደንጐየ', so: 'Wakhtigu Dhacay' },
  'Returned': { am: 'የተመለሰ', om: 'Kan Deebi\'e', ti: 'ዝተመለሰ', so: 'La Soo Celiyay' },
  'Issued': { am: 'የተሰጠ', om: 'Kan Kenname', ti: 'ዝተዋህበ', so: 'La Bixiyay' },
  'Student / Staff ID or University Email *': { am: 'የተማሪ / ሰራተኛ መታወቂያ ወይም የዩኒቨርሲቲ ኢሜይል *', om: 'Waraqaa Eenyummaa Barataa / Hojjetaa ykn Imeelii Yuunivarsiitii *', ti: 'መለለዪ ተምሃራይ / ሰራሕተኛ ወይ ኢመይል ዩኒቨርሲቲ *', so: 'Aqoonsiga Ardayda / Shaqaalaha ama Iimaylka Jaamacadda *' },
  'Password *': { am: 'የይለፍ ቃል *', om: 'Jecha Darbii *', ti: 'መሕለፊ ቓል *', so: 'Furaha Sirta ah *' },
  'Full Legal Name *': { am: 'ሙሉ ህጋዊ ስም *', om: 'Maqaa Guutuu *', ti: 'ምሉእ ሕጋዊ ስም *', so: 'Magaca Buuxa *' },
  'Create Account': { am: 'አዲስ አካውንት ፍጠር', om: 'Akkaawuntii Haaraa Uumi', ti: 'ሓዱሽ ኣካውንት ፍጠር', so: 'Sameyso Akoon' },
  '← Back to Books Catalog': { am: '← ወደ መጻሕፍት ማውጫ ተመለስ', om: '← Gara Kaatalaagii Kitaabaatti Deebi\'i', ti: '← ናብ መዝገብ መጻሕፍቲ ተመለስ', so: '← Ku Noqo Liiska Buugaagta' },

  // ── Contact Page ──
  'Book Inquiry': { am: 'የመጽሐፍ ጥያቄ', om: 'Gaaffii Kitaabaa', ti: 'ሕቶ መጽሓፍ', so: 'Weydiinta Buugga' },
  'E-Library & Digital': { am: 'ዲጂታል ላይብረሪ', om: 'Mana Kitaabaa Dijitaalaa', ti: 'ዲጂታል ቤተ-መጻሕፍቲ', so: 'Maktabadda Dijitaalka ah' },
  'General Question': { am: 'አጠቃላይ ጥያቄ', om: 'Gaaffii Waliigalaa', ti: 'ሓፈሻዊ ሕቶ', so: 'Su\'aal Guud' },
  'Send Message': { am: 'መልዕክት ላክ', om: 'Ergaa Ergi', ti: 'መልእኽቲ ስደድ', so: 'Dir Farriin' },
  'Your Name': { am: 'የእርስዎ ስም', om: 'Maqaa Keessan', ti: 'ስምኩም', so: 'Magacaaga' },
  'Your Email': { am: 'የእርስዎ ኢሜይል', om: 'Imeelii Keessan', ti: 'ኢመይልኩም', so: 'Iimaylkaaga' },
  'Phone Number': { am: 'ስልክ ቁጥር', om: 'Lakkoofsa Bilbilaa', ti: 'ቊጽሪ ተሌፎን', so: 'Lambarka Taleefanka' },
  'Message': { am: 'መልዕክት', om: 'Ergaa', ti: 'መልእኽቲ', so: 'Farriinta' },
  'Working Hours': { am: 'የስራ ሰዓታት', om: 'Sa\'aatii Hojii', ti: 'ሰዓታት ስራሕ', so: 'Saacadaha Shaqada' },
};

const currentLang = ref<string>('en');
let isTranslatingDom = false;
let domObserver: MutationObserver | null = null;

// Helper: Normalize phrases for flexible matching (handles colons, punctuation, casing)
const getTranslation = (text: string, targetLang: string): string | null => {
  if (targetLang === 'en') return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Direct exact match
  if (PHRASE_MAP[trimmed] && PHRASE_MAP[trimmed][targetLang]) {
    return PHRASE_MAP[trimmed][targetLang];
  }

  // 2. Trailing punctuation check (e.g., 'Shelf:', 'Password *', 'Clearance Status:')
  const punctMatch = trimmed.match(/^(.+?)([:*•\-→←\s]+)$/);
  if (punctMatch) {
    const base = punctMatch[1].trim();
    const punct = punctMatch[2];
    if (PHRASE_MAP[base] && PHRASE_MAP[base][targetLang]) {
      return PHRASE_MAP[base][targetLang] + punct;
    }
  }

  // 3. Case-insensitive lookup
  const lower = trimmed.toLowerCase();
  for (const [key, mapping] of Object.entries(PHRASE_MAP)) {
    if (key.toLowerCase() === lower && mapping[targetLang]) {
      return mapping[targetLang];
    }
  }

  return null;
};

// DOM Walker Translation Engine (Runs in <5ms, completely client-side, zero lag)
export const translatePageDom = (targetLang: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (isTranslatingDom) return;
  isTranslatingDom = true;

  try {
    const root = document.getElementById('app-root') || document.body;
    if (!root) return;

    // 1. TRANSLATE TEXT NODES
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'textarea', 'input', 'select'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.closest('.skiptranslate') || parent.closest('#google_translate_element')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const updates: { node: Text; newText: string }[] = [];
    let currentNode = walker.nextNode();

    while (currentNode) {
      const textNode = currentNode as Text;
      const raw = textNode.nodeValue || '';
      const trimmed = raw.trim();

      if (trimmed.length > 0) {
        if (!(textNode as any).__lcms_orig) {
          (textNode as any).__lcms_orig = raw;
        }
        const originalRaw = (textNode as any).__lcms_orig;
        const originalTrimmed = originalRaw.trim();

        if (targetLang === 'en') {
          if (textNode.nodeValue !== originalRaw) {
            updates.push({ node: textNode, newText: originalRaw });
          }
        } else {
          const translated = getTranslation(originalTrimmed, targetLang);
          if (translated && translated !== originalTrimmed) {
            const finalReplacement = originalRaw.replace(originalTrimmed, translated);
            if (textNode.nodeValue !== finalReplacement) {
              updates.push({ node: textNode, newText: finalReplacement });
            }
          }
        }
      }
      currentNode = walker.nextNode();
    }

    for (const item of updates) {
      item.node.nodeValue = item.newText;
    }

    // 2. TRANSLATE INPUT & TEXTAREA PLACEHOLDERS
    const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[placeholder], textarea[placeholder]');
    inputs.forEach((input) => {
      const ph = input.getAttribute('placeholder') || '';
      if (!ph.trim()) return;

      if (!(input as any).__lcms_orig_ph) {
        (input as any).__lcms_orig_ph = ph;
      }
      const origPh = (input as any).__lcms_orig_ph;

      if (targetLang === 'en') {
        input.setAttribute('placeholder', origPh);
      } else {
        const transPh = getTranslation(origPh, targetLang);
        if (transPh) {
          input.setAttribute('placeholder', transPh);
        }
      }
    });
  } catch (e) {
    console.warn('DOM translation pass warning:', e);
  } finally {
    isTranslatingDom = false;
  }
};

export const useLanguage = () => {
  if (import.meta.client) {
    const saved = localStorage.getItem('lcms_language');
    if (saved && ETHIOPIAN_LANGUAGES.some(l => l.code === saved)) {
      currentLang.value = saved;
    }
  }

  const currentLanguageOption = computed(() => {
    return ETHIOPIAN_LANGUAGES.find(l => l.code === currentLang.value) || ETHIOPIAN_LANGUAGES[0];
  });

  // Manual Template Translator: t('Home')
  const t = (key: string): string => {
    const entry = PHRASE_MAP[key];
    if (!entry) return key;
    return entry[currentLang.value] || entry['en'] || key;
  };

  // Change language and run dynamic translations
  const setLanguage = (langCode: string) => {
    if (!ETHIOPIAN_LANGUAGES.some(l => l.code === langCode)) return;
    currentLang.value = langCode;

    if (import.meta.client) {
      localStorage.setItem('lcms_language', langCode);
      
      // Multi-stage translation passes to capture async rendered components
      translatePageDom(langCode);
      setTimeout(() => translatePageDom(langCode), 80);
      setTimeout(() => translatePageDom(langCode), 250);
      setTimeout(() => translatePageDom(langCode), 600);
    }
  };

  // DOM MutationObserver to translate async tabs, modals, and elements automatically
  const startDomWatcher = () => {
    if (!import.meta.client || domObserver) return;

    setTimeout(() => {
      if (currentLang.value !== 'en') {
        translatePageDom(currentLang.value);
      }
    }, 150);

    let debounceTimer: any = null;
    domObserver = new MutationObserver(() => {
      if (currentLang.value === 'en') return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        translatePageDom(currentLang.value);
      }, 120);
    });

    const root = document.getElementById('app-root') || document.body;
    if (root) {
      domObserver.observe(root, {
        childList: true,
        subtree: true,
        characterData: false,
      });
    }
  };

  const initGoogleTranslate = () => {
    if (!import.meta.client) return;
    startDomWatcher();
  };

  return {
    languages: ETHIOPIAN_LANGUAGES,
    currentLang,
    currentLanguageOption,
    t,
    setLanguage,
    initGoogleTranslate,
    translatePageDom,
    startDomWatcher
  };
};
