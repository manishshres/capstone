exports.processBusinessHours = (hours) => {
  if (!hours) return { isOpen: false, schedule: {} };

  const schedule = {};
  const lines = hours.split("\n");

  lines.forEach((line) => {
    const [day, time] = line.split(": ");
    schedule[day] = time === "Closed" ? "Closed" : time;
  });

  return {
    isOpen: Object.values(schedule).some((time) => time !== "Closed"),
    schedule,
  };
};
