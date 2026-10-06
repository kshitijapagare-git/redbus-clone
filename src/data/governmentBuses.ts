export interface GovernmentBusOperator {
  id: string
  name: string
  localName: string
  logoAlt: string
  rating: number
  serviceCount: number
  partnerText: string
}

export const governmentBusOperators: GovernmentBusOperator[] = [
  {
    id: 'apsrtc',
    name: 'APSRTC',
    localName: 'ఆంధ్ర ప్రదేశ్ రాష్ట్ర రోడ్డు రవాణా సంస్థ',
    logoAlt: 'APSRTC logo',
    rating: 4.2,
    serviceCount: 1200,
    partnerText: 'Official booking partner of APSRTC',
  },
  {
    id: 'tgsrtc',
    name: 'TGSRTC',
    localName: 'తెలంగాణ రాష్ట్ర రోడ్డు రవాణా సంస్థ',
    logoAlt: 'TGSRTC logo',
    rating: 4.1,
    serviceCount: 950,
    partnerText: 'Official booking partner of TGSRTC',
  },
  {
    id: 'kerala-rtc',
    name: 'KERALA RTC',
    localName: 'കേരള സംസ്ഥാന റോഡ് ട്രാൻസ്പോർട്ട് കോർപ്പറേഷൻ',
    logoAlt: 'KERALA RTC logo',
    rating: 4.0,
    serviceCount: 700,
    partnerText: 'Official booking partner of KERALA RTC',
  },
  {
    id: 'ktcl',
    name: 'KTCL',
    localName: 'ಕರ್ನಾಟಕ ಸಾರಿಗೆ ನಿಗಮ',
    logoAlt: 'KTCL logo',
    rating: 4.3,
    serviceCount: 860,
    partnerText: 'Official booking partner of KTCL',
  },
]
