import jwt from "jsonwebtoken";

export const generateToken = ({
  payload,
  jwt_secure = process.env.JWT_SECRET,
  expiresIn = "1d",
}) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    },
    jwt_secure,
    { expiresIn },
  );
};

export const decodedToken = ({
  token,
  jwt_secure = process.env.JWT_SECRET,
}) => {
  return jwt.verify(token, jwt_secure);
};