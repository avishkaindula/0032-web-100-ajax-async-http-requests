// Ajax is all about sending http requests from the "browser side" JS code.
// So we add this logic inside the public folder.
// Then we need to connect this file to post-detail.ejs file.
// We don't connect the JS script files inside the public folder to the blog.js route file.
// Instead this file is automatically detected by the blog.js file.

const loadCommentsBtnElement = document.getElementById("load-comments-btn");
// This is how we gain access to the button on the post-detail.ejs file.

const commentsSectionElement = document.getElementById("comments");
// In order to manipulate the DOM of post-detail.ejs file through the data fetched from comments.js,
// we need to get access to the comments section of the post-detail.ejs like this.

const commentsFormElement = document.querySelector("#comments-form form");
// This will give access to the form that submits the comments.
const commentTitleElement = document.getElementById("title");
const commentTextElement = document.getElementById("text");
// we need to get access to the title and the comment input elements like this in order
// to extract data from it.

function createCommentsList(comments) {
  // I think this (comments) is the const comment that was created on the blog.js like this. =>
  // res.json(comments);

  // I think that because the data we use in this function are the data that is provided by the
  // following code in the fetchCommentsForPost() function comments.js file
  // => const commentsListElement = createCommentsList(responseData);

  // Those response data is provided by the => const responseData = await response.json();
  // code in the fetchCommentsForPost() function.
  // and those data was sent by => res.json(comments); code on blog.js file.

  // Also (comments) in res.json is the const comments created on the blog.js file like following.
  // const comments = await db.getDb().collection("comments").find({ postId: postId }).toArray();
  // And this is the code we use to extract comments data from the MongoDB database.

  // So finally, assume that we are getting the comments data from the mongoDB database to
  // function when we pass (comments) to => function createCommentsList(comments) {}

  const commentListElement = document.createElement("ol");

  for (const comment of comments) {
    const commentElement = document.createElement("li");
    commentElement.innerHTML = `
    <article class="comment-item">
      <h2>${comment.title}</h2>
      <p>${comment.text}</p>
    </article>
    `;
    // .title and .text are actual keys of the actual comments data on the MongoDB Database.
    commentListElement.appendChild(commentElement);
  }

  return commentListElement;
}
// In order to replace the content of the comments section of post-detail.ejs, we first need to
// prepare our list of comments. For that we need to create a helper function like this.
// We can define the code used to create the comment items inside this function.

async function fetchCommentsForPost() {
  const postId = loadCommentsBtnElement.dataset.postid;
  // When you trigger a function based on an event listener, JS automatically gives an
  // "event" object describing the event that occurred.
  // So that we can get the data-postid value we assigned on the post-detail.ejs file.
  // We can get access to the data attributes by using the dataset property.

  const response = await fetch(`/posts/${postId}/comments`);
  // The concrete value here should be the URL which you wanna send a GET request
  // This will send a get request to the /posts/:id/comments route on blog.js
  // We can construct the url by sing backtick. ${postId} is the const postId
  // we created in this function.
  // This will now send a http request to this url.
  // This is a HTTP request which is invoked by our own JS code
  // It's not sent by automatically by the browser like we did before.
  // And therefor the response won't automatically be handled by the browser.
  // Instead it's sent manually. Therefor now we as a developer also have to define the
  // exact code that should be executed once we get a response. So now we should define the
  // code to update the existing page instead of loading a new page.
  // The fetch() function returns a promise. So we need to use async await
  // const response is a object with a bunch of information about the response.
  const responseData = await response.json();
  // This will give us the extracted and already parsed response body data as a JS object.
  // Which means .json() will convert the "json data" that was send by the
  // /posts/:id/comments get route on blog.js into "JS objects"
  // .json also returns a promise. Therefor we also need to add await here.
  // const responseData will now give us the actual response data.
  // That data is the data that we can use in our code to update parts of the loaded page.
  // But this would fail because the /post/:id/comments get route on blog.js does not return any JSON
  // Instead that get route returns a rendered html code. (post-detail.ejs) But now we're not interested in a
  // full HTML ejs document, but instead we want the raw data.
  // So we need to update the route on blog.js to send comment data as JSON to this comments.js file.
  // Once we send the comments data by using => res.json(comments); code on blog.js file, this code should start working.

  console.log(responseData);
  // result==============================================================================================
  // 0:
  //  postId: "62d1510d2d2484a370f2d709"
  //  text: "This is the test comment content"
  //  title: "Test Comment"
  //  _id: "62e0f1e6f8fc172c668aea75"
  //  [[Prototype]]: Object
  // 1:
  //  postId: "62d1510d2d2484a370f2d709"
  //  text: "This is another test comment content"
  //  title: "Another Comment"
  //  _id: "62e0f205f8fc172c668aea76"
  //  [[Prototype]]: Object
  // length: 2
  //  [[Prototype]]: Array(0)

  if (responseData && responseData.length > 0) {
    const commentsListElement = createCommentsList(responseData);
    // createCommentsList(responseData) will provide the actual comment data to
    // the (comments) parameter on => function createCommentsList(comments) {}

    commentsSectionElement.innerHTML = "";
    // This will remove the innerHTML of the "comments" section of the post-detail.ejs file.
    // Now we can replace that innerHTML with some other HTML code. We can do that by using
    // the following code.

    commentsSectionElement.appendChild(commentsListElement);
    // This will replace the innerHTML of comments section of post-detail.ejs with the data inside the
    // createCommentsList() function.
  } else {
    commentsSectionElement.firstElementChild.textContent =
      "We could not find any comments. Maybe add one?";
  }
  // This if statement will handle the case where there's no comments yet.

}
// In this function, we can now send a Ajax request to the server to fetch the comments data
// We can use XMLHttpRequest Function or the Axios package instead of fetch()

