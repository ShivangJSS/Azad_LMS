// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { getStates, getDistricts, getBlocks, createCentre } from "../services/centerService";

// const emptyForm = {
//     state_id: "", district_id: "", block_id: "", centre_name: "", location: "",
//     latitude: "", longitude: "", pin: "", phone_number: "", email: "", address: "", status: "1",
// };

// const statusOptions = [
//     { value: "1", label: "Active" },
//     { value: "0", label: "Inactive" },
// ];

// /* ============ CLASSES ============ */

// const cardClass = "w-full bg-white p-[20px] border border-[#D8E2EF] rounded-[8px] shadow-sm";

// const labelClass = "block mb-[8px] text-[14px] font-medium leading-[1.5] text-[#344050]";

// const inputClass = "block w-full h-[38px] px-[12px] bg-white border border-[#D8E2EF] rounded-[6px] text-[14px] text-[#344050] outline-none box-border";

// const selectClass = "block w-full h-[38px] pl-[12px] pr-[36px] appearance-none bg-white border border-[#D8E2EF] rounded-[6px] text-[14px] text-[#344050] outline-none cursor-pointer truncate box-border disabled:bg-[#F5F7FA] disabled:text-[#9DA9BB] disabled:cursor-not-allowed bg-[length:14px_11px] bg-no-repeat bg-[right_12px_center] bg-[url('data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Cpath fill=%22none%22 stroke=%22%235E6E82%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.6%22 d=%22m2 5 6 6 6-6%22/%3E%3C/svg%3E')]";

// const textareaClass = "block w-full min-h-[76px] px-[12px] py-[8px] bg-white border border-[#D8E2EF] rounded-[6px] text-[14px] text-[#344050] outline-none resize-y box-border";

// const cancelBtnClass = "h-[38px] px-[20px] rounded-[6px] text-[14px] font-medium text-[#5E6E82] bg-white border border-[#D8E2EF] cursor-pointer hover:bg-gray-50";

// const submitBtnClass = "h-[38px] px-[20px] rounded-[6px] text-[14px] font-semibold !text-white bg-[#6B2D5B] border border-[#6B2D5B] cursor-pointer hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed";

// const Req = () => <span className="text-[#e63757] ml-[2px]">*</span>;


// export default function CenterUserForm() {

//     const navigate = useNavigate();

//     const [formData, setFormData] = useState(emptyForm);

//     const [states, setStates] = useState([]);
//     const [districts, setDistricts] = useState([]);
//     const [blocks, setBlocks] = useState([]);

//     const [saving, setSaving] = useState(false);


//     /* ============ LOAD STATES ============ */

//     useEffect(() => { fetchStates(); }, []);

//     const fetchStates = async () => {
//         try { const res = await getStates(); setStates(res.data); }
//         catch (err) { console.error("State API Error:", err); setStates([]); }
//     };

//     const fetchDistricts = async (stateId) => {
//         try { const res = await getDistricts(stateId); setDistricts(res.data); }
//         catch (err) { console.error("District API Error:", err); setDistricts([]); }
//     };

//     const fetchBlocks = async (districtId) => {
//         try { const res = await getBlocks(districtId); setBlocks(res.data); }
//         catch (err) { console.error("Block API Error:", err); setBlocks([]); }
//     };


//     /* ============ CASCADE ============ */

//     const handleChange = (e) => {

//         const { name, value } = e.target;

//         if (name === "state_id") {
//             setFormData((prev) => ({ ...prev, state_id: value, district_id: "", block_id: "" }));
//             setDistricts([]);
//             setBlocks([]);
//             if (value) fetchDistricts(value);
//             return;
//         }

//         if (name === "district_id") {
//             setFormData((prev) => ({ ...prev, district_id: value, block_id: "" }));
//             setBlocks([]);
//             if (value) fetchBlocks(value);
//             return;
//         }

//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };


//     /* ============ SUBMIT ============ */

//     const handleSubmit = async (e) => {

//         e.preventDefault();

//         try {

//             setSaving(true);

//             const payload = {
//                 state_id: Number(formData.state_id),
//                 district_id: Number(formData.district_id),
//                 block_id: Number(formData.block_id),
//                 centre_name: formData.centre_name.trim(),
//                 location: formData.location.trim(),
//                 latitude: formData.latitude === "" ? null : Number(formData.latitude),
//                 longitude: formData.longitude === "" ? null : Number(formData.longitude),
//                 pin: formData.pin.trim(),
//                 phone_number: formData.phone_number.trim(),
//                 email: formData.email.trim(),
//                 address: formData.address.trim(),
//                 status: Number(formData.status),
//             };

//             console.log("PAYLOAD →", payload);

//             await createCentre(payload);

//             alert("Centre created successfully");

//             navigate("/centres/list");

