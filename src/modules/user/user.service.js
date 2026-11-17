import User, {
  defaultProfilePicture,
  defaultPublicId,
  defaultSecureUrl,
  providers,
} from "../../DB/models/user.model.js";
import { OTP } from "../../DB/models/otp.model.js";
import { compareHashFn } from "../../utils/hasing/hash.js";
import { emailEvent } from "../../utils/email/email.event.js";
import { subjects } from "../../utils/email/sendEmailFile.js";
import Randomstring from "randomstring";
import fs from "node:fs";
import path from "node:path";
import cloudinary from "../../utils/file uploading/cloudinary.config.js";

// ==================== Get All Profiles ====================

export const getAllProfiles = async (req, res, next) => {
  const users = await User.find({
    isActivated: true,
    isDeleted: false,
    frezeed: false,
  }).select("-password");

  return res.status(200).json({
    success: true,
    message: "Profiles retrieved successfully",
    data: users,
  });
};

// ==================== Share Specific Profile ====================

export const shareProfile = async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({
    _id: id,
    isActivated: true,
    isDeleted: false,
    frezeed: false,
  }).select("-password");

  if (!user) {
    return next(new Error("User Not Found!", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: user,
  });
};

// ==================== Update Profile ====================

export const updateProfile = async (req, res, next) => {
  const { userName } = req.body;
  const { _id } = req.user;

  // 1. Find logged-in user
  const user = await User.findById(_id);

  if (!user) {
    return next(new Error("User Not Found!", { cause: 404 }));
  }

  // 2. Check account status
  if (user.isDeleted || user.frezeed || !user.isActivated) {
    return next(new Error("Account Is Not Available!", { cause: 403 }));
  }

  // 3. Update profile
  user.userName = userName;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      provider: user.provider,
    },
  });
};

// ==================== Update Email ====================

export const updateEmail = async (req, res, next) => {
  const { email, newEmail, password } = req.body;
  const { _id } = req.user;

  // 1. Find logged-in user
  const user = await User.findById(_id);

  if (!user) {
    return next(new Error("User Not Found!", { cause: 404 }));
  }

  // 2. Check account status
  if (user.isDeleted || user.frezeed || !user.isActivated) {
    return next(new Error("Account Is Not Available!", { cause: 403 }));
  }

  // 3. Check provider
  if (user.provider !== providers.system) {
    return next(
      new Error(
        "Google accounts cannot change email using password authentication!",
        { cause: 400 },
      ),
    );
  }

  // 4. Verify current email
  if (user.email !== email) {
    return next(new Error("Current email is incorrect!", { cause: 400 }));
  }

  // 5. Check if new email is different
  if (newEmail === user.email) {
    return next(
      new Error("New email must be different from current email!", {
        cause: 400,
      }),
    );
  }

  // 6. Check if new email already exists
  const existingUser = await User.findOne({ email: newEmail });

  if (existingUser) {
    return next(new Error("Email Already Exists!", { cause: 409 }));
  }

  // 7. Verify current password
  const isPasswordMatched = await compareHashFn({
    plainText: password,
    hash: user.password,
  });

  if (!isPasswordMatched) {
    return next(new Error("Incorrect Password!", { cause: 401 }));
  }

  // 8. Generate OTP
  const otp = Randomstring.generate({
    length: 5,
    charset: "numeric",
  });

  // 9. Delete previous OTPs
  await OTP.deleteMany({ email: newEmail });

  // 10. Create OTP
  await OTP.create({
    email: newEmail,
    otp,
  });

  // 11. Send OTP
  emailEvent.emit("sendEmail", {
    email: newEmail,
    otp,
    subject: subjects.ACCOUNT_VERIFICATION,
  });

  return res.status(200).json({
    success: true,
    message: "OTP sent successfully to your new email",
  });
};

// ==================== Confirm Update Email ====================

export const confirmUpdateEmail = async (req, res, next) => {
  const { newEmail, otp } = req.body;
  const { _id } = req.user;

  // 1. Find logged-in user
  const user = await User.findById(_id);

  if (!user) {
    return next(new Error("User Not Found!", { cause: 404 }));
  }

  // 2. Check account status
  if (user.isDeleted || user.frezeed || !user.isActivated) {
    return next(new Error("Account Is Not Available!", { cause: 403 }));
  }

  // 3. Check provider
  if (user.provider !== providers.system) {
    return next(
      new Error("Google accounts cannot change email using this method!", {
        cause: 400,
      }),
    );
  }

  // 4. Check if new email is the same
  if (newEmail === user.email) {
    return next(
      new Error("This email is already associated with your account!", {
        cause: 400,
      }),
    );
  }

  // 5. Check if email already exists
  const existingUser = await User.findOne({ email: newEmail });

  if (existingUser) {
    return next(new Error("Email Already Exists!", { cause: 409 }));
  }

  // 6. Verify OTP
  const otpRecord = await OTP.findOne({
    email: newEmail,
    otp,
  });

  if (!otpRecord) {
    return next(new Error("Invalid OTP!", { cause: 400 }));
  }

  // 7. Update email
  user.email = newEmail;

  await user.save();

  // 8. Delete used OTP
  await OTP.deleteMany({ email: newEmail });

  return res.status(200).json({
    success: true,
    message: "Email updated successfully",
    data: {
      _id: user._id,
      userName: user.userName,
      email: user.email,
    },
  });
};

