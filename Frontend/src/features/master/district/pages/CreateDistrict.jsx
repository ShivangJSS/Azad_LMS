import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import DistrictForm from "../components/DistrictForm";

import { createDistrict } from "../services/DistrictService";
import { getAllStates } from "../../state/services/StateService";

const breadcrumbItems = [
  { label: "Home", path: "/dashboard" },
  { label: "District Masters", path: "/master/districts" },
  { label: "Add District" },
];

export default function CreateDistrict() {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await getAllStates();
        const payload = response?.data ?? response ?? [];

        setStates(Array.isArray(payload) ? payload : (payload.data ?? []));
      } catch (error) {
        console.error("State API Error:", error?.response?.data ?? error);
        setStates([]);
      }
    };

    fetchStates();
  }, []);

  const handleCreate = useCallback(
    async (data) => {
      setLoading(true);

      try {
        await createDistrict({
          district_lgd_code: Number(data.district_lgd_code),
          district_name: data.district_name.trim(),
          state_lgd_code: Number(data.state_lgd_code),
          status: data.status,
        });

        toast.success("District created successfully.");
        navigate("/master/districts");
      } catch (error) {
        console.error("Create failed:", error?.response?.data);

        const detail = error?.response?.data?.detail;
        toast.error(
          typeof detail === "string"
            ? detail
            : "Unable to create district.",
        );
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  const handleCancel = useCallback(
    () => navigate("/master/districts"),
    [navigate],
  );

  return (
    <AppLayout>
      <div className="mb-[16px] flex w-full items-center justify-between px-3">
        <div className="text-[20px] font-medium text-[#344050]">
          District Masters
        </div>

        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="px-3">
        <DistrictForm
          mode="create"
          states={states}
          loading={loading}
          onSubmit={handleCreate}
          onCancel={handleCancel}
        />
      </div>
    </AppLayout>
  );
}