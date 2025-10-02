import jwt from "jsonwebtoken";

export const generateToken = (payload: object) => {
  const secret = process.env.ACCESS_TOKEN!;
  const token = jwt.sign(payload, secret, { expiresIn: "1d" });
  return token;
};
