import type { DynamicFormsOverview } from "./types";

const now = Date.now();

export const demoFormsOverview: DynamicFormsOverview = {
  forms: [
    {
      id: "signup-builder",
      key: "default-signup",
      name: "Default Signup Form",
      description: "Lead capture schema for public signup surfaces. Not connected to registration.",
      kind: "SIGNUP",
      status: "PUBLISHED",
      currentVersionId: "signup-builder-v2",
      createdAt: new Date(now - 9 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      currentVersion: {
        id: "signup-builder-v2",
        version: 2,
        notes: "Added trading experience question.",
        publishedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        definition: {
          submitLabel: "Create lead",
          successMessage: "Signup schema preview completed.",
          fields: [
            { id: "first-name", key: "firstName", label: "First name", type: "TEXT", required: true, order: 1 },
            { id: "email", key: "email", label: "Email", type: "EMAIL", required: true, order: 2 },
            { id: "phone", key: "phone", label: "Phone", type: "PHONE", required: false, order: 3 },
            {
              id: "experience",
              key: "tradingExperience",
              label: "Trading experience",
              type: "SELECT",
              required: true,
              options: ["New", "Intermediate", "Professional"],
              order: 4
            },
            {
              id: "consent",
              key: "marketingConsent",
              label: "I agree to receive product updates",
              type: "CONSENT",
              required: true,
              order: 5
            }
          ]
        }
      },
      versions: []
    },
    {
      id: "questionnaire-builder",
      key: "risk-profile-questionnaire",
      name: "Risk Profile Questionnaire",
      description: "Suitability questionnaire schema for compliance review workflows.",
      kind: "QUESTIONNAIRE",
      status: "DRAFT",
      currentVersionId: "questionnaire-builder-v1",
      createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      currentVersion: {
        id: "questionnaire-builder-v1",
        version: 1,
        createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
        definition: {
          submitLabel: "Complete questionnaire",
          successMessage: "Questionnaire schema preview completed.",
          fields: [
            {
              id: "risk-appetite",
              key: "riskAppetite",
              label: "Risk appetite",
              type: "RADIO",
              required: true,
              options: ["Conservative", "Balanced", "Aggressive"],
              order: 1
            },
            {
              id: "investment-goal",
              key: "investmentGoal",
              label: "Primary objective",
              type: "TEXTAREA",
              required: true,
              placeholder: "Describe the client's trading objective",
              order: 2
            },
            {
              id: "annual-income",
              key: "annualIncome",
              label: "Annual income",
              type: "NUMBER",
              required: false,
              order: 3
            }
          ]
        }
      },
      versions: []
    }
  ]
};

demoFormsOverview.forms = demoFormsOverview.forms.map((form) => ({
  ...form,
  versions: form.currentVersion ? [form.currentVersion] : []
}));
