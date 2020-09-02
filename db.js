//Initiallising node modules
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const app = express();
const dbConfig = require("./config")
// Body Parser Middleware
app.use(bodyParser.json());

//CORS Middleware
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  next();
});

//Setting up server
const server = app.listen(process.env.PORT || 8080, function () {
  const port = server.address().port;
  console.log("App now running on port", port);
});

// Change execute query to accept parameters.
const executeQuery = function (res, query, parameters) {
  sql.connect(dbConfig, function (err) {
    if (err) {
      console.log("there is a database connection error -> " + err);
      res.send(err);
    } else {
      // create request object
      let request = new sql.Request();

      // Add parameters
      if (parameters) {
        parameters.forEach(function (p) {
          request.input(p.name, p.sqltype, p.value);
        });
      }
      // query to the database
      request.query(query, function (err, result) {
        if (err) {
          console.log("error while querying database -> " + err);
          //   res.send(err);
        } else {
          //   res.send(result);
          res
            .type("json")
            .send(JSON.stringify(result, null, 2) + "\n");
          sql.close();
        }
      });
    }
  });
};

const tablename = "[SMDB].[dbo].[idd_project_filter]"; // İşlemlerin yapılacağı sql tablo
//GET ALL PROJECTS
app.get("/api/Projects", function (req, res) {
  let query = `select * from ${tablename}`;
  executeQuery(res, query);
});

//GET ONE PROJECTID
app.get("/api/Projects/:id/", function (req, res) {
  let query = `select * from ${tablename} where [projectId] = '${req.params.id}'`;
  executeQuery(res, query);
});

//POST API
app.post("/api/Addfilter", function (req, res) {
  const { projectId, qtag, operator, filtre } = req.body;
  var parameters = [
    { name: "projectId", sqltype: sql.NVarChar, value: projectId },
    { name: "qtag", sqltype: sql.NVarChar, value: qtag },
    { name: "operator", sqltype: sql.NVarChar, value: operator },
    { name: "filtre", sqltype: sql.NVarChar, value: filtre },
  ];
  var query = `INSERT INTO ${tablename} (projectId, qtag, operator, filtre) VALUES (@projectId, @qtag,@operator,@filtre)`;
  executeQuery(res, query, parameters);
});

//PUT API
app.put("/api/Updatefilter/:id", function (req, res) {
  const { projectId, qtag, operator, filtre } = req.body;
  let query = `UPDATE ${tablename} SET qtag='${qtag}',filtre='${filtre}' where id=${req.params.id}`;
  executeQuery(res, query);
});

// DELETE API
app.delete("/api/Deletefilter/:id", function (req, res) {
  let query = `DELETE FROM ${tablename} where id=${req.params.id}`;
  executeQuery(res, query);
});
