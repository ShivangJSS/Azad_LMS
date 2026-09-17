# Mobile Module Locking & Sequential Progression Changelog

This document logs all changes made to resolve the mobile app module locking issue.

---

## 1. Issue Summary & Root Cause Analysis

### Problem:
In the mobile application, all assigned modules for participants were displaying as **"लॉक किया गया" (Locked)** (as shown in the screenshot for Participant 128 / Geeta in "वुमेन विद व्हील्स", Technical track: both "लर्निंग लाइसेंस" and "ऑन-रोड मॉड्यूल" were locked). As a result, participants could not open or begin learning in any module.

### User Requirements:
1. **First module must ALWAYS be opened** (active/unlocked) for every participant in their assigned module tracks.
2. **All subsequent modules must be locked initially**.
3. **Passing the post-assessment (score $\ge 70\%$) of the current module must unlock the next module**. If the assessment is failed, the next module must remain locked.

### Root Causes Identified:
1. **Module Creation Defaults to Locked (`lock_status = 0`):**
   When participants are assigned modules in `create_participant_module`, `lock_status` was hardcoded to `0` for all modules, including the first one.
2. **Mobile Module Listing Did Not Enforce Active State:**
   `MobileModuleService.list_modules` directly mapped whatever integer was in `participant_module.lock_status` without ensuring the first module of a track is always accessible.
3. **Module Progression Missing Track/Type Scoping:**
   In `progress.complete_and_unlock`, modules were sorted globally by `parent_id` across both Technical and Non-Technical tracks, rather than unlocking the next module within the participant's current curriculum track (`module_type`).
4. **Existing Database Data Inconsistencies:**
   Existing participant records in PostgreSQL had all modules initialized with `lock_status = 0`, locking out existing participants.

---

## 2. Business Rules Implemented

| Rule | Description | Status Mapping |
| :--- | :--- | :--- |
| **First Module Rule** | The first module of each track (e.g. Technical, Non-Technical) is **always unlocked**. If not already completed, it is marked as `active` (`lock_status = 1`). It can never be `locked`. | `status = "active"`, `is_locked = false` |
| **Subsequent Modules Rule** | Module $N$ ($N > 1$) remains strictly **locked** until Module $N-1$ has been marked as `completed` (`lock_status = 2`). | `status = "locked"`, `is_locked = true` |
| **Post-Assessment Pass** | When a participant scores $\ge 70\%$ (`PASS_PERCENTAGE`) on the post-assessment, Module $N$ transitions to `completed` and Module $N+1$ in that track unlocks to `active`. | Next: `status = "active"`, `is_locked = false` |
| **Post-Assessment Fail** | When a participant scores $< 70\%$, Module $N$ remains `active` and Module $N+1$ remains `locked`. | Next: `status = "locked"`, `is_locked = true` |
| **Cross-Language Sync** | Progression updates are applied to all language variants of the module group (`parent_id`), so switching between Hindi, English, Bengali, or Tamil preserves identical progress. | Synchronized across all variants |

---

## 3. Detailed File Modifications

### File 1: `Backend/app/modules/mobile/module/service.py`
- **Location:** `MobileModuleService.list_modules`
- **Changes Made:**
  - Grouped participant modules by `module_type` (Technical vs Non-Technical).
  - Enforced that the 1st module of each track is always `ACTIVE` or `COMPLETED`. If stored as `0` (`LOCKED`) in the database, it is automatically updated to `1` (`ACTIVE`) in `participant_module` and committed.
  - Enforced that for module index $i > 0$, the module is only unlocked if module $i - 1$ has status `COMPLETED`. If the previous module is not completed, module $i$ is strictly forced to `LOCKED` (both in the API response and synced to the database).
  - Accurate `completed` count returned in `ModuleListResponse`.

