import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import {
    getBlocks,
    getCentres,
    getCreatableRoles,
    getDistricts,
    getStates,
} from "../services/UserService";

export default function UserForm({
    mode = "create",
    defaultValues = {},
    loading = false,
    onSubmit,
    onCancel,
}) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    const selectedRole = watch("role");
    const selectedState = watch("state_lgd_code");
    const selectedDistrict = watch("district_lgd_code");
    const selectedBlock = watch("block_lgd_code");

    const [showPassword, setShowPassword] = useState(false);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [centres, setCentres] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);

    /* =========================================================
       EDIT MODE
    ========================================================= */
    useEffect(() => {
        if (mode === "edit" && defaultValues) {
            reset(defaultValues);
        }
    }, [mode, defaultValues, reset]);

    /* =========================================================
       LOAD ROLES
    ========================================================= */
    useEffect(() => {
        getCreatableRoles()
            .then((data) => {
                setRoleOptions(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setRoleOptions([]);
            });
    }, []);

    /* =========================================================
       RESTORE ROLE IN EDIT MODE
    ========================================================= */
    useEffect(() => {
        if (mode !== "edit" || defaultValues?.role == null) {
            return;
        }

        const roleStr = String(defaultValues.role);

        setRoleOptions((prev) =>
            prev.some((option) => String(option.id) === roleStr)
                ? prev
                : [
                      ...prev,
                      {
                          id: defaultValues.role,
                          name:
                              defaultValues.role_name ||
                              `Role ${roleStr}`,
                      },
                  ]
        );

        setValue("role", roleStr);
    }, [
        mode,
        defaultValues,
        roleOptions.length,
        setValue,
    ]);

    /* =========================================================
       LOAD STATES
    ========================================================= */
    useEffect(() => {
        getStates()
            .then((data) => {
                setStates(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setStates([]);
            });
    }, []);

    /* =========================================================
       LOAD DISTRICTS
    ========================================================= */
    useEffect(() => {
        setDistricts([]);
        setBlocks([]);
        setCentres([]);

        setValue("district_lgd_code", "");
        setValue("block_lgd_code", "");
        setValue("centre_id", "");

        if (!selectedState) {
            return;
        }

        getDistricts(selectedState)
            .then((data) => {
                setDistricts(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setDistricts([]);
            });
    }, [selectedState, setValue]);

    /* =========================================================
       LOAD BLOCKS
    ========================================================= */
    useEffect(() => {
        setBlocks([]);
        setCentres([]);

        setValue("block_lgd_code", "");
        setValue("centre_id", "");

        if (!selectedDistrict) {
            return;
        }

        getBlocks(selectedDistrict)
            .then((data) => {
                setBlocks(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setBlocks([]);
            });
    }, [selectedDistrict, setValue]);

    /* =========================================================
       LOAD CENTRES
    ========================================================= */
    useEffect(() => {
        setCentres([]);
        setValue("centre_id", "");

        if (!selectedBlock) {
            return;
        }

        getCentres(selectedBlock)
            .then((data) => {
                setCentres(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setCentres([]);
            });
    }, [selectedBlock, setValue]);

    /* =========================================================
       ROLE LOCATION REQUIREMENTS
    ========================================================= */
    const needsState = ["3", "4", "5"].includes(
        String(selectedRole)
    );

    const needsDistrict = ["4", "5"].includes(
        String(selectedRole)
    );

    const needsBlock = String(selectedRole) === "5";

    const needsCentre = String(selectedRole) === "5";

    /* =========================================================
       LOCATION FIELD
    ========================================================= */
    const locationField = (
        name,
        label,
        options,
        valueKey,
        labelKey,
        required
    ) => (
        <div>
            <label className="block mb-2 text-[#5E6E82] font-medium">
                {label}:
                {required && (
                    <span className="text-red-500"> *</span>
                )}
            </label>

            <select
                {...register(
                    name,
                    required
                        ? {
                              required: `${label} is required`,
                          }
                        : {}
                )}
                className="w-full h-8 border shadow-inner border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={!required || options.length === 0}
            >
                <option value="">
                    Please select a {label}
                </option>

                {options.map((option) => (
                    <option
                        key={option[valueKey]}
                        value={option[valueKey]}
                    >
                        {option[labelKey]}
                    </option>
                ))}
            </select>

            {errors[name] && (
                <p className="text-red-500 text-sm">
                    {errors[name].message}
                </p>
            )}
        </div>
    );

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
        >
            {/* =====================================================
                NAME
            ====================================================== */}
            <div className="mb-2">
                <label className="block mb-2 text-[#5E6E82] font-medium">
                    Name:
                    <span className="text-red-500"> *</span>
                </label>

                <input
                    type="text"
                    {...register("name", {
                        required: "Name is required",
                        maxLength: {
                            value: 255,
                            message: "Maximum 255 characters",
                        },
                    })}
                    className="w-full shadow-inner h-8 border border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {errors.name && (
                    <p className="text-red-500 text-sm">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* =====================================================
                EMAIL
            ====================================================== */}
            <div className="mb-2">
                <label className="block mb-2 text-[#5E6E82] font-medium">
                    Email:
                    <span className="text-red-500"> *</span>
                </label>

                <input
                    type="email"
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value:
                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message:
                                "Please enter a valid email address",
                        },
                    })}
                    className="w-full h-8 border shadow-inner border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {errors.email && (
                    <p className="text-red-500 text-sm">
                        {errors.email.message}
                    </p>
                )}
            </div>

            {/* =====================================================
                ROLE + PASSWORD
            ====================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Role */}
                <div>
                    <label className="block mb-2 text-[#5E6E82] font-medium">
                        Role:
                        <span className="text-red-500"> *</span>
                    </label>

                    <select
                        {...register("role", {
                            required: "Role is required",
                        })}
                        className="w-full h-8 border shadow-inner border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">
                            Please select a Role
                        </option>

                        {roleOptions.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>

                    {errors.role && (
                        <p className="text-red-500 text-sm">
                            {errors.role.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block mb-2 text-[#5E6E82] font-medium">
                        Password
                        {mode === "create" && (
                            <span className="text-red-500"> *</span>
                        )}
                    </label>

                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={
                                mode === "edit"
                                    ? "Leave blank to keep current password"
                                    : ""
                            }
                            {...register("password", {
                                ...(mode === "create"
                                    ? {
                                          required: "Password is required",
                                          minLength: {
                                              value: 8,
                                              message: "Minimum 8 characters",
                                          },
                                      }
                                    : {}),
                            })}
                            className="w-full h-8 border shadow-inner border-gray-300 rounded px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />

                        <button
                            type="button"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                            title={
                                showPassword ? "Hide password" : "Show password"
                            }
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-[#7e2081] focus:outline-none transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff size={17} strokeWidth={2} />
                            ) : (
                                <Eye size={17} strokeWidth={2} />
                            )}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="text-red-500 text-sm">
                            {errors.password.message}
                        </p>
                    )}
                </div>
            </div>

            {/* =====================================================
                STATE + DISTRICT
            ====================================================== */}
            {needsState && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {locationField(
                        "state_lgd_code",
                        "State",
                        states,
                        "state_lgd_code",
                        "state_name",
                        true
                    )}

                    {needsDistrict &&
                        locationField(
                            "district_lgd_code",
                            "District",
                            districts,
                            "district_lgd_code",
                            "district_name",
                            true
                        )}
                </div>
            )}

            {/* =====================================================
                BLOCK + CENTRE
            ====================================================== */}
            {needsBlock && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {locationField(
                        "block_lgd_code",
                        "Block",
                        blocks,
                        "block_lgd_code",
                        "block_name",
                        true
                    )}

                    {locationField(
                        "centre_id",
                        "Centre",
                        centres,
                        "centre_id",
                        "centre_name",
                        needsCentre
                    )}
                </div>
            )}

            {/* =====================================================
                BUTTONS
            ====================================================== */}
            <div className="mt-6 flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#7e2081] hover:bg-[#69186c] text-white px-8 py-1 rounded disabled:opacity-50"
                >
                    {loading
                        ? mode === "create"
                            ? "Creating..."
                            : "Updating..."
                        : mode === "create"
                        ? "Create User"
                        : "Update User"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="border shadow-inner border-1 border-black px-8 py-1 rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}