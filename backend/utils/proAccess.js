// backend/utils/proAccess.js

const isProActive = (user) => {
  if (!user) return false;

  if (!user.isPro) return false;

  if (!user.proExpiresAt) return true;

  return new Date(user.proExpiresAt) > new Date();
};

const refreshWeeklyInterviewWindow = (user) => {
  if (!user) return user;

  const now = new Date();
  const lastReset = user.weeklyInterviewResetAt
    ? new Date(user.weeklyInterviewResetAt)
    : new Date();

  const diffInMs = now - lastReset;
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

  if (diffInMs >= sevenDaysInMs) {
    user.weeklyInterviewCount = 0;
    user.weeklyInterviewResetAt = now;
  }

  if (user.isPro && user.proExpiresAt && new Date(user.proExpiresAt) <= now) {
    user.isPro = false;
    user.proExpiresAt = null;
  }

  return user;
};

export { refreshWeeklyInterviewWindow, isProActive };