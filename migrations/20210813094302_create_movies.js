
exports.up = function(knex) {
  return knex.schema.createTable('movies', (table) => {
    table.increments('id');
    table.string('title').notNullable();
    table.integer('runtime');
    table.integer('release_year');
    table.string('director');
    table.timestamps(true,true);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('movies');
};
