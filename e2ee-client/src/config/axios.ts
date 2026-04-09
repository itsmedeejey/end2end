import axios from "axios";

// this proxyApi http client is for routing request through nextjs proxy 
// so we can access cookies for auth 
// this should be only used in the auth routes
const proxyApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
});


//this client is for anything other than auth like messages conversations...
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
});
export default api;
export { proxyApi };
