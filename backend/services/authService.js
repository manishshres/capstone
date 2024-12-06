const supabase = require("../config/supabaseClient");
const { connectToDatabase } = require("../config/mongoDbClient");

// Register a new user
exports.register = async (email, password, name, accountType) => {
  try {
    // Register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          accountType,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Connect to MongoDB
    const db = await connectToDatabase();
    const users = db.collection("users");

    // Create user in MongoDB
    await users.insertOne({
      _id: data.user.id,
      email: data.user.email,
      name,
      accountType,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // If account type is 'org', add to organizations collection
    if (accountType === "org") {
      const organizations = db.collection("organizations");
      await organizations.insertOne({
        userId: data.user.id,
        profile: {
          name,
          email,
        },
        services: {},
        inventory: {},
        hours: {},
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        accountType,
      },
    };
  } catch (error) {
    // console.error("Registration error:", error);
    return { error: error.message };
  }
};

// Log in an existing user
exports.login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }

    // Fetch additional user data from MongoDB
    const db = await connectToDatabase();
    const users = db.collection("users");
    const userData = await users.findOne({ _id: data.user.id });
    if (!userData) {
      //throw new Error("User data not found in MongoDB");
      return { error: "User data not found in MongoDB" };
    }
    //console.log(userData);

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userData.name,
        accountType: userData.accountType,
      },
    };
  } catch (error) {
    return { error: error.message };
  }
};

// Reset password (send reset email)
exports.resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) throw new Error(error.message);

    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// Change password
exports.changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // First verify current password
    const { data: userData, error: userError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });

    if (userError) throw new Error("Current password is incorrect");

    // Update password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new Error(error.message);

    // Update MongoDB timestamp
    const db = await connectToDatabase();
    const users = db.collection("users");
    await users.updateOne(
      { _id: userId },
      { $set: { updated_at: new Date() } }
    );

    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// Update password with token (after reset)
exports.updatePasswordWithToken = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new Error(error.message);

    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};