### File 2: `Backend/app/modules/mobile/assessment/progress.py`
- **Location:** `complete_and_unlock`
- **Changes Made:**
  - Determined the `module_type` and `language_id` of the completed module.
  - Passed `module_type` to `AnswerRepository.list_participant_module_groups` so that unlocking only opens the next module within the **same track/type**.
  - Localized `next_module_id` and `next_module_name` to return the participant's active language variant (e.g. returning Module ID 6 and "ऑन-रोड मॉड्यूल" for Hindi rather than English fallback).

### File 3: `Backend/app/modules/mobile/assessment/answer_repository.py`
- **Location:** `AnswerRepository.list_participant_module_groups`
- **Changes Made:**
  - Added optional `module_type: Optional[str] = None` parameter to `list_participant_module_groups`.
  - Added filter `cast(ModuleMaster.module_type, String) == str(module_type)` when specified to preserve curriculum ordering per track.

### File 4: `Backend/app/modules/mobile/assessment/service.py`
- **Location:** `AssessmentService._require_open_module`
- **Changes Made:**
  - Updated validation guard: If the participant module being accessed/submitted has `lock_status == LOCK_STATUS_LOCKED` but is the first module in its track, it is auto-activated (`lock_status = 1`) in the database and allowed to proceed, preventing false `403 Forbidden ("Complete the previous module first")` errors.

### File 5: `Backend/app/modules/users/service.py`
- **Location:** `UserService.assign_module`
- **Changes Made:**
  - When assigning a module to a participant, checked whether the module is the first in its track (`parent_id == first_in_track`).
  - Passed `lock_status = 1` for the first module and `0` for subsequent modules upon initial assignment.
  - If existing records are updated and the module is the first in its track with `lock_status == 0`, it is updated to `1`.

### File 6: `Backend/app/modules/users/repository.py`
- **Location:** `UserRepository.create_participant_module`
- **Changes Made:**
  - Extended method signature to `create_participant_module(self, participant_id, course_id, module_id, lock_status: int = 0)`.
  - Stored the provided `lock_status` instead of hardcoding `0`.

---

## 4. Database Data Synchronization

A database synchronization script was executed across the existing PostgreSQL database (`azadlms_dev_db`):
- **Participants Synchronized:** 80 participants
- **Before:** `lock_status` counts: Locked (0): 2,120 | Active (1): 228 | Completed (2): 188
- **After:** `lock_status` counts: Locked (0): 1,736 | Active (1): 612 | Completed (2): 188
- **Result:** Existing participants (including Participant 128 / Geeta from the screenshot) now immediately have their first module unlocked in all tracks.

---

## 5. Verification Results

### Test Case 1: Participant 128 (Geeta) - Technical Track (Hindi)
- **API Call:** `MobileModuleService.list_modules(db, participant_id=128, language_id=2, module_type=1)`
- **Output:**
  - Total Modules: 2, Completed: 0
  - **Module 2 (लर्निंग लाइसेंस):** `status: "active"`, `is_locked: false` (OPENED)
  - **Module 6 (ऑन-रोड मॉड्यूल):** `status: "locked"`, `is_locked: true` (LOCKED)

### Test Case 2: Post-Assessment Pass Simulation
- **Action:** Simulated passing post-assessment for Module 2.
- **Output:**
  - Module 2 marked as `COMPLETED`.
  - Next Module 6 ("ऑन-रोड मॉड्यूल") automatically unlocked to `ACTIVE`.
  - Response: `completed=True, next_id=6, next_name="ऑन-रोड मॉड्यूल"`.

### Test Case 3: Participant 119 (Khushi) - Multi-Track Verification
- **Technical Track (`module_type = 1`):**
  - Module 2 (लर्निंग लाइसेंस): `status: "active"`, `is_locked: false`
  - Module 6, 19, 23: `status: "locked"`, `is_locked: true`
- **Non-Technical Track (`module_type = 2`):**
  - Module 10 (जेंडर और पितृसत्ता): `status: "active"`, `is_locked: false`
  - Module 14, 27, 31: `status: "locked"`, `is_locked: true`
