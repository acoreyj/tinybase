export const defaults = {
  today: () => {
    return new Date().toISOString().split('T')[0];
  },
  now: () => {
    return new Date().toISOString();
  },
};
