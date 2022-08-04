// Ajax is all about sending http requests from the "browser side" JS code.
// So we add this logic inside the public folder.

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
  // We can construct the url by sing backtick.
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
  // Once we send the comments data by using res.json(comments); code on blog.js file, this code should start working.

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
}
// In this function, we can now send a Ajax request to the server to fetch the comments data
// We can use XMLHttpRequest Function or the Axios package instead of fetch()

function saveComment(event) {
  event.preventDefault();
  // The default browser behavior would be to send the request on its own and reload the page.
  // But we wanna prevent that browser default. So First of all we should do that like this.

  const enteredTitle = commentTitleElement.value;
  const enteredText = commentTextElement.value;
  // These will extract the values that the user input through the form

  console.log(enteredTitle, enteredText);
  // output => 3rd Comment. This is the body of the 3rd comment.
}
// We write the ajax code to handle form submission inside this function.

loadCommentsBtnElement.addEventListener("click", fetchCommentsForPost);

commentsFormElement.addEventListener("submit", saveComment);
// We add the event listener to the overall form of the comment submission section.
// not to the button inside that comment submission form.
// We add a "submit" listener here. (a submit event occurs when a form is submitted. it will
// occur before the browser tries to handle the form submission. So we can use that event listener
// for our job.)
