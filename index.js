const express = require("express");
const apiRoute = require("./routes/api");
const app = express();

app.use(express.raw());
app.use(apiRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
