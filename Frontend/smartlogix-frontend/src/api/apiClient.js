import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/bff",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;