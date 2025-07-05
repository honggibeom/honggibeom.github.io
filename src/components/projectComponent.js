import { Link } from "react-router-dom";
import styled from "styled-components";

const ProjectComponentCss = styled.div`
  margin: 80px 0;
  .link {
    text-decoration: none;
  }
  .link:visited {
    color: inherit;
  }
  .background {
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    width: 100%;
    height: 70vh;
  }
  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 0;
    height: 70vh;
    background: rgba(22, 27, 33, 0.7);
    opacity: 0;
    transition: 0.3s;
    h2 {
      font-weight: 400;
      font-size: 45px;
      color: #ffffff;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .desc {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 400;
      line-height: 1.6;
      letter-spacing: 0;
    }
  }

  .content:hover {
    opacity: 1;
  }
`;
function ProjectComponent({ link, src, title, description }) {
  return (
    <ProjectComponentCss>
      <Link className="link" to={link}>
        <div className="background" style={{ backgroundImage: `url(${src})` }}>
          <div className="content">
            <h2>{title}</h2>
            <p className="desc">{description}</p>
          </div>
        </div>
      </Link>
    </ProjectComponentCss>
  );
}

export default ProjectComponent;
