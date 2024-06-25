import Employee from "../models/EmployeeModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getProfile = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({
      where: { employeeId: employeeId },
      attributes: [
        "employeeId",
        "uuid",
        "nik",
        "fullname",
        "date_birth",
        "place_of_birth",
        "username",
        "password",
        "phone_number",
        "email",
        "position",
        "employee_status",
        "department",
        "company",
        "role",
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Karyawan tidak ditemukan" });
    }

    res.status(200).json({ employee });
  } catch (error) {
    console.error("Error verifying access token:", error.message);
    return res.status(401).json({ message: "Unauthenticated" });
  }
};

export const Login = async (req, res) => {
  try {
    const employee = await Employee.findAll({
      where: {
        email: req.body.email,
      },
    });

    if (employee.length === 0) {
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(
      req.body.password,
      employee[0].password
    );
    if (!isMatch) return res.status(400).json({ message: "Password Salah" });

    const employeeId = employee[0].employeeId;
    const name = employee[0].fullname;
    const email = employee[0].email;
    const accessToken = jwt.sign(
      { employeeId, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const role = employee[0].role;

    await Employee.update(
      {
        token: accessToken,
      },
      {
        where: {
          employeeId: employeeId,
        },
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login Berhasil", accessToken, role });
  } catch (error) {
    res.status(404).json({ messasge: error });
  }
};

export const Logout = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken)
    return res.status(204).json({ message: "Anda Belum Login" });

  const employee = await Employee.findAll({
    where: {
      token: accessToken,
    },
  });
  if (!employee[0]) return res.sendStatus(204);
  const employeeId = employee[0].employeeId;
  try {
    await Employee.update(
      { token: null },
      {
        where: {
          employeeId: employeeId,
        },
      }
    );
    res.clearCookie("accessToken");
    res.status(200).json({ message: "Logout Berhasil" });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};
