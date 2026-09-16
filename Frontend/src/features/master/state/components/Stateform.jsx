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
        mode: "onSubmit",
        reValidateMode: "onChange",
        defaultValues: {
            state_lgd_code: "",
            state_name: "",
            status: "",
        },
    });

    useEffect(() => {
        if (mode !== "edit" || !defaultValues) {
            return;
        }

        reset({
            state_lgd_code:
                defaultValues.state_lgd_code ?? "",
            state_name:
                defaultValues.state_name ?? "",
            status:
                defaultValues.status !== null &&
                defaultValues.status !== undefined
                    ? String(defaultValues.status)
                    : "",
        });
    }, [mode, defaultValues, reset]);

    const handleFormSubmit = (data) => {
        // In edit mode the LGD code arrives from the API as a number, so
        // calling .trim() on it directly throws and silently aborts the
        // submit (this was the "Edit not working" bug). Coerce to string
        // first so both create and edit submit reliably.
        const cleanedData = {
            state_lgd_code: String(data.state_lgd_code ?? "").trim(),
            state_name: String(data.state_name ?? "").trim(),
            status: data.status,
        };

        onSubmit(cleanedData, setError);
    };

    const labelClass =
        "mb-2 block text-[14px] font-medium text-[#5E6E82]";

    const fieldClass =
        "h-[38px] w-full rounded-sm border border-[#D8E2EF] px-4 text-[14px] text-[#5E6E82] placeholder:text-[#5E6E82] focus:border-[#732269] focus:outline-none focus:ring-1 focus:ring-[#732269] shadow-inner";

    const errorClass =
        "mt-1 text-[12px] text-[#E63757]";

    return (
        <div className="w-full rounded-md border border-[#D8E2EF] bg-white p-5">
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                noValidate
            >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                    {/* =========================
                        STATE LGD CODE
                    ========================== */}
                    <div>
                        <label
                            htmlFor="state_lgd_code"
                            className={labelClass}
                        >
                            State LGD Code{" "}
                            <span className="text-red-500">
                                *
                            </span>
                        </label>

                        <input
                            id="state_lgd_code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="Enter LGD Code"
                            readOnly={mode === "edit"}
                            // Digits only, max 5 (LGD code max is 32767).
                            onInput={(e) => {
                                e.target.value = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 5);
                            }}
                            aria-invalid={
                                errors.state_lgd_code
                                    ? "true"
                                    : "false"
                            }
                            {...register("state_lgd_code", {
                                required:
                                    "LGD Code is required",

                                pattern: {
                                    value: /^[0-9]+$/,
                                    message:
                                        "LGD Code must contain numbers only",
                                },

                                maxLength: {
                                    value: 10,
                                    message: "LGD Code cannot exceed 10 digits",
                                },

                                validate: (value) => {
                                    // Value can arrive as a number in edit
                                    // mode, so coerce before trimming.
                                    const cleaned =
                                        String(value ?? "").trim();

                                    if (!cleaned) {
                                        return "LGD Code is required";
                                    }

                                    if (
                                        !/^[0-9]+$/.test(
                                            cleaned
                                        )
                                    ) {
                                        return "LGD Code must contain numbers only";
                                    }

                                    const numeric = Number(cleaned);

                                    if (numeric <= 0) {
                                        return "LGD Code must be greater than 0";
                                    }

                                    // State LGD code is stored as a small
                                    // integer server-side (max 32767); flag
                                    // out-of-range values here instead of
                                    // letting the request fail with a 422.
                                    if (numeric > 32767) {
                                        return "LGD Code must be between 1 and 32767";
                                    }

                                    return true;
                                },
                            })}
                            className={`${fieldClass} ${
                                mode === "edit"
                                    ? "cursor-not-allowed bg-gray-100"
                                    : ""
                            } ${
                                errors.state_lgd_code
                                    ? "border-[#E63757]"
                                    : ""
                            }`}
                        />

                        {errors.state_lgd_code && (
                            <p
                                className={errorClass}
                                role="alert"
                            >
                                {
                                    errors.state_lgd_code
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    {/* =========================
                        STATE NAME
                    ========================== */}
                    <div>
                        <label
                            htmlFor="state_name"
                            className={labelClass}
                        >
                            State Name{" "}
                            <span className="text-red-500">
                                *
                            </span>
                        </label>

                        <input
                            id="state_name"
                            type="text"
                            autoComplete="off"
                            placeholder="Enter State Name"
                            aria-invalid={
                                errors.state_name
                                    ? "true"
                                    : "false"
                            }
                            {...register("state_name", {
                                required:
                                    "State Name is required",

                                maxLength: {
                                    value: 100,
                                    message:
                                        "Maximum 100 characters",
                                },

                                validate: (value) => {
                                    const name =
                                        value.trim();

                                    if (!name) {
                                        return "State Name is required";
                                    }

                                    if (
                                        name.length < 2
                                    ) {
                                        return "State Name must be at least 2 characters";
                                    }

                                    /*
                                     * Allows:
                                     * Letters
                                     * Spaces
                                     * Hyphen
                                     * Apostrophe
                                     *
                                     * Examples:
                                     * Delhi
                                     * Uttar Pradesh
                                     * Jammu-Kashmir
                                     * Dadra & Nagar Haveli
                                     */
                                    if (
                                        !/^[A-Za-z][A-Za-z\s&'-]*$/.test(
                                            name
                                        )
                                    ) {
                                        return "State Name contains invalid characters";
                                    }

                                    return true;
                                },
                            })}
                            className={`${fieldClass} ${
                                errors.state_name
                                    ? "border-[#E63757]"
                                    : ""
                            }`}
                        />

                        {errors.state_name && (
                            <p
                                className={errorClass}
                                role="alert"
                            >
                                {
                                    errors.state_name
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    {/* =========================
                        STATUS
                    ========================== */}
                    <div>
                        <label
                            htmlFor="status"
                            className={labelClass}
                        >
                            Status{" "}
                            <span className="text-red-500">
                                *
                            </span>
                        </label>

                        <select
                            id="status"
                            autoComplete="off"
                            aria-invalid={
                                errors.status
                                    ? "true"
                                    : "false"
                            }
                            {...register("status", {
                                required:
                                    "Status is required",

                                validate: (value) => {
                                    if (
                                        value !== "1" &&
                                        value !== "0"
                                    ) {
                                        return "Please select a valid status";
                                    }

                                    return true;
                                },
                            })}
                            className={`${fieldClass} bg-white ${
                                errors.status
                                    ? "border-[#E63757]"
                                    : ""
                            }`}
                        >
                            <option value="">
                                Select Status
                            </option>

                            <option value="1">
                                Active
                            </option>

                            <option value="0">
                                Inactive
                            </option>
                        </select>

                        {errors.status && (
                            <p
                                className={errorClass}
                                role="alert"
                            >
                                {errors.status.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* =========================
                    BUTTONS
                ========================== */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="h-[38px] rounded-sm border border-[#D8E2EF] bg-white px-7 text-[14px] font-medium text-[#344050] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-[38px] rounded-sm bg-[#732269] px-7 text-[14px] font-medium text-white hover:bg-[#69186c] disabled:cursor-not-allowed disabled:opacity-50"
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