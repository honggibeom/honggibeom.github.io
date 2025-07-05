import styled from "styled-components";
import ProjectComponent from "../../components/projectComponent";
import nearbyCover from "../../assets/img/nearby_cover.svg";
const ProjectsCss = styled.div`
  width: 100%;
  padding: 60px;
  .intro {
    font-weight: 500;
    font-style: normal;
    line-height: 1;
    color: #2a2f36;
    font-size: 50px;
  }
  .list {
    margin-top: 60px;
    padding-bottom: 20px;
  }
`;

function Projects() {
  const data = [
    {
      link: "/nearby",
      src: nearbyCover,
      title: "nearby",
      description: "위치기반 티켓사이트",
    },
    {
      link: "/nearby",
      src: nearbyCover,
      title: "nearby",
      description: "위치기반 티켓사이트",
    },
    {
      link: "/nearby",
      src: nearbyCover,
      title: "nearby",
      description: "위치기반 티켓사이트",
    },
  ];
  return (
    <ProjectsCss>
      <h1 className="intro">Projects</h1>
      <div className="list">
        {data.map((e, idx) => {
          return (
            <ProjectComponent
              key={idx}
              link={e.link}
              src={e.src}
              title={e.title}
              description={e.description}
            />
          );
        })}
      </div>
    </ProjectsCss>
  );
}

export default Projects;