async function saveComment(event) {
  event.preventDefault();
  // The default browser behavior would be to send the request on its own and reload the page.
  // But we wanna prevent that browser default. So First of all we should do that like this.

  const postId = loadCommentsBtnElement.dataset.postid;

  const enteredTitle = commentTitleElement.value;
  const enteredText = commentTextElement.value;
  // These will extract the values that the user input through the form

  console.log(enteredTitle, enteredText);
  // output => 3rd Comment. This is the body of the 3rd comment.

  const comment = { title: enteredTitle, text: enteredText };
  // We can create an Object that is sent to the body of the fetch function like this.

  const response = await fetch(`/posts/${postId}/comments`, {
    method: "POST",
    // by default, the method is GET. But as we need to post a request, we need to use POST as the method.
    body: JSON.stringify(comment),
    // The post request also need the data that should be send with it.
    // We can define that by using body: field.
    // This should be some data in the JSON format, because JSON is the common data format
    // for exchanging data when using AJAX.
    // JSON.parse() will convert JSON to raw JavaScript Values
    // JSON.stringify() will encode JavaScript values into JSON
    // Now this JSON data is sent to the => router.post("/posts/:id/comments", async function (req, res) {}
    // route on the blog.js file.

    headers: {
      "Content-Type": "application/json",
      // This is a key value format
      // Content-Type is the name of the header. And the application/json is the value of that header.
      // application/json will tell the browser that we've attached some json data to this request.
    },
    // app.use(express.json()); middleware will only be able to catch a JSON request if that
    // request has some meta-data which describes that the request is actually a JSON request.
    // That meta-data is attached to the headers of the incoming request.
    // But as we send this entire request manually by our selves, We also need to add those
    // meta-data manually like this.
  });
  // We need to construct the path to which we wanna send the request inside the fetch() function.
  // The path is the => router.post("/posts/:id/comments", async function (req, res) {}) in blog.js
  // Now we can send the http request through JavaScript by using the fetch() function.
  // Fetch by default send a get request. But fetch can be used to send any kind of requests.
  // In order to turn this into a post request, we need to add a second parameter to the fetch function.
  // That second value is an object in which we can set different properties.
  // we don't need to wait the fetch function because we're not doing anything with the response in blog.js
  // => res.json({ message: "Comment added!" }); we just send a message instead.
  // fetch yields a promise. So we can await this function and then write the code to enhance the user experience.

  fetchCommentsForPost();
  // We can call fetchCommentsForPost() inside the saveComment() function like this.
  // This will fetch the comments immediately after we create and save a comment.
  // Therefor, right after we create a new comment, the page will show us all the comments
  // including the comment we created just now.
}
// We write the ajax code to handle form submission inside this function.

loadCommentsBtnElement.addEventListener("click", fetchCommentsForPost);

commentsFormElement.addEventListener("submit", saveComment);
// We add the event listener to the overall form of the comment submission section.
// not to the button inside that comment submission form.
// We add a "submit" listener here. (a submit event occurs when a form is submitted. it will
// occur before the browser tries to handle the form submission. So we can use that event listener
// for our job.)
