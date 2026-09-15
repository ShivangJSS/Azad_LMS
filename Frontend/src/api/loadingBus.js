
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
