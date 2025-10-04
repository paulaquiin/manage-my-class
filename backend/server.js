const express = require("express");

const app = express();
const PORT = 3000;

//MD
app.use(express.static("public"));

app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));