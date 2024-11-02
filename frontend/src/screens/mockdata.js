// mockData/volunteerJob.js
export const MOCK_VOLUNTEER_JOB = {
  id: "vj1",
  title: "Community Food Bank Assistant",
  description:
    "Join our team of dedicated volunteers helping to sort and distribute food to families in need. Your work will directly impact food security in our community.",
  type: "recurring",
  date: "2024-12-15",
  startTime: "09:00",
  endTime: "13:00",
  location: "Springfield Community Food Bank",
  address: "123 Main Street",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  spots: 10,
  requirements: `- Must be 18 or older
  - Able to lift 25 pounds
  - Food handling certification preferred
  - Reliable transportation
  - Commitment to food safety protocols`,
  benefits: `- Hands-on experience in food bank operations
  - Volunteer certification provided
  - Free lunch during shifts
  - Letter of recommendation available
  - Flexible scheduling options`,
  skills: [
    "Organization",
    "Teamwork",
    "Communication",
    "Physical Stamina",
    "Time Management",
    "Food Safety",
    "Inventory Management",
  ],
  responsibilies: [
    "Sort and organize food donations",
    "Pack food boxes for distribution",
    "Maintain inventory records",
    "Assist with client check-in",
    "Help maintain clean work areas",
  ],
  status: "active",
  schedule: {
    frequency: "weekly",
    days: ["Monday", "Wednesday"],
    duration: "3 months",
  },
  contact: {
    name: "Sarah Johnson",
    email: "volunteer@springfieldfoodbank.org",
    phone: "(217) 555-0123",
  },
};
