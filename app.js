const express = require('express')

const {open} = require('sqlite')

const sqlite3 = require(sqlite3)
const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')

const app = express()
app.use(express.json())

const db = null
const initializeDbResponse = async () => {
  try {
    db = open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost;3000/'),
    )
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}
initializeDbResponse()

const convertDbToResponse = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const convertDirectorToResponse = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const api1 = `
  SELECT movie_name FROM movie`
  const r1 = await db.all(api1)
  response.send(r1.map(eachMovie => ({movieName: eachMovie.movie_name})))
})

// create new movie

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const api2 = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}',
  )`
  const r2 = await db.run(api2)
  response.send('Movie Successfully Added')
})

//Returns movie based on movieId

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const api3 = `
  SELECT * FROM movie WHERE 
  movie_id=${movieId}`
  const r3 = await db.get(api3)
  response.send(convertDbToResponse(movie))
})

//updates movie
app.put('/movies/:movieId', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const api4 = `
    UPDATE movie SET director_id="${directorId}",
    movie_name='${movieName}',
    lead_actor='${leadActor}' WHERE movie_id=${movieId};`
  const r4 = await db.get(api4)
  response.send('Movie Details Updated')
})

//delete
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const api5 = `
  DELETE FROM movie WHERE movie_id=${movieId}`
  const r5 = await db.run(api4)
  response.send('Movie Removed')
})

//get in director table

app.get('/directors/', async (request, response) => {
  const api6 = `
  SELECT * FROM director`
  const r6 = await db.all(api6)
  response.send(r6.map(eachDirector => convertDirectorToResponse(eachDirector)))
})

//get specific moviename

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const api7 = `
  SELECT movie_name FROM movie
  WHERE director_id='${directorId}'`
  const r7 = await db.get(api7)
  response.send(r7.map(eachMovie => ({movieName: eachMovie.movie_name})))
})

module.exports = app
