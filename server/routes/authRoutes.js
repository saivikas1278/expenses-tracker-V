import express from 'express';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();
    const supabase = req.app.locals.supabase;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      const statusCode = error.status === 422 ? 409 : 400;
      return res.status(statusCode).json({ message: error.message });
    }

    if (!data.session || !data.user) {
      return res.status(400).json({ message: 'Signup succeeded but no active session was created' });
    }

    res.status(201).json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || name,
        email: data.user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();
    const supabase = req.app.locals.supabase;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.session || !data.user) {
      return res.status(401).json({ message: error?.message || 'Invalid credentials' });
    }

    res.status(200).json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || 'User',
        email: data.user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

export default router;
