import React, { useState, useEffect } from 'react';

interface CedulaInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

const CEDULA_TYPES = [
    { value: 'V', label: 'V' },
    { value: 'E', label: 'E' },
    { value: 'CE', label: 'CE' },
    { value: 'P', label: 'P' },
];

export const CedulaInput: React.FC<CedulaInputProps> = ({ value, onChange, disabled, className, placeholder }) => {
    const [type, setType] = useState('V');
    const [number, setNumber] = useState('');

    useEffect(() => {
        if (value) {
            const parts = value.split('-');
            if (parts.length === 2) {
                setType(parts[0]);
                setNumber(parts[1]);
            } else {
                // Handle legacy or unformatted values
                setNumber(value);
            }
        } else {
            setNumber('');
        }
    }, [value]);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value;
        setType(newType);
        updateValue(newType, number);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-numeric characters
        const rawValue = e.target.value.replace(/\D/g, '');

        // Format with dots
        const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        setNumber(formattedValue);
        updateValue(type, formattedValue);
    };

    const updateValue = (t: string, n: string) => {
        if (n) {
            onChange(`${t}-${n}`);
        } else {
            onChange('');
        }
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            <select
                value={type}
                onChange={handleTypeChange}
                disabled={disabled}
                className="p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary w-24"
            >
                {CEDULA_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </select>
            <input
                type="text"
                value={number}
                onChange={handleNumberChange}
                disabled={disabled}
                placeholder={placeholder || "12.345.678"}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
        </div>
    );
};
