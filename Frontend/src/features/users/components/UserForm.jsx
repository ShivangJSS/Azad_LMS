import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { getCreatableRoles } from "../services/UserService";

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
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (mode === "edit" && defaultValues) {
            reset(defaultValues);
        }
    }, [mode, defaultValues, reset]);

    // Only the roles the current user is allowed to create/assign.
    const [roleOptions, setRoleOptions] = useState([]);

    useEffect(() => {
        getCreatableRoles()
            .then((data) => setRoleOptions(Array.isArray(data) ? data : []))
            .catch(() => setRoleOptions([]));
    }, []);

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
        >
            {/* Name */}
            <div className="mb-2">
                <label className="block mb-2 text-[#5E6E82] font-medium">
                    Name: <span className="text-red-500">*</span>
                </label>

                <input
                    type="text"
                    {...register("name", {
                        required: "Name is required",
                    })}
                    className="w-full shadow-inner h-8 border border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {errors.name && (
                    <p className="text-red-500 text-sm">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Email */}
            <div className="mb-2">
                <label className="block mb-2 text-[#5E6E82] font-medium">
                    Email: <span className="text-red-500">*</span>
                </label>

                <input
                    type="email"
                    {...register("email", {
                        required: "Email is required",
                    })}
                    className="w-full h-8 border shadow-inner border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {errors.email && (
                    <p className="text-red-500 text-sm">
                        {errors.email.message}
                    </p>
                )}
            </div>

            {/* Role + Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Role */}
                <div>
                    <label className="block mb-2 text-[#5E6E82] font-medium">
                        Role: <span className="text-red-500">*</span>
                    </label>

                    <select
                        {...register("role", {
                            required: "Role is required",
                        })}
                        className="w-full h-8 border shadow-inner border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">Please select a Role</option>
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
                    <label className="block mb-2 text-[#5E6E82] font-medium shadow-inner">
                        Password
                        {mode === "create" && (
                            <span className="text-red-500"> *</span>
                        )}
                    </label>

                    <input
                        type="password"
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
                        className="w-full h-8 border shadow-inner border-gray-300 rounded px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    {errors.password && (
                        <p className="text-red-500 text-sm">
                            {errors.password.message}
                        </p>
                    )}
                </div>
        

            </div>

            {/* Buttons */}
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