const cstOffsetMs = 8 * 60 * 60 * 1000;

function toUtcFromCst(y: number, m: number, d: number, h = 0, min = 0, s = 0): Date {
  const utc = Date.UTC(y, m - 1, d, h, min, s) - cstOffsetMs;
  return new Date(utc);
}

export const CNY_COUNTDOWN_TARGET = toUtcFromCst(2027, 2, 5, 23, 59, 59);
export const CNY_RELEASE_TIME = toUtcFromCst(2027, 2, 6, 0, 0, 0);

export const MAX_WISH_PER_USER = 3;
export const DEFAULT_LIST_LIMIT = 20;
export const MAX_LIST_LIMIT = 50;

export const RELEASE_MESSAGE = "愿所有美好如期而至，新年快乐！";
