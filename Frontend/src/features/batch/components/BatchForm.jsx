import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCentres, getBatchById, createBatch, updateBatch } from '../services/BatchService';

const BRAND = '#732269';

const FIELD =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400';

function Label({ children, required }) {
    return (
        <label className="block text-sm font-medium text-gray-800 mb-1.5">
            {children} {required && <span className="text-red-500">*</span>}
        </label>
    );
}

function buildFyOptions(includeYear) {
    const now = new Date();
    const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const years = new Set();
    for (let y = currentYear - 1; y <= currentYear + 2; y++) {
        years.add(`${y}-${String((y + 1) % 100).padStart(2, '0')}`);
    }
    if (includeYear) years.add(includeYear);
    return Array.from(years).sort();
}

export default function BatchForm({ batchId }) {
    const navigate = useNavigate();
    const isEditMode = Boolean(batchId);

    const [fyOptions, setFyOptions] = useState(buildFyOptions());
    const [form, setForm] = useState({
        batch_name: '',
        status: '',
        centre_id: '',
        fy_year: '',
    });

    const [centres, setCentres] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [notFound, setNotFound] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Centres list is needed either way.
    useEffect(() => {
        getAllCentres().then(setCentres).catch(() => setCentres([]));
    }, []);

    // Create mode: just pick a sensible default FY once, on mount.
    useEffect(() => {
        if (isEditMode) return;
        const options = buildFyOptions();
        setFyOptions(options);
        setForm((prev) => ({
            ...prev,
            fy_year: options.includes('2026-27') ? '2026-27' : options[1] || options[0],
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Edit mode: fetch the batch and pre-fill the form.
    useEffect(() => {
        if (!isEditMode) return;

        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            setNotFound(false);
            try {
                const batch = await getBatchById(batchId);
                if (cancelled) return;
                setForm({
                    batch_name: batch.batch_name ?? '',
                    status: batch.status ?? '',
                    centre_id: batch.centre_id ?? '',
                    fy_year: batch.fy_year ?? '',
                });
                setFyOptions(buildFyOptions(batch.fy_year));
            } catch (err) {
                if (cancelled) return;
                if (err?.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setError('Could not load this batch. Please try again.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [isEditMode, batchId]);

    const handleChange = (key) => (e) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const handleCancel = () => navigate('/batches/list');

    const handleSubmit = async () => {
        setError(null);

        if (!fyOptions.includes(form.fy_year)) {
            setError('Financial Year value is invalid. Please reselect it and try again.');
            if (!isEditMode) {
                setForm((prev) => ({ ...prev, fy_year: fyOptions[0] }));
            }
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                batchName: form.batch_name,
                centreId: Number(form.centre_id),
                fyYear: form.fy_year,
                status: Number(form.status),
            };

            if (isEditMode) {
                await updateBatch(batchId, payload);
            } else {
                await createBatch(payload);
            }

            navigate('/batches/list');
        } catch (err) {
            setError(
                err?.response?.data?.detail?.[0]?.msg ||
                err?.response?.data?.detail ||
                `Could not ${isEditMode ? 'update' : 'create'} batch. Please check the form and try again.`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit =
        form.batch_name.trim() && form.status !== '' && form.centre_id && form.fy_year;

    if (isEditMode && loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-400">
                Loading batch…
            </div>
        );
    }

    if (isEditMode && notFound) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                Batch not found.
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-6">
                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* autoComplete="off" on the form itself discourages browser
                    extensions / autofill heuristics from writing into these
                    fields based on their name/id. */}
                <div className="grid grid-cols-3 gap-x-6 gap-y-5" autoComplete="off">
                    <div>
                        <Label required>Batch Name</Label>
                        <input
                            type="text"
                            name="batch_name_field"
                            autoComplete="off"
                            className={FIELD}
                            style={{ '--tw-ring-color': BRAND }}
                            value={form.batch_name}
                            onChange={handleChange('batch_name')}
                        />
                    </div>

                    <div>
                        <Label required>Status</Label>
                        <select
                            name="status_field"
                            autoComplete="off"
                            className={FIELD}
                            style={{ '--tw-ring-color': BRAND }}
                            value={form.status}
                            onChange={handleChange('status')}
                        >
                            <option value="">Please select a Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <Label required>Centre Name</Label>
                        <select
                            name="centre_field"
                            autoComplete="off"
                            className={FIELD}
                            style={{ '--tw-ring-color': BRAND }}
                            value={form.centre_id}
                            onChange={handleChange('centre_id')}
                        >
                            <option value="">Select Centre</option>
                            {centres.map((c) => (
                                <option key={c.centre_id} value={c.centre_id}>
                                    {c.centre_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label required>Financial Year</Label>
                        <select
                            name="financial_year_field"
                            autoComplete="off"
                            className={FIELD}
                            style={{ '--tw-ring-color': BRAND }}
                            value={form.fy_year}
                            onChange={handleChange('fy_year')}
                        >
                            {fyOptions.map((fy) => (
                                <option key={fy} value={fy}>
                                    {fy}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="border border-gray-300 text-gray-600 bg-white text-sm font-medium px-5 py-2 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    style={{ backgroundColor: BRAND }}
                    className="text-white text-sm font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                    {submitting
                        ? (isEditMode ? 'Saving…' : 'Creating…')
                        : (isEditMode ? 'Save Changes' : 'Create Batch')}
                </button>
            </div>
        </>
    );
}