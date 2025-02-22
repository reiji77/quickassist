import BasicPageLayout from "./BasicPageLayout";
import { UserContext } from "./UserContext";
import { HealthNavContext } from "./HealthNavigator";
import { useContext, useState } from "react";
import styled from "styled-components";
import config from "../config";
import { useNavigate } from "react-router-dom";
import { PostsChangeContext, PostsContext } from "./HealthOrg";
import translations from "../assets/translations.json";
import { LanguageContext } from "../App";
import PublicIcon from "@mui/icons-material/Public";
const FlexDiv = styled.div`
  padding: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;

  justify-content: start;
`;

const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 2px solid black;
`;
const PostInfo = styled.div`
  padding: 10px;
  display: flex;
  gap: 5px;
  flex-direction: column;
  justify-content: start;
`;

const DeletePostButton = styled.button`
  padding: 10px;

  background-color: red;
  width: min-content;
  margin-top: 10px;
  color: white;
  cursor: pointer;
  flex-grow: 1;
  border-radius: 5px;
`;
const EditInfoButton = styled.button`
  padding: 10px;

  background-color: #0277bd;
  width: min-content;
  margin-top: 10px;
  color: white;
  cursor: pointer;
  flex-grow: 1;
  border-radius: 5px;
`;

const MakePostButton = styled.button`
  background-color: #0277bd;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  align-self: flex-start;
  margin-bottom: 20px;
  font-size: 15px;
`;

export function Post({ postData = undefined, showDelete = true }) {
  const linkConversion = (link) => {
    if (link.startsWith("https://") || link.startsWith("http://")) {
      return link;
    } else {
      return "//" + link;
    }
  };
  const { language } = useContext(LanguageContext);
  const lang = translations[language];
  const { postsChange, setPostsChange } = useContext(PostsChangeContext);
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState(postData["title"]);
  const [description, setDescription] = useState(postData["description"]);
  const [location, setLocation] = useState(postData["location"]);

  const [lastUpdated, setLastUpdated] = useState(postData["last_updated"]);
  const handleDeletePostClick = async () => {
    const response = await fetch(
      `${config.SERVER_URL}/health_org/delete_post`,
      {
        method: "DELETE",
        body: JSON.stringify({
          auth_token: localStorage.getItem("auth_token"),
          post_id: postData["post_id"],
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (response.ok) {
      setPostsChange(!postsChange);
    }
  };
  const handleSaveButtonClick = async () => {
    const response = await fetch(`${config.SERVER_URL}/health_org/edit_post`, {
      method: "PUT",
      body: JSON.stringify({
        auth_token: localStorage.getItem("auth_token"),
        post_id: postData["post_id"],
        title,
        description,
        location,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (response.ok) {
      const json = await response.json();
      const time = json["time"];
      setLastUpdated(time);
      setIsEditMode(false);
    } else {
      const json = await response.json();
      alert(json.message);
    }
  };

  return (
    <PostWrapper>
      <PostInfo>
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
          }}
        >
          <span
            style={{ textDecoration: "underline", display: "inline-block" }}
          >
            {postData["poster_name"]}
          </span>
          {postData["poster_url"] && (
            <a
              href={linkConversion(postData["poster_url"])}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PublicIcon></PublicIcon>
            </a>
          )}
        </div>
        <div style={{ overflowWrap: "anywhere", display: "flex" }}>
          {isEditMode ? (
            <div style={{ flexGrow: 1, display: "flex", gap: "2px" }}>
              <strong>{lang ? lang.Posts.Title + ": " : "Title: "}</strong>
              <input
                onChange={(e) => setTitle(e.target.value)}
                style={{ flexGrow: 1 }}
                value={title}
              />
            </div>
          ) : (
            <h1 style={{ margin: 0 }}>{title}</h1>
          )}
        </div>
        <div style={{ overflowWrap: "anywhere" }}>
          <strong>{lang ? lang.Posts.Created + ": " : "Created: "}</strong>
          {postData["time"]}
        </div>
        <div style={{ overflowWrap: "anywhere" }}>
          <strong>
            {lang ? lang.Posts.LastUpdated + ": " : "Last Updated: "}
          </strong>
          {lastUpdated}
        </div>

        <div style={{ overflowWrap: "anywhere", display: "flex", gap: "2px" }}>
          {isEditMode ? (
            <>
              <strong>
                {lang ? lang.Posts.Location : "Location"}
                {":"}
              </strong>
              <input
                onChange={(e) => {
                  setLocation(e.target.value);
                }}
                style={{ flexGrow: 1 }}
                value={location}
              />
            </>
          ) : (
            <>
              {location.trim() && (
                <>
                  <strong>
                    {lang ? lang.Posts.Location : "Location"}
                    {":"}
                  </strong>
                  {location}
                </>
              )}
            </>
          )}
        </div>

        <div>
          <strong>
            {lang ? lang.Posts.Description + ": " : "Description: "}
          </strong>
        </div>
        <div style={{ overflowWrap: "anywhere", display: "flex" }}>
          {isEditMode ? (
            <>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                style={{ flexGrow: 1, minHeight: "100px" }}
                value={description}
              />
            </>
          ) : (
            description
          )}
        </div>

        <div style={{ display: "flex", width: "max-content", gap: "5px" }}>
          {showDelete && !isEditMode && (
            <EditInfoButton
              onClick={() => {
                setIsEditMode(!isEditMode);
              }}
            >
              {lang ? lang.Posts.Edit : "Edit"}
            </EditInfoButton>
          )}
          {showDelete && isEditMode && (
            <EditInfoButton
              onClick={() => {
                handleSaveButtonClick();
              }}
            >
              {lang ? lang.Posts.Save : "Save"}
            </EditInfoButton>
          )}
          {showDelete && !isEditMode && (
            <DeletePostButton onClick={handleDeletePostClick}>
              {lang ? lang.Posts.Delete : "Delete"}
            </DeletePostButton>
          )}
          {showDelete && isEditMode && (
            <DeletePostButton
              onClick={() => {
                setTitle(postData.title);
                setLocation(postData.location);
                setDescription(postData.description);
                setIsEditMode(false);
              }}
            >
              {lang ? lang.Posts.Cancel : "Cancel"}
            </DeletePostButton>
          )}
        </div>
      </PostInfo>
    </PostWrapper>
  );
}
export default function HealthOrgHome() {
  const { setPostsChange } = useContext(PostsChangeContext);
  const { posts } = useContext(PostsContext);
  const { language } = useContext(LanguageContext);
  const lang = translations[language];
  const navigate = useNavigate();
  return (
    <BasicPageLayout>
      <FlexDiv>
        <MakePostButton
          onClick={() => {
            navigate("/health_org/make_post");
          }}
        >
          {lang ? lang.Posts["Make Post"] : "Make Post"}
        </MakePostButton>
        {posts.map((p) => {
          return <Post key={p["post_id"]} postData={p}></Post>;
        })}
      </FlexDiv>
    </BasicPageLayout>
  );
}
