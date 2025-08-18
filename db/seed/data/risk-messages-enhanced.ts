// Enhanced message templates for different risk levels with comprehensive information
export const enhancedRiskMessageTemplatesData = [
  // Low Risk Messages - With Prevention Tips
  {
    riskLevel: 'low' as const,
    messageType: 'result',
    templateText: 'BantAI: LOW RISK result. Prevention tips: 1) Always use condoms 2) Know partner\'s status 3) Test annually 4) Avoid sharing needles. Stay safe! Reply STOP to opt out.',
    templateTextTagalog: 'BantAI: LOW RISK. Payo: 1) Palaging gumamit ng condom 2) Alamin status ng partner 3) Magpa-test taun-taun 4) Huwag magshare ng karayom. Reply STOP para tumigil.',
    isActive: true
  },
  {
    riskLevel: 'low' as const,
    messageType: 'prevention_tips',
    templateText: 'BantAI Prevention Tips: Use condoms correctly every time. Limit partners. Get PrEP if at risk. Avoid drugs/alcohol before sex. Test together with partner. Reply INFO for more.',
    templateTextTagalog: 'BantAI Payo: Gamitin condom tuwing makipagtalik. Limitahan partner. Kumuha ng PrEP kung at risk. Iwasan droga/alak bago sex. Magpa-test kasama partner. Reply INFO.',
    isActive: true
  },
  {
    riskLevel: 'low' as const,
    messageType: 'reminder',
    templateText: 'Hi {{name}}, maintain your low HIV risk! Remember: Safe sex saves lives. Annual testing recommended. Free condoms available at health centers. Reply CENTERS for locations.',
    templateTextTagalog: 'Hi {{name}}, panatilihin ang low risk! Tandaan: Safe sex nagliligtas. Annual test recommended. Libreng condom sa health center. Reply CENTERS para sa lokasyon.',
    isActive: true
  },

  // Moderate Risk Messages - With Test Center Details
  {
    riskLevel: 'moderate' as const,
    messageType: 'result',
    templateText: 'BantAI: MODERATE RISK. Get tested within 30 days. REF: {{referralCode}}\n\n{{testCenter}}\n{{testCenterAddress}}\n{{testCenterHours}}\nTel: {{testCenterPhone}}\n\nFREE & CONFIDENTIAL',
    templateTextTagalog: 'BantAI: MODERATE RISK. Magpa-test sa loob ng 30 araw. REF: {{referralCode}}\n\n{{testCenter}}\n{{testCenterAddress}}\n{{testCenterHours}}\nTel: {{testCenterPhone}}\n\nLIBRE & CONFIDENTIAL',
    isActive: true
  },
  {
    riskLevel: 'moderate' as const,
    messageType: 'test_centers',
    templateText: 'NEAREST TEST CENTERS:\n1. {{testCenter1}} - {{distance1}}km\n   {{hours1}}\n2. {{testCenter2}} - {{distance2}}km\n   {{hours2}}\n\nAll accept walk-ins. Bring {{referralCode}}',
    templateTextTagalog: 'PINAKAMALAPIT:\n1. {{testCenter1}} - {{distance1}}km\n   {{hours1}}\n2. {{testCenter2}} - {{distance2}}km\n   {{hours2}}\n\nLahat tumatanggap ng walk-in. Dalhin {{referralCode}}',
    isActive: true
  },
  {
    riskLevel: 'moderate' as const,
    messageType: 'reminder',
    templateText: '{{name}}, your HIV test is important. Use REF {{referralCode}} at any center:\n\n{{nearestCenters}}\n\nNeed transport help? Reply TRANSPO. Questions? Reply HELP',
    templateTextTagalog: '{{name}}, mahalaga ang HIV test. Gamitin REF {{referralCode}} sa center:\n\n{{nearestCenters}}\n\nKailangan ng tulong sa transport? Reply TRANSPO. May tanong? Reply HELP',
    isActive: true
  },

  // High Risk Messages - With Priority Instructions
  {
    riskLevel: 'high' as const,
    messageType: 'result',
    templateText: '🚨URGENT: HIGH RISK🚨\n\nGo TODAY to:\n{{testCenter}}\n{{testCenterAddress}}\n\nSHOW THIS CODE: {{referralCode}}\nYou\'ll be prioritized.\n\nEmergency hotline: 8989-BANTAI',
    templateTextTagalog: '🚨URGENT: HIGH RISK🚨\n\nPumunta NGAYON sa:\n{{testCenter}}\n{{testCenterAddress}}\n\nIPAKITA CODE: {{referralCode}}\nPriority ka.\n\nEmergency hotline: 8989-BANTAI',
    isActive: true
  },
  {
    riskLevel: 'high' as const,
    messageType: 'priority_instructions',
    templateText: 'PRIORITY TESTING INSTRUCTIONS:\n1. Go directly to triage desk\n2. Show code {{referralCode}}\n3. Say "BantAI priority referral"\n4. Testing takes 20min\n5. Results in 1-2 hours\n\nWe\'re here to help.',
    templateTextTagalog: 'PRIORITY TESTING:\n1. Diretso sa triage desk\n2. Ipakita code {{referralCode}}\n3. Sabihin "BantAI priority referral"\n4. 20min lang ang test\n5. Resulta sa 1-2 oras\n\nNandito kami para tumulong.',
    isActive: true
  },
  {
    riskLevel: 'high' as const,
    messageType: 'reminder',
    templateText: '🚨{{name}}, PLEASE GET TESTED TODAY🚨\n\nYour health is critical. Use priority code {{referralCode}}.\n\nNearest 24/7 center:\n{{emergencyCenter}}\n\nCall 8989-BANTAI for immediate help.',
    templateTextTagalog: '🚨{{name}}, MAGPA-TEST NA NGAYON🚨\n\nKritikal ang kalusugan mo. Gamitin priority code {{referralCode}}.\n\n24/7 center:\n{{emergencyCenter}}\n\nTawag 8989-BANTAI para sa tulong.',
    isActive: true
  },
  {
    riskLevel: 'high' as const,
    messageType: 'emergency_support',
    templateText: 'If you need immediate support:\n📞 Hotline: 8989-BANTAI\n🏥 24/7 Center: PGH Emergency\n🚕 Free transport: Reply RIDE\n💬 Counselor: Reply TALK\n\nYou\'re not alone. Code: {{referralCode}}',
    templateTextTagalog: 'Kung kailangan mo ng tulong:\n📞 Hotline: 8989-BANTAI\n🏥 24/7: PGH Emergency\n🚕 Libreng sakay: Reply RIDE\n💬 Counselor: Reply TALK\n\nHindi ka nag-iisa. Code: {{referralCode}}',
    isActive: true
  }
]

