const dev = {
  SERVER_URL: process.env.REACT_APP_BACKEND_URL || "http://localhost:6001",
};

const prod = {
  SERVER_URL: process.env.REACT_APP_BACKEND_URL || "http://localhost:6001", //  change this once app is deployed and we have a real production url
};

const config = process.env.NODE_ENV === "production" ? prod : dev;

export default config;
