import { OTP } from "../../DB/models/otp.model.js";
import User, { providers } from "../../DB/models/user.model.js";
import { emailEvent } from "../../utils/email/email.event.js";
import { subjects } from "../../utils/email/sendEmailFile.js";
import Randomstring from "randomstring";
import { compareHashFn } from "../../utils/hasing/hash.js";
import { decodedToken, generateToken } from "../../utils/token/token.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==================== Send OTP ====================
export const sendOtp = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    return next(new Error("User Already Exist!", { cause: 409 }));
  }

  const otp = Randomstring.generate({
    length: 5,
    charset: "numeric",
  });

  await OTP.deleteMany({ email });

  const otpCreated = await OTP.create({
    email,
    otp,
  });

  emailEvent.emit("sendEmail", {
    email,
    otp,
    subject: subjects.ACCOUNT_VERIFICATION,
  });

  return res.status(200).json({
    success: true,
    message: "OTP sent successfully",
    otpCreated, // for check in runTime (Post man)
  });
};

// ==================== Register ====================
export const registerUser = async (req, res, next) => {
  const { email, otp } = req.body;

  // Check existing user
  const user = await User.findOne({ email });

  if (user) {
    return next(new Error("User Already Exist!", { cause: 409 }));
  }

  // Check OTP
  const otpRecord = await OTP.findOne({
    email,
    otp,
  });

  if (!otpRecord) {
    return next(new Error("Invalid OTP!", { cause: 400 }));
  }

  // Create user
  const newUser = await User.create({ ...req.body, isActivated: true });

  // Delete used OTP
  await OTP.deleteMany({ email });

  return res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: newUser,
  });
};

// ==================== Login ====================
export const loginUserService = async (req, res, next) => {
  const { email, password } = req.body;
  // 1. Check required data
  if (!email || !password) {
    return next(
      new Error("Email and password are required", {
        cause: 400,
      }),
    );
  }

  // 2. Check user existence
  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new Error("Invalid email or password", {
        cause: 401,
      }),
    );
  }

  // 3. Check account activation
  if (!user.isActivated) {
    return next(
      new Error("Please activate your account first", {
        cause: 403,
      }),
    );
  }

  // 4. Check account status
  if (user.frezeed) {
    return next(
      new Error("Your account is freezed", {
        cause: 403,
      }),
    );
  }

  if (user.isDeleted) {
    return next(
      new Error("Your account has been deleted", {
        cause: 403,
      }),
    );
  }

  // 5. Compare password with hashed password
  const isPasswordMatched = compareHashFn({
    plainText: password,
    hash: user.password,
  });

  if (!isPasswordMatched) {
    return next(
      new Error("Invalid email or password", {
        cause: 401,
      }),
    );
  }

  // 6. Generate JWT
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const access_token = generateToken({
    payload,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });

  const refresh_token = generateToken({
    payload,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  // 7. Update login status
  user.isLoggedIn = true;

  await user.save();

  return res.status(201).json({
    success: true,
    message: "User Login successfully",
    user,
    token: {
      access_token,
      refresh_token,
    },
  });
};

// ==================== Forgot Password ====================

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  // 1. Check if email exists
  const user = await User.findOne({ email });

  if (!user) {
    return next(new Error("User Not Found!", { cause: 404 }));
  }

  // 2. Generate OTP
  const otp = Randomstring.generate({
    length: 5,
    charset: "numeric",
  });

  // 3. Delete old OTPs
  await OTP.deleteMany({ email });

  // 4. Create new OTP
  const otpCreated = await OTP.create({ email, otp });

  // 5. Send OTP to user's email
  emailEvent.emit("sendEmail", {
    email,
    otp,
    subject: subjects.PASSWORD_RESET,
  });

  return res.status(200).json({
    success: true,
    message: "Password reset OTP sent successfully",
    otpCreated,
  });
};

// ==================== Reset Password ====================

export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword, confirmNewPassword } = req.body;

  // 1. Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    return next(new Error("User Not Found!", { cause: 404 }));
  }

  // 2. Check password confirmation
  if (newPassword !== confirmNewPassword) {
    return next(
      new Error("Password confirmation does not match!", {
        cause: 400,
      }),
    );
  }

  // 3. Check if new password is different from old password
  const isSamePassword = await compareHashFn({
    plainText: newPassword,
    hash: user.password,
  });

  if (isSamePassword) {
    return next(
      new Error("New password must be different from the old password!", {
        cause: 400,
      }),
    );
  }

  // 4. Validate OTP
  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    return next(new Error("Invalid OTP!", { cause: 400 }));
  }

  // 5. Update password
  user.password = newPassword;

  // This triggers the pre-save hook in User Schema
  // and hashes the new password before saving it.
  await user.save();

  // 6. Delete OTP after successful reset
  await OTP.deleteMany({ email });

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
    user,
  });
};

// ==================== Refresh Token ====================
export const refreshToken = async (req, res, next) => {
  const { referesh_token } = req.body;

  if (!referesh_token) {
    return next(new Error("Refresh token is required", { cause: 400 }));
  }

  const decoded = decodedToken({
    token: referesh_token,
  });

  if (!decoded) {
    return next(
      new Error("Invalid or expired refresh token", {
        cause: 401,
      }),
    );
  }

  const user = await User.findById(decoded.id);

  if (!user || !user.isLoggedIn || user.isDeleted || user.frezeed) {
    return next(new Error("Unauthorized", { cause: 401 }));
  }

  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const access_token = generateToken({
    payload,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      access_token,
    },
  });
};

// ==================== Login With Gmail ====================

export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  // 1. Verify Google ID Token
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  // 2. Get Google user information
  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    return next(
      new Error("Invalid Google Account Information!", { cause: 401 }),
    );
  }

  const { email, name, email_verified } = payload;

  // 3. Check if Google email is verified
  if (!email_verified) {
    return next(new Error("Google Email Is Not Verified!", { cause: 401 }));
  }

  const userName = name || email.split("@")[0];

  // 3. Check if User Exists
  let user = await User.findOne({ email });

  // 4. Create New Google Account if User Doesn't Exist
  if (!user) {
    user = await User.create({
      userName,
      email,
      provider: providers.google,
      isActivated: true,
    });
  } else {
    // 5. Check Account Provider
    if (user.provider !== providers.google) {
      next(
        new Error(
          "This email is registered using Email and Password. Please login using System Login!",
          { cause: 409 },
        ),
      );
    }
  }

  // 6. Check account status
  if (!user.isActivated) {
    return next(new Error("Account Is Not Activated!", { cause: 403 }));
  }

  if (user.frezeed) {
    return next(new Error("Account Is Frozen!", { cause: 403 }));
  }

  if (user.isDeleted) {
    return next(new Error("Account Is Deleted!", { cause: 403 }));
  }

  // 7. Generate Tokens
  const tokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const access_token = generateToken({
    payload: tokenPayload,
    jwt_secure: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });

  const refresh_token = generateToken({
    payload: tokenPayload,
    jwt_secure: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  // 8. Update login status
  user.isLoggedIn = true;
  await user.save();

  // 9. Return response
  return res.status(200).json({
    success: true,
    message: "Login With Google Successfully",
    data: {
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
      token: {
        access_token,
        refresh_token,
      },
    },
  });
};
