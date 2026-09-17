"""
Definition of the full trainee feedback form across multiple languages.

The questionnaire is not stored in the database — only the answers are, one
column per question on participant_feedback. Keeping the definitions here lets
the app render the form without hard-coding it, so both sides stay in step.

Supported Languages:
1 = English
2 = Hindi (हिन्दी)
3 = Bangla (বাংলা)
4 = Tamil (தமிழ்)
"""

from typing import Any, Dict, List

# ---------------------------------------------------------------------------
# Option Sets by Language
# ---------------------------------------------------------------------------

RATING_BY_LANG: Dict[int, List[str]] = {
    1: ["Excellent", "Good", "Average", "Poor"],
    2: ["उत्कृष्ट", "अच्छा", "औसत", "खराब"],
    3: ["চমৎকার", "ভালো", "মোটামুটি", "খারাপ"],
    4: ["மிகச் சிறந்தது", "நல்லது", "சராசரி", "மோசம்"],
}

YES_NO_BY_LANG: Dict[int, List[str]] = {
    1: ["Yes", "Somewhat", "No"],
    2: ["हाँ", "कुछ हद तक", "नहीं"],
    3: ["হ্যাঁ", "কিছুটা", "না"],
    4: ["ஆம்", "ஓரளவு", "இல்லை"],
}

CONFIDENCE_AREAS_BY_LANG: Dict[int, List[str]] = {
    1: [
        "Traffic rules",
        "Vehicle handling",
        "Road safety",
        "Communication",
        "Self confidence",
    ],
    2: [
        "यातायात नियम",
        "वाहन संचालन",
        "सड़क सुरक्षा",
        "बातचीत / संवाद",
        "आत्मविश्वास",
    ],
    3: [
        "ট্রাফিক নিয়ম",
        "গাড়ি চালানো / হ্যান্ডলিং",
        "সড়ক নিরাপত্তা",
        "যোগাযোগ",
        "আত্মবিশ্বাস",
    ],
    4: [
        "போக்குவரத்து விதிகள்",
        "வாகனம் கையாளுதல்",
        "சாலை பாதுகாப்பு",
        "தகவல் தொடர்பு",
        "தன்னம்பிக்கை",
    ],
}

HELPFUL_CONTENT_BY_LANG: Dict[int, List[str]] = {
    1: ["Videos", "PDFs", "Presentations", "Assessments"],
    2: ["वीडियो", "पीडीएफ", "प्रस्तुतियाँ", "मूल्यांकन"],
    3: ["ভিডিও", "পিডিএফ", "প্রেজেন্টেশন", "মূল্যায়ন"],
    4: ["வீடியோக்கள்", "PDFகள்", "விளக்கக்காட்சிகள்", "மதிப்பீடுகள்"],
}


# ---------------------------------------------------------------------------
# Form Definitions by Language (Field names match ParticipantFeedback columns)
# ---------------------------------------------------------------------------

