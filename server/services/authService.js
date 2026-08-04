const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user.
 */
const registerUser = async ({ full_name, email, password }) => {

  const normalizedEmail = email.trim().toLowerCase();

  // Check whether email already exists
  const { data: existingUser, error: lookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

 if (lookupError) {
  const error = new Error(
    `Failed to check existing user: ${lookupError.message}`
  );
  error.statusCode = 500;
  throw error;
}

  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert new user
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        full_name: full_name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
      },
    ])
    .select('id, full_name, email')
    .single();

 if (error) {
  const dbError = new Error(
    `Failed to create user: ${error.message}`
  );
  dbError.statusCode = 500;
  throw dbError;
}

  // Generate JWT
  const token = generateToken({
    id: data.id,
    full_name: data.full_name,
    email: data.email,
  });

  return {
    user: data,
    token,
  };
};

/**
 * Authenticate a user by email and password.
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: user, error: lookupError } = await supabase
    .from('profiles')
    .select('id, full_name, email, password_hash')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (lookupError) {
  const error = new Error(
    `Failed to lookup user: ${lookupError.message}`
  );
  error.statusCode = 500;
  throw error;
}

  if (!user || !user.password_hash) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
    },
    token,
  };
};

/**
 * Get a user's profile by ID.
 */
const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    const dbError = new Error(`Failed to fetch profile: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  if (!data) {
    const notFoundError = new Error('User profile not found');
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  return data;
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};