// ==================== Confirm Password ====================

export const confirmPassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const { _id } = req.user;

  // 1. Find logged-in user
  const user = await User.findById(_id);

  if (!user) {
    return next(new Error("User Not Found!", { cause: 404 }));
  }

  // 2. Check account status
  if (user.isDeleted || user.frezeed || !user.isActivated) {
    return next(new Error("Account Is Not Available!", { cause: 403 }));
  }

  // 3. Check provider
  if (user.provider !== providers.system) {
    return next(
      new Error("Google accounts do not have a system password!", {
        cause: 400,
      }),
    );
  }

  // 4. Verify old password
  const isOldPasswordMatched = await compareHashFn({
    plainText: oldPassword,
    hash: user.password,
  });

  if (!isOldPasswordMatched) {
    return next(new Error("Old Password Is Incorrect!", { cause: 401 }));
  }

  // 5. Check if new password is different
  const isSamePassword = await compareHashFn({
    plainText: newPassword,
    hash: user.password,
  });

  if (isSamePassword) {
    return next(
      new Error("New password must be different from old password!", {
        cause: 400,
      }),
    );
  }

  // 6. Update password
  user.password = newPassword;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
};

// ==================== Upload Profile Picture ====================

export const uploadProfilePicture = async (req, res, next) => {
  const { _id } = req.user;
  const file = req.file;

  if (!file) {
    return next(new Error("Please upload a profile picture", { cause: 400 }));
  }

  const user = await User.findById(_id);

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  user.profilePicture = file.path;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile picture uploaded successfully",
    data: {
      profilePicture: user.profilePicture,
    },
  });
};
// ==================== Upload Profile Picture Cloudnairy ====================

export const uploadProfilePictureCloudnairy = async (req, res, next) => {
  const { _id } = req.user;
  const file = req.file.path;
  const user = await User.findById(_id);

  if (!file) {
    return next(new Error("Please upload a profile picture", { cause: 400 }));
  }
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const { public_id, secure_url } = await cloudinary.uploader.upload(file, {
    folder: `users/${user._id}/profile-pictures`,
  });

  user.profilePicture = { public_id, secure_url };
  await user.save();

  // "public_id": "xe4qer2eujvrlmorajty"

  return res.status(200).json({
    success: true,
    message: "Profile picture uploaded in Cloudnairy successfully",
    data: {
      user,
    },
  });
};

// ==================== Upload Cover Pictures ====================

export const uploadCoverPictures = async (req, res, next) => {
  const { _id } = req.user;
  const files = req.files;

  if (!files || files.length === 0) {
    return next(new Error("Please upload cover pictures", { cause: 400 }));
  }
  const user = await User.findById(_id);

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const imagePaths = files.map((file) => file.path);

  user.coverPictures.push(...imagePaths);

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Cover pictures uploaded successfully",
    data: {
      coverPictures: user.coverPictures,
    },
  });
};

// ==================== Delete Profile Picture ====================

export const deleteProfilePicture = async (req, res, next) => {
  const { _id } = req.user;

  const user = await User.findById(_id);

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (!user.profilePicture) {
    return next(new Error("No profile picture found", { cause: 404 }));
  }

  const pathPicture = path.resolve(process.cwd(), user.profilePicture);
  fs.unlinkSync(pathPicture);
  user.profilePicture = defaultProfilePicture;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Profile picture deleted successfully",
    data: {
      profilePicture: user.profilePicture,
    },
  });
};
// ==================== Delete Profile Picture ====================

export const deleteProfilePictureCloudnairy = async (req, res, next) => {
  const { _id } = req.user;
  const user = await User.findById(_id);

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (!user.profilePicture) {
    return next(new Error("No profile picture found", { cause: 404 }));
  }

  const resault = await cloudinary.uploader.destroy(
    user.profilePicture.public_id,
  );

  if (resault.result === "ok") {
    user.profilePicture = {
      public_id: defaultPublicId,
      secure_url: defaultSecureUrl,
    };
  }

  // const pathPicture = path.resolve(process.cwd(), user.profilePicture);
  // fs.unlinkSync(pathPicture);
  // user.profilePicture = defaultProfilePicture;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile picture deleted successfully",
    data: {
      resault,
    },
    user,
  });
};
