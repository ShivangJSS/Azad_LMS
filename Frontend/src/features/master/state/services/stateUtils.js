/**
 * Transforms the state form data into the correct payload for the API.
 * @param {object} data - The raw form data.
 * @param {boolean} isEditMode - A flag indicating if it's for an update.
 * @returns {object} The transformed payload for the API.
 */
export const transformStatePayload = (data, isEditMode) => {
    // For updates, the API doesn't require the LGD code in the payload
    if (isEditMode) {
        return {
            state_name: data.state_name.trim(),
            status: data.status,
        };
    }
    // For creation, include and format the LGD code
    return {
        state_lgd_code: Number(data.state_lgd_code),
        state_name: data.state_name.trim(),
        status: data.status,
    };
};