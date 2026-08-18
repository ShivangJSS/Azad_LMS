import { useLocation } from 'react-router-dom';

import AddTraineeForm from '../components/AddTraineeForm';
import AppLayout from '../../../components/layout/AppLayout';
import Breadcrumb from '../../../shared/components/Breadcrumbs/Breadcrumbs';

const BRAND = '#732269';

export default function ParticipantCreate() {

    // When opened via a batch's "Add Participants" button, the batch (and
    // its state/district/block/centre) arrives in the router state so the
    // Add Trainee form can pre-select the cascade and assign the trainee to
    // exactly that batch.
    const location = useLocation();
    const preset = location.state || null;

    const initialData = preset
        ? {
            state_id: preset.state_id ?? '',
            district_id: preset.district_id ?? '',
            block_id: preset.block_id ?? '',
            centre_id: preset.centre_id ?? '',
            batch_id: preset.batch_id ?? '',
        }
        : null;

    const breadcrumbItems = [
        { label: 'Home', path: '/dashboard' },
        { label: 'Participants', path: '/participants/list' },
        { label: 'Add Trainee', path: '/participants/create' },
    ];

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-semibold text-gray-800">Add Trainee</span>
                <Breadcrumb items={breadcrumbItems} />
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <AddTraineeForm initialData={initialData} />
            </div>
        </AppLayout>
    );
}