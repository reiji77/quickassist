export function isLoggedIn() {
  if (localStorage.getItem("auth_token")) {
    return true;
  } else {
    return false;
  }
}

export function getTokenPayload(jwt) {
  // return object representing payload of jwt.
  // Assumes jwt is a string and  is syntactically correct
  let payload = jwt.split(".")[1];
  payload = payload.replace("-", "+").replace("_", "/");
  return JSON.parse(window.atob(payload));
}
