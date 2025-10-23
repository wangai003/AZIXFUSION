import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPaymentStatusAsync, selectCurrentPaymentStatus, selectPaymentIntentId } from './PaymentSlice';
import { useNavigate } from 'react-router-dom';

export const usePaymentStatusPoller = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const paymentIntentId = useSelector(selectPaymentIntentId);
    const currentStatus = useSelector(selectCurrentPaymentStatus);
    const pollIntervalRef = useRef(null);

    const startPolling = (intentId, redirectPath = '/order-success') => {
        if (!intentId) return;

        // Clear any existing polling
        stopPolling();

        // Start polling every 5 seconds
        pollIntervalRef.current = setInterval(async () => {
            try {
                const result = await dispatch(getPaymentStatusAsync(intentId)).unwrap();

                if (result.status === 'paid') {
                    // Payment successful - redirect to success page
                    stopPolling();
                    navigate(`${redirectPath}/${intentId}`);
                } else if (result.status === 'failed') {
                    // Payment failed - could show error or redirect to retry
                    stopPolling();
                    console.error('Payment failed');
                    // Could dispatch an action to show error modal
                }
                // Continue polling for 'pending' status
            } catch (error) {
                console.error('Error polling payment status:', error);
                // Could implement retry logic or exponential backoff
            }
        }, 5000); // Poll every 5 seconds
    };

    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, []);

    return {
        startPolling,
        stopPolling,
        currentStatus
    };
};