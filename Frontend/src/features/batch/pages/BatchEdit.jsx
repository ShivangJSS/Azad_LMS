import { useParams } from 'react-router-dom';
import BatchForm from '../components/BatchForm';
import AppLayout from '../../../components/layout/AppLayout';

const BRAND = '#732269';

export default function BatchEdit() {
    const { batchId } = useParams();

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-semibold text-gray-800">Edit Batch</span>
                <nav className="text-sm italic" style={{ color: BRAND }}>
                    Home <span className="text-gray-400 mx-1">/</span> Batches{' '}
                    <span className="text-gray-400 mx-1">/</span>
                    <span>Edit</span>
                </nav>
            </div>

            <BatchForm batchId={batchId} />
        </AppLayout>
    );
}