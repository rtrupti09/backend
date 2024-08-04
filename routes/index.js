const express = require("express");
const router = express.Router();
require("../util/functions");
require("../util/constants");
const jwt = require("jsonwebtoken");

router.post('/authenticate', function (req, res, next) {
  console.log(req.body);
  var username = req.body.username;
  var password = req.body.password;
  password = encrypt(password);
  var query = "select * from user_def where username = $1 and password = $2";
  db.result(query, [username, password]).then(result => {
    console.log(result.rows);
    if (result.rows.length > 0) {
      var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
        data: result.rows[0]
      }, JWT_SECRET);
      if (result.rows[0].status == 'Active') {
        res.status(200).json({ success: true, msg: "Logged In Successfully", token: token, role: result.rows[0].role, id : result.rows[0].id });
        db.result("update user_def set last_login = now() where username = $1 ", [username]).then(result => { }).catch(err => { })
      }
      else {
        res.status(200).json({ success: false, msg: "User Id is Blocked" });
      }
    } else {
      res.status(200).json({ success: false, msg: "Invalid Login Id or Password" });
    }
  }).catch(err => {
    console.log(err);
    res.status(500).json({ success: false, msg: SERVER_ERROR });
  })
});
// router.post("/authenticate", function (req, res, next) {
//   console.log(req.body);
//   var username = req.body.data.attributes.username;
//   var password = req.body.data.attributes.password;
//   password = encrypt(password);
//   var query = "select * from user_def where username = $1 and password = $2";
//   db.result(query, [username, password])
//     .then((result) => {
//       console.log(result.rows);
//       if (result.rows.length > 0) {
//         var token = jwt.sign(
//           {
//             exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
//             data: result.rows[0],
//           },
//           JWT_SECRET
//         );
//         if (result.rows[0].status == "Active") {
//           if (result.rows[0].role == "banker") {
//             const getAllUserCountQuery = `select * from user_def where role != 'banker'`;
//             db.query(getAllUserCountQuery)
//               .then((data) => {
//                 res.status(200).json({
//                   success: true,
//                   msg: "Logged In Successfully",
//                   token_type: "Bearer",
//                   expires_in: "24h",
//                   access_token: token,
//                   refresh_token: token,
//                   role: result.rows[0].role,
//                   id: result.rows[0].id,
//                   userCount : data.length
//                 });
//                 db.result(
//                   "update user_def set last_login = now() where username = $1 ",
//                   [username]
//                 )
//                   .then((result) => {})
//                   .catch((err) => {});
//               })
//               .catch((error) => {});
//           } else {
//             res.status(200).json({
//               success: true,
//               msg: "Logged In Successfully",
//               token_type: "Bearer",
//               expires_in: "24h",
//               access_token: token,
//               refresh_token: token,
//               role: result.rows[0].role,
//               id: result.rows[0].id,
//             });
//             db.result(
//               "update user_def set last_login = now() where username = $1 ",
//               [username]
//             )
//               .then((result) => {})
//               .catch((err) => {});
//           }
//         } else {
//           res.status(200).json({ success: false, msg: "User Id is Blocked" });
//         }
//       } else {
//         res
//           .status(200)
//           .json({ success: false, msg: "Invalid Login Id or Password" });
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({ success: false, msg: SERVER_ERROR });
//     });
// });

module.exports = router;
