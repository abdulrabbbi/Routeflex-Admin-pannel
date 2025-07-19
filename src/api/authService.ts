import apiClient from "./api";
import { AuthRoutePayload, UpdatePasswordPayload, ProfilePayload } from "../types/auth";

export const Login = async (payload: AuthRoutePayload) => {
  try {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const UpdatePassword = async (payload: UpdatePasswordPayload) => {
  try {
    const response = await apiClient.patch(
      "/users/update-my-password",
      payload
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const UpdateMe = async (payload: ProfilePayload) => {
  try {
    const formData = new FormData();

    if (payload.firstName) formData.append("firstName", payload.firstName);
    if (payload.lastName) formData.append("lastName", payload.lastName);
    if (payload.email) formData.append("email", payload.email);
    if (payload.profilePicture) formData.append("profilePicture", payload.profilePicture);

    const response = await apiClient.patch("/users/update-me", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
