// src/helpData.ts

export const userManuals = {
  en: {
    title: "BT Express Complete Guide Handbook",
    intro: "Welcome to BT Express, an offline-first enterprise class reporting and transcripts engine designed specifically for educational institutions.",
    setup: "1. CONFIGURATION SYSTEM: Setup school details, upload logos, signatures, and stamps. Set Passing Marks (e.g. 50) and build custom promotion compiler rules.",
    students: "2. STUDENT REGISTRY: Register students, assign unique IDs, toggling sorting options, and add custom attributes dynamically.",
    subjects: "3. SUBJECTS DIRECTORY: Register course materials and define maximum scores for grading calculations.",
    marks: "4. EXCEL MARKS GRID: Input scores with horizontal and vertical arrow-key navigation. Automatically saves in real-time.",
    reports: "5. OUTPUT PRINTING: Divide layouts into Class Performance sheets or individual printable cards. Supports target-specific page-breaks when compiling to PDF."
  },
  am: {
    title: "የቢቲ ኤክስፕረስ ሙሉ መመሪያ መጽሐፍ",
    intro: "እንኳን ወደ ቢቲ ኤክስፕረስ በሰላም መጡ፤ ይህ መተግበሪያ ሙሉ በሙሉ ከመስመር ውጪ (Offline) የሚሰራ እና ለአካዳሚክ ተቋማት የተዘጋጀ ዘመናዊ የሪፖርት ካርድ ማጠናቀሪያ ሥርዓት ነው።",
    setup: "1. ቅንብሮች (Configuration): የትምህርት ቤቱን ስም፣ ዓመተ ምህረት፣ አርማ እና ማህተም እዚህ ያስገቡ። ማለፊያ ነጥቦችን እና መመዘኛዎችን ያስተካክሉ።",
    students: "2. የተማሪዎች መዝገብ (Registry): ተማሪዎችን ይመዝግቡ፣ መለያ ቁጥር (ID) ይስጡ፣ እና እንደ ፍላጎትዎ ተጨማሪ ዓምዶችን ይጨምሩ።",
    subjects: "3. የትምህርት ዓይነቶች (Subjects): ትምህርቶችን እና ከፍተኛ ነጥቦችን እዚህ ያስመዝግቡ።",
    marks: "4. ማርክ ማስገቢያ ሰሌዳ (Marks Grid): በኪቦርድ ቀስቶች (Arrow Keys) በመጠቀም ነጥቦችን በፍጥነት ያስገቡ። በራሱ ወዲያውኑ ይመዘገባል።",
    reports: "5. ማተሚያ እና ሪፖርት (Reports): የክፍሉን ማጠቃለያ ወይም የግል ሪፖርት ካርዶችን በተናጠል ለየብቻ በፒዲኤፍ (PDF) ማተም ይችላሉ።"
  },
  om: {
    title: "BT Express - Kitaaba Qajeelfama Guutuu",
    intro: "Baga gara BT Express nagaan dhuftan; kun gabaasa qabxii barattootaa fi tiraaniskiiriptii mana barumsaa offline irratti qopheessuuf meeshaa tekinoolojii guddaadha.",
    setup: "1. QINDESSUU (Configuration): Maqaa mana barumsaa, bara barnootaa, logo fi chaappaa galchi. Qabxii darbiinsaa fi qajeelfamoota darbiinsaa dhuunfaan bulchi.",
    students: "2. GALMEESSUU (Registry): Barattoota galmeessi, meeqa barataa (ID) kenniif, amala barattootaas galmeessi.",
    subjects: "3. BARNOOTA (Subjects): Maqaa barnootaa fi qabxii ol-aanaa galchi.",
    marks: "4. GALCHII QABXII (Marks Grid): Qabduu furtuu fayyadamuun qabxii galchi. Ofiin ol-kaahama.",
    reports: "5. GABAASA (Reports): Gabaasa waliigalaa kutaa ykn kaardii dhuunfaa addaan baasii printi godhi."
  }
};

export interface ChatbotQA {
  q: string;
  a: string;
}

