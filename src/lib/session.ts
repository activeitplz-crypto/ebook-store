
'use server';

import { cookies } from 'next/headers';
import { MOCK_AUTH_COOKIE_NAME, MOCK_USERS } from './mock-data';

export async function getSession() {
  const cookieStore = cookies();
  const email = cookieStore.get(MOCK_AUTH_COOKIE_NAME)?.value;

  if (email) {
    // Find the user in our mock database
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (user) {
      return {
        isLoggedIn: true,
        email: user.email,
        name: user.name,
        // ... other non-sensitive data you might need
      };
    }
  }
  
  return null;
}
