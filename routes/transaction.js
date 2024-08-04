const express = require("express");
const router = express.Router();
require("../util/functions");
require("../util/constants");

router.get("/all_transaction", function (req, res, next) {
  const id = req.query.id;
  let query;
  if (id && id !== "") {
    query = `select ad.*, ud.username, ud.email, ud."name"  from account_def ad 
    inner join user_def ud on ud.id = ad.user_id
    where ad.user_id = ${id}
    order by ad.inserted_date DESC`;
  } else {
    query = `select ad.*, ud.username, ud.email, ud."name"  from account_def ad 
    inner join user_def ud on ud.id = ad.user_id
    order by ad.inserted_date DESC`;
  }
  console.log(query);
  db.query(query)
    .then((result) => {
      res.status(200).json({
        success: true,
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: SERVER_ERROR });
    });
});

router.post("/create_transaction", function (req, res, next) {
  const id = req.body.id;
  const amount = req.body.amount;
  const transaction_type = req.body.transaction_type;
  const inserted_by = req.body.inserted_by;
  let type;
  let mode;
  if (transaction_type == "DEPOSIT") {
    mode = 0;
    type = "CREDIT";
  } else if (transaction_type == "WITHDRAW") {
    mode = 1;
    type = 'DEBIT'
  }
  const query = `SELECT public.account_credit_debit_ins(${mode}, ${id}, '${type}', ${amount}, '${inserted_by}')`;
  console.log(query);
  db.query(query)
    .then((result) => {
      console.log(result);
      const out_error_code = result[0].account_credit_debit_ins
      if (out_error_code == 0) {
        res.status(200).json({
          success: true,
          msg: `Transaction Done`,
        });
      }else if (out_error_code == 500){
        res.status(500).json({
          success: false,
          msg: `Transaction Fail Insufficient Balance`,
        });
      }
      else{
        res.status(500).json({
          success: false,
          msg: SERVER_ERROR,
        });
      }
     
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: SERVER_ERROR });
    });
});

module.exports = router;
