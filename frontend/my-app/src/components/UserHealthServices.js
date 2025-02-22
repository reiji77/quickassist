import BasicPageLayout from "./BasicPageLayout";
import { Post } from "./HealthOrgHome";
import { PostsContext } from "./HealthOrg";
import { useContext } from "react";
import styled from "styled-components";
const FlexDiv = styled.div`
  padding: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;

  justify-content: start;
`;
export default function UserHealthServices() {
  const { posts } = useContext(PostsContext);
  return (
    <BasicPageLayout>
      <FlexDiv>
        {posts.map((p) => {
          return (
            <Post key={p["post_id"]} postData={p} showDelete={false}></Post>
          );
        })}
      </FlexDiv>
    </BasicPageLayout>
  );
}
