// src/context/BookingContext.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { createContext, useState, useContext } from 'react';

export const BookingContext = createContext();

const CURRENCIES = [
  { code: 'NPR', flag: '🇳🇵', symbol: 'Rs' },
  { code: 'USD', flag: '🇺🇸', symbol: '$' },
  { code: 'INR', flag: '🇮🇳', symbol: '₹' },
  { code: 'EUR', flag: '🇪🇺', symbol: '€' },
  { code: 'JPY', flag: '🇯🇵', symbol: '¥' },
];

const RATES = { NPR: 1, USD: 0.0075, INR: 0.63, EUR: 0.0069, JPY: 1.12 };

export function getCurrencyMeta(code) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

export function convertPrice(amount, currency) {
  const rate = RATES[currency] || 1;
  const converted = amount * rate;
  return currency === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
}

export function formatPrice(amount, currency = 'NPR') {
  const meta = getCurrencyMeta(currency);
  const val  = convertPrice(amount, currency);
  if (currency === 'JPY') return `${meta.symbol}${val.toLocaleString()}`;
  return `${meta.symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export { CURRENCIES };

const EMPTY = {
  checkIn: null, checkOut: null, adults: 1, children: 0,
  room: null, guestDetails: {}, paymentMethod: 'qr_transfer',
  proofUri: null, specialRequests: '',
};

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState(EMPTY);
  const [currency, setCurrency] = useState('NPR');

  const updateBooking = (patch) => setBooking(prev => ({ ...prev, ...patch }));
  const resetBooking  = () => setBooking(EMPTY);

  const nights = booking.checkIn && booking.checkOut
    ? Math.max(0, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000))
    : 0;

  const price         = booking.room?.base_price || 0;
  const subtotal      = price * nights;
  const taxes         = subtotal * 0.13;
  const serviceCharge = subtotal * 0.10;
  const total         = subtotal + taxes + serviceCharge;

  return (
    <BookingContext.Provider value={{
      booking, updateBooking, resetBooking,
      currency, setCurrency, nights,
      subtotal, taxes, serviceCharge, total,
      formatPrice: (amt) => formatPrice(amt, currency),
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
