import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/**
 * A reusable hook for handling form submissions (create and update).
 *
 * @param {object} config - The configuration object.
 * @param {string|number} [config.id] - The ID of the entity to update. If not provided, assumes create mode.
 * @param {object} config.api - An object containing the API service functions.
 * @param {function} [config.api.create] - The function to call for creating an entity.
 * @param {function} [config.api.update] - The function to call for updating an entity.
 * @param {string} config.onSuccessUrl - The URL to navigate to on successful submission.
 * @param {string} [config.entityName='Item'] - The name of the entity for use in toast messages.
 * @param {function} [config.transformPayload] - An optional function to transform the form data before sending it to the API.
 * @returns {{loading: boolean, handleSubmit: function, handleCancel: function}}
 */
export const useMasterForm = ({
  id,
  api,
  onSuccessUrl,
  entityName = 'Item',
  transformPayload = (data) => data,
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (data, setError) => {
      setLoading(true);
      try {
        const isEditMode = !!id;
        const payload = transformPayload(data, isEditMode);

        await (isEditMode ? api.update(id, payload) : api.create(payload));

        toast.success(`${entityName} ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate(onSuccessUrl);
      } catch (error) {
        const responseData = error?.response?.data;

        if (error.response?.status === 400 && typeof responseData === 'object' && setError) {
          Object.keys(responseData).forEach((fieldName) => {
            setError(fieldName, { type: 'server', message: Array.isArray(responseData[fieldName]) ? responseData[fieldName].join(' ') : responseData[fieldName] });
          });
          toast.error('Please correct the errors in the form.');
        } else {
          const detail = responseData?.detail;
          toast.error(typeof detail === 'string' ? detail : `Unable to save ${entityName.toLowerCase()}.`);
        }
      } finally {
        setLoading(false);
      }
    },
    [id, api, onSuccessUrl, entityName, transformPayload, navigate]
  );

  const handleCancel = useCallback(() => navigate(onSuccessUrl), [onSuccessUrl, navigate]);

  return { loading, handleSubmit, handleCancel };
};