// Additional message types for follow-up
export const followUpMessageTemplatesData = [
  {
    riskLevel: 'low' as const,
    messageType: 'annual_reminder',
    templateText: '{{name}}, it\'s been a year since your last HIV test. Stay on top of your health - schedule your annual test today. Reply YES to get a referral code.',
    templateTextTagalog: '{{name}}, isang taon na mula sa huling HIV test mo. Alagaan ang kalusugan - mag-schedule ng annual test. Reply YES para sa referral code.',
    isActive: true
  },
  {
    riskLevel: 'moderate' as const,
    messageType: 'no_show_follow_up',
    templateText: '{{name}}, we noticed you haven\'t used your test referral {{referralCode}}. Your health matters. Reply RESCHED to set a new appointment or HELP if you have concerns.',
    templateTextTagalog: '{{name}}, hindi mo pa nagamit ang referral {{referralCode}}. Mahalaga ang kalusugan mo. Reply RESCHED para sa bagong appointment o HELP kung may alalahanin.',
    isActive: true
  },
  {
    riskLevel: 'high' as const,
    messageType: 'urgent_no_show',
    templateText: '🚨URGENT: {{name}}, you haven\'t been tested yet. High risk requires immediate action. We\'re worried about you. Reply NOW for same-day testing or CALL for phone support.',
    templateTextTagalog: '🚨URGENT: {{name}}, hindi ka pa nag-test. Kailangan ng aksyon para sa high risk. Nag-aalala kami. Reply NOW para same-day test o CALL para phone support.',
    isActive: true
  }
]