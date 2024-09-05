require('dotenv').config()
const pg = require("pg")
const express = require("express")
const client = new pg.Client(process.env.DATABASE_URL)
const app = express();
app.use(express.json());

// READ
app.get("/api/flavors", async (req, res, next) => {
    try {
      const SQL = `SELECT * from flavors ORDER BY created_at DESC`;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
  });
// POST
app.post('/api/flavors', async(req, res, next) => {
    try {
      const SQL = `
        INSERT INTO flavors(name,is_favorite)
        VALUES($1,$2)
        RETURNING *
      `;
      const response = await client.query(SQL,[req.body.name,req.body.is_favorite]);
      res.send(response.rows[0]);
    }
    catch(error){
      next(error);
    }
  });

// update
app.put('/api/flavors/:id', async(req, res, next) => {
    try {
      const SQL = `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at= now()
        WHERE id=$3 RETURNING *
      `;
  const response = await client.query(SQL, [req.body.name,req.body.is_favorite,req.params.id]);
  res.send(response.rows[0]);
    }
    catch(error){
      next(error);
    }
  });

  //DELETE
  app.delete('/api/flavors/:id', async(req, res, next) => {
    try {
      const SQL = `
        DELETE from flavors
        WHERE id = $1
      `;
      const response = await client.query(SQL, [ req.params.id]);
      res.sendStatus(204);
    }
    catch(error){
      next(error);
    }
  });

async function init() {

console.log("URL "+process.env.DATABASE_URL)
await client.connect()
console.log('connected to database')
// stock INTEGER DEFAULT 0 NOT NULL,
// price FLOAT DEFAULT 5.50 NOT NULL,
// info VARCHAR(255)
// INSERT INTO flavors(name,stock,price,info)
let SQL = /*SQL*/ `
DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors(
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_favorite BOOLEAN,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

INSERT INTO flavors(name,is_favorite) VALUES('chocolate',true);
INSERT INTO flavors(name,is_favorite) VALUES('razzberry',true);
INSERT INTO flavors(name,is_favorite) VALUES('chocolate chip',true);
INSERT INTO flavors(name,is_favorite) VALUES('mint chocolate chip',true);
INSERT INTO flavors(name,is_favorite) VALUES('strawberry',false);
INSERT INTO flavors(name,is_favorite) VALUES('blueberry',false);
INSERT INTO flavors(name,is_favorite) VALUES('blackberry',false);
INSERT INTO flavors(name,is_favorite) VALUES('banana',false);
INSERT INTO flavors(name,is_favorite) VALUES('vanilla',false);
INSERT INTO flavors(name,is_favorite) VALUES('birthday cake',false);
INSERT INTO flavors(name,is_favorite) VALUES('orange cream',false);

`;
await client.query(SQL)
console.log("data seeded")


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on port ${port}`))
}

init();