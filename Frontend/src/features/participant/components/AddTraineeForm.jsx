import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { getParticipantImageUrl } from '@/shared/utils/mediaUrl';
import { validateImage, ASPECT_SQUARE } from '@/shared/utils/imageValidation';
import { sanitizeDigits } from '@/shared/utils/inputValidation';
import {
  getStates,
  getDistricts,
  getBlocks,
  getCentres,
  getBatches,
  getEnrollment,
  createParticipant,
  updateParticipant,
} from '@/features/participant/services/ParticipantService';

const BRAND = '#732269';

const FIELD =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-400';

function Label({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function FieldError({ message }) {
  return message ? <p className="mt-1 text-xs text-red-600" role="alert">{message}</p> : null;
}

function shortCode(name) {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function shortFy(fyYear) {
  if (!fyYear) return '';
  const [start, end] = fyYear.split('-');
  return `${start.slice(-2)}-${end}`;
}

const FIELD_LABELS = {
  state_id: 'State',
  district_id: 'District',
  block_id: 'Block',
  centre_id: 'Centre',
  batch_id: 'Batch',
  participant_name: 'Trainee Name',
  enrollment_no: 'Enrollment No',
  gender: 'Gender',
  age: 'Age',
  email: 'Email',
  username: 'Username',
  password: 'Password',
  mobile_no: 'Mobile No',
  pin: 'PIN Code',
  aadhaar_number: 'Aadhaar Number',
  location: 'Location',
  address: 'Address',
};

const REVIEW_FIELD_ORDER = Object.keys(FIELD_LABELS);

function extractErrorMessage(err) {
  const detail = err?.response?.data?.detail;

  if (!detail) return 'Could not create trainee. Please check the form and try again.';

  if (typeof detail === 'string') return detail;

  const formatItem = (item) => {
    if (typeof item === 'string') return item;
    const loc = Array.isArray(item?.loc) ? item.loc.join(' -> ') : item?.loc;
    return [loc, item?.msg].filter(Boolean).join(' : ') || JSON.stringify(item);
  };

  if (Array.isArray(detail)) {
    return detail.map(formatItem).join(', ');
  }

  // Single error object (not wrapped in an array).
  if (typeof detail === 'object') {
    return formatItem(detail);
  }

  return String(detail);
}

export default function AddTraineeForm({ mode = 'create', initialData = null, participantId = null }) {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState(() => ({
    state_id: initialData?.state_id ?? '',
    district_id: initialData?.district_id ?? '',
    block_id: initialData?.block_id ?? '',
    centre_id: initialData?.centre_id ?? '',
    batch_id: initialData?.batch_id ?? '',
    participant_name: initialData?.participant_name ?? '',
    enrollment_no: initialData?.enrollment_no ?? '',
    gender: initialData?.gender ?? '',
    age: initialData?.age ?? '',
    email: initialData?.email ?? '',
    username: initialData?.username ?? '',
    password: '',
    mobile_no: initialData?.mobile_no ?? '',
    pin: initialData?.pin ?? '',
    aadhaar_number: initialData?.aadhaar_number ?? '',
    location: initialData?.location ?? '',
    address: initialData?.address ?? '',
  }));

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [centres, setCentres] = useState([]);
  const [batches, setBatches] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState('');
  // Blob URL for instant preview of a freshly chosen file.
  const [imagePreview, setImagePreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Preview priority: a just-picked file, else the trainee's existing photo
  // (edit mode). Falls back to an initials avatar when neither exists.
  const existingImageUrl = getParticipantImageUrl(initialData?.image);
  const previewSrc = imagePreview || existingImageUrl;

  const [refreshingEnrollment, setRefreshingEnrollment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showReview, setShowReview] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    if (showReview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showReview]);

  // ---- load states once ----
  useEffect(() => {
    getStates().then(setStates).catch(() => setStates([]));
  }, []);

  // ---- cascading dropdowns ----
  useEffect(() => {
    if (!form.state_id) {
      setDistricts([]);
      return;
    }
    getDistricts(form.state_id).then(setDistricts).catch(() => setDistricts([]));
  }, [form.state_id]);

  useEffect(() => {
    if (!form.district_id) {
      setBlocks([]);
      return;
    }
    getBlocks(form.district_id).then(setBlocks).catch(() => setBlocks([]));
  }, [form.district_id]);

  useEffect(() => {
    if (!form.block_id) {
      setCentres([]);
      return;
    }
    getCentres(form.block_id).then(setCentres).catch(() => setCentres([]));
  }, [form.block_id]);

  useEffect(() => {
    if (!form.centre_id) {
      setBatches([]);
      return;
    }
    getBatches(form.centre_id).then(setBatches).catch(() => setBatches([]));
  }, [form.centre_id]);

  // ---- auto-build enrollment number ----
  // Create mode: generate a new sequence for the selected batch.
  // Edit mode: keep the OLD unique sequence and rebuild only the
  // state/district/fy/centre/batch parts.
  useEffect(() => {
    if (!form.state_id || !form.district_id || !form.centre_id || !form.batch_id) {
      return;
    }

    const state = states.find((s) => String(s.state_lgd_code) === String(form.state_id));
    const district = districts.find(
      (d) => String(d.district_lgd_code) === String(form.district_id)
    );
    const centre = centres.find((c) => String(c.centre_id) === String(form.centre_id));
    const batch = batches.find((b) => String(b.batch_id) === String(form.batch_id));

    if (!state || !district || !centre || !batch) return;

    let cancelled = false;

    async function buildEnrollmentNo() {
      setRefreshingEnrollment(true);

      try {
        let sequence = '';

        if (isEdit) {
          // IMPORTANT:
          // Never create a new unique sequence while editing.
          // Reuse the sequence from the original enrollment number.
          const oldEnrollment = String(initialData?.enrollment_no || '').trim();
          const oldParts = oldEnrollment.split('/');

          if (oldParts.length > 1) {
            sequence = oldParts[oldParts.length - 1];
          }
        } else {
          // Create mode gets the next sequence for the selected batch.
          const existing = await getEnrollment(form.batch_id).catch(() => []);
          sequence = String(
            (Array.isArray(existing) ? existing.length : 0) + 1
          );
        }

        // If an old enrollment number exists but its format is unexpected,
        // do not overwrite it with a newly generated unique number.
        if (isEdit && !sequence) {
          if (!cancelled) setRefreshingEnrollment(false);
          return;
        }

        const parts = [
          'WWW',
          shortCode(state.state_name),
          shortCode(district.district_name),
          shortFy(batch.fy_year),
          shortCode(centre.centre_name),
          batch.batch_name,
          sequence,
        ];

        if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            enrollment_no: parts.join('/'),
          }));
        }
      } finally {
        if (!cancelled) setRefreshingEnrollment(false);
      }
    }

    buildEnrollmentNo();

    return () => {
      cancelled = true;
    };
  }, [
    isEdit,
    initialData?.enrollment_no,
    form.state_id,
    form.district_id,
    form.centre_id,
    form.batch_id,
    states,
    districts,
    centres,
    batches,
  ]);

  // ---- handlers ----

  // For dropdown fields, show the selected option's visible label rather
  // than the raw id (mirrors the reference's readableValue() for <select>).
  const getReviewValue = (key) => {
    switch (key) {
      case 'state_id':
        return states.find((s) => String(s.state_lgd_code) === String(form.state_id))?.state_name || '';
      case 'district_id':
        return districts.find((d) => String(d.district_lgd_code) === String(form.district_id))?.district_name || '';
      case 'block_id':
        return blocks.find((b) => String(b.block_lgd_code) === String(form.block_id))?.block_name || '';
      case 'centre_id':
        return centres.find((c) => String(c.centre_id) === String(form.centre_id))?.centre_name || '';
      case 'batch_id':
        return batches.find((b) => String(b.batch_id) === String(form.batch_id))?.batch_name || '';
      case 'password':
        return form.password ? '•'.repeat(form.password.length) : '';
      default:
        return form[key] ?? '';
    }
  };

  // Numeric fields accept digits only (capped to their max length), so
  // letters/symbols can't be typed into age/mobile/PIN/Aadhaar at all.
  const NUMERIC_FIELDS = {
    age: 3,
    mobile_no: 10,
    pin: 6,
    aadhaar_number: 12,
  };

  const handleChange = (key) => (e) => {
    const value = Object.prototype.hasOwnProperty.call(NUMERIC_FIELDS, key)
      ? sanitizeDigits(e.target.value, NUMERIC_FIELDS[key])
      : e.target.value;
    setValidationErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // clear dependent fields when a parent selection changes
      if (key === 'state_id') {
        next.district_id = '';
        next.block_id = '';
        next.centre_id = '';
        next.batch_id = '';
        // Do not clear enrollment_no in edit mode.
        // It will be regenerated with the same unique sequence once
        // the new cascading selections are completed.
        if (!isEdit) next.enrollment_no = '';
      } else if (key === 'district_id') {
        next.block_id = '';
        next.centre_id = '';
        next.batch_id = '';
        if (!isEdit) next.enrollment_no = '';
      } else if (key === 'block_id') {
        next.centre_id = '';
        next.batch_id = '';
        if (!isEdit) next.enrollment_no = '';
      } else if (key === 'centre_id') {
        next.batch_id = '';
        if (!isEdit) next.enrollment_no = '';
      } else if (key === 'batch_id') {
        if (!isEdit) next.enrollment_no = '';
      }
      return next;
    });
  };

  const validateForm = () => {
    // Address is optional supplementary detail (a long free-text field not
    // shown on the trainee profile); only Location — the short field used in
    // reports — is required, to avoid asking for the same info twice.
    const requiredFields = isEdit
      ? [
        ['participant_name', 'Participant Name'],
        ['gender', 'Gender'],
        ['age', 'Age'],
        ['pin', 'PIN'],
        ['location', 'Location'],
      ]
      : [
        ['state_id', 'State'],
        ['district_id', 'District'],
        ['block_id', 'Block'],
        ['centre_id', 'Centre'],
        ['batch_id', 'Batch'],
        ['participant_name', 'Participant Name'],
        ['enrollment_no', 'Enrollment No'],
        ['username', 'Username'],
        ['password', 'Password'],
        ['gender', 'Gender'],
        ['age', 'Age'],
        ['pin', 'PIN'],
        ['location', 'Location'],
      ];
    const nextErrors = {};

    requiredFields.forEach(([key, label]) => {
      if (String(form[key] ?? '').trim() === '') nextErrors[key] = `${label} is required.`;
    });

    const age = Number(form.age);
    if (form.age && (!Number.isInteger(age) || age < 1 || age > 100)) {
      nextErrors.age = 'Age must be a whole number between 1 and 100.';
    }
    if (form.pin && !/^\d{6}$/.test(form.pin)) nextErrors.pin = 'PIN must contain exactly 6 digits.';
    if (form.mobile_no && !/^\d{10}$/.test(form.mobile_no)) {
      nextErrors.mobile_no = 'Mobile No must contain exactly 10 digits.';
    }
    if (form.aadhaar_number && !/^\d{12}$/.test(form.aadhaar_number)) {
      nextErrors.aadhaar_number = 'Aadhaar Number must contain exactly 12 digits.';
    }

    setValidationErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async () => {
    setError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      const message = `Please correct the highlighted fields: ${Object.values(errors).join(' ')}`;

      setError(message);
      toast.error('Please fill all required fields.');

      // Scroll up to the message so the user sees it.
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const efd = new FormData();
        efd.append('participant_name', form.participant_name);
        efd.append('age', form.age);
        efd.append('gender', form.gender);
        if (form.email) efd.append('email', form.email);
        if (form.mobile_no) efd.append('mobile_no', form.mobile_no);
        efd.append('pin', form.pin);
        if (form.aadhaar_number) efd.append('aadhaar_number', form.aadhaar_number);
        efd.append('location', form.location);
        efd.append('address', form.address);
        if (form.state_id) efd.append('state_id', form.state_id);
        if (form.district_id) efd.append('district_id', form.district_id);
        if (form.block_id) efd.append('block_id', form.block_id);
        if (form.centre_id) efd.append('centre_id', form.centre_id);
        if (form.batch_id) efd.append('batch_id', form.batch_id);
        if (form.enrollment_no) efd.append('enrollment_no', form.enrollment_no);
        if (imageFile) efd.append('image', imageFile);
        await updateParticipant(participantId, efd);
        navigate('/participants/list');
        return;
      }
      const fd = new FormData();
      fd.append('state_id', form.state_id);
      fd.append('district_id', form.district_id);
      fd.append('block_id', form.block_id);
      fd.append('centre_id', form.centre_id);
      fd.append('batch_id', form.batch_id);
      fd.append('participant_name', form.participant_name);
      fd.append('enrollment_no', form.enrollment_no);
      fd.append('username', form.username);
      fd.append('password', form.password);
      fd.append('gender', form.gender);
      fd.append('age', form.age);
      if (form.email) fd.append('email', form.email);
      if (form.mobile_no) fd.append('mobile_no', form.mobile_no);
      fd.append('pin', form.pin);
      if (form.aadhaar_number) fd.append('aadhaar_number', form.aadhaar_number);
      fd.append('location', form.location);
      fd.append('address', form.address);
      if (imageFile) fd.append('image', imageFile);

      await createParticipant(fd);
      // On success, go back to the participants list rather than resetting
      // and staying on this form.
      navigate('/participants/list');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const focusStyle = { '--tw-ring-color': BRAND };

  return (
    <>
      <div className="p-6" ref={topRef}>
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          {/* Row 1: State / District / Block */}
          <div>
            <Label required>State:</Label>
            <select
              className={FIELD}
              style={focusStyle}
              value={form.state_id}
              onChange={handleChange('state_id')}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.state_lgd_code} value={s.state_lgd_code}>
                  {s.state_name}
                </option>
              ))}
            </select>
            <FieldError message={validationErrors.state_id} />
          </div>

          <div>
            <Label required>District:</Label>
            <select
              className={FIELD}
              style={focusStyle}
              value={form.district_id}
              onChange={handleChange('district_id')}
              disabled={!form.state_id}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.district_lgd_code} value={d.district_lgd_code}>
                  {d.district_name}
                </option>
              ))}
            </select>
            <FieldError message={validationErrors.district_id} />
          </div>

          <div>
            <Label required>Block:</Label>
            <select
              className={FIELD}
              style={focusStyle}
              value={form.block_id}
              onChange={handleChange('block_id')}
              disabled={!form.district_id}
            >
              <option value="">Select Block</option>
              {blocks.map((b) => (
                <option key={b.block_lgd_code} value={b.block_lgd_code}>
                  {b.block_name}
                </option>
              ))}
            </select>
            <FieldError message={validationErrors.block_id} />
          </div>

          {/* Row 2: Centre / Select Batch */}
          <div>
            <Label required>Centre:</Label>
            <select
              className={FIELD}
              style={focusStyle}
              value={form.centre_id}
              onChange={handleChange('centre_id')}
              disabled={!form.block_id}
            >
              <option value="">Select Centre</option>
              {centres.map((c) => (
                <option key={c.centre_id} value={c.centre_id}>
                  {c.centre_name}
                </option>
              ))}
            </select>
            <FieldError message={validationErrors.centre_id} />
          </div>

          <div className="col-span-2">
            <Label required>Select Batch</Label>
            <select
              className={FIELD}
              style={focusStyle}
              value={form.batch_id}
              onChange={handleChange('batch_id')}
              disabled={!form.centre_id}
            >
              <option value="">
                {form.centre_id ? 'Select Batch' : '-- Pick centre first --'}
              </option>
              {batches.map((b) => (
                <option key={b.batch_id} value={b.batch_id}>
                  {b.batch_name}
                </option>
              ))}
            </select>
            <FieldError message={validationErrors.batch_id} />
          </div>

          {/* Row 3: Trainee Name / Enrollment No */}
          <div>
            <Label required>Trainee Name</Label>
            <input
              type="text"
              className={FIELD}
              style={focusStyle}
              value={form.participant_name}
              onChange={handleChange('participant_name')}
            />
            <FieldError message={validationErrors.participant_name} />
          </div>

          <div className="col-span-2">
            <Label required>Enrollment No</Label>
            <div className="flex gap-2">
              <input
                type="text"
                className={FIELD + ' flex-1 bg-gray-50 text-gray-500'}
                style={focusStyle}
                placeholder="Select state, district, centre & batch to auto-generate"
                value={refreshingEnrollment ? 'Generating…' : form.enrollment_no}
                readOnly
              />
            </div>
            {isEdit && (
              <p className="text-xs text-gray-400 mt-1">
                Enrollment number cannot be changed after creation.
              </p>
            )}
            <FieldError message={validationErrors.enrollment_no} />
          </div>

          {/* Row 4: Age / Gender / Email */}
          <div>
            <Label required>Age</Label>
            <input
              type="text"
              inputMode="numeric"
              min="1"
              max="100"
              maxLength={3}
              className={FIELD}
              style={focusStyle}
              value={form.age}
              onChange={handleChange('age')}
            />
            <FieldError message={validationErrors.age} />
          </div>

          <div>
            <Label required>Gender</Label>
            <select
              className={FIELD}
              style={focusStyle}
              value={form.gender}
              onChange={handleChange('gender')}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <FieldError message={validationErrors.gender} />
          </div>

          <div>
            <Label>Email</Label>
            <input
              type="email"
              className={FIELD}
              style={focusStyle}
              value={form.email}
              onChange={handleChange('email')}
            />
          </div>

          {/* Row 5: Username / Password */}
          <div>
            <Label required>Username</Label>
            <input
              type="text"
              className={FIELD}
              style={focusStyle}
              value={form.username}
              onChange={handleChange('username')}
              readOnly={isEdit}
              disabled={isEdit}
            />
            <p className="text-xs text-gray-400 mt-1">
              {isEdit
                ? 'Username cannot be changed after creation.'
                : '3-255 characters. Letters / digits / . _ -. No spaces.'}
            </p>
            <FieldError message={validationErrors.username} />
          </div>

          <div className="col-span-2">
            <Label required>Password</Label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={FIELD + ' pr-10'}
                style={focusStyle}
                value={form.password}
                onChange={handleChange('password')}
                readOnly={isEdit}
                disabled={isEdit}
                placeholder={isEdit ? '••••••••' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {isEdit
                ? 'Password cannot be changed from this screen.'
                : 'Min 8 chars. Must include uppercase, lowercase, digit & special character.'}
            </p>
            <FieldError message={validationErrors.password} />
          </div>

          {/* Row 6: Mobile No / PIN Code */}
          <div>
            <Label>Mobile No</Label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={FIELD}
              style={focusStyle}
              value={form.mobile_no}
              onChange={handleChange('mobile_no')}
            />
            <FieldError message={validationErrors.mobile_no} />
          </div>

          <div className="col-span-2">
            <Label required>PIN Code</Label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className={FIELD}
              style={focusStyle}
              value={form.pin}
              onChange={handleChange('pin')}
            />
            <FieldError message={validationErrors.pin} />
          </div>

          {/* Row 7: Aadhaar Number / Location */}
          <div>
            <Label>Aadhaar Number</Label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              className={FIELD}
              style={focusStyle}
              value={form.aadhaar_number}
              onChange={handleChange('aadhaar_number')}
            />
            <FieldError message={validationErrors.aadhaar_number} />
          </div>

          <div className="col-span-2">
            <Label required>Location</Label>
            <input
              type="text"
              className={FIELD}
              style={focusStyle}
              value={form.location}
              onChange={handleChange('location')}
            />
            <FieldError message={validationErrors.location} />
          </div>

          {/* Row 8: Address / Profile Image */}
          <div>
            <Label>Address</Label>
            <textarea
              rows={3}
              className={FIELD + ' resize-y'}
              style={focusStyle}
              value={form.address}
              onChange={handleChange('address')}
            />
            <FieldError message={validationErrors.address} />
          </div>

          <div className="col-span-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-3">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Profile preview"
                  className="h-14 w-14 flex-shrink-0 rounded-md border border-gray-200 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-[10px] text-gray-400">
                  No image
                </div>
              )}

              <label className="cursor-pointer bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-md">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null;
                    e.target.value = '';

                    if (file) {
                      // Profile photo must be square (1:1), plus type/size.
                      const result = await validateImage(file, { aspectRatio: ASPECT_SQUARE });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                    }

                    setImageFile(file);
                    setImageName(file?.name || '');
                    setImagePreview((prev) => {
                      if (prev?.startsWith('blob:')) {
                        URL.revokeObjectURL(prev);
                      }
                      return file ? URL.createObjectURL(file) : '';
                    });
                  }}
                />
              </label>
              <span className="text-sm text-gray-500">{imageName || 'No file chosen'}</span>
            </div>

            {isEdit && !imageFile && existingImageUrl && (
              <p className="mt-1 text-xs text-gray-400">
                Current photo shown. Choose a file to replace it.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 px-6 pb-6">
        <button
          type="button"
          onClick={() => navigate('/participants/list')}
          className="border border-gray-300 text-gray-500 bg-white text-sm font-medium px-5 py-2 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={() => setShowReview(true)}
            style={{ borderColor: BRAND, color: BRAND }}
            className="border bg-white text-sm font-medium px-5 py-2 rounded-md hover:bg-purple-50"
          >
            Review &amp; Edit
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ backgroundColor: BRAND }}
          className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Update Trainee' : 'Create Trainee'}
        </button>
      </div>

      {/* Review & Edit modal - shows every field so the person can
          sanity-check before final submit. "Back to Edit" just closes it;
          "Confirm & Save" closes it and runs the real submit handler. */}
      {showReview && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowReview(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4 rounded-t-lg text-white"
              style={{ backgroundColor: BRAND }}
            >
              <h3 className="text-base font-semibold">Review Trainee Details</h3>
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4">
              <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
                <tbody>
                  {REVIEW_FIELD_ORDER.map((key) => {
                    const value = getReviewValue(key);
                    return (
                      <tr key={key} className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-semibold text-gray-700 w-2/5 align-top">
                          {FIELD_LABELS[key]}
                        </td>
                        <td className="py-2 text-gray-600 align-top">
                          {value === '' || value == null ? '—' : String(value)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td className="py-2 pr-4 font-semibold text-gray-700 align-top">Profile Image</td>
                    <td className="py-2 text-gray-600 align-top">{imageName || '(no file)'}</td>
                  </tr>
                </tbody>
              </table></div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="border border-gray-300 text-gray-600 bg-white text-sm font-medium px-5 py-2 rounded-md hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReview(false);
                  handleSubmit();
                }}
                disabled={submitting}
                style={{ backgroundColor: BRAND }}
                className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}