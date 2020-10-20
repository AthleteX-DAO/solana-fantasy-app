import axios from 'axios';

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return error;
  }
);

export { axios };
export * from 'axios';
