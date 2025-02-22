import { isLoggedIn, getTokenPayload } from "../utils/authHelpers";
import { Navigate } from "react-router-dom";

export default function Home() {
  // if not logged in then go to account's home page. Else, go to the login page
  if (isLoggedIn()) {
    let payload = getTokenPayload(localStorage["auth_token"]);
    let type = payload["account_type"];

    return <Navigate to={"/" + type + "/home"} />;
  } else {
    return <Navigate to={"/login"} />;
  }
}
