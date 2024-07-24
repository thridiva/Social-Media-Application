import axios from "axios";
import { showAlert } from "./alerts";
// Login Page Backend

export async function login(email, password) {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Successfully Logged In");
      window.setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (err) {
    // console.log(err.response.data.message);
    showAlert(
      "error",
      err?.response?.data?.message || "Something Went Wrong, Try Again"
    );
  }
}

export const logout = async () => {
  try {
    const res = await axios({
      method: "get",
      url: "/api/users/logout",
    });

    if (res.data.status == "success") {
      showAlert("success", "Successfully Logged Out");
      window.setTimeout(() => {
        location.reload(true);
        location.assign("/");
      }, 2000);
    }
  } catch (err) {
    showAlert("error", "Error logging out Try Again");
  }
};

export const signup = async function (
  name,
  email,
  userName,
  password,
  passwordConfirm,
  about
) {
  try {
    console.log(name, email, userName, password, passwordConfirm, about);
    const res = await axios({
      method: "POST",
      url: "/api/users/signup",
      data: {
        name,
        email,
        userName,
        password,
        passwordConfirm,
        about,
      },
    });

    if (res.data.status == "success") {
      showAlert("success", "Successfully Created Account!! 🚀");
      window.setTimeout(() => {
        location.reload(true);
        location.assign("/");
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert(
      "error",
      err?.response?.data?.message || "Something Went Wrong! Try Again"
    );
  }
};
