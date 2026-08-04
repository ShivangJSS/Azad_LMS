import AddTraineeForm from '../components/AddTraineeForm';
import AppLayout from '../../../components/layout/AppLayout';
import Breadcrumb from '../../../shared/components/Breadcrumbs/Breadcrumbs';

const BRAND = '#732269';

export default function ParticipantCreate() {

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
                <AddTraineeForm />
            </div>
        </AppLayout>
    );
}