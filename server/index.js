const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  deleteFavorite,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (error) {
    next(error);
  }
});
app.delete("/api/users/:user_id/favorites/:id", async (req, res, next) => {
  try {
    await deleteFavorite({ user_id: req.params.user_id, id: req.params.id });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const port = process.env.PORT || 3000;

const init = async () => {
  await client.connect();
  await createTables();
  console.log("table created");

  const [moe, lucy, ethyl, one, two, three, four] = await Promise.all([
    createUser({ username: "moe", password: "secret" }),
    createUser({ username: "lucy", password: "secret1" }),
    createUser({ username: "ethyl", password: "secret2" }),
    createProduct({ name: "one" }),
    createProduct({ name: "two" }),
    createProduct({ name: "three" }),
    createProduct({ name: "four" }),
  ]);

  const users = await fetchUsers();
  console.log("users", users);

  const products = await fetchProducts();
  console.log("products", products);

  const favorites = await Promise.all([
    createFavorite({ user_id: moe.id, product_id: four.id }),
    createFavorite({ user_id: moe.id, product_id: two.id }),
    createFavorite({ user_id: ethyl.id, product_id: three.id }),
    createFavorite({ user_id: lucy.id, product_id: one.id }),
  ]);

  console.log("favorites", favorites);

  console.log("moe's 2 products", await fetchProducts(moe.id));

  await deleteFavorite({ user_id: moe.id, id: favorites[0].id });

  console.log("moe's 1 product", await fetchProducts(moe.id));

  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
