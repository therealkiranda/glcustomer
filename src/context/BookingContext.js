// src/context/BookingContext.js
// Author: Kiran Khadka, Contact: +977-9869756622, Mail: therealkiranda@gmail.com
// © 2026 Kiran Khadka. All rights reserved.
import React, { createContext, useState, useContext } from 'react';

export const BookingContext = createContext();

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

  const price = booking.room?.base_price || 0;
  const subtotal      = price * nights;
  const taxes         = subtotal * 0.13;
  const serviceCharge = subtotal * 0.10;
  const total         = subtotal + taxes + serviceCharge;

  return (
    <BookingContext.Provider value={{
      booking, updateBooking, resetBooking,
      currency, setCurrency, nights,
      subtotal, taxes, serviceCharge, total,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
