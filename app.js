const express = require("express");

const app = express();
const PORT = 3000;
const apiRoutes = require("./routes/api");

app.use(express.raw({
  inflate:true,
  limit: "400kb",
  type: "*/*"
}));

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is Running http://localhost:${PORT}`);
});
