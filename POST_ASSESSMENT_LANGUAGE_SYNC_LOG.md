   # Post-Assessment Question Synchronization Log: Bangla & Tamil Resolution

## Executive Summary

- **Issue Reported:** On the Web Admin, questions (MCQ, SCQ, Drop Bucket, and Match Making) are assigned to modules in English and then propagated to translated modules (Hindi, Bangla, Tamil). While English and Hindi post-assessments on mobile were synchronized with Web (showing 2 MCQ, 3 SCQ, 2 DB, 1 MM), Bangla and Tamil showed fewer questions than assigned on Web (only 1 MCQ and 1 SCQ, missing 1 MCQ and 2 SCQs).
- **Resolution:** The mobile assessment resolver logic (`Backend/app/modules/mobile/assessment/ref_resolver.py` and `Backend/app/modules/mobile/assessment/question_repository.py`) was updated to establish the canonical **base module's post-assessment container** as the single source of truth across all language variants, matching the Web Admin's architecture.
- **Outcome:** All languages (English, Hindi, Bangla, Tamil) now show 100% question count and content parity across all module groups in the LMS.

---

## 1. Root Cause Analysis

### Web Admin Architecture
In the Web LMS backend (`Backend/app/modules/module/repository.py`), the function `get_post_assessments_by_module` explicitly states:
```python
# Always operate on the base module so every language version of the
# module shares one assessment container / set of assigned questions.
module_id = ModuleRepository._resolve_base_module_id(db, module_id)
```
- Regardless of whether the administrator selects Module 18 (English), Module 19 (Hindi), Module 20 (Bangla), or Module 21 (Tamil), the Web Admin resolves to **Module 18** (the canonical base module).
- The Web Admin manages questions under the primary container: `PostSessionAssessment(assessment_id=55)`.
- When questions are assigned, active mapping rows are stored under container `55` with `assessment_ref_id` pointing to the canonical English question IDs (`MCQ 34, 58`, `SCQ 3, 12, 111`, `DB 13, 17`, `MM 45`).
- On Web, translations are displayed by matching `parent_id` across language variants using `ModuleService._is_checked_across_langs()`.

### Mobile Backend Flaw
In `Backend/app/modules/mobile/assessment/ref_resolver.py`:
```python
def ref_ids(db: Session, module_id: int, assessment_type: str):
    ids = _mapped_refs(db, [module_id], assessment_type)
    if ids:
        return ids, False
    base = _base_module(db, module_id)
    if base is not None and base != module_id:
        ids = _mapped_refs(db, [base], assessment_type)
        if ids:
            return ids, True
    ...
```

### Why Hindi and English Worked:
1. **Module 18 (English):**
   `module_id = 18` is the base module. It read its own primary container (`PSA 55`), which holds the full set of newly assigned questions.
2. **Module 19 (Hindi):**
   Module 19 has **no** `PostSessionAssessment` record in the database. `_mapped_refs(db, [19], "MCQ")` returned `[]`. It fell through to `base` (Module 18), borrowed all questions from container `55` (`borrowed = True`), and `in_language()` translated them to Hindi.

### Why Bangla and Tamil Failed:
1. **Module 20 (Bangla) & Module 21 (Tamil):**
   During legacy migrations or earlier database operations, independent containers were created directly under modules 20 and 21:
   - Module 20: `PostSessionAssessment(assessment_id=56)` (created 2026-06-20)
   - Module 21: `PostSessionAssessment(assessment_id=57)` (created 2026-06-20)
2. **The Stale Container Trap:**
   - Container `56` only contained 1 legacy MCQ (`ref_id=60`) and 1 legacy SCQ (`ref_id=113`).
   - Container `57` only contained 1 legacy MCQ (`ref_id=61`) and 1 legacy SCQ (`ref_id=114`).
   - Neither container had any Drop Bucket (DB) or Match Making (MM) mappings.
3. **The Resulting Behavior:**
   - When Mobile called `ref_ids(db, 20, "MCQ")`, `_mapped_refs(db, [20], "MCQ")` queried container `56` directly.
   - Because `ids` was not empty (`[60]`), `ref_ids` returned `([60], False)` immediately, **completely ignoring the base module where 2 MCQs are assigned**.
   - For SCQ, `ids` was `[113]`, returning only 1 SCQ instead of the 3 active SCQs on the base module.
   - For DB and MM, container `56` had 0 mappings (`ids = []`). Because `ids` was empty, `ref_ids` fell back to base module 18 and borrowed the 2 DB and 1 MM questions.
   - Hence, DB and MM appeared synchronized, but MCQ and SCQ were frozen to the stale legacy mappings.

---

## 2. Changes Implemented

### 1. `Backend/app/modules/mobile/assessment/ref_resolver.py`
Updated `ref_ids()` to prioritize the canonical base module:
- If the canonical `base` module exists and has an active post-session assessment container (`_primary_assessment_id(db, base)` is not None), its configuration is authoritative for all language variants in the family.
- It pulls question refs from the base container and returns `borrowed = (module_id != base)`.
- Sibling/translation modules with legacy or stale assessment containers (such as PSA 56 and PSA 57) are bypassed.
- If the base module does not have an assessment container, fallback to the module itself or sibling translations is preserved.

### 2. `Backend/app/modules/mobile/assessment/question_repository.py`
In `mcq_questions`, `scq_questions`, `drop_bucket_questions`, and `match_questions`:
- Updated translation check from `if borrowed:` to `if borrowed or language_id != 1:`.
- Guarantees that questions are translated to the participant's requested language even if a request supplies the base module ID.

---

## 3. Verification & Parity Matrix

### Module 18 Family ("Permanent License") - Before vs After

| Language | Module ID | Type | Web Admin Count | Before Fix (Mobile) | After Fix (Mobile) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **English** | 18 | MCQ / SCQ / DB / MM | 2 / 3 / 2 / 1 (Total: 8) | 2 / 3 / 2 / 1 (Total: 8) | 2 / 3 / 2 / 1 (Total: 8) | **PASS** |
| **Hindi** | 19 | MCQ / SCQ / DB / MM | 2 / 3 / 2 / 1 (Total: 8) | 2 / 3 / 2 / 1 (Total: 8) | 2 / 3 / 2 / 1 (Total: 8) | **PASS** |
| **Bangla** | 20 | MCQ / SCQ / DB / MM | 2 / 3 / 2 / 1 (Total: 8) | 1 / 1 / 2 / 1 (Total: 5) | **2 / 3 / 2 / 1 (Total: 8)** | **PASS** |
| **Tamil** | 21 | MCQ / SCQ / DB / MM | 2 / 3 / 2 / 1 (Total: 8) | 1 / 1 / 2 / 1 (Total: 5) | **2 / 3 / 2 / 1 (Total: 8)** | **PASS** |

### Question Details for Module 20 (Bangla) on Mobile:
1. **[MCQ] ID 40:** "একজন মহিলার কাছে মোবাইল ফোন আছে, কিন্তু তার স্বামী..." (4 options) - Translated from English MCQ 34
2. **[MCQ] ID 60:** "স্থায়ী ড্রাইভিং লাইসেন্স (PL) পরীক্ষার আগে গাড়ি চালানোর..." (4 options) - Translated from English MCQ 58
3. **[SCQ] ID 5:** "লাল ট্রাফিক সিগন্যাল কী নির্দেশ করে?..." (4 options) - Translated from English SCQ 3
4. **[SCQ] ID 21:** "একটি জরুরি অবস্থার সময় কোন বাক্যটি সবচেয়ে ভালো?..." (4 options) - Translated from English SCQ 12
5. **[SCQ] ID 113:** "মোড় নেওয়ার প্রস্তুতির সময় প্রথম পদক্ষেপ কী?..." (4 options) - Translated from English SCQ 111
6. **[DB] ID 15:** "কাজগুলিকে সঠিক বালতিতে রাখুন..." (2 buckets, 6 draggable items) - Translated from English DB 13
7. **[DB] ID 19:** "কাজগুলিকে সঠিক বালতিতে রাখুন..." (2 buckets, 6 draggable items) - Translated from English DB 17
8. **[MM] ID 47:** "যোগাযোগ প্রক্রিয়ার উপাদানগুলিকে মিল করুন..." (4 left items, 4 right items) - Translated from English MM 45

### Question Details for Module 21 (Tamil) on Mobile:
1. **[MCQ] ID 41:** "ஒரு பெண்ணிடம் மொபைல் போன் உள்ளது, ஆனால் அவள் கணவர்..." (4 options) - Translated from English MCQ 34
2. **[MCQ] ID 61:** "நிரந்தர ஓட்டுநர் உரிமம் (PL) தேர்வுக்கு முன் காரைத் தொடங்குவதற்கு..." (4 options) - Translated from English MCQ 58
3. **[SCQ] ID 6:** "சிவப்பு போக்குவரத்து சிக்னல் என்னைக் குறிக்கிறது?..." (4 options) - Translated from English SCQ 3
4. **[SCQ] ID 22:** "அவசர காலத்தின் போது எந்த வாக்கியம் சிறந்தது?..." (4 options) - Translated from English SCQ 12
5. **[SCQ] ID 114:** "ஒரு திருப்பத்தை எடுக்கத் தயாராகும்போது முதலில் செய்ய வேண்டிய படி என்ன?..." (4 options) - Translated from English SCQ 111
6. **[DB] ID 16:** "செயல்களை சரியான பக்கெட்டுகளில் வைக்கவும்..." (2 buckets, 6 draggable items) - Translated from English DB 13
7. **[DB] ID 20:** "செயல்களை சரியான பக்கெட்டுகளில் வைக்கவும்..." (2 buckets, 6 draggable items) - Translated from English DB 17
8. **[MM] ID 48:** "தகவல் தொடர்பு செயல்முறையின் கூறுகளை பொருத்துக..." (4 left items, 4 right items) - Translated from English MM 45

---

## 4. Full Database Verification Summary

Every module group in the database was evaluated across English, Hindi, Bangla, and Tamil:

| Base Module ID | Module Title | Base Questions | English | Hindi | Bangla | Tamil | Parity Status |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | Learning License | 2 MCQ | 2 | 2 | 2 | 2 | **100% MATCH** |
| **5** | On-road Module | 1 MCQ | 1 | 1 | 1 | 1 | **100% MATCH** |
| **9** | Gender & Patriarchy | 1 MCQ | 1 | 1 | 1 | 1 | **100% MATCH** |
| **13** | Spoken English | 1 MCQ, 1 SCQ, 1 DB, 1 MM | 4 | 4 | 4 | 4 | **100% MATCH** |
| **18** | Permanent License | 2 MCQ, 3 SCQ, 2 DB, 1 MM | 8 | 8 | 8 | 8 | **100% MATCH** |
| **22** | Self Drive | 1 MCQ | 1 | 1 | 1 | 1 | **100% MATCH** |
| **26** | SRHR-Sexual and Reproductive Health | 1 MCQ, 1 SCQ, 1 DB, 1 MM | 4 | 4 | 4 | 4 | **100% MATCH** |
| **30** | Communication | 1 MCQ, 1 SCQ, 1 MM | 3 | 3 | 3 | 3 | **100% MATCH** |

All module groups across all languages now maintain 100% synchronization with the Web Admin.
