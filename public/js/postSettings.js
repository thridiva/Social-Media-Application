import { showAlert } from "./alerts";
import axios from "axios";

export const updatePost = async function (name, category, description, id) {
  try {
    let base_url = window.location.origin;
    let res = await axios({
      method: "PATCH",
      url: `${base_url}/api/posts/updatePost/${id}`,
      data: {
        name,
        category,
        description,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Updated Post Successfully");
      window.setTimeout(() => {
        location.assign("/account");
      }, 1000);
    }
  } catch (err) {
    showAlert(
      err?.response?.data?.message || "Something Went Wrong Try Again!!"
    );
  }
};
export const deletePost = async function (id) {
  try {
    let base_url = window.location.origin;

    let res = await axios({
      method: "DELETE",
      url: `${base_url}/api/posts/${id}`,
    });

    if (res.status === 204) {
      showAlert("success", "Deleted Post !!");
      window.setTimeout(() => {
        location.assign("/account");
      }, 1000);
    }
  } catch (err) {
    showAlert(
      err?.response?.data?.message || "Something Went Wrong Try Again!!"
    );
  }
};
