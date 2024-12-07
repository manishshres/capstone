exports.processBusinessHours = (hours) => {
  if (!hours) return { isOpen: false, schedule: {} };

  const schedule = {};
  const lines = hours.split("\n");

  lines.forEach((line) => {
    const [day, time] = line.split(": ");

    if (!day || !time) return;

    // Normalize time string for consistent checking
    const normalizedTime = time.trim().toLowerCase();

    if (normalizedTime.includes("24 hours")) {
      // If it says "Open 24 hours"
      schedule[day] = "Open 24 hours";
    } else if (normalizedTime === "closed") {
      // If the business is closed that day
      schedule[day] = "Closed";
    } else {
      // Any other time format
      schedule[day] = time.trim();
    }
  });

  // Determine if the business is open on any day
  const isOpen = Object.values(schedule).some(
    (time) => time !== "Closed" && time !== undefined
  );

  return {
    isOpen,
    schedule,
  };
};