export const chatbotDatabase: Record<'en' | 'am' | 'om', ChatbotQA[]> = {
  en: [
    { q: "How do I backup and save my school files?", a: "Every edit is automatically saved in real-time. To backup manually, click 'Export .bte file' on the top-right toolbar. To reload it later, use the 'Import BTE' file uploader." },
    { q: "How do I navigate inside the Marks Grid using the keyboard?", a: "Click inside any cell and use the Left, Right, Up, and Down arrow keys to slide focus horizontally and vertically. Stepping scroll values has been completely disabled." },
    { q: "How do I print individual student cards on separate sheets of paper?", a: "Go to Reports -> Individual Cards. Under each card, click 'Print Card'. The system applies custom page breaks so it compiles alone on a single page." },
    { q: "How do I define advanced custom promotion rules?", a: "Go to Configuration -> Promotion Rules -> click '+ Add Rule'. You can set rules such as: 'If failed subjects > 3, then average score must be >= 65 to promote'." }
  ],
  am: [
    { q: "ፋይሌን እንዴት ባክአፕ ማድረግ ወይም ማስቀመጥ እችላለሁ?", a: "እያንዳንዱ እርምጃ በራሱ ወዲያውኑ ይመዘገባል። ፋይሉን በተናጠል ለማስቀመጥ ከላይ በቀኝ በኩል 'Export .bte file' የሚለውን ይጫኑ። መልሰው ለመጫን 'Import BTE' የሚለውን ይጠቀሙ።" },
    { q: "በኪቦርድ ቀስት መቆጣጠሪያዎች እንዴት መጠቀም እችላለሁ?", a: "ማንኛውም የማርክ ማስገቢያ ክፍል ውስጥ በመጫን የኪቦርድ ግራ፣ ቀኝ፣ ላይ እና ታች ቀስቶችን በመጠቀም ክፍሎችን በፍጥነት መቀያየር ይችላሉ።" },
    { q: "የግል ሪፖርት ካርዶችን በተናጠል ያለ ስህተት ማተም የሚቻለው እንዴት ነው?", a: "ወደ 'Reports -> Individual Cards' ይሂዱ። በእያንዳንዱ ካርድ ስር 'Print Card' የሚለውን ይጫኑ። እያንዳንዱ ተማሪ በራሱ ወረቀት ላይ ብቻ ይታተማል።" },
    { q: "ውስብስብ የማለፊያ ቅንብሮችን እንዴት ማዘጋጀት እችላለሁ?", a: "ቅንብሮች (Configuration) -> 'Promotion Rules' ይሂዱና '+ Add Rule' የሚለውን ይጫኑ። ለምሳሌ 'ተማሪው ከ 3 ትምህርት በላይ ከወደቀ፣ ለማለፍ አማካይ ውጤቱ 65 መሆን አለበት' የሚል ህግ መፍጠር ይችላሉ።" }
  ],
  om: [
    { q: "Akkaattan faayila koo gabaasee ol-kaahu akkami?", a: "Wanti galchitan hundi ofiin ol-kaahama. Marsaa dhuunfaan ol-kaahuuf olii mirgaatti 'Export .bte file' cuqaasi. Gara duralaatti deebisuuf 'Import BTE' fayyadami." },
    { q: "Akkaattan qabduu furtuu (arrow keys) itti fayyadamu akkami?", a: "Bakka qabxii galchitan irratti cuqaasuun qabduu gara Gadii, Oli, Bitaa fi Mirgaatti fayyadamuun qabxii galchuu saffisiisuu dandeessu." },
    { q: "Kaardota dhuunfaa qofa margins sirriin akkamiin printi godha?", a: "Gara Reports -> Individual Cards deemi. Kaardii jalaatti 'Print Card' kan jedhu cuqaasi. Kaardiin tokko qofti fuula waraqaa tokko irratti baha." },
    { q: "Qindaa'ina darbiinsaa walxaxaa ta'e akkamiin seeneessu danda'a?", a: "Gara Configuration -> Promotion Rules deemi, '+ Add Rule' cuqaasi. Qajeelfama dabalataa galchuu dandeessa; fakkeenyaaf: 'Yoo barataan barnoota 3 gadi kufe, darbuuf giddu-galeessi isaa >= 65 ta'uu qaba'." }
  ]
};