import { Outlet, useNavigate } from "react-router-dom";
import { createContext, useState, useEffect, useContext } from "react";
import config from "../config";
import { LanguageContext } from "../App";
import { PostsContext, PostsChangeContext } from "./HealthOrg";

export const UserDetailsContext = createContext({});

export default function User() {
  const [posts, setPosts] = useState([]);
  const [postsChange, setPostsChange] = useState(false);

  useEffect(() => {
    async function getPosts() {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `${config.SERVER_URL}/user/get_posts/?auth_token=${token}`,
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
    getPosts();
  }, []);

  return (
    <PostsChangeContext.Provider value={{ postsChange, setPostsChange }}>
      <PostsContext.Provider value={{ posts, setPosts }}>
        <Outlet />
      </PostsContext.Provider>
    </PostsChangeContext.Provider>
  );
}
