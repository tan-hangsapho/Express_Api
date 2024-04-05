import connectToDatabase from "./utils/dbConnection";
import createServer from "./server";
const port = 3000;
const app = createServer;
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
