import styled from "styled-components";
import { useEffect, useState } from "react";
import fm from "front-matter";
import PostComponent from "../../components/postComponent";

const PostsCss = styled.div`
  width: 100%;
  height: 100vh;
  overflow: auto;
  padding: 60px;
  box-sizing: border-box;
  .intro {
    font-weight: 500;
    font-style: normal;
    line-height: 1;
    color: #2a2f36;
    font-size: 50px;
  }
  .list {
    padding-bottom: 20px;
  }
`;

function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const req = require.context("../../posts/md", false, /\.md$/);

    const fileInfos = req.keys().map((key) => ({
      filename: key.replace("./", ""),
      url: req(key), // Webpack이 변환한 static URL
    }));

    Promise.all(
      fileInfos.map(async ({ filename, url }) => {
        const res = await fetch(url);
        const text = await res.text();
        const parsed = fm(text);
        const img = await import(
          `../../posts/assets/${filename.split(".md")[0]}/${
            parsed.attributes.src
          }`
        );

        return {
          filename,
          ...parsed.attributes,
          src: img.default,
          date: parsed.attributes.date.toDateString(),
          body: parsed.body,
        };
      })
    ).then((res) => {
      setPosts([...res, ...res]);
    });
  }, []);

  return (
    <PostsCss>
      <div className="list">
        {posts.map((e, idx) => {
          return (
            <PostComponent
              link={`/posts/${idx + 1}`}
              title={e.title}
              src={e.src}
              date={e.date}
              summary={e.summary}
              tags={e.tags}
              key={idx}
            />
          );
        })}
      </div>
    </PostsCss>
  );
}

export default Posts;
