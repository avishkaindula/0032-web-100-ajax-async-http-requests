const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const posts = await db
    .getDb()
    .collection("posts")
    .find({}, { title: 1, summary: 1, "author.name": 1 })
    .toArray();
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  const authors = await db.getDb().collection("authors").find().toArray();
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const authorId = new ObjectId(req.body.author);
  const author = await db
    .getDb()
    .collection("authors")
    .findOne({ _id: authorId });

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email,
    },
  };

  const result = await db.getDb().collection("posts").insertOne(newPost);
  console.log(result);
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) }, { summary: 0 });

  if (!post) {
    return res.status(404).render("404");
  }

  post.humanReadableDate = post.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  post.date = post.date.toISOString();

  res.render("post-detail", { post: post, comments: null });
});

router.get("/posts/:id/edit", async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) }, { title: 1, summary: 1, body: 1 });

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: post });
});

router.post("/posts/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection("posts")
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
          // date: new Date()
        },
      }
    );

  res.redirect("/posts");
});

router.post("/posts/:id/delete", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection("posts")
    .deleteOne({ _id: postId });
  res.redirect("/posts");
});

router.get("/posts/:id/comments", async function (req, res) {
  const postId = new ObjectId(req.params.id);

  // const post = await db.getDb().collection("posts").findOne({ _id: postId });
  // Previously we needed to fetch posts in addition to the comments because
  // We had to render the complete post-detail.ejs template.
  // Now since we don't load a new page, but only sends back specific data,
  // We don't need to get the posts again in this route.
  // We only need to send back the comments data as JSON to the comments.js file from this route.

  const comments = await db
    .getDb()
    .collection("comments")
    .find({ postId: postId })
    .toArray();

  // return res.render("post-detail", { post: post, comments: comments });
  // const responseData on comments.js is the data that we can use in our code to
  // update parts of the loaded page. But that would fail if the /post/:id/comments get route on blog.js
  // does not return any JSON.
  // Therefor we need to provide that JSON data to comments.js by using the following code.
  res.json(comments);
  // .json() will encode data as JSON to send it as a response to comments.js file.
  // First of all we need to provide the value that should be encoded to JSON.
  // And that value is const comments.
  // We can alternatively write the above code like this => res.json({comments : comments});
  // This is an object that has a "comments" key which then stores the comments
  // So the comments array would be a nested array in this object.
});

router.post("/posts/:id/comments", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const newComment = {
    postId: postId,
    title: req.body.title,
    text: req.body.text,
    // When we extract data from the request body, we currently only do that if the req body is URL encoded.
    // In app.js we added URL encoded Middleware for parsing all incoming requests for
    // data that might be attached to them.
    // But that only look for data that is URL encoded, which is the format if a form is submitted.
    // But we are instead sending JSON data from the comments.js file to this route.
    // So we need to add a middleware that parse JSON data inside the app.js
    // => app.use(express.json()); After that this code now should work.
    // req.body.title will extract the title sent by the saveComment() function inside the comments.js file
    // req.body.text will extract the text sent by the saveComment() function inside the comments.js file
  };
  await db.getDb().collection("comments").insertOne(newComment);

  // res.redirect("/posts/" + req.params.id);
  // We no longer wanna redirect users and load the page.
  // Instead now we wanna send back some JSON data.
  res.json({ message: "Comment added!" });
  // We can send back an {} object, which is converted to JSON by res.json() as the response.
});

module.exports = router;
