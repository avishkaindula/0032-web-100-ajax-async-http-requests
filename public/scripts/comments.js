// Ajax is all about sending http requests from the "browser side" JS code.
// So we add this logic inside the public folder.

const loadCommentsBtnElement = document.getElementById("load-comments-btn");
// This is how we gain access to the button on the post-detail.ejs file.

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
  // And now this code should work.

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
}
// In this function, we can now send a Ajax request to the server to fetch the comments data
// We can use XMLHttpRequest Function or the Axios package instead of fetch()

loadCommentsBtnElement.addEventListener("click", fetchCommentsForPost);
