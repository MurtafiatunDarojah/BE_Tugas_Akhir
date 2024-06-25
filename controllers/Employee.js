import { Op } from "sequelize";
import Employee from "../models/EmployeeModel.js";
import bcrypt from "bcrypt";
import { decrypt, encrypt, generateKeys } from "../utils/rsa.js";

export const getEmployeeAnalytics = async (req, res) => {
  try {
    const employees = await Employee.findAll({ attributes: ["createdAt"] });

    const shortMonthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const data = {};

    employees.forEach((item) => {
      const createdAt = new Date(item.createdAt);
      const year = `data${createdAt.getFullYear()}`;
      const month = createdAt.getMonth();

      if (!data[year]) {
        data[year] = Array.from({ length: 12 }, (_, index) => ({
          id: index + 1,
          month: shortMonthNames[index],
          total: 0,
        }));
      }

      data[year][month].total++;
    });

    res.status(200).json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const parsedLimit = parseInt(limit, 10);

    const whereClause = {};

    if (search) {
      whereClause.fullname = { [Op.like]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    const resp = await Employee.findAndCountAll({
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
        "createdAt",
      ],
      where: whereClause,
      limit: parsedLimit,
      offset,
    });

    const totalPages = Math.ceil(resp.count / limit);

    res.status(200).json({
      totalPages,
      totalEmployees: resp.count,
      currentPage: parseInt(page),
      employees: resp.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeesDecrypted = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const parsedLimit = parseInt(limit, 10);

    const whereClause = {};

    if (search) {
      whereClause.fullname = { [Op.like]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    const resp = await Employee.findAndCountAll({
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
        "createdAt",
      ],
      where: whereClause,
      limit: parsedLimit,
      offset,
    });

    // Dekripsi data sebelum dikirimkan sebagai respons
    const decryptedEmployees = resp.rows.map((employee) => {
      const keys = generateKeys();
      const privateKey = keys.privateKey;

      return {
        ...employee.dataValues,
        nik: decrypt(employee.nik, privateKey),
        phone_number: decrypt(employee.phone_number, privateKey),
      };
    });

    const totalPages = Math.ceil(resp.count / limit);

    res.status(200).json({
      totalPages,
      totalEmployees: resp.count,
      currentPage: parseInt(page),
      employees: decryptedEmployees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!employee)
      return res.status(404).json({ message: "Pengguna Tidak DItemukan" });

    const keys = generateKeys();
    const privateKey = keys.privateKey;
    const decryptedNIK = decrypt(employee.nik, privateKey);
    const decryptedPhoneNumber = decrypt(employee.phone_number, privateKey);

    const resp = {
      employeeId: employee.employeeId,
      uuid: employee.uuid,
      nik: decryptedNIK,
      fullname: employee.fullname,
      date_birth: employee.date_birth,
      place_of_birth: employee.place_of_birth,
      username: employee.username,
      password: employee.password,
      phone_number: decryptedPhoneNumber,
      email: employee.email,
      position: employee.position,
      employee_status: employee.employee_status,
      department: employee.department,
      company: employee.company,
      role: employee.role,
      createdAt: employee.createdAt,
    };

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  const { nik } = req.body;

  // Validasi NIK harus berupa angka dan memiliki panjang tepat 16 digit
  if (!/^\d{16}$/.test(nik)) {
    return res.status(400).json({ message: "NIK harus berupa 16 digit angka" });
  }

  try {
    const employee = await Employee.findOne({
      where: {
        nik: nik,
      },
    });

    if (employee) {
      return res.status(400).json({ message: "NIK Sudah Terdaftar" });
    }

    const {
      fullname,
      date_birth,
      place_of_birth,
      username,
      password,
      confPassword,
      phone_number,
      email,
      position,
      employee_status,
      department,
      company,
    } = req.body;

    if (password !== confPassword) {
      return res.status(400).json({ message: "Password Tidak Sama" });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const keys = generateKeys();
    const publicKey = keys.publicKey;
    const encryptedNIK = encrypt(nik, publicKey);
    const encryptedPhoneNumber = encrypt(phone_number, publicKey);

    await Employee.create({
      nik: encryptedNIK,
      fullname,
      date_birth,
      place_of_birth,
      username,
      password: hashPassword,
      phone_number: encryptedPhoneNumber,
      email,
      position,
      employee_status,
      department,
      company,
      role: "employee",
    });

    res.status(201).json({ message: "Karyawan Berhasil Ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: {
        employeeId: req.params.id,
      },
    });

    if (!employee)
      return res.status(404).json({ message: "Karyawan Tidak Ditemukan" });

    await Employee.destroy({
      where: {
        employeeId: employee.employeeId,
      },
    });
    res.status(200).json({ message: "Karyawan Berhasil Dihapus" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
