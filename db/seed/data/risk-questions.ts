export const riskQuestionsData = [
  {
    questionCode: 'UNPROTECTED_SEX',
    questionText: 'Have you had unprotected sex (without condom) in the last 6 months?',
    questionTextTagalog: 'Nakipagtalik ka ba nang walang condom sa nakaraang 6 na buwan?',
    questionType: 'yes_no',
    weight: 30,
    orderIndex: 1,
    isActive: true
  },
  {
    questionCode: 'MULTIPLE_PARTNERS',
    questionText: 'Have you had sex with more than one partner in the last 6 months?',
    questionTextTagalog: 'Nakipagtalik ka ba sa higit sa isang tao sa nakaraang 6 na buwan?',
    questionType: 'yes_no',
    weight: 20,
    orderIndex: 2,
    isActive: true
  },
  {
    questionCode: 'PARTNER_HIV_STATUS',
    questionText: 'Do you know if any of your sexual partners are HIV positive or have unknown HIV status?',
    questionTextTagalog: 'Alam mo ba kung ang iyong kasintahan ay HIV positive o hindi alam ang kanilang HIV status?',
    questionType: 'yes_no',
    weight: 25,
    orderIndex: 3,
    isActive: true
  },
  {
    questionCode: 'STI_SYMPTOMS',
    questionText: 'Have you experienced any STI symptoms (sores, discharge, pain) in the last 3 months?',
    questionTextTagalog: 'Nakaranas ka ba ng sintomas ng STI (sugat, discharge, sakit) sa nakaraang 3 buwan?',
    questionType: 'yes_no',
    weight: 15,
    orderIndex: 4,
    isActive: true
  },
  {
    questionCode: 'INJECTION_DRUG_USE',
    questionText: 'Have you ever shared needles or syringes for drug injection?',
    questionTextTagalog: 'Nakipag-share ka ba ng karayom o syringe para sa pag-inject ng droga?',
    questionType: 'yes_no',
    weight: 30,
    orderIndex: 5,
    isActive: true
  },
  {
    questionCode: 'PREVIOUS_TEST',
    questionText: 'Have you been tested for HIV before?',
    questionTextTagalog: 'Na-test ka na ba para sa HIV dati?',
    questionType: 'yes_no',
    weight: -10, // Negative weight as previous testing shows health awareness
    orderIndex: 6,
    isActive: true
  },
  {
    questionCode: 'COMMERCIAL_SEX',
    questionText: 'Have you paid for sex or been paid for sex in the last 12 months?',
    questionTextTagalog: 'Nagbayad ka ba o binayaran para sa sex sa nakaraang 12 buwan?',
    questionType: 'yes_no',
    weight: 20,
    orderIndex: 7,
    isActive: true
  }
]

// Scoring rules based on total weight
export const scoringRulesData = [
  {
    name: 'Low Risk',
    description: 'Continue safe practices and get tested annually',
    minScore: 0,
    maxScore: 30,
    riskLevel: 'low' as const,
    isActive: true
  },
  {
    name: 'Moderate Risk',
    description: 'Consider getting tested within the next month',
    minScore: 31,
    maxScore: 60,
    riskLevel: 'moderate' as const,
    isActive: true
  },
  {
    name: 'High Risk',
    description: 'Strongly recommend immediate HIV testing',
    minScore: 61,
    maxScore: 200,
    riskLevel: 'high' as const,
    isActive: true
  }
]

// Message templates for different risk levels
export const riskMessageTemplatesData = [
  // Low Risk Messages
  {
    riskLevel: 'low' as const,
    messageType: 'result',
    templateText: 'Your HIV risk assessment shows LOW RISK. Continue practicing safe sex and get tested annually. Reply STOP to unsubscribe.',
    templateTextTagalog: 'Ang iyong HIV risk assessment ay LOW RISK. Magpatuloy sa safe sex at magpa-test taun-taon. Reply STOP para mag-unsubscribe.',
    isActive: true
  },
  {
    riskLevel: 'low' as const,
    messageType: 'reminder',
    templateText: 'Hi {{name}}, reminder to maintain your low HIV risk through safe practices. Need testing info? Reply INFO.',
    templateTextTagalog: 'Hi {{name}}, paalala na panatilihin ang mababang HIV risk sa pamamagitan ng ligtas na gawain. Kailangan ng testing info? Reply INFO.',
    isActive: true
  },
  // Moderate Risk Messages
  {
    riskLevel: 'moderate' as const,
    messageType: 'result',
    templateText: 'Your HIV risk assessment shows MODERATE RISK. We recommend getting tested soon. Your referral code: {{referralCode}}. Nearest center: {{testCenter}}',
    templateTextTagalog: 'Ang iyong HIV risk assessment ay MODERATE RISK. Inirerekomenda naming magpa-test ka kaagad. Referral code: {{referralCode}}. Pinakamalapit: {{testCenter}}',
    isActive: true
  },
  {
    riskLevel: 'moderate' as const,
    messageType: 'reminder',
    templateText: 'Hi {{name}}, have you scheduled your HIV test? Your referral code {{referralCode}} is still valid. Reply HELP for assistance.',
    templateTextTagalog: 'Hi {{name}}, naka-schedule ka na ba para sa HIV test? Valid pa ang referral code mo {{referralCode}}. Reply HELP para sa tulong.',
    isActive: true
  },
  // High Risk Messages
  {
    riskLevel: 'high' as const,
    messageType: 'result',
    templateText: 'URGENT: Your HIV risk assessment shows HIGH RISK. Please get tested immediately. Referral: {{referralCode}}. Go to: {{testCenter}}. Free & confidential.',
    templateTextTagalog: 'URGENT: Ang iyong HIV risk assessment ay HIGH RISK. Magpa-test AGAD. Referral: {{referralCode}}. Pumunta sa: {{testCenter}}. Libre at confidential.',
    isActive: true
  },
  {
    riskLevel: 'high' as const,
    messageType: 'reminder',
    templateText: 'URGENT {{name}}: Please don\'t delay HIV testing. Your health matters. Use code {{referralCode}} at {{testCenter}}. We\'re here to help.',
    templateTextTagalog: 'URGENT {{name}}: Huwag nang ipagpaliban ang HIV test. Mahalaga ang kalusugan mo. Gamitin {{referralCode}} sa {{testCenter}}.',
    isActive: true
  }
]