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
  // const responseData on comments.js will give us the response data.
  // That data is the data that we can use in our code to update parts of the loaded page.
  // But this would fail because the /post/:id/comments get route on blog.js does not return any JSON
  // Instead that get route returns a rendered html code. (post-detail.ejs)
  // But now we're not interested in a full HTML ejs document, but instead we want the raw data.
  // We can do that by using the following code.
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
  };
  await db.getDb().collection("comments").insertOne(newComment);
  res.redirect("/posts/" + req.params.id);
});

module.exports = router;
