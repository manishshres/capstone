const { processBusinessHours } = require("../../utils/processBusinessHours");

describe("processBusinessHours", () => {
  it("should return isOpen = false and empty schedule if no hours provided", () => {
    const result = processBusinessHours();
    expect(result.isOpen).toBe(false);
    expect(result.schedule).toEqual({});
  });

  it("should return isOpen = false if all days are Closed", () => {
    const hours = `
Monday: Closed
Tuesday: Closed
Wednesday: Closed
Thursday: Closed
Friday: Closed
Saturday: Closed
Sunday: Closed
    `.trim();

    const result = processBusinessHours(hours);
    expect(result.isOpen).toBe(false);
    expect(result.schedule).toEqual({
      Monday: "Closed",
      Tuesday: "Closed",
      Wednesday: "Closed",
      Thursday: "Closed",
      Friday: "Closed",
      Saturday: "Closed",
      Sunday: "Closed",
    });
  });

  it("should return isOpen = true if at least one day is open", () => {
    const hours = `
Monday: Closed
Tuesday: 9:00 AM - 5:00 PM
Wednesday: Closed
Thursday: Closed
Friday: Closed
Saturday: Closed
Sunday: Closed
    `.trim();

    const result = processBusinessHours(hours);
    expect(result.isOpen).toBe(true);
    expect(result.schedule).toEqual({
      Monday: "Closed",
      Tuesday: "9:00 AM - 5:00 PM",
      Wednesday: "Closed",
      Thursday: "Closed",
      Friday: "Closed",
      Saturday: "Closed",
      Sunday: "Closed",
    });
  });

  it("should parse multiple open days correctly", () => {
    const hours = `
Monday: 9:00 AM - 5:00 PM
Tuesday: Closed
Wednesday: 10:00 AM - 6:00 PM
Thursday: Closed
Friday: 9:00 AM - 5:00 PM
Saturday: 9:00 AM - 1:00 PM
Sunday: Closed
    `.trim();

    const result = processBusinessHours(hours);
    expect(result.isOpen).toBe(true);
    expect(result.schedule).toEqual({
      Monday: "9:00 AM - 5:00 PM",
      Tuesday: "Closed",
      Wednesday: "10:00 AM - 6:00 PM",
      Thursday: "Closed",
      Friday: "9:00 AM - 5:00 PM",
      Saturday: "9:00 AM - 1:00 PM",
      Sunday: "Closed",
    });
  });
});