FEEDBACK_FORMS_BY_LANGUAGE: Dict[int, List[Dict[str, Any]]] = {
    # 1: English
    1: [
        {
            "field": "visual_material",
            "question": "How useful were the videos and visual material?",
            "type": "single",
            "options": RATING_BY_LANG[1],
        },
        {
            "field": "reading_material",
            "question": "How useful were the PDFs and reading material?",
            "type": "single",
            "options": RATING_BY_LANG[1],
        },
        {
            "field": "assessment_help",
            "question": "Did the assessments help you understand the modules?",
            "type": "single",
            "options": YES_NO_BY_LANG[1],
        },
        {
            "field": "confidence_areas",
            "question": "Which areas do you feel more confident in now?",
            "type": "multiple",
            "options": CONFIDENCE_AREAS_BY_LANG[1],
        },
        {
            "field": "work_preparedness",
            "question": "Do you feel prepared to work as a driver?",
            "type": "single",
            "options": YES_NO_BY_LANG[1],
        },
        {
            "field": "challenges",
            "question": "What challenges did you face while learning?",
            "type": "text",
            "options": [],
        },
        {
            "field": "helpful_content",
            "question": "Which content type helped you the most?",
            "type": "single",
            "options": HELPFUL_CONTENT_BY_LANG[1],
        },
        {
            "field": "like_most",
            "question": "What did you like most about the training?",
            "type": "text",
            "options": [],
        },
        {
            "field": "improve_lms",
            "question": "What would you improve about the app?",
            "type": "text",
            "options": [],
        },
        {
            "field": "recommend",
            "question": "Would you recommend this training to others?",
            "type": "single",
            "options": YES_NO_BY_LANG[1],
        },
    ],
    # 2: Hindi (हिन्दी)
    2: [
        {
            "field": "visual_material",
            "question": "वीडियो और दृश्य सामग्री आपके लिए कितनी उपयोगी थी?",
            "type": "single",
            "options": RATING_BY_LANG[2],
        },
        {
            "field": "reading_material",
            "question": "पीडीएफ और पढ़ने की सामग्री आपके लिए कितनी उपयोगी थी?",
            "type": "single",
            "options": RATING_BY_LANG[2],
        },
        {
            "field": "assessment_help",
            "question": "क्या मूल्यांकनों से आपको मॉड्यूल को समझने में मदद मिली?",
            "type": "single",
            "options": YES_NO_BY_LANG[2],
        },
        {
            "field": "confidence_areas",
            "question": "अब आप किन क्षेत्रों में अधिक आत्मविश्वासी महसूस करते हैं?",
            "type": "multiple",
            "options": CONFIDENCE_AREAS_BY_LANG[2],
        },
        {
            "field": "work_preparedness",
            "question": "क्या आप ड्राइवर के रूप में काम करने के लिए तैयार महसूस करते हैं?",
            "type": "single",
            "options": YES_NO_BY_LANG[2],
        },
        {
            "field": "challenges",
            "question": "सीखते समय आपको किन चुनौतियों का सामना करना पड़ा?",
            "type": "text",
            "options": [],
        },
        {
            "field": "helpful_content",
            "question": "किस प्रकार की सामग्री ने आपकी सबसे अधिक मदद की?",
            "type": "single",
            "options": HELPFUL_CONTENT_BY_LANG[2],
        },
        {
            "field": "like_most",
            "question": "प्रशिक्षण में आपको सबसे अच्छा क्या लगा?",
            "type": "text",
            "options": [],
        },
        {
            "field": "improve_lms",
            "question": "ऐप में आप क्या सुधार करना चाहेंगे?",
            "type": "text",
            "options": [],
        },
        {
            "field": "recommend",
            "question": "क्या आप दूसरों को इस प्रशिक्षण की सिफारिश करेंगे?",
            "type": "single",
            "options": YES_NO_BY_LANG[2],
        },
    ],
    # 3: Bangla (বাংলা)
    3: [
        {
            "field": "visual_material",
            "question": "ভিডিও এবং ভিজ্যুয়াল উপকরণগুলি আপনার জন্য কতটা কার্যকর ছিল?",
            "type": "single",
            "options": RATING_BY_LANG[3],
        },
        {
            "field": "reading_material",
            "question": "পিডিএফ এবং পড়ার উপকরণগুলি আপনার জন্য কতটা কার্যকর ছিল?",
            "type": "single",
            "options": RATING_BY_LANG[3],
        },
        {
            "field": "assessment_help",
            "question": "মূল্যায়নগুলি কি আপনাকে মডিউলগুলি বুঝতে সাহায্য করেছে?",
            "type": "single",
            "options": YES_NO_BY_LANG[3],
        },
        {
            "field": "confidence_areas",
            "question": "এখন আপনি কোন কোন ক্ষেত্রে বেশি আত্মবিশ্বাসী বোধ করছেন?",
            "type": "multiple",
            "options": CONFIDENCE_AREAS_BY_LANG[3],
        },
        {
            "field": "work_preparedness",
            "question": "আপনি কি চালক হিসেবে কাজ করার জন্য প্রস্তুত বোধ করছেন?",
            "type": "single",
            "options": YES_NO_BY_LANG[3],
        },
        {
            "field": "challenges",
            "question": "শেখার সময় আপনি কী কী চ্যালেঞ্জের মুখোমুখি হয়েছিলেন?",
            "type": "text",
            "options": [],
        },
        {
            "field": "helpful_content",
            "question": "কোন ধরনের বিষয়বস্তু আপনাকে সবচেয়ে বেশি সাহায্য করেছে?",
            "type": "single",
            "options": HELPFUL_CONTENT_BY_LANG[3],
        },
        {
            "field": "like_most",
            "question": "প্রশিক্ষণের কোন বিষয়টি আপনার সবচেয়ে ভালো লেগেছে?",
            "type": "text",
            "options": [],
        },
        {
            "field": "improve_lms",
            "question": "অ্যাপটিতে আপনি কী উন্নতি দেখতে চান?",
            "type": "text",
            "options": [],
        },
        {
            "field": "recommend",
            "question": "আপনি কি অন্যদের এই প্রশিক্ষণের সুপারিশ করবেন?",
            "type": "single",
            "options": YES_NO_BY_LANG[3],
        },
    ],
    # 4: Tamil (தமிழ்)
    4: [
        {
            "field": "visual_material",
            "question": "வீடியோக்கள் மற்றும் காட்சிப் பொருட்கள் உங்களுக்கு எவ்வளவு பயனுள்ளதாக இருந்தன?",
            "type": "single",
            "options": RATING_BY_LANG[4],
        },
        {
            "field": "reading_material",
            "question": "PDFகள் மற்றும் வாசிப்புப் பொருட்கள் உங்களுக்கு எவ்வளவு பயனுள்ளதாக இருந்தன?",
            "type": "single",
            "options": RATING_BY_LANG[4],
        },
        {
            "field": "assessment_help",
            "question": "தொகுதிகளைப் புரிந்து கொள்ள மதிப்பீடுகள் உங்களுக்கு உதவினவா?",
            "type": "single",
            "options": YES_NO_BY_LANG[4],
        },
        {
            "field": "confidence_areas",
            "question": "இப்போது எந்தப் பகுதிகளில் நீங்கள் அதிக நம்பிக்கையுடன் உணர்கிறீர்கள்?",
            "type": "multiple",
            "options": CONFIDENCE_AREAS_BY_LANG[4],
        },
        {
            "field": "work_preparedness",
            "question": "ஒரு ஓட்டுநராகப் பணியாற்ற நீங்கள் தயாராக இருப்பதாக உணர்கிறீர்களா?",
            "type": "single",
            "options": YES_NO_BY_LANG[4],
        },
        {
            "field": "challenges",
            "question": "கற்றலின் போது நீங்கள் என்ன சவால்களை எதிர்கொண்டீர்கள்?",
            "type": "text",
            "options": [],
        },
        {
            "field": "helpful_content",
            "question": "எந்த வகையான உள்ளடக்கம் உங்களுக்கு மிகவும் உதவியாக இருந்தது?",
            "type": "single",
            "options": HELPFUL_CONTENT_BY_LANG[4],
        },
        {
            "field": "like_most",
            "question": "பயிற்சியில் உங்களுக்கு மிகவும் பிடித்தது எது?",
            "type": "text",
            "options": [],
        },
        {
            "field": "improve_lms",
            "question": "பயன்பாட்டில் நீங்கள் என்ன மேம்படுத்த விரும்புகிறீர்கள்?",
            "type": "text",
            "options": [],
        },
        {
            "field": "recommend",
            "question": "இந்தப் பயிற்சியை மற்றவர்களுக்குப் பரிந்துரைப்பீர்களா?",
            "type": "single",
            "options": YES_NO_BY_LANG[4],
        },
    ],
}


def get_feedback_form(language_id: int = 1) -> List[Dict[str, Any]]:
    """
    Returns the 10-question feedback form in the requested language.
    Defaults to English (language_id=1) if the provided id is not configured.
    """
    return FEEDBACK_FORMS_BY_LANGUAGE.get(
        language_id,
        FEEDBACK_FORMS_BY_LANGUAGE[1],
    )


# Backward compatibility default (English)
FEEDBACK_FORM = FEEDBACK_FORMS_BY_LANGUAGE[1]

# Columns the API is allowed to write, guarding against anything unexpected
# reaching the update.
TEXT_FIELDS = {item["field"] for item in FEEDBACK_FORMS_BY_LANGUAGE[1]}

MULTI_FIELDS = {
    item["field"]
    for item in FEEDBACK_FORMS_BY_LANGUAGE[1]
    if item["type"] == "multiple"
}
