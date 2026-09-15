import { useLoading } from "./LoadingContext";

export default function GlobalLoader() {
    const { loading } = useLoading();

    if (!loading) {
        return null;
    }

    return (
        <>
            {/* Top bar loader */}
            <div className="fixed top-0 left-0 w-full h-1 z-[9999] overflow-hidden bg-purple-100">
                <div className="gl-bar h-full w-1/3 bg-[#7b216f]" />
            </div>

            <style>{`
                @keyframes gl-slide {
                    0% {
                        transform: translateX(-120%);
                    }
                    100% {
                        transform: translateX(360%);
                    }
                }

                .gl-bar {
                    animation: gl-slide 1s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}