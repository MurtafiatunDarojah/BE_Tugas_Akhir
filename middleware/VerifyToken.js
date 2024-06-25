import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("header:", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token:", token);
  if (token == null) return res.status(401).json({ msg: "Token Belum Ada" });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid Token" });
    req.employeeId = decoded.employeeId;
    next();
  });
};
