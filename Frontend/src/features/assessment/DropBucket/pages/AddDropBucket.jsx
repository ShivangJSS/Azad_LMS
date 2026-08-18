import React from "react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import DropBucketForm from "../components/DropBucketForm";
import useDropBucketForm from "../hook/useDropBucketForm";

// =====================================================
// COMPONENT
// =====================================================

export default function AddDropBucket() {
    const navigate = useNavigate();

    const {
        form,
        loading,
        handleChange,
        handleImageChange,
        handleBucketChange,
        handleAddBucket,
        handleDeleteBucket,
        handleSubmit,
    } = useDropBucketForm();

    // =================================================
    // UI
    // =================================================

    return (
        <AppLayout>

            {/* Page Header */}

            <div className="mb-4 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Add Drop Bucket Question
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/",
                        },
                        {
                            label:
                                "Drop Bucket Questions",
                            path:
                                "/drop-bucket-master",
                        },
                        {
                            label: "Create",
                        },
                    ]}
                />

            </div>

            {/* Form */}

            <DropBucketForm
                title="Add Drop Bucket Question"
                form={form}
                loading={loading}

                submitLabel={
                    "Create Drop Bucket Question"
                }

                onChange={
                    handleChange
                }

                onImageChange={
                    handleImageChange
                }

                onBucketChange={
                    handleBucketChange
                }

                onAddBucket={
                    handleAddBucket
                }

                onDeleteBucket={
                    handleDeleteBucket
                }

                onSubmit={
                    handleSubmit
                }

                onCancel={() =>
                    navigate(
                        "/drop-bucket-master"
                    )
                }
            />

        </AppLayout>
    );
}