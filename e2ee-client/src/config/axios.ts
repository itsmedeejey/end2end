import axios from "axios"

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL
axios.defaults.withCredentials = true

export default axios
