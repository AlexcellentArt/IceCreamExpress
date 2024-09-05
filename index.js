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
        INSERT INTO flavors(flavor_name)
        VALUES($1)
        RETURNING *
      `;
      const response = await client.query(SQL,[req.body.flavor_name]);
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
        SET flavor_name=$1
        WHERE id=$2 RETURNING *
      `;
  const response = await client.query(SQL, [ req.body.flavor_name,req.params.id]);
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
let SQL = /*SQL*/ `
DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    flavor_name VARCHAR(255)
);

INSERT INTO flavors(flavor_name) VALUES('chocolate');
INSERT INTO flavors(flavor_name) VALUES('strawberry');
INSERT INTO flavors(flavor_name) VALUES('razzberry');
INSERT INTO flavors(flavor_name) VALUES('blueberry');
INSERT INTO flavors(flavor_name) VALUES('blackberry');
INSERT INTO flavors(flavor_name) VALUES('banana');
INSERT INTO flavors(flavor_name) VALUES('vanilla');
INSERT INTO flavors(flavor_name) VALUES('birthday cake');
INSERT INTO flavors(flavor_name) VALUES('orange cream');
INSERT INTO flavors(flavor_name) VALUES('chocolate chip');
INSERT INTO flavors(flavor_name) VALUES('mint chocolate chip');
`;

await client.query(SQL)
console.log("data seeded")


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on port ${port}`))
}

init();