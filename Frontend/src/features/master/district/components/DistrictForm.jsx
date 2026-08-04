import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function DistrictForm({
    loading = false,
    onSubmit,
    onCancel,
    defaultValues = null,
    mode = "create",
    states = [],
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            district_lgd_code: "",
            district_name: "",
            state_lgd_code: "",
            status: "",
        },
    });

    useEffect(() => {
        if (mode !== "edit" || !defaultValues) return;

        reset({
            district_lgd_code: defaultValues.district_lgd_code ?? "",
            district_name: defaultValues.district_name ?? "",
            state_lgd_code: String(defaultValues.state_lgd_code ?? ""),
            status: String(defaultValues.status ?? ""),
        });
    }, [mode, defaultValues, reset]);

    const labelClass = "mb-2 block text-[15px] text-[#5E6E82]";

    const fieldClass =
        "h-[38px] w-full rounded-sm border border-[#D8E2EF] bg-white px-4 text-[14px] text-[#5E6E82] placeholder:text-[#9DA9BB] outline-none focus:border-[#732269] focus:ring-1 focus:ring-[#732269] shadow-inner";

    const selectClass = `${fieldClass} shadow-inner cursor-pointer appearance-none bg-[length:14px_11px] bg-no-repeat bg-[right_14px_center] bg-[url('data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Cpath fill=%22none%22 stroke=%22%235E6E82%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.6%22 d=%22m2 5 6 6 6-6%22/%3E%3C/svg%3E')]`;
    const errorClass = "mt-1 text-[12px] text-[#E63757]";

    const required = <span className="text-[#E63757]">*</span>;

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[24px]">
                <div className="grid grid-cols-1 gap-x-[24px] gap-y-[20px] md:grid-cols-2">

                    {/* DISTRICT LGD CODE */}
                    <div>
                        <label htmlFor="district_lgd_code" className={labelClass}>
                            District LGD Code {required}
                        </label>

                        <input
                            id="district_lgd_code"
                            type="text"
                            inputMode="numeric"
                            readOnly={mode === "edit"}
                            {...register("district_lgd_code", {
                                required: "District LGD Code is required",
                                pattern: {
                                    value: /^\d+$/,
                                    message: "Only numbers allowed",
                                },
                            })}
                            className={`${fieldClass} ${mode === "edit"
                                    ? "cursor-not-allowed bg-[#F5F7FA]"
                                    : ""
                                }`}
                        />

                        {errors.district_lgd_code && (
                            <p className={errorClass}>
                                {errors.district_lgd_code.message}
                            </p>
                        )}
                    </div>

                    {/* DISTRICT NAME */}
                    <div>
                        <label htmlFor="district_name" className={labelClass}>
                            District Name {required}
                        </label>

                        <input
                            id="district_name"
                            type="text"
                            {...register("district_name", {
                                required: "District Name is required",
                                maxLength: {
                                    value: 100,
                                    message: "Maximum 100 characters",
                                },
                            })}
                            className={fieldClass}
                        />

                        {errors.district_name && (
                            <p className={errorClass}>
                                {errors.district_name.message}
                            </p>
                        )}
                    </div>

                    {/* STATE */}
                    <div>
                        <label htmlFor="state_lgd_code" className={labelClass}>
                            State {required}
                        </label>

                        <select
                            id="state_lgd_code"
                            {...register("state_lgd_code", {
                                required: "State is required",
                            })}
                            className={selectClass}
                        >
                            <option value="">Select State</option>

                            {states.map((state) => (
                                <option
                                    key={state.state_lgd_code}
                                    value={state.state_lgd_code}
                                >
                                    {state.state_name}
                                </option>
                            ))}
                        </select>

                        {errors.state_lgd_code && (
                            <p className={errorClass}>
                                {errors.state_lgd_code.message}
                            </p>
                        )}
                    </div>

                    {/* STATUS */}
                    <div>
                        <label htmlFor="status" className={labelClass}>
                            Status {required}
                        </label>

                        <select
                            id="status"
                            {...register("status", {
                                required: "Status is required",
                            })}
                            className={selectClass}
                        >
                            <option value="">Select Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>

                        {errors.status && (
                            <p className={errorClass}>{errors.status.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* BUTTONS — outside the card, as in the screenshot */}
            <div className="mt-[20px] flex justify-end gap-[12px]">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-[38px] w-[110px] rounded-sm! border-1 border-[#060606] bg-white text-[15px] text-[#5E6E82] hover:bg-gray-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="h-[38px] w-[160px] rounded-sm! bg-[#732269] text-[15px] font-medium !text-white hover:opacity-90 disabled:opacity-50"
                >
                    {loading
                        ? mode === "create"
                            ? "Creating..."
                            : "Updating..."
                        : mode === "create"
                            ? "Create District"
                            : "Update District"}
                </button>
            </div>
        </form>
    );
}