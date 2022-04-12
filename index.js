const express = require('express'); 
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var cors = require('cors');
app.use(cors());

var shortid = require('shortid');

const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.send(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
})

app.post('/dbput', async (req, res) => {
    
    var text = 'INSERT INTO code_store(id, code) VALUES($1, $2) RETURNING *';   
    try {
      id = req.body['id'];
      code = req.body['code'];
      
      if (id === null) {
        id = shortid.generate();
      }
      else {
        text = 'UPDATE code_store SET code = $2 WHERE id = $1 RETURNING *';             
      }
           
      const client = await pool.connect();      
      const result = await client.query(text, [id, code]);
      const results = { 'results': (result) ? result.rows : null};
      console.log(results);
      console.log(id);
      res.send(id);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
})
app.get('/dbget', async (req, res) => {
    const text = 'SELECT * from code_store WHERE id = $1';
    try {
      const client = await pool.connect();
      const result = await client.query(text, [req.query.id]);
      const results = { 'results': (result) ? result.rows[0] : null};
      console.log(results);
      res.send(result.rows[0]['code']);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
})


app.post('/dbtestput', async (req, res) => {
    const text = 'INSERT INTO code_store(id, code) VALUES($1, $2) RETURNING *';   
    try {
      const client = await pool.connect();
      const result = await client.query(text, ['12345', 'print("Hello, world!")']);
      const results = { 'results': (result) ? result.rows : null};
      res.send("12345");
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
})


app.listen(PORT, () => console.log(`Listening on ${ PORT }`));