import { useLoading } from "./LoadingContext";

export default function GlobalLoader() {
    const { loading } = useLoading();

    if (!loading) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-[#7b216f]"></div>
        </div>
    );
}