//         } catch (error) {

//             console.error("Create Centre Error:", error);
//             console.error("Server said:", error.response?.status, error.response?.data);

//             const detail = error.response?.data?.detail;

//             const message = Array.isArray(detail)
//                 ? detail.map((d) => `${d.loc?.join(".")} → ${d.msg}`).join("\n")
//                 : detail || "Unable to create centre";

//             alert(message);

//         } finally {

//             setSaving(false);
//         }
//     };


//     const handleCancel = () => {
//         setFormData(emptyForm);
//         setDistricts([]);
//         setBlocks([]);
//     };


//     return (

//         <form onSubmit={handleSubmit} className="w-full px-2 py-0">

//             <div className={cardClass}>

//                 {/* ============ LOCATION ROW ============ */}

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">

//                     <div className="w-full">
//                         <label className={labelClass}>State <Req /></label>
//                         <select name="state_id" value={formData.state_id} onChange={handleChange} className={selectClass} required>
//                             <option value="">Select State</option>
//                             {states.map((s) => <option key={s.state_lgd_code} value={s.state_lgd_code}>{s.state_name}</option>)}
//                         </select>
//                     </div>

//                     <div className="w-full">
//                         <label className={labelClass}>District <Req /></label>
//                         <select name="district_id" value={formData.district_id} onChange={handleChange} className={selectClass} disabled={!formData.state_id} required>
//                             <option value="">Select District</option>
//                             {districts.map((d) => <option key={d.district_lgd_code} value={d.district_lgd_code}>{d.district_name}</option>)}
//                         </select>
//                     </div>

//                     <div className="w-full">
//                         <label className={labelClass}>Block <Req /></label>
//                         <select name="block_id" value={formData.block_id} onChange={handleChange} className={selectClass} disabled={!formData.district_id} required>
//                             <option value="">Select Block</option>
//                             {blocks.map((b) => <option key={b.block_lgd_code} value={b.block_lgd_code}>{b.block_name}</option>)}
//                         </select>
//                     </div>

//                 </div>


//                 <div className="border-t border-[#D8E2EF] my-[24px]" />


//                 {/* ============ DETAILS ============ */}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[24px] gap-y-[18px]">

//                     <div className="w-full">
//                         <label className={labelClass}>Centre Name <Req /></label>
//                         <input type="text" name="centre_name" value={formData.centre_name} onChange={handleChange} className={inputClass} maxLength={75} required />
//                     </div>

//                     <div className="w-full">
//                         <label className={labelClass}>Location <Req /></label>
//                         <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} maxLength={30} required />
//                     </div>

//                     <div className="w-full">
//                         <label className={labelClass}>Latitude</label>
//                         <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className={inputClass} />
//                     </div>

//                     <div className="w-full">
//                         <label className={labelClass}>Longitude</label>
//                         <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className={inputClass} />
//                     </div>

//                     <div className="w-full">
//                         <label className={labelClass}>PIN Code <Req /></label>
//                         <input type="text" inputMode="numeric" name="pin" value={formData.pin} onChange={handleChange} className={inputClass} maxLength={6} required />
//                     </div>

//                     <div className="w-full">
//                         <label className={labelClass}>Phone Number <Req /></label>
//                         <input type="text" inputMode="numeric" name="phone_number" value={formData.phone_number} onChange={handleChange} className={inputClass} maxLength={10} required />
//                     </div>

//                     <div className="w-full">
//                         <label className={labelClass}>Email <Req /></label>
//                         <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
//                     </div>

//                 </div>


//                 <div className="w-full mt-[18px]">
//                     <label className={labelClass}>Address <Req /></label>
//                     <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className={textareaClass} required />
//                 </div>


//                 <div className="w-full md:w-1/3 mt-[18px]">
//                     <label className={labelClass}>Status <Req /></label>
//                     <select name="status" value={formData.status} onChange={handleChange} className={selectClass} required>
//                         {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
//                     </select>
//                 </div>

//             </div>


//             {/* ============ BUTTONS ============ */}

//             <div className="flex justify-end items-center gap-[10px] mt-[20px]">

//                 <button type="button" onClick={handleCancel} className={cancelBtnClass}>Cancel</button>

//                 <button type="submit" disabled={saving} className={submitBtnClass}>{saving ? "Saving..." : "Create Centre"}</button>

//             </div>

//         </form>

//     );
// }

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

import { getStates, getDistricts, getBlocks, getCentreById, createCentre, updateCentre } from "../services/centerService";

const emptyForm = {
    state_id: "", district_id: "", block_id: "", centre_name: "", location: "",
    latitude: "", longitude: "", pin: "", phone_number: "", email: "", address: "", status: "1",
};

const statusOptions = [
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
];

/* ============ CLASSES ============ */

