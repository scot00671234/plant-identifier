// Simple client-side storage utilities
const USER_ID_KEY = 'plantid_user_id';

export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function clearUserData(): void {
  localStorage.removeItem(USER_ID_KEY);
}
