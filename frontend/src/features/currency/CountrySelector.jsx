import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCountry, selectCountry } from './countrySlice';
import { updateUserByIdAsync } from '../user/UserSlice';
import { selectLoggedInUser } from '../auth/AuthSlice';
import { Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const CountrySelector = () => {
    const dispatch = useDispatch();
    const selectedCountry = useSelector(selectCountry);
    const loggedInUser = useSelector(selectLoggedInUser);

    const handleCountryChange = (event) => {
        const newCountry = event.target.value;
        dispatch(setSelectedCountry(newCountry));

        // Update user profile if logged in
        if (loggedInUser && loggedInUser._id) {
            dispatch(updateUserByIdAsync({
                _id: loggedInUser._id,
                country: newCountry
            }));
        }
    };

    // Initialize selected country from user profile
    useEffect(() => {
        if (loggedInUser && loggedInUser.country && loggedInUser.country !== selectedCountry) {
            dispatch(setSelectedCountry(loggedInUser.country));
        }
    }, [loggedInUser, selectedCountry, dispatch]);

    const countries = [
        { code: 'KE', name: 'Kenya' },
        { code: 'NG', name: 'Nigeria' },
        { code: 'ZA', name: 'South Africa' },
        { code: 'GH', name: 'Ghana' },
        { code: 'TZ', name: 'Tanzania' },
        { code: 'UG', name: 'Uganda' },
        { code: 'RW', name: 'Rwanda' },
        { code: 'ET', name: 'Ethiopia' },
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'JP', name: 'Japan' },
        { code: 'CN', name: 'China' },
        { code: 'IN', name: 'India' },
        { code: 'BR', name: 'Brazil' },
        { code: 'MX', name: 'Mexico' },
        { code: 'AR', name: 'Argentina' },
        { code: 'CL', name: 'Chile' },
        { code: 'CO', name: 'Colombia' },
        { code: 'PE', name: 'Peru' },
        { code: 'VE', name: 'Venezuela' },
        { code: 'EC', name: 'Ecuador' },
        { code: 'BO', name: 'Bolivia' },
        { code: 'PY', name: 'Paraguay' },
        { code: 'UY', name: 'Uruguay' },
        { code: 'GY', name: 'Guyana' },
        { code: 'SR', name: 'Suriname' },
        { code: 'TT', name: 'Trinidad and Tobago' },
        { code: 'JM', name: 'Jamaica' },
        { code: 'HT', name: 'Haiti' },
        { code: 'DO', name: 'Dominican Republic' },
        { code: 'CU', name: 'Cuba' },
        { code: 'PR', name: 'Puerto Rico' },
        { code: 'BS', name: 'Bahamas' },
        { code: 'BB', name: 'Barbados' },
        { code: 'LC', name: 'Saint Lucia' },
        { code: 'GD', name: 'Grenada' },
        { code: 'VC', name: 'Saint Vincent and the Grenadines' },
        { code: 'AG', name: 'Antigua and Barbuda' },
        { code: 'DM', name: 'Dominica' },
        { code: 'KN', name: 'Saint Kitts and Nevis' },
        { code: 'MS', name: 'Montserrat' },
        { code: 'AI', name: 'Anguilla' },
        { code: 'VG', name: 'British Virgin Islands' },
        { code: 'VI', name: 'U.S. Virgin Islands' },
        { code: 'KY', name: 'Cayman Islands' },
        { code: 'TC', name: 'Turks and Caicos Islands' },
        { code: 'BM', name: 'Bermuda' },
        { code: 'GL', name: 'Greenland' },
        { code: 'IS', name: 'Iceland' },
        { code: 'NO', name: 'Norway' },
        { code: 'SE', name: 'Sweden' },
        { code: 'FI', name: 'Finland' },
        { code: 'DK', name: 'Denmark' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'BE', name: 'Belgium' },
        { code: 'LU', name: 'Luxembourg' },
        { code: 'AT', name: 'Austria' },
        { code: 'CH', name: 'Switzerland' },
        { code: 'IT', name: 'Italy' },
        { code: 'ES', name: 'Spain' },
        { code: 'PT', name: 'Portugal' },
        { code: 'IE', name: 'Ireland' },
        { code: 'GR', name: 'Greece' },
        { code: 'TR', name: 'Turkey' },
        { code: 'RU', name: 'Russia' },
        { code: 'PL', name: 'Poland' },
        { code: 'CZ', name: 'Czech Republic' },
        { code: 'SK', name: 'Slovakia' },
        { code: 'HU', name: 'Hungary' },
        { code: 'RO', name: 'Romania' },
        { code: 'BG', name: 'Bulgaria' },
        { code: 'HR', name: 'Croatia' },
        { code: 'SI', name: 'Slovenia' },
        { code: 'BA', name: 'Bosnia and Herzegovina' },
        { code: 'ME', name: 'Montenegro' },
        { code: 'RS', name: 'Serbia' },
        { code: 'MK', name: 'North Macedonia' },
        { code: 'AL', name: 'Albania' },
        { code: 'XK', name: 'Kosovo' },
        { code: 'MT', name: 'Malta' },
        { code: 'CY', name: 'Cyprus' },
        { code: 'IL', name: 'Israel' },
        { code: 'JO', name: 'Jordan' },
        { code: 'LB', name: 'Lebanon' },
        { code: 'SY', name: 'Syria' },
        { code: 'IQ', name: 'Iraq' },
        { code: 'KW', name: 'Kuwait' },
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'QA', name: 'Qatar' },
        { code: 'BH', name: 'Bahrain' },
        { code: 'OM', name: 'Oman' },
        { code: 'YE', name: 'Yemen' },
        { code: 'IR', name: 'Iran' },
        { code: 'AF', name: 'Afghanistan' },
        { code: 'PK', name: 'Pakistan' },
        { code: 'BD', name: 'Bangladesh' },
        { code: 'LK', name: 'Sri Lanka' },
        { code: 'NP', name: 'Nepal' },
        { code: 'BT', name: 'Bhutan' },
        { code: 'MV', name: 'Maldives' },
        { code: 'MM', name: 'Myanmar' },
        { code: 'TH', name: 'Thailand' },
        { code: 'LA', name: 'Laos' },
        { code: 'KH', name: 'Cambodia' },
        { code: 'VN', name: 'Vietnam' },
        { code: 'PH', name: 'Philippines' },
        { code: 'ID', name: 'Indonesia' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'SG', name: 'Singapore' },
        { code: 'BN', name: 'Brunei' },
        { code: 'TL', name: 'Timor-Leste' },
        { code: 'PG', name: 'Papua New Guinea' },
        { code: 'SB', name: 'Solomon Islands' },
        { code: 'VU', name: 'Vanuatu' },
        { code: 'FJ', name: 'Fiji' },
        { code: 'TO', name: 'Tonga' },
        { code: 'WS', name: 'Samoa' },
        { code: 'KI', name: 'Kiribati' },
        { code: 'TV', name: 'Tuvalu' },
        { code: 'MH', name: 'Marshall Islands' },
        { code: 'PW', name: 'Palau' },
        { code: 'FM', name: 'Micronesia' },
        { code: 'NR', name: 'Nauru' },
        { code: 'NZ', name: 'New Zealand' },
        { code: 'KR', name: 'South Korea' },
        { code: 'KP', name: 'North Korea' },
        { code: 'TW', name: 'Taiwan' },
        { code: 'HK', name: 'Hong Kong' },
        { code: 'MO', name: 'Macau' },
        { code: 'MN', name: 'Mongolia' },
        { code: 'KZ', name: 'Kazakhstan' },
        { code: 'KG', name: 'Kyrgyzstan' },
        { code: 'TJ', name: 'Tajikistan' },
        { code: 'TM', name: 'Turkmenistan' },
        { code: 'UZ', name: 'Uzbekistan' },
        { code: 'AZ', name: 'Azerbaijan' },
        { code: 'GE', name: 'Georgia' },
        { code: 'AM', name: 'Armenia' },
        { code: 'BY', name: 'Belarus' },
        { code: 'UA', name: 'Ukraine' },
        { code: 'MD', name: 'Moldova' },
        { code: 'EE', name: 'Estonia' },
        { code: 'LV', name: 'Latvia' },
        { code: 'LT', name: 'Lithuania' },
        { code: 'EG', name: 'Egypt' },
        { code: 'LY', name: 'Libya' },
        { code: 'TN', name: 'Tunisia' },
        { code: 'DZ', name: 'Algeria' },
        { code: 'MA', name: 'Morocco' },
        { code: 'EH', name: 'Western Sahara' },
        { code: 'MR', name: 'Mauritania' },
        { code: 'SN', name: 'Senegal' },
        { code: 'GM', name: 'Gambia' },
        { code: 'GN', name: 'Guinea' },
        { code: 'SL', name: 'Sierra Leone' },
        { code: 'LR', name: 'Liberia' },
        { code: 'CI', name: 'Ivory Coast' },
        { code: 'BF', name: 'Burkina Faso' },
        { code: 'TG', name: 'Togo' },
        { code: 'BJ', name: 'Benin' },
        { code: 'NE', name: 'Niger' },
        { code: 'ML', name: 'Mali' },
        { code: 'TD', name: 'Chad' },
        { code: 'CM', name: 'Cameroon' },
        { code: 'GQ', name: 'Equatorial Guinea' },
        { code: 'GA', name: 'Gabon' },
        { code: 'CG', name: 'Republic of the Congo' },
        { code: 'CD', name: 'Democratic Republic of the Congo' },
        { code: 'AO', name: 'Angola' },
        { code: 'BW', name: 'Botswana' },
        { code: 'ZW', name: 'Zimbabwe' },
        { code: 'MZ', name: 'Mozambique' },
        { code: 'MW', name: 'Malawi' },
        { code: 'ZM', name: 'Zambia' },
        { code: 'NA', name: 'Namibia' },
        { code: 'SZ', name: 'Eswatini' },
        { code: 'LS', name: 'Lesotho' },
        { code: 'CV', name: 'Cape Verde' },
        { code: 'ST', name: 'São Tomé and Príncipe' },
        { code: 'GQ', name: 'Equatorial Guinea' },
        { code: 'GA', name: 'Gabon' },
        { code: 'KM', name: 'Comoros' },
        { code: 'MG', name: 'Madagascar' },
        { code: 'MU', name: 'Mauritius' },
        { code: 'SC', name: 'Seychelles' },
        { code: 'RE', name: 'Réunion' },
        { code: 'YT', name: 'Mayotte' },
        { code: 'DJ', name: 'Djibouti' },
        { code: 'SO', name: 'Somalia' },
        { code: 'SS', name: 'South Sudan' },
        { code: 'SD', name: 'Sudan' },
        { code: 'ER', name: 'Eritrea' },
        { code: 'BJ', name: 'Benin' },
        { code: 'NE', name: 'Niger' },
        { code: 'ML', name: 'Mali' },
        { code: 'TD', name: 'Chad' },
        { code: 'CM', name: 'Cameroon' },
        { code: 'GQ', name: 'Equatorial Guinea' },
        { code: 'GA', name: 'Gabon' },
        { code: 'CG', name: 'Republic of the Congo' },
        { code: 'CD', name: 'Democratic Republic of the Congo' },
        { code: 'AO', name: 'Angola' },
        { code: 'BW', name: 'Botswana' },
        { code: 'ZW', name: 'Zimbabwe' },
        { code: 'MZ', name: 'Mozambique' },
        { code: 'MW', name: 'Malawi' },
        { code: 'ZM', name: 'Zambia' },
        { code: 'NA', name: 'Namibia' },
        { code: 'SZ', name: 'Eswatini' },
        { code: 'LS', name: 'Lesotho' },
        { code: 'CV', name: 'Cape Verde' },
        { code: 'ST', name: 'São Tomé and Príncipe' },
        { code: 'GQ', name: 'Equatorial Guinea' },
        { code: 'GA', name: 'Gabon' },
        { code: 'KM', name: 'Comoros' },
        { code: 'MG', name: 'Madagascar' },
        { code: 'MU', name: 'Mauritius' },
        { code: 'SC', name: 'Seychelles' },
        { code: 'RE', name: 'Réunion' },
        { code: 'YT', name: 'Mayotte' },
        { code: 'DJ', name: 'Djibouti' },
        { code: 'SO', name: 'Somalia' },
        { code: 'SS', name: 'South Sudan' },
        { code: 'SD', name: 'Sudan' },
        { code: 'ER', name: 'Eritrea' },
    ];

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth size="small">
                <InputLabel id="country-select-label">Country</InputLabel>
                <Select
                    labelId="country-select-label"
                    id="country-select"
                    value={selectedCountry}
                    label="Country"
                    onChange={handleCountryChange}
                >
                    {countries.map((country) => (
                        <MenuItem key={country.code} value={country.name}>
                            {country.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default CountrySelector;