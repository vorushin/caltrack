import { serialize } from 'cookie';

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get credentials from request body
    const { username, password } = req.body;

    // Get expected credentials from environment variables
    const expectedUsername = process.env.AUTH_USERNAME;
    const expectedPassword = process.env.AUTH_PASSWORD;

    // Check if credentials are provided in environment variables
    if (!expectedUsername || !expectedPassword) {
      console.error('Authentication credentials not configured in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Validate credentials
    if (username !== expectedUsername || password !== expectedPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate a simple token (in a real app, you might want to use JWT)
    const token = process.env.AUTH_TOKEN_VALUE || 'default-secure-token';

    // Set cookie with the token
    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Set the cookie in the response
    res.setHeader('Set-Cookie', cookie);

    // Return success response
    return res.status(200).json({ message: 'Authentication successful' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 