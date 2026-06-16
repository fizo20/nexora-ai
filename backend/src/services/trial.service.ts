// src/services/trial.service.ts
export const isTrialExpired = (trialStartedAt: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(trialStartedAt).getTime();

  const days = diff / (1000 * 60 * 60 * 24);

  return days > 7;
};
