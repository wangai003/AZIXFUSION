import { useEffect } from 'react';
import { checkAuthAsync } from '../../features/auth/AuthSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthChecked } from '../../features/auth/AuthSlice';

export const useAuthCheck = () => {
    const dispatch = useDispatch();
    const isAuthChecked = useSelector(selectIsAuthChecked);

    useEffect(() => {
        // Only check auth if not already checked
        if (!isAuthChecked) {
            console.log("Checking authentication status...");
            dispatch(checkAuthAsync())
                .then(() => console.log("Auth check completed"))
                .catch(err => console.error("Auth check failed:", err));
        }
    }, [dispatch, isAuthChecked]);
}