const cardClass = "w-full bg-white p-[20px] border border-[#D8E2EF] rounded-[8px] shadow-sm";

const labelClass = "block mb-[8px] text-[14px] font-medium leading-[1.5] shadow-inner text-[#5E6E82]";

const inputClass = "block w-full h-[35px] px-[12px] bg-white border border-[#D8E2EF] rounded-[6px] text-[14px] text-[#5E6E82] outline-none box-border shadow-inner";

const selectClass = "block w-full h-[35px] pl-[12px] pr-[36px] appearance-none bg-white      border border-[#D8E2EF] rounded-[6px] text-[14px] text-[#5E6E82] outline-none  shadow-inner cursor-pointer truncate box-border disabled:bg-[#F5F7FA] disabled:text-[#9DA9BB] disabled:cursor-not-allowed bg-[length:14px_11px] bg-no-repeat bg-[right_12px_center] bg-[url('data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Cpath fill=%22none%22 stroke=%22%235E6E82%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.6%2２ d=%2２m2 5 6 6 6-6%2２/%3E%3C/svg%3E')]";

const textareaClass = "block w-full min-h-[76px] px-[12px] py-[8px] bg-white border border-[#D8E2EF] rounded-[6px] text-[14px] text-[#5E6E82] outline-none resize-y box-border";

const cancelBtnClass = "h-[35px] px-[20px] rounded-[6px] text-[14px] font-medium text-[#5E6E82] bg-white border border-[#D8E2EF] cursor-pointer hover:bg-gray-50 rounded-sm!";

const submitBtnClass = "h-[35px] px-[20px] rounded-sm! text-[14px] font-semibold !text-white bg-[#732269] border border-[#732269] cursor-pointer hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed ";

const Req = () => <span className="text-[#e63757] ml-[2px]">*</span>;


export default function CenterUserForm() {

    const { id } = useParams();
    const navigate = useNavigate();

    const isEdit = Boolean(id);

    const [formData, setFormData] = useState(emptyForm);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);


    /* ============ BOOTSTRAP ============ */

    useEffect(() => { bootstrap(); }, [id]);

    const bootstrap = async () => {
        await fetchStates();
        if (isEdit) await loadCentre();
    };


    const fetchStates = async () => {
        try { const res = await getStates(); setStates(res.data); }
        catch (err) { console.error("State API Error:", err); setStates([]); }
    };

    const fetchDistricts = async (stateId) => {
        try { const res = await getDistricts(stateId); setDistricts(res.data); }
        catch (err) { console.error("District API Error:", err); setDistricts([]); }
    };

    const fetchBlocks = async (districtId) => {
        try { const res = await getBlocks(districtId); setBlocks(res.data); }
        catch (err) { console.error("Block API Error:", err); setBlocks([]); }
    };


    /* ============ EDIT PREFILL ============ */

    const loadCentre = async () => {

        try {

            setLoading(true);

            const res = await getCentreById(id);
            const c = res.data;

            /* child lists must load BEFORE values are set */
            if (c.state_id) await fetchDistricts(c.state_id);
            if (c.district_id) await fetchBlocks(c.district_id);

            setFormData({
                state_id: c.state_id ?? "",
                district_id: c.district_id ?? "",
                block_id: c.block_id ?? "",
                centre_name: c.centre_name ?? "",
                location: c.location ?? "",
                latitude: c.latitude ?? "",
                longitude: c.longitude ?? "",
                pin: c.pin ?? "",
                phone_number: c.phone_number ?? "",
                email: c.email ?? "",
                address: c.address ?? "",
                status: String(c.status ?? "1"),
            });

        } catch (err) {

            console.error("Load Centre Error:", err);
            alert(err.response?.data?.detail || "Unable to load centre");
            navigate("/centres/list");

        } finally {

            setLoading(false);
        }
    };


    /* ============ CASCADE ============ */

    const handleChange = (e) => {

        const { name, value } = e.target;

        if (name === "state_id") {
            setFormData((prev) => ({ ...prev, state_id: value, district_id: "", block_id: "" }));
            setDistricts([]);
            setBlocks([]);
            if (value) fetchDistricts(value);
            return;
        }

        if (name === "district_id") {
            setFormData((prev) => ({ ...prev, district_id: value, block_id: "" }));
            setBlocks([]);
            if (value) fetchBlocks(value);
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    /* ============ SUBMIT ============ */

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            const payload = {
                state_id: Number(formData.state_id),
                district_id: Number(formData.district_id),
                block_id: Number(formData.block_id),
                centre_name: formData.centre_name.trim(),
                location: formData.location.trim(),
                latitude: formData.latitude === "" ? null : Number(formData.latitude),
                longitude: formData.longitude === "" ? null : Number(formData.longitude),
                pin: String(formData.pin).trim(),
                phone_number: String(formData.phone_number).trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                status: Number(formData.status),
            };

            console.log("PAYLOAD →", payload);

            if (isEdit) {
                await updateCentre(id, payload);
                alert("Centre updated successfully");
            } else {
                await createCentre(payload);
                alert("Centre created successfully");
            }

            navigate("/centres/list");

        } catch (error) {

            console.error("Save Centre Error:", error);
            console.error("Server said:", error.response?.status, JSON.stringify(error.response?.data, null, 2));

            const detail = error.response?.data?.detail;

            const message = Array.isArray(detail)
                ? detail.map((d) => `${d.loc?.join(".")} → ${d.msg}`).join("\n")
                : detail || "Unable to save centre";

            alert(message);

        } finally {

            setSaving(false);
        }
    };


    const handleCancel = () => {

        if (isEdit) {
            navigate("/centres/list");
            return;
        }

        setFormData(emptyForm);
        setDistricts([]);
        setBlocks([]);
    };


    if (loading) {
        return (
            <div className={cardClass}>
                <p className="m-0 text-[14px] text-[#5E6E82]">Loading centre...</p>
            </div>
        );
    }


    return (

        <form onSubmit={handleSubmit} className="w-full px-2 py-0">

            <div className={cardClass}>

                {/* ============ LOCATION ROW ============ */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">

                    <div className="w-full">
                        <label className={labelClass}>State <Req /></label>
                        <div className="relative">
                            <select name="state_id" value={formData.state_id} onChange={handleChange} className={selectClass} required>
                                <option value="">Select State</option>
                                {states.map((s) => <option key={s.state_lgd_code} value={s.state_lgd_code}>{s.state_name}</option>)}
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6E82] pointer-events-none" />
                        </div>
                    </div>

                    <div className="w-full">
                        <label className={labelClass}>District <Req /></label>
                        <div className="relative">
                            <select name="district_id" value={formData.district_id} onChange={handleChange} className={selectClass} disabled={!formData.state_id} required>
                                <option value="">Select District</option>
                                {districts.map((d) =>
                                    <option key={d.district_lgd_code} value={d.district_lgd_code}>{d.district_name}
                                    </option>)}
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6E82] pointer-events-none" />
                        </div>

                    </div>
                    <div className="w-full">
                        <label className={labelClass}>Block <Req /></label>
                        <div className="relative">
                            <select name="block_id" value={formData.block_id} onChange={handleChange} className={selectClass} disabled={!formData.district_id} required>
                                <option value="">Select Block</option>
                                {blocks.map((b) => <option key={b.block_lgd_code} value={b.block_lgd_code}>{b.block_name}</option>)}
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6E82] pointer-events-none" />
                        </div>

                    </div>
                </div>


                <div className="border-t border-[#D8E2EF] my-[24px]" />


                {/* ============ DETAILS ============ */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[24px] gap-y-[18px]">

                    <div className="w-full">
                        <label className={labelClass}>Centre Name <Req /></label>
                        <input type="text" name="centre_name" value={formData.centre_name} onChange={handleChange} className={inputClass} maxLength={75} required />
                    </div>

                    <div className="w-full">
                        <label className={labelClass}>Location <Req /></label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} maxLength={30} required />
                    </div>

                    <div className="w-full">
                        <label className={labelClass}>Latitude</label>
                        <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="w-full">
                        <label className={labelClass}>Longitude</label>
                        <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="w-full">
                        <label className={labelClass}>PIN Code <Req /></label>
                        <input type="text" inputMode="numeric" name="pin" value={formData.pin} onChange={handleChange} className={inputClass} maxLength={6} required />
                    </div>

                    <div className="w-full">
                        <label className={labelClass}>Phone Number <Req /></label>
                        <input type="text" inputMode="numeric" name="phone_number" value={formData.phone_number} onChange={handleChange} className={inputClass} maxLength={10} required />
                    </div>

                    <div className="w-full">
                        <label className={labelClass}>Email <Req /></label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                    </div>

                </div>


                <div className="w-full mt-[18px]">
                    <label className={labelClass}>Address <Req /></label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className={textareaClass} required />
                </div>


                <div className="w-full md:w-1/3 mt-[18px]">
                    <label className={labelClass}>Status <Req /></label>
                    <select name="status" value={formData.status} onChange={handleChange} className={selectClass} required>
                        {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                </div>

            </div>


            {/* ============ BUTTONS ============ */}

            <div className="flex justify-end items-center gap-[10px] mt-[20px]">

                <button type="button" onClick={handleCancel} className={cancelBtnClass}>Cancel</button>

                <button type="submit" disabled={saving} className={submitBtnClass}>
                    {saving ? "Saving..." : isEdit ? "Update Centre" : "Create Centre"}
                </button>

            </div>

        </form>

    );
}