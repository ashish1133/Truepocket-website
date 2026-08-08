// ============================================================
//  Truepocket Support Chatbot
//  Fully trained on all website content:
//  index.html, about.html, terms.html, privacy.html
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------
    //  KNOWLEDGE BASE  (trained from every page of the site)
    //  Each entry: { patterns: [...phrases], answer: "..." }
    //  Matching uses whole-word / phrase-level regex so short
    //  words like "fee" don't fire inside unrelated words.
    // ----------------------------------------------------------
    const KB = [

        // â”€â”€ GREETINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['hello', 'hi there', 'hey there', 'good morning', 'good afternoon',
                       'good evening', 'namaste', 'hii', 'helo', 'hai', 'sup', 'greetings'],
            answer: "Hello! ðŸ‘‹ Welcome to Truepocket. I'm trained on everything about the app. Ask me anything â€” fees, eligibility, repayment, security, privacy, or how to get started!"
        },

        // â”€â”€ WHAT IS TRUEPOCKET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['what is truepocket', 'what is this app', 'about truepocket',
                       'tell me about truepocket', 'what does truepocket do',
                       'truepocket kya hai', 'explain truepocket'],
            answer: "Truepocket is a zero-interest instant cash advance app built for students, daily wage workers, and employees in India. It provides short-term microfinance support with no upfront processing fees, bank-grade security, and a strict No-Harassment policy. If you repay on time, it's 100% free."
        },

        // â”€â”€ WHO CAN APPLY / ELIGIBILITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['who can apply', 'who can use', 'eligibility', 'eligible',
                       'am i eligible', 'can i apply', 'qualify', 'requirements to apply',
                       'who is it for', 'target users', 'for students', 'for workers',
                       'college student', 'daily wage', 'gig worker', 'employee'],
            answer: "Truepocket is designed for:\nâ€¢ Students and college students\nâ€¢ Daily wage workers\nâ€¢ Gig workers and freelancers\nâ€¢ Salaried employees\n\nEligibility requirements (from Terms):\nâœ… Must be at least 18 years old\nâœ… Legally capable of entering a contract\nâœ… Provide accurate information\nâœ… Have valid ID and bank account details\n\nFull eligibility is shown inside the app before you apply."
        },

        // â”€â”€ PROCESSING FEES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['processing fee', 'processing fees', 'upfront fee', 'hidden fee',
                       'hidden charges', 'any charges', 'is it free', 'free to use',
                       'zero processing', 'no processing fee'],
            answer: "Truepocket charges ZERO upfront processing fees. Unlike other apps that call themselves 'zero interest' but hide fees, we genuinely don't charge anything upfront. If you repay within your agreed timeframe, the total cost is â‚¹0."
        },

        // â”€â”€ INTEREST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['interest', 'zero interest', 'interest rate', 'interest free',
                       'kya interest lagta hai', 'interest charges'],
            answer: "Truepocket does NOT charge interest on the principal advance amount. As stated in our Terms (Section 5): we provide fully interest-free advances. The only charge possible is a flat late fee â€” and that only starts from Day 7 if you miss your repayment date."
        },

        // â”€â”€ LATE FEES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['late fee', 'late fees', 'late payment', 'late charge',
                       'what if i pay late', 'missed payment', 'overdue',
                       'grace period', 'day 6', 'day 7', 'penalty'],
            answer: "Late fee policy (from Terms, Section 6):\n\nâ€¢ Day 1â€“6 after due date: NO late fee (grace period)\nâ€¢ From Day 7 onwards: A flat late fee applies\nâ€¢ Continued default may result in additional penalties\n\nAll charges are clearly shown before you accept the advance. No surprises."
        },

        // â”€â”€ HOW IT WORKS / STEPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['how does it work', 'how it works', 'how to apply',
                       'how to use', 'steps', 'process', 'how to get money',
                       'how to get advance', 'application process', '3 steps'],
            answer: "Getting started with Truepocket is 3 simple steps:\n\n1ï¸âƒ£ Download the APK from this website and create your secure account\n2ï¸âƒ£ Complete the digital form and review the terms, repayment date, and late fee rules before you confirm\n3ï¸âƒ£ If approved, funds are sent to your linked bank account\n\nApproved advances are generally disbursed within 5 minutes after approval."
        },

        // â”€â”€ DISBURSEMENT TIME â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['how fast', 'how quick', 'disbursement', 'disburse', 'when will i get',
                       'how long does it take', 'instant', 'time to receive',
                       'money in how many minutes', '5 minutes'],
            answer: "Approved advances are generally disbursed within 5 minutes after approval (as per our Terms, Section 3). Delays may occasionally occur due to banking systems or payment gateways, but we aim for the fastest possible transfer."
        },

        // â”€â”€ DOWNLOAD THE APP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['download', 'download app', 'download apk', 'install app',
                       'where to download', 'get the app', 'how to download',
                       'apk download', 'truepocket apk'],
            answer: "Download the official Truepocket APK directly from this website (truepocket.live). Just click the 'Download APK â€” Safe & Direct' button on the homepage.\n\nâœ… Safe and official distribution\nâœ… No third-party app stores needed\nâœ… See the downloads page for verification details and installation instructions"
        },

        // â”€â”€ SECURITY / ENCRYPTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['is it safe', 'safe to use', 'security', 'secure', 'encryption',
                       'data safe', 'bank grade', '256 bit', 'is my data safe',
                       'data protection', 'ssl', 'tls'],
            answer: "Truepocket uses 256-bit SSL/TLS encryption â€” the same level used by major banks â€” for all data transfers. Key security points:\n\nðŸ”’ End-to-end encryption for all transactions\nðŸ”’ Secure servers with restricted access and monitoring\nðŸ”’ Your data is never sold to third parties\nðŸ”’ Industry-standard access controls and regular security reviews"
        },

        // â”€â”€ PRIVACY / DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['privacy', 'data privacy', 'my data', 'personal data',
                       'what data', 'data collected', 'information collected',
                       'privacy policy', 'data sharing', 'sell my data'],
            answer: "We take your privacy seriously (Privacy Policy, last updated June 4, 2026):\n\nðŸ“‹ Data we collect: name, mobile, email, address proof, ID proof, bank details, selfie for verification, device info for fraud prevention\n\nðŸš« We never sell, rent, or trade your personal information\nâœ… Data is shared only with payment partners, verification services, and legal authorities when required\n\nYou have rights to access, correct, or delete your data â€” email support1@truepocket.live"
        },

        // â”€â”€ CONTACT LIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['contact list', 'call my contacts', 'access contacts',
                       'contact my family', 'call my friends', 'phone contacts',
                       'will you call', 'harassment', 'harass'],
            answer: "Truepocket has a strict No-Harassment Guarantee:\n\nâŒ We NEVER access your device contact list\nâŒ We NEVER call or message your friends or family\nâŒ We NEVER use public shaming or abusive language\nâŒ We NEVER share your info without authorization\n\nThis is guaranteed in both our Terms (Section 10) and Privacy Policy (Section 5). We only contact you (the user) through SMS, email, WhatsApp, or in-app notifications for lawful repayment reminders."
        },

        // â”€â”€ NO-HARASSMENT POLICY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['no harassment', 'ethical collection', 'fair collection',
                       'collection practice', 'recovery practice', 'abusive',
                       'shame', 'threaten', 'threat'],
            answer: "Our Fair Collection Policy (Terms, Section 10) guarantees we will NEVER:\nâ€¢ Harass or threaten borrowers\nâ€¢ Use abusive language\nâ€¢ Publicly shame you\nâ€¢ Misuse contact lists\nâ€¢ Contact family/friends for harassment\nâ€¢ Share personal information without authorization\n\nWe only contact you via phone, SMS, email, WhatsApp, or in-app notifications for legitimate repayment reminders."
        },

        // â”€â”€ REPAYMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['repay', 'repayment', 'pay back', 'how to repay',
                       'return money', 'due date', 'repayment date', 'when to pay',
                       'flexible repayment', 'repayment options'],
            answer: "Repayment details (Terms, Section 4):\n\nâœ… The repayment date and all charges are shown clearly before you accept\nâœ… You agree to repay on or before the due date\nâœ… Pick a repayment timeline that fits your budget\nâœ… Grace period: No late fee for Days 1â€“6 after due date\nâœ… Late fee applies only from Day 7 onwards\n\nPay on time = 100% free advance."
        },

        // â”€â”€ ADVANCE AMOUNT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['how much', 'advance amount', 'advance amount', 'maximum amount',
                       'minimum amount', 'credit limit', 'how much money',
                       'kitna milega', 'available credit'],
            answer: "The advance amount available to you depends on your individual eligibility profile. The approved amount, repayment date, and all applicable charges are displayed inside the app before you accept â€” so you always know exactly what you're agreeing to before you proceed."
        },

        // â”€â”€ MISSION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['mission', 'what is your mission', 'company mission',
                       'truepocket mission'],
            answer: "Truepocket's Mission:\n\n\"To provide compassionate, transparent, and accessible short-term financial support to people facing temporary financial emergencies.\"\n\nWe help people overcome difficult moments with dignity â€” offering transparent assistance free from hidden charges, excessive fees, and unfair recovery practices. We strive to be a trusted helping hand when financial challenges arise."
        },

        // â”€â”€ VISION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['vision', 'what is your vision', 'company vision',
                       'truepocket vision'],
            answer: "Truepocket's Vision:\n\n\"To build a future where everyone can access fair and respectful emergency financial assistance when they need it most.\"\n\nWe aspire to build a community-driven financial support platform that promotes trust, transparency, and financial well-being â€” empowering individuals to navigate life's unexpected challenges with confidence and peace of mind."
        },

        // â”€â”€ ABOUT THE COMPANY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['about us', 'about company', 'who are you', 'who made this',
                       'company info', 'truepocket company', 'who is truepocket'],
            answer: "Truepocket is a zero-interest microfinance platform serving Chennai and all of India. Our focus is on clear terms, secure processing, and a respectful support experience. We believe no one should face temporary financial hardship alone.\n\nðŸŒ Website: truepocket.live\nðŸ“§ Support: support1@truepocket.live\nðŸ“ Legal jurisdiction: Chennai, Tamil Nadu, India"
        },

        // â”€â”€ GST / TAXES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['gst', 'tax', 'taxes', 'gst charges', 'gst on fees'],
            answer: "GST and applicable taxes may be charged on service fees, penalties, late fees, or other charges as required by Indian law (Terms, Section 7). All such charges are disclosed before you accept the advance â€” nothing is hidden."
        },

        // â”€â”€ VERIFICATION / KYC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['verification', 'kyc', 'documents needed', 'what documents',
                       'id proof', 'identity proof', 'bank details', 'selfie',
                       'address proof', 'what is required'],
            answer: "For verification (Terms, Section 8), you may need to provide:\n\nðŸ“‹ Name\nðŸ“± Mobile number\nðŸ“§ Email address\nðŸ  Address proof\nðŸªª Identity proof\nðŸ¦ Bank account details\nðŸ¤³ Selfie for verification\n\nAll information must be accurate and truthful. This is required for identity verification and fraud prevention."
        },

        // â”€â”€ NON-NBFC / NOT A BANK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['is it a bank', 'nbfc', 'rbi registered', 'rbi',
                       'regulated', 'bank registered', 'not a bank'],
            answer: "Truepocket is an LLP registered company and operates on an LSP (Lending Service Provider) model connecting with NBFCs. As disclosed in our Terms (Section 12):\n\n• Advances are facilitated through our NBFC partners\n• Intended for eligible users\n• We do not accept public deposits or investment funds\n• Advance availability depends on partner NBFC funds and internal policies\n\nThis transparency is part of our commitment to honest communication."
        },

        // â”€â”€ FRAUD PREVENTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['fraud', 'fake documents', 'false information',
                       'fraudulent', 'account suspended', 'banned'],
            answer: "Truepocket takes fraud very seriously (Terms, Section 11). The following are strictly prohibited:\n\nâŒ Submitting false information\nâŒ Using forged documents\nâŒ Using another person's identity\nâŒ Unauthorized access attempts\n\nViolations may result in account suspension, advance rejection, legal action, or reporting to relevant authorities."
        },

        // â”€â”€ ACCOUNT SUSPENSION / TERMINATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['account suspended', 'account terminated', 'account blocked',
                       'why suspended', 'ban', 'account closed'],
            answer: "Accounts may be suspended or terminated (Terms, Section 22) if:\nâ€¢ False information is provided\nâ€¢ Fraud is detected\nâ€¢ Terms and conditions are violated\nâ€¢ Verification requirements are not satisfied\n\nIf you believe your account was suspended in error, contact us at support1@truepocket.live."
        },

        // â”€â”€ DATA RIGHTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['delete my data', 'data deletion', 'my rights',
                       'access my data', 'correct my data', 'right to erasure',
                       'data request'],
            answer: "You have full data rights (Privacy Policy, Section 7):\n\nâœ… Access the personal data we hold about you\nâœ… Request correction of inaccurate information\nâœ… Request deletion of your data (subject to legal obligations)\nâœ… Withdraw consent for non-essential communications\n\nEmail support1@truepocket.live to exercise any of these rights."
        },

        // â”€â”€ COOKIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['cookies', 'tracking', 'cookie policy'],
            answer: "We use cookies and similar technologies only for session management and analytics (Privacy Policy, Section 8). We do NOT use cookies for advertising profiling. You can control cookie settings through your browser at any time."
        },

        // â”€â”€ AGE RESTRICTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['age limit', 'minimum age', '18 years', 'age requirement',
                       'can minor apply', 'under 18'],
            answer: "You must be at least 18 years old to use Truepocket (Terms, Section 1). Our services are not available to minors. If we discover data collected from anyone under 18, it is deleted promptly (Privacy Policy, Section 9)."
        },

        // â”€â”€ GOVERNING LAW / JURISDICTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['governing law', 'jurisdiction', 'legal jurisdiction',
                       'which court', 'chennai court', 'dispute'],
            answer: "Truepocket is governed by the laws of India. Any disputes are subject to the jurisdiction of competent courts in Chennai, Tamil Nadu (Terms, Section 26 & Privacy Policy, Section 11)."
        },

        // â”€â”€ COMPARISON WITH OTHER APPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['better than other apps', 'vs mpokket', 'compared to other apps',
                       'why truepocket is better', 'difference from other apps',
                       'why choose truepocket', 'truepocket vs'],
            answer: "Truepocket vs other cash apps:\n\nâœ… ZERO upfront processing fees (others hide fees as 'zero interest')\nâœ… No harassment â€” we never contact your friends/family\nâœ… Clear flat late fee â€” only after Day 6, shown upfront\nâœ… Bank-grade 256-bit encryption â€” data never sold\nâœ… Transparent terms before acceptance\n\nâŒ Other apps: high hidden fees, contact list harassment, confusing penalties, data sold to marketers"
        },

        // â”€â”€ TERMS AND CONDITIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['terms', 'terms and conditions', 'terms of service',
                       'what are the terms', 'read terms'],
            answer: "You can read the full Terms and Conditions at truepocket.live/terms.html. Key highlights:\n\nâ€¢ Zero processing fees, zero interest\nâ€¢ Late fee only from Day 7\nâ€¢ Disbursement within 5 minutes of approval\nâ€¢ No harassment guarantee\nâ€¢ Minimum age: 18 years\nâ€¢ Governed by Indian law, Chennai jurisdiction\nâ€¢ Last updated: May 28, 2026"
        },

        // â”€â”€ CONTACT / SUPPORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['contact support', 'customer support', 'help me',
                       'email support', 'support email', 'how to contact',
                       'reach support', 'customer service', 'need help'],
            answer: "Contact Truepocket support:\n\nðŸ“§ Email: support1@truepocket.live\nðŸŒ Website: truepocket.live\nðŸ“„ About Us: truepocket.live/about.html\n\nWe're here to help with application questions, account issues, repayment, fees, or anything else!"
        },
        // ──── SOCIAL MEDIA ────────────────────────────────────────────────
        {
            patterns: ['social media', 'facebook', 'instagram', 'twitter',
                       'linkedin', 'follow truepocket'],
            answer: "You can follow Truepocket on social media:\n\n📘 Facebook: facebook.com/profile.php?id=61592697014065\n🐦 Twitter/X: twitter.com/truepocket\n📸 Instagram: instagram.com/truepocket\n💼 LinkedIn: linkedin.com/company/true-pocket/posts/?feedView=all"
        },

        // ──── RATINGS / REVIEWS ───────────────────────────────────────────
        {
            patterns: ['rating', 'reviews', 'user rating', 'stars', '4.9',
                       'is it good', 'trusted', 'trustworthy', 'genuine',
                       'legit', 'is it a scam', 'real app'],
            answer: "Truepocket is rated 4.9/5 by early users. It is a legitimate microfinance platform with:\n\nâ­ 4.9/5 user rating\nðŸ”’ Bank-grade 256-bit encryption\nâœ… Transparent terms shown upfront\nðŸ¤ Strict No-Harassment Guarantee\nðŸ“ Operating under Indian law (Chennai, Tamil Nadu)"
        },

        // â”€â”€ WEBSITE / APP URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['website', 'app website', 'official website', 'url',
                       'truepocket website', 'official site'],
            answer: "The official Truepocket website is: https://www.truepocket.live\n\nAll pages:\nâ€¢ Home: truepocket.live\nâ€¢ About Us: truepocket.live/about.html\nâ€¢ Terms: truepocket.live/terms.html\nâ€¢ Privacy Policy: truepocket.live/privacy.html\nâ€¢ Download Info: truepocket.live/downloads"
        },

        // â”€â”€ THANKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['thank you', 'thanks', 'thank u', 'tysm', 'appreciated',
                       'great help', 'helpful', 'ok thanks'],
            answer: "You're welcome! ðŸ˜Š Feel free to ask anything else about Truepocket. I'm here to help!"
        },

        // â”€â”€ GOODBYE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        {
            patterns: ['bye', 'goodbye', 'see you', 'ok bye', 'cya', 'later'],
            answer: "Goodbye! ðŸ‘‹ Come back anytime you have questions about Truepocket. Have a great day!"
        }
    ];

    // ----------------------------------------------------------
    //  MATCHING ENGINE
    //  Whole-word / whole-phrase matching to avoid false hits
    //  (e.g., "hi" inside "ashish", "fee" inside "coffee")
    // ----------------------------------------------------------
    function findAnswer(userMessage) {
        const text = userMessage.toLowerCase().trim();

        for (const entry of KB) {
            for (const pattern of entry.patterns) {
                // Escape regex special chars in pattern
                const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Match as whole word / phrase (not inside another word)
                const regex = new RegExp('(?:^|[\\s,!?.])' + escaped + '(?:[\\s,!?.]|$)', 'i');
                if (regex.test(text) || text === pattern) {
                    return entry.answer;
                }
            }
        }

        // Nothing matched â€” stay in scope
        return "I'm only able to help with questions about Truepocket â€” things like fees, eligibility, repayment, security, privacy, or how to download the app.\n\nTry asking something like:\nâ€¢ \"How does it work?\"\nâ€¢ \"Are there any fees?\"\nâ€¢ \"What is the late fee policy?\"\nâ€¢ \"Is my data safe?\"";
    }

    // ----------------------------------------------------------
    //  QUICK REPLY CHIPS  (shown on first open)
    // ----------------------------------------------------------
    const QUICK_REPLIES = [
        "How does it work?",
        "Any processing fees?",
        "What is the late fee?",
        "Is my data safe?",
        "Who can apply?",
        "How to download?"
    ];

    // ----------------------------------------------------------
    //  UI STATE
    // ----------------------------------------------------------
    let chatOpened = false;

    // ----------------------------------------------------------
    //  INIT
    // ----------------------------------------------------------
    function initChatbot() {
        const chatToggle   = document.getElementById('chat-toggle');
        const chatWindow   = document.getElementById('chat-window');
        const chatClose    = document.getElementById('chat-close');
        const chatInput    = document.getElementById('chat-input');
        const chatSend     = document.getElementById('chat-send');
        const msgContainer = document.getElementById('chat-messages');

        if (!chatToggle || !chatWindow) return;

        // â”€â”€ Toggle open/close â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        chatToggle.addEventListener('click', () => {
            const isOpen = chatWindow.classList.toggle('active');
            if (isOpen) {
                // Hide notification badge
                const badge = chatToggle.querySelector('.notification-badge');
                if (badge) badge.style.display = 'none';

                chatInput.focus();

                // Welcome message on very first open
                if (!chatOpened) {
                    chatOpened = true;
                    addBotMessage(
                        "Hello! ðŸ‘‹ I'm the Truepocket assistant, fully trained on everything about this app.\n\nAsk me about fees, eligibility, repayment, security, privacy, how to apply â€” anything!",
                        true // show quick replies
                    );
                }
            }
        });

        // â”€â”€ Close button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        chatClose?.addEventListener('click', () => chatWindow.classList.remove('active'));

        // â”€â”€ Send on button click â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        chatSend?.addEventListener('click', sendMessage);

        // â”€â”€ Send on Enter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        chatInput?.addEventListener('keypress', e => {
            if (e.key === 'Enter') sendMessage();
        });

        // â”€â”€ SEND MESSAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;
            addUserMessage(text);
            chatInput.value = '';

            showTyping();
            setTimeout(() => {
                hideTyping();
                addBotMessage(findAnswer(text));
            }, 600 + Math.random() * 600);
        }

        // â”€â”€ RENDER: user bubble â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        function addUserMessage(text) {
            renderBubble('user', text);
        }

        // â”€â”€ RENDER: bot bubble (+ optional quick replies) â”€â”€â”€â”€â”€â”€
        function addBotMessage(text, withQuickReplies = false) {
            renderBubble('bot', text);

            if (withQuickReplies) {
                const wrap = document.createElement('div');
                wrap.className = 'quick-replies';
                QUICK_REPLIES.forEach(reply => {
                    const btn = document.createElement('button');
                    btn.className = 'quick-reply-btn';
                    btn.textContent = reply;
                    btn.addEventListener('click', () => {
                        // Remove quick reply buttons after one is clicked
                        wrap.remove();
                        chatInput.value = reply;
                        sendMessage();
                    });
                    wrap.appendChild(btn);
                });
                msgContainer.appendChild(wrap);
                scrollBottom();
            }
        }

        // â”€â”€ Build and insert a message bubble â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        function renderBubble(type, text) {
            const row = document.createElement('div');
            row.className = `chat-message ${type}`;

            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.innerHTML = type === 'bot'
                ? '<i class="ri-robot-fill"></i>'
                : '<i class="ri-user-fill"></i>';

            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            // Preserve newlines, then linkify email addresses
            bubble.innerHTML = escapeHtml(text)
                .replace(/\n/g, '<br>')
                .replace(
                    /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g,
                    '<a href="mailto:$1" style="color:var(--primary);text-decoration:underline;font-weight:600;">$1</a>'
                );

            row.appendChild(avatar);
            row.appendChild(bubble);
            msgContainer.appendChild(row);
            scrollBottom();
        }

        // â”€â”€ Typing indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        function showTyping() {
            const row = document.createElement('div');
            row.className = 'chat-message bot';
            row.id = 'typing-indicator';

            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.innerHTML = '<i class="ri-robot-fill"></i>';

            const bubble = document.createElement('div');
            bubble.className = 'message-bubble typing-indicator active';
            bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

            row.appendChild(avatar);
            row.appendChild(bubble);
            msgContainer.appendChild(row);
            scrollBottom();
        }

        function hideTyping() {
            document.getElementById('typing-indicator')?.remove();
        }

        // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        function scrollBottom() {
            msgContainer.scrollTop = msgContainer.scrollHeight;
        }

        function escapeHtml(str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }
    }

    initChatbot();
});


