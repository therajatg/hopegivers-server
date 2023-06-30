const { pool } = require("../db/db");

const postContact = async (req, res) => {
  const { name, number, email, message } = req.body.contactDetail;
  try {
    await pool.query(
      "INSERT INTO contact (name, number, email, message) VALUES($1, $2, $3, $4)",
      [name, number, email, message]
    );
    res.status(200).json({ msg: "Contact Details Sent to Administrator" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getContact = async (req, res) => {
  try {
    const allContacts = await pool.query("SELECT * FROM contact");
    res.status(200).json(allContacts.rows);
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const deleteContact = async (req, res) => {
  try {
    await pool.query("DELETE FROM contact WHERE id=$1", [req.params.id]);
    const contacts = await pool.query("SELECT * FROM contact");
    res.status(200).json(contacts.rows);
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = { postContact, getContact, deleteContact };
