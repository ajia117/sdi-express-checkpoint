# sdi-express-checkpoint

Config: 
 - Have a local postgres docker container running on default port (5432). 
 - It should have default username "postgres" and password "docker". 
 - It will have the database "express_cp" where the data will be stored. 


User Stories: 
 - As a client application consuming your api application,
   I want to be able to receive a list of movies from the database,
   so that I can list them on my interface.
 - As a client application consuming your application,
   I want to be able to search by title for movies from the database,
   so that I can list them on my interface.