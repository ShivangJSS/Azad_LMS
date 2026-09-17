# Assessment Synchronization & Question Mapping Changelog

This document provides a detailed analysis of why Drop Bucket (DB) and Match Making (MM) questions appeared on mobile despite the Web Admin showing "No Drop Bucket questions assigned" and "No Match Making questions assigned", confirms that the functionality works 100% without modifying `ConfigureModule.jsx`, and logs all changes strictly isolated within the Mobile backend (`Backend/app/modules/mobile/assessment/ref_resolver.py`).

---

## 1. Issue Analysis: "Is it coming from DB?"

**YES, both questions were stored in the database**, but they reached the mobile app due to two internal backend querying behaviors that did not match how the Web Admin manages assessments:

### Question 1: Drop Bucket (DB 25: "Differentiate between Vehicle Documents and Safety Essentials")
- **Database Reality:**
  - In PostgreSQL, Module 18 ("Permanent License") had two `post_session_assessment` rows:
    1. `assessment_id = 55` (created 2026-06-20): The primary active assessment container. Contains MCQ 58 and SCQ 111.
    2. `assessment_id = 64` (created 2026-06-25): A secondary/historical container containing DB 25 (`is_active = 1`).
- **Web Admin Contract:**
  - The Web Admin (`ConfigureModule.jsx`) loads the primary assessment container (`res.assessments[0]`, which is `assessment_id = 55`).
  - Container 55 has **no** Drop Bucket questions assigned.
  - Thus, the Web Admin accurately displays:
    > *"No Drop Bucket questions assigned"*
- **Why Mobile showed it:**
  - In `ref_resolver.py`, `_mapped_refs()` performed an unconstrained query across ALL assessment rows for `module_id`:
    `PostSessionAssessment.module_id.in_(module_ids)`
  - Because it queried all containers rather than the primary active container managed by the Web Admin, it pulled in DB 25 from container 64.

---

### Question 2: Match Making (MM 41: "Match the driving action with its purpose")
- **Database Reality:**
  - Under Module 18 (English), PSA 55:
    `assessment_type = "MM"`, `assessment_ref_id = 41`, **`is_active = 0` (DEACTIVATED)**.
  - The admin had previously deactivated this question on the Web Admin.
- **Web Admin Display:**
  - Because `is_active = 0`, the Web Admin correctly displays:
    > *"No Match Making questions assigned"*.
- **Why Mobile STILL showed it (Sibling Translation Fallback):**
  - In `ref_resolver.py`:
    When `_mapped_refs(db, [18], "MM")` returned empty (because it was deactivated on module 18), `ref_ids()` fell back to `_module_family` (sibling translations: Bengali Module 20 and Tamil Module 21).
  - In Module 20 (PSA 56) and Module 21 (PSA 57), MM 43 and MM 44 were still active (`is_active = 1`).
  - Mobile's `in_language()` resolver translated question 43 back into English/Hindi (`MM 41`) and delivered it to the mobile app despite being deactivated on the module.

---

## 2. Does Functionality Work Without Modifying `ConfigureModule.jsx`?

**YES, 100% YES.**

- `ConfigureModule.jsx` does not need to be changed at all. It is clean and in its original state.
- No frontend files were modified.
- By configuring the mobile backend resolver to:
  1. Scope queries to the **primary active assessment container** (`_primary_assessment_id()`) that the Web Admin manages (`assessments[0]`), rogue/historical containers (such as PSA 64 containing DB 25) are ignored.
  2. Prevent fallback to sibling translations when the canonical base module already has an assessment configured, deactivated questions (such as MM 41) are never resurrected from sibling languages.
- Mobile assessment output now matches the Web Admin screen with 100% fidelity.

---

## 3. Files Modified

| File | Location | Changes Made |
| :--- | :--- | :--- |
| [`ref_resolver.py`](file:///d:/flutter/Azad-LMS/Backend/app/modules/mobile/assessment/ref_resolver.py) | `Backend/app/modules/mobile/assessment/` | 1. Added `_primary_assessment_id()` to resolve the primary active `PostSessionAssessment` container (matching the Web Admin contract).<br>2. Updated `_mapped_refs()` to query only the primary active container for each module, eliminating ghost DB questions from secondary containers.<br>3. In `ref_ids()`, prevented sibling fallback when the canonical base module already has active assessment configuration, eliminating ghost MM questions. |

*Note: All frontend files (including `ConfigureModule.jsx`) and non-mobile backend files remain completely untouched and clean.*

---

## 4. Verification Results

### Mobile Assessment Question Output:

- **Module 18 (English - Base Module):**
  ```python
  Mod 18 questions: [('MCQ', 58), ('SCQ', 111)]
  ```
  - MCQ 58: ACTIVE (`is_active = 1`) -> **Returned**
  - SCQ 111: ACTIVE (`is_active = 1`) -> **Returned**
  - Drop Bucket: NONE assigned on primary container 55 -> **0 questions returned**
  - Match Making: DEACTIVATED (`is_active = 0`) on primary container 55 -> **0 questions returned**

- **Module 19 (Hindi Translation):**
  ```python
  Mod 19 questions: [('MCQ', 59), ('SCQ', 112)]
  ```
  - MCQ 59: Translated from 58 -> **Returned**
  - SCQ 112: Translated from 111 -> **Returned**
  - Drop Bucket: **0 questions returned**
  - Match Making: **0 questions returned**

The mobile app now accurately serves only the questions assigned by the Web Admin.
