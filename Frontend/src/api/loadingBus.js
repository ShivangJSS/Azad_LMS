/* =========================================================================
   loadingBus — a tiny module-level pub/sub so the axios interceptors (which
   live outside React) can drive the global loading indicator.

   It counts in-flight requests; `subscribeLoading` fires with the current
   active count whenever it changes. The LoadingProvider listens and flips the
   global loader on while count > 0.
========================================================================= */

let active = 0;
const listeners = new Set();

const emit = () => {
    listeners.forEach((cb) => {
        try {
            cb(active);
        } catch {
            /* ignore listener errors */
        }
    });
};

export const startLoading = () => {
    active += 1;
    emit();
};

export const stopLoading = () => {
    active = Math.max(0, active - 1);
    emit();
};

export const subscribeLoading = (cb) => {
    listeners.add(cb);
    cb(active); // push current state immediately
    return () => listeners.delete(cb);
};
