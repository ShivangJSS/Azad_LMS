import BatchForm from '../components/BatchForm';
import AppLayout from '../../../components/layout/AppLayout';

const BRAND = '#732269';

export default function BatchCreate() {
    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-semibold text-gray-800">Create Batch</span>
                <nav className="text-sm italic" style={{ color: BRAND }}>
                    Home <span className="text-gray-400 mx-1">/</span> Batches{' '}
                    <span className="text-gray-400 mx-1">/</span>
                    <span>Create</span>
                </nav>
            </div>

            <BatchForm />
        </AppLayout>
    );
}