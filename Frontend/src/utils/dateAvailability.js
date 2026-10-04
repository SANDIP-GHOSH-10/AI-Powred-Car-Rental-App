export const toLocalDateOnly = (value) => {
  if (!value) return "";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const formatDateOnly = (value) => {
  const date = toLocalDateOnly(value);

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const isDateRangeAvailable = (startDate, endDate, bookedDates = []) => {
  if (!startDate || !endDate) return false;

  const start = toLocalDateOnly(startDate);
  const end = toLocalDateOnly(endDate);

  if (!(start instanceof Date) || !(end instanceof Date)) return false;
  if (end <= start) return false;

  return !bookedDates.some((booking) => {
    if (!booking?.startDate || !booking?.endDate) return false;

    const bookedStart = toLocalDateOnly(booking.startDate);
    const bookedEnd = toLocalDateOnly(booking.endDate);

    if (!(bookedStart instanceof Date) || !(bookedEnd instanceof Date)) {
      return false;
    }

    // Keep the same overlap semantics used by the backend: the booking interval
    // blocks any requested range that intersects it.
    return start < bookedEnd && end > bookedStart;
  });
};

export const isDateBlocked = (dateString, bookedRanges = []) => {
  if (!dateString) return false;

  const currentDay = toLocalDateOnly(dateString);

  if (!(currentDay instanceof Date)) {
    return false;
  }

  return bookedRanges.some((booking) => {
    if (!booking?.startDate || !booking?.endDate) return false;

    const bookedStart = toLocalDateOnly(booking.startDate);
    const bookedEnd = toLocalDateOnly(booking.endDate);

    if (!(bookedStart instanceof Date) || !(bookedEnd instanceof Date)) {
      return false;
    }

    return currentDay >= bookedStart && currentDay <= bookedEnd;
  });
};
