import { login } from "./auth";
import { logout } from "./auth";
import { updateUserData } from "./updateUserData";
// import { latesPosts } from "./latestPosts";
import { createPost } from "./createPost";
import { showAlert } from "./alerts";
import { signup } from "./auth";
import { updatePost, deletePost } from "./postSettings";

// console.log("Starting index.js....");

// Login
document?.querySelector(".form-li")?.addEventListener("submit", (e) => {
  e.preventDefault();
  let email = document.getElementById("email").value;
  let password = document.getElementById("password-take").value;

  login(email, password);
});

// Logout
document?.querySelector(".logout-now")?.addEventListener("click", logout);

// Update User Data
// console.log(document.querySelector("profile-submit-btn"));

let profileForm = document?.querySelector(".profile-form-div-id");
let inputs = profileForm?.querySelectorAll("input, textarea, select, button");
if (inputs) {
  inputs.forEach((input) => {
    input.disabled = true;
  });
}

if (document.querySelector(".profile-submit-btn")) {
  document.querySelector(".profile-submit-btn").style.display = "none";
}

document
  ?.querySelector(".profile-edit-button")
  ?.addEventListener("click", () => {
    inputs.forEach((input) => {
      input.disabled = false;
    });
    document.querySelector(".profile-submit-btn").style.display = "block";
  });

document
  .querySelector(".profile-submit-btn")
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let about = document.getElementById("about").value;
    let userName = document.getElementById("userName").value;
    let name = document.getElementById("name").value;

    updateUserData(name, email, userName, about);
  });

document
  ?.querySelector(".create-post-form")
  ?.addEventListener("submit", (e) => {
    e.preventDefault();
    let name = document.getElementById("name").value;
    let category = document.getElementById("category").value;
    let description = document.getElementById("description").value;

    if (!name || !category || !description) {
      showAlert("error", "All Fields Are Mandatory");
      return;
    }

    createPost(name, description, category);
  });

document?.querySelector(".signup-form-div")?.addEventListener("submit", (e) => {
  e.preventDefault();

  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let passwordConfirm = document.getElementById("passwordConfirm").value;
  let userName = document.getElementById("userName").value;
  let about = document.getElementById("about").value;

  if (password !== passwordConfirm) {
    showAlert("error", "Password Doesnt Macth");
    return;
  }

  signup(name, email, userName, password, passwordConfirm, about);
});

function getFormNumber(classNames, nameRecived) {
  let formNumber;
  classNames.forEach((curr) => {
    if (curr.startsWith(nameRecived)) {
      formNumber = curr.split("-").at(-1);
      // console.log(formNumber);
    }
  });

  return formNumber;
}

document.querySelectorAll(".post-btns-button").forEach((button) => {
  button.addEventListener("click", (e) => {
    let classNames = [...e.target.classList];

    if (!classNames.includes("post-settings-btn")) {
      return;
    }
    let num;

    if (classNames.includes("post-edit-btn")) {
      num = getFormNumber(classNames, "post-update-btn");

      let name = document.querySelector(`.title-${num}`).value;
      let category = document.querySelector(`.category-${num}`).value;
      let description = document.querySelector(`.description-${num}`).value;
      let id = document.querySelector(`.get-id-${num}`).dataset.postid;

      updatePost(name, category, description, id);
    } else if (classNames.includes("post-delete-button")) {
      num = getFormNumber(classNames, "post-remove-btn");
      let id = document.querySelector(`.get-id-${num}`).dataset.postid;
      deletePost(id);
    }
  });
});

// document.querySelector(".div-latest-posts").addEventListener("click", (e) => {
//   latesPosts();
// });
