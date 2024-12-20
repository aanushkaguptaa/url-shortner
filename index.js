const express = require("express");
const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const path = require('path');
const app = express();
const PORT = 8001;
const staticRouter = require('./routes/staticRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("Mongodb connected")
);

app.set('view engine', 'ejs');
app.set("views", path.resolve('./views'));

app.use("/url", urlRoute);
app.use("/", staticRouter);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  try {
      const entry = await URL.findOneAndUpdate(
        { shortId: shortId },
        {
         $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true }
    );
    
    if (entry) {
      res.redirect(entry.redirectURL);
    } else {
      res.status(404).send('URL not found');
    }
  } 
  catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));