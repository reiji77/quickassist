import { Outlet, useNavigate } from "react-router-dom";
import { createContext, useState, useEffect, useContext } from "react";
import config from "../config";
import { io } from "socket.io-client";

export const PostsContext = createContext();
export const PostsChangeContext = createContext();

export default function HealthOrg() {
  const [posts, setPosts] = useState([]);
  const [postsChange, setPostsChange] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    async function getUserDetails() {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `${config.SERVER_URL}/health_org/get_posts/?auth_token=${token}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const json = await response.json();
      if (!response.ok) {
        if ("error_id" in json) {
          alert(json["error_id"]);
        }
      } else {
        setPosts(json);
      }
    }
    getUserDetails();
  }, [postsChange]);
  return (
    <PostsChangeContext.Provider value={{ postsChange, setPostsChange }}>
      <PostsContext.Provider value={{ posts, setPosts }}>
        <Outlet />
      </PostsContext.Provider>
    </PostsChangeContext.Provider>
  );
}
