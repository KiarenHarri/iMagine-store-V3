import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const submitProductQuote = (data) => axios.post(`${API}/quotes/product`, data, { withCredentials: true });
export const submitRepairQuote = (data) => axios.post(`${API}/quotes/repair`, data, { withCredentials: true });
export const lookupRepair = (ref) => axios.get(`${API}/quotes/repair/${encodeURIComponent(ref)}`);
export const submitContact = (data) => axios.post(`${API}/contact`, data);
