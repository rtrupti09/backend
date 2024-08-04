const express = require("express");
const router = express.Router();
require("../util/functions");
require("../util/constants");

router.post("/password_authenticate", function (req, res, next) {
  const id = req.body.id;
  const password = encrypt(req.body.password.toString());
  const query = `SELECT id from user_def where password = '${password}' and id = ${id}`;
  db.query(query)
    .then((result) => {
      if (result && result.length !== 0) {
        res.status(200).json({
          success: true,
          data: result,
        });
      } else {
        res.status(500).json({
          success: false,
          msg: "Username and Password Does Not Match",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: SERVER_ERROR });
    });
});

router.post("/create_user", function (req, res, next) {
  const { username, name, email } = req.body;
  const password = encrypt(req.body.password.toString());
  const checkEmailUsernameQuery = `select * from user_def where email = '${email}' or username = '${username}'`;
  db.query(checkEmailUsernameQuery)
    .then((result) => {
      if (result && result.length == 0) {
        const query = `SELECT public.user_create_update_delete_ins(0, 1, '${name}', '${username}', '${email}', '${password}', 'customer', 'Active', '${name}')`;
        db.query(query)
          .then((result) => {
            if (result && result[0].user_create_update_delete_ins == 0) {
              res.status(200).json({
                success: true,
                msg : "User Created",
              });
            } else {
              res.status(500).json({
                success: false,
                msg: "Something Went Wrong",
              });
            }
          })
          .catch((err) => {
            res.status(500).json({ success: false, msg: SERVER_ERROR });
          });
      } else {
        res.status(500).json({
          success: false,
          msg: "Email or Username already Exist",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: SERVER_ERROR });
    });
});

router.get("/user_balance", function (req, res, next) {
  const id = req.query.id;
  const query = `SELECT COALESCE((
      SELECT balance
      FROM account_def
      WHERE user_id = ${id}
      ORDER BY inserted_date DESC
      LIMIT 1
      ), 0) as balance`;
  console.log(query);
  db.query(query)
    .then((result) => {
      if (result && result.length !== 0) {
        res.status(200).json({
          success: true,
          data: result,
        });
      } else {
        res.status(500).json({
          success: false,
          msg: "customer not found",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: SERVER_ERROR });
    });
});

module.exports = router;
