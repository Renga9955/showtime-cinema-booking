import Container from "../../components/ui/Container";
import Content from "../../components/ui/Content";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../constants";
import EditList from "../../components/lists/EditList";
import DeleteModal from "../../components/modals/DeleteModal";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import styles from "./Cinemas.module.css";
import MainButton from "../../components/ui/MainButton";
import useFlash from "../../hooks/useFlash";

const Cinemas = (props) => {
  const [cinemas, setCinemas] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCinema, setDeleteCinema] = useState();
  const { fetch, isFetching, errorMsg, clearErrorMsg } = useFetch();
  const { fetch: fetchPage, isFetching: isFetchingPage } = useFetch();
  const { createMessage } = useFlash();

  useEffect(() => {
    fetchPage
      .get(`${BACKEND_URL}/cinemas`)
      .then((res) => {
        const cinemaItems = res.data.map((el) => ({
          title: el.title,
          editPath: `/admin/cinemas/${el.title}/edit`,
        }));
        return cinemaItems;
      })
      .then((cinemaItems) => {
        const cinemaItemsSorted = cinemaItems.sort((cinemaA, cinemaB) =>
          cinemaA.title.localeCompare(cinemaB.title)
        );
        setCinemas(cinemaItemsSorted);
      })
      .catch((err) => console.log(err));
  }, [fetchPage]);

  const deleteCinemaHandler = () => {
    fetch.delete(`${BACKEND_URL}/cinemas/${deleteCinema.title}`).then((res) => {
      if (res.status !== 200) return;
      setShowDeleteModal(false);
      setCinemas((prev) => {
        const cinemas = prev.filter((el) => el.title !== deleteCinema.title);
        return cinemas;
      });
      createMessage({
        text: "Cinema hall was successfully deleted",
        variant: "success",
      });
    });
  };

  const onDeleteCinema = (cinema) => {
    setDeleteCinema(cinema);
    clearErrorMsg();
    setShowDeleteModal(true);
  };

  return (
    <>
      <Container>
        <Content className={styles.content} style={{minHeight: "70vh"}}>
          <div className={styles.header}>
            <h1>Cinema Hall Management</h1>
            <hr />
            <Link to="/admin/cinemas/new">
              <MainButton className="mb-4">
                Add new cinema hall
              </MainButton>
            </Link>
          </div>
          {isFetchingPage && <LoadingSpinner />}
          {!isFetchingPage && (
            <>
              {cinemas.length > 0 && (
                <EditList data={cinemas} onDelete={onDeleteCinema} />
              )}
              {cinemas.length <= 0 && (
                <h2 className="text-muted text-center">
                  No cinema halls available
                </h2>
              )}
            </>
          )}
        </Content>
      </Container>
      <DeleteModal
        show={showDeleteModal}
        title={deleteCinema?.title}
        text="Are you sure you want to delete this cinema hall?"
        onClose={() => setShowDeleteModal(false)}
        onDelete={deleteCinemaHandler}
        isLoading={isFetching}
        error={errorMsg}
      />
    </>
  );
};

export default Cinemas;
