require('dotenv').config();
import app from "./app";

const PORT = process.env.PORT || 8080;

app.server.listen(PORT, () => console.log(`App listening on port ${PORT}!`));