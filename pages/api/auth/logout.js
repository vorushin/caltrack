import { serialize } from 'cookie';

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the auth_token cookie by setting it to expire immediately
  const cookie = serialize('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  // Set the cookie in the response
  res.setHeader('Set-Cookie', cookie);

  // Redirect to login page
  return res.status(200).json({ message: 'Logged out successfully' });
} 