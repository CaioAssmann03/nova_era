module.exports = {
  type: "sqlite",
  database: "barbershop.sqlite",
  synchronize: true,
  logging: false,
  entities: [
    "src/entity/**/*.js"
  ]
};