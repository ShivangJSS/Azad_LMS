"""
Definition of the full trainee feedback form.

The questionnaire is not stored in the database — only the answers are, one
column per question on participant_feedback. Keeping the definition here lets
the app render the form without hard-coding it, so both sides stay in step.
"""

RATING = ["Excellent", "Good", "Average", "Poor"]
YES_NO = ["Yes", "Somewhat", "No"]

# field: the participant_feedback column the answer is written to.
FEEDBACK_FORM = [
    {
        "field": "visual_material",
        "question": "How useful were the videos and visual material?",
        "type": "single",
        "options": RATING,
    },
    {
        "field": "reading_material",
        "question": "How useful were the PDFs and reading material?",
        "type": "single",
        "options": RATING,
    },
    {
        "field": "assessment_help",
        "question": "Did the assessments help you understand the modules?",
        "type": "single",
        "options": YES_NO,
    },
    {
        "field": "confidence_areas",
        "question": "Which areas do you feel more confident in now?",
        "type": "multiple",
        "options": [
            "Traffic rules",
            "Vehicle handling",
            "Road safety",
            "Communication",
            "Self confidence",
        ],
    },
    {
        "field": "work_preparedness",
        "question": "Do you feel prepared to work as a driver?",
        "type": "single",
        "options": YES_NO,
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
        "options": ["Videos", "PDFs", "Presentations", "Assessments"],
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
        "options": YES_NO,
    },
]

# Columns the API is allowed to write, guarding against anything unexpected
# reaching the update.
TEXT_FIELDS = {item["field"] for item in FEEDBACK_FORM}

MULTI_FIELDS = {
    item["field"] for item in FEEDBACK_FORM if item["type"] == "multiple"
}
