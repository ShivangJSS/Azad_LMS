import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function StateForm({
    loading = false,
    onSubmit,
    onCancel,
    defaultValues = null,
    mode = "create",
}) {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            state_lgd_code: "",
            state_name: "",
            status: "",
        },
    });

    useEffect(() => {
        if (mode !== "edit" || !defaultValues) return;

        reset({
            state_lgd_code: defaultValues.state_lgd_code ?? "",
            state_name: defaultValues.state_name ?? "",
            status: String(defaultValues.status ?? ""),
        });
    }, [mode, defaultValues, reset]);

    const handleFormSubmit = (data) => {
        onSubmit(data, setError);
    };

    const labelClass =
        "mb-2 block text-[14px] font-medium text-[#5E6E82]";

    const fieldClass =
        "h-[38px] w-full rounded-sm border border-[#D8E2EF] px-4 text-[14px] text-[#5E6E82] placeholder:text-[#5E6E82] focus:border-[#732269] focus:outline-none shadow-inner";

    const errorClass =
        "mt-1 text-[12px] text-[#E63757]";

    return (
        <div className="w-full rounded-md border border-[#D8E2EF] bg-white p-5">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                    {/* LGD CODE */}
                    <div>
                        <label htmlFor="state_lgd_code" className={labelClass}>
                            State LGD Code <span className="text-red-500">*</span>
                        </label>

                        <input
                            id="state_lgd_code"
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter LGD Code"
                            readOnly={mode === "edit"}
                            {...register("state_lgd_code", {
                                required: "LGD Code is required",
                                pattern: {
                                    value: /^\d+$/,
                                    message: "Only numbers allowed",
                                },
                            })}
                            className={`${fieldClass} ${mode === "edit"
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : ""
                                }`}
                        />

                        {errors.state_lgd_code && (
                            <p className={errorClass}>
                                {errors.state_lgd_code.message}
                            </p>
                        )}
                    </div>

                    {/* STATE NAME */}
                    <div>
                        <label htmlFor="state_name" className={labelClass}>
                            State Name <span className="text-red-500">*</span>
                        </label>

                        <input
                            id="state_name"
                            type="text"
                            placeholder="Enter State Name"
                            {...register("state_name", {
                                required: "State Name is required",
                                maxLength: {
                                    value: 100,
                                    message: "Maximum 100 characters",
                                },
                            })}
                            className={fieldClass}
                        />

                        {errors.state_name && (
                            <p className={errorClass}>
                                {errors.state_name.message}
                            </p>
                        )}
                    </div>

                    {/* STATUS */}
                    <div>
                        <label htmlFor="status" className={labelClass}>
                            Status <span className="text-red-500">*</span>
                        </label>

                        <select
                            id="status"
                            {...register("status", {
                                required: "Status is required",
                            })} 
                            className={`${fieldClass} bg-white`}
                        >
                            <option value="">Select Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>

                        {errors.status && (
                            <p className={errorClass}>
                                {errors.status.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        navigate="/master/states"
                        className="h-[38px] rounded-sm border border-[#D8E2EF] bg-white px-7 text-[14px] font-medium text-[#344050] hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit" 
                        disabled={loading}
                        className="h-[38px] rounded-sm bg-[#732269] px-7 text-[14px] font-medium text-white hover:bg-[#69186c] disabled:opacity-50"
                    >
                        {loading
                            ? mode === "create"
                                ? "Creating..."
                                : "Updating..."
                            : mode === "create"
                                ? "Create State"
                                : "Update State"}
                    </button>
                </div>
            </form>
        </div>
    );
}