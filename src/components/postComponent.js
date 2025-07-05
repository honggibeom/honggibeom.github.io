import styled from "styled-components";
import { Link } from "react-router-dom";

const PostComponentCss = styled.div`
  margin: 20px 0;
  border-bottom: 1px solid #2a2f36;
  .link {
    text-decoration: none;
  }
  .link:visited {
    color: inherit;
  }
  .post__header {
    h2 {
      font-weight: 400;
      font-size: 50px;
      color: #2a2f36;
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin: 10px 0;
    }
    h2:hover {
      color: #a2ded0;
    }
    .date {
      font-size: 20px;
      font-weight: 400;
      line-height: 1.6;
      letter-spacing: 0;
      color: #abb7b7;
    }
  }

  .titleImg {
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    width: 100%;
    height: 60vh;
  }

  .summary {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 3;
    font-size: 20px;
    font-weight: 400;
    line-height: 1.6;
    letter-spacing: 0;
    color: #6c7a89;
  }

  .tags {
    padding: 10px 0 20px 0;

    .tag {
      text-decoration: none;
      background: #a2ded0;
      color: #fff;
      padding: 10px;
      margin-right: 15px;
      border-radius: 4px;
      font-size: 15px;
    }
  }
`;

function PostComponent({ id, link, title, src, tags, date, summary }) {
  return (
    <PostComponentCss>
      <div className="post__header">
        <Link className="link" to={link}>
          <h2>{title}</h2>{" "}
        </Link>
        <p className="date">{date}</p>
      </div>
      <Link className="link" to={link}>
        <div className="titleImg" style={{ backgroundImage: `url(${src})` }} />
      </Link>
      <p className="summary">{summary}</p>
      <div className="tags">
        {tags.map((e, idx) => {
          return (
            <Link to={`/tags/${e}`} className="tag" key={idx}>
              {e}
            </Link>
          );
        })}
      </div>
    </PostComponentCss>
  );
}
export default PostComponent;
