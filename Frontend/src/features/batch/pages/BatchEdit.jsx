import { useParams } from 'react-router-dom';
import BatchForm from '@/features/batch/components/BatchForm';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/shared/components/breadcrumbs/Breadcrumbs';
const BRAND = '#732269';

export default function BatchEdit() {
    const { batchId } = useParams();

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-semibold text-gray-800">Edit Batch</span>
                <Breadcrumbs
                    items={[
                        { label: "Home", path: "/dashboard" },
                        { label: "Batches", path: "/batches/list" },
                        { label: "Edit" },
                    ]}
                />
            </div>

            <BatchForm batchId={batchId} />
        </AppLayout>
    );
}