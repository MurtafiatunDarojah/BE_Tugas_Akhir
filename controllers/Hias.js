import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import Employee from "../models/EmployeeModel.js";
import Hias from "../models/HiasModel.js";

export const getHiasAnalytics = async (req, res) => {
  try {
    const hias = await Hias.findAll({ attributes: ["createdAt"] });

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

    hias.forEach((item) => {
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

export const getHias = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const parsedLimit = parseInt(limit, 10);

    const whereClause = {};

    if (search) {
      whereClause.location = { [Op.like]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    const resp = await Hias.findAndCountAll({
      attributes: [
        "hiasId",
        "uuid",
        "url_image_location",
        "location",
        "name_of_reporter",
        "position",
        "company",
        "number",
        "department",
        "nik",
        "categories_advice",
        "mismatch",
        "reason",
        "observations",
        "corrective_actions",
        "recommendations",
        "is_confirm",
        "createdAt",
      ],
      include: [
        {
          model: Employee,
          attributes: ["employeeId", "uuid", "fullname"],
        },
      ],
      where: whereClause,
      limit: parsedLimit,
      offset,
    });

    const totalPages = Math.ceil(resp.count / limit);

    res.status(200).json({
      totalPages,
      totalHias: resp.count,
      currentPage: parseInt(page),
      hias: resp.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHiasById = async (req, res) => {
  try {
    const hias = await Hias.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!hias) return res.status(404).json({ message: "Data Tidak DItemukan" });

    const resp = await Hias.findOne({
      attributes: [
        "hiasId",
        "uuid",
        "url_image_location",
        "location",
        "name_of_reporter",
        "position",
        "company",
        "number",
        "department",
        "nik",
        "categories_advice",
        "mismatch",
        "reason",
        "observations",
        "corrective_actions",
        "is_confirm",
        "recommendations",
      ],
      include: [
        {
          model: Employee,
          attributes: ["employeeId", "uuid", "fullname"],
        },
      ],
      where: {
        uuid: req.params.id,
      },
    });
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyHias = async (req, res) => {
  try {
    const hias = await Hias.findAll({
      attributes: [
        "hiasId",
        "uuid",
        "url_image_location",
        "location",
        "name_of_reporter",
        "position",
        "company",
        "number",
        "department",
        "nik",
        "categories_advice",
        "mismatch",
        "reason",
        "observations",
        "corrective_actions",
        "recommendations",
        "is_confirm",
        "createdAt",
      ],
      where: {
        employeeId: req.params.id,
      },
    });

    if (!hias)
      return res.status(404).json({ message: "Data Hias Anda Belum Ada" });

    res.status(200).json(hias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHias = async (req, res) => {
  const {
    location,
    name_of_reporter,
    position,
    company,
    number,
    department,
    nik,
    categories_advice,
    mismatch,
    reason,
    observations,
    corrective_actions,
    recommendations,
  } = req.body;

  if (req.files === null)
    return res.status(400).json({ message: "Gambar Belum Ditambahkan" });

  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const randomNumber = Math.floor(Math.random() * 1000000000000);
  const fileName = file.md5 + randomNumber + ext;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext.toLocaleLowerCase()))
    return res
      .status(422)
      .json({ message: "Format Gambar Harus PNG/JPG/JPEG" });

  if (fileSize > 5000000)
    return res.status(422).json({ message: "Maksimal 5 MB" });

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ message: err.message });
    console.log("File berhasil dipindahkan ke folder public/images");

    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    try {
      await Hias.create({
        url_image_location: url,
        image_location: fileName,
        location,
        name_of_reporter,
        position,
        company,
        number,
        department,
        nik,
        categories_advice,
        mismatch,
        reason,
        observations,
        corrective_actions,
        recommendations,
        is_confirm: false,
        employeeId: req.employeeId,
      });
      res.status(201).json({ message: "Data Hias Berhasil Ditambahkan" });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: error.message });
    }
  });
};

export const updateHias = async (req, res) => {
  const hias = await Hias.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!hias)
    return res.status(404).json({ message: "Data Hias Tidak Ditemukan" });

  const { is_confirm } = req.body;
  try {
    await Hias.update(
      {
        is_confirm,
      },
      {
        where: {
          hiasId: hias.hiasId,
        },
      }
    );
    res.status(200).json({ message: "Data Hias Berhasil Diubah" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteHias = async (req, res) => {
  try {
    const hias = await Hias.findOne({
      where: {
        hiasId: req.params.id,
      },
    });

    if (!hias) return res.status(404).json({ message: "Data Tidak Ditemukan" });

    const filepath = `./public/images/${hias.image_location}`;
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    await Hias.destroy({
      where: {
        hiasId: hias.hiasId,
      },
    });
    res.status(200).json({ message: "Data Berhasil Dihapus" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
