import { createContext, useContext, useEffect, useState } from "react";

import { subscribeLoading } from "../../api/loadingBus";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
    // `loading` reflects global request activity (any axios call in flight),
    // driven by the loadingBus. `setLoading` stays exposed for manual use.
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeLoading((active) => {
            setLoading(active > 0);
        });
        return unsubscribe;
    }, []);

    return (
        <LoadingContext.Provider
            value={{
                loading,
                setLoading,
            }}
        >
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    return useContext(LoadingContext);
}
