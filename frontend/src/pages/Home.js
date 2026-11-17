import Header from "../components/home/Header";
import ProgramPlan from "../components/programplan/ProgramPlan";
import Container from "../components/ui/Container";
import Content from "../components/ui/Content";
import styles from "./Home.module.css";

const Home = (props) => {
  return (
    <>
      <Container style={{ minHeight: "80vh" }}>
        <Header />
        <Content>
          <div className={styles.headerRow}>
            <h1 className={styles.sectionHeading}>Now Showing</h1>
          </div>
          <ProgramPlan />
        </Content>
      </Container>
    </>
  );
};

export default Home;
