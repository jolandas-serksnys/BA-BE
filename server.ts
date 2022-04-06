import app from "./app";
import { environment } from "./environment";

const PORT = environment.port || 8080;

app.server.listen(PORT, () => console.log(`App listening on port ${PORT}!`));