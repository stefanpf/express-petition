const express = require("express");
const { logUrl } = require("./helperFunctions");
const app = express();
const PORT = 8080;

app.use(logUrl);
app.use(express.static("./public"));

app.route("/").get((req, res) => {
    res.sendStatus(200);
});

app.listen(PORT, console.log(`Express server listening on port ${PORT}`));
