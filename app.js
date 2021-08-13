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
  if(!idParam) { // id not valid
    res.status(400).send(`Invalid id: received ${req.params.id}`)
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
    titleQuery = '';
    /*
    res.status(400).json({
      message: `titleQuery provided is invalid: received '${req.query.title}'`
    })
    */
  }
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


/**
 * POST a new movie to the db
 * @returns status 200 if the insertion was successful into the DB
 * @returns status 400 if the given movie is not valid
 * @returns status 500 if the insertion fails
 */
app.post('/movies', (req, res) => {
  console.log(req.body);
  let newMovie = validMovie(req.body);
  if(!newMovie) {
    res.status(400).send(`Invalid movie: received ${JSON.stringify(req.body)}`);
  } else {
    // INSERT INTO movies (title, runtime, release_year, director) VALUES (<input>)
    knex('movies').insert(newMovie)
      .then(data => res.status(200).json(data))
      .catch(err => res.status(500).send(`Server error: ${err}`));
  }
})
/**
 * Validates a given movie
 * @param {*} movie the movie to be validated. Contains keys title, runtime, release_year, and director.
 * @returns true if there is a title and is valid; all other field optional but must be valid if present.
 */
const validMovie = (movie) => {
  if(movie.title && typeof movie.title === 'string' &&
     (!movie.runtime || typeof movie.runtime === 'number') &&
     (!movie.release_year || typeof movie.release_year === 'number') &&
     (!movie.director || typeof movie.director === 'string')) {
    return movie;
  }
  return false;
}

/**
 * DELETE a movie from the db given an id
 * @returns status 200 if the deletion was successful, with the response body conataining the info on the movie
 * @returns status 400 if the id given is not a avalid id
 * @returns status 404 if id is valid but no movie with that id is found
 */
app.delete('/movies/:id', (req, res) => {
  // DELETE FROM movies WHERE id = <input> RETURNING *;
  let idParam = validID(req.params.id);
  if(!idParam) { // id not valid
    res.status(400).send(`Invalid id: received ${req.params.id}`)
  } else {
    knex('movies')
      .where({id: idParam})
      .del('*')
      .then(data => {
        if(data.length === 0) {
          res.status(404).send(`No movie with id ${idParam} found`)
        } else {
          res.status(200).json(data)
        }
      })
      .catch(err => res.status(500).send(`Server error: ${err}`))

  }
})

app.listen(PORT, () => {
  console.log(`The server is running on ${PORT}`);
});