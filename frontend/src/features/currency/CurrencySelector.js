import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCurrency, selectCurrency } from './currencySlice';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const CurrencySelector = () => {
    const dispatch = useDispatch();
    const selectedCurrency = useSelector(selectCurrency);
    //const rates = useSelector(selectRates);

    /*useEffect(() => {
        dispatch(fetchCurrencyRates());
    }, [dispatch]);*/

    const handleCurrencyChange = (event) => {
        dispatch(setSelectedCurrency(event.target.value));
    };

    //if (!rates) return null;

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth size="small">
                <InputLabel id="currency-select-label">Currency</InputLabel>
                <Select
                    labelId="currency-select-label"
                    id="currency-select"
                    value={selectedCurrency}
                    label="Currency"
                    onChange={handleCurrencyChange}
                >
                    <MenuItem value="AKOFA">AKOFA</MenuItem>
                    <MenuItem value="USDC">USDC</MenuItem>
                    <MenuItem value="BTC">BTC</MenuItem>
                    <MenuItem value="USDT">USDT</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default CurrencySelector;

export const formatPrice = (amount, selectedCurrency, rates) => {
    if (!rates || !amount) return `${amount} AKOFA`;
    
    if (selectedCurrency === 'AKOFA') return `${amount} AKOFA`;
    
    const convertedAmount = amount * rates[selectedCurrency];
    
    switch (selectedCurrency) {
        case 'USDC':
        case 'USDT':
            return `$${convertedAmount.toFixed(2)}`;
        case 'BTC':
            return `₿${convertedAmount.toFixed(8)}`;
        default:
            return `${convertedAmount.toFixed(2)} ${selectedCurrency}`;
    }
};