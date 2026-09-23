/**
 * The complaint vocabulary itself — findings, priorities, reasons, modes.
 *
 * Where RTA's own export carries a bilingual value, the Arabic below is
 * theirs rather than ours: the findings and the action taken come straight
 * from `Status Reason` and the investigation forms.
 */
export const domain = {
  Critical: "حرجة",
  High: "عالية",
  Medium: "متوسطة",
  Low: "منخفضة",

  New: "جديدة",
  Assigned: "مُسندة",
  "Under Investigation": "قيد التحقيق",
  Escalated: "مُصعّدة",
  Returned: "مُعادة",
  Closed: "مغلقة",

  Confirmed: "مؤكدة",
  Inconclusive: "غير حاسمة",
  "False Positive": "بلاغ خاطئ",

  // RTA's verified findings — their wording.
  "Valid Complaint - Guilty": "شكوى صحيحة - مذنب",
  "Valid Complaint - Not Guilty": "شكوى صحيحة - غير مذنب",
  "Essential Information Missing": "معلومات أساسية ناقصة",
  "Potential Match Found": "تمت المطابقة بمعثور",

  // RTA's Action Taken.
  "Verbal Warning": "تنبيه شفهي",
  "Driver Fine": "مخالفة على السائق",
  "Fine & Suspension": "مخالفة وإيقاف",
  "Not guilty": "غير مذنب",
  Termination: "إنهاء الخدمة",

  Complaint: "شكوى",
  "Lost Item": "مفقودات",

  Taxi: "تاكسي",
  "Public Bus": "حافلة عامة",
  "School Bus": "حافلة مدرسية",
  "Limousine and e-Hail": "ليموزين والحجز الذكي",
  Rental: "التأجير",
  Marine: "النقل البحري",
  "All Modes": "كل الوسائل",

  // Reason groupings.
  "Driver Conduct": "سلوك السائق",
  Driving: "القيادة",
  "Fare and Service": "الأجرة والخدمة",

  // RTA's Origin.
  Chatbot: "المحادثة الآلية",
  Phone: "الهاتف",
  "E-mail": "البريد الإلكتروني",
  "Walk-in": "حضور شخصي",

  // RTA's Reason / Purpose.
  "Verbal Assault": "اعتداء لفظي",
  "Physical Assault": "اعتداء جسدي",
  "Verbal Harassment": "تحرش لفظي",
  "Physical Harassment": "تحرش جسدي",
  "Staff Conduct": "سلوك الموظف",
  "Reckless driving": "قيادة متهورة",
  "Extending Route To Increase Fare": "إطالة المسار لزيادة الأجرة",
  "Refusal of Pick-up": "رفض إقلال الراكب",
  "Lost Item Investigation": "التحقيق في المفقودات",

  // Operators (Touchpoint).
  Kabi: "كابي",
  "Arabia Taxi": "أرابيا تاكسي",
  DTC: "مؤسسة تاكسي دبي",
  "National Taxi": "ناشيونال تاكسي",

  // Satisfaction.
  Satisfied: "راضٍ",
  Neutral: "محايد",
  "Very Dissatisfied": "غير راضٍ إطلاقاً",
  "Called Customer - No Reply": "تم الاتصال بالعميل ولم يرد",

  // Investigation method.
  "Via Camera": "عبر الكاميرا",
  "Face to Face & Camera": "مقابلة شخصية والكاميرا",
}
