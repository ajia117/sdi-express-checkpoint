const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const knex = require('knex')(require('./knexfile.js')[process.env.NODE_ENV]);

app.use(express.json());


/**
 * GET movies by id
 * @returns status 200: valid id input and movie with id found
 * @returns status 404: valid id input but no movie with id found
 * @returns status 400: invalid id supplied
 */
app.get('/movies/:id', (req, res) => {
  // SQL query: SELECT * FROM movies WHERE id = <input> 
  let idParam = validID(req.params.id) 
  if (!idParam) {
    res.status(400).json({
      message: `ID provided is invalid: received '${req.params.id}'`
    })
  } else {
    knex.select('*')
      .from('movies')
      .where('id', idParam)
      .then(data => {
        if(data.length === 0) { // no results found
          throw new Error("no results");
        }
        res.status(200).json(data);
      })
      .catch(err =>
        res.status(404).json({
          message: `No movie with id '${idParam}' found`
        }));
  } 
})

/**
 * Validates a string to represent the ID
 * @param idStr a proposed string representing the ID int
 * @returns a valid int ID, or false if the input was not a valid ID string
 */
const validID = (idStr) => {
  if(idStr) { // idStr not defined or empty
    let parsed = parseInt(idStr);
    if(parsed) { // parsed is not NaN
      return parsed > 0 ? parsed : false;
    }
  }
  return false;
}

/**
 * GET movies by query
 * @returns status 200: result of query
 */
app.get('/movies?', (req, res) => {
  // SQL query: SELECT * FROM movies WHERE title ILIKE %<input>%
  let titleQuery = req.query.title;
  if (!titleQuery) { // query not defined
    res.status(400).json({
      message: `titleQuery provided is invalid: received '${req.query.title}'`
    })
  } else {
    knex.select('*')
      .from('movies')
      .where('title', 'ILIKE', `%${titleQuery}%`)
      .then(data => {
        if(data.length === 0) {
          throw new Error("no results");
        }
        res.status(200).json(data);
      })
      .catch(err => 
        res.status(404).json({
          message: `No movie with title containing '${titleQuery}' found`
        }));
  }
})

/**
 * GET all movies in db
 */
app.get('/movies', function(req, res) {
  knex
    .select('*')
    .from('movies')
    .then(data => res.status(200).json(data))
    .catch(err =>
      res.status(404).json({
        message:
          'The data you are looking for could not be found. Please try again'
      }));
});


app.listen(PORT, () => {
  console.log(`The server is running on ${PORT}`);
});