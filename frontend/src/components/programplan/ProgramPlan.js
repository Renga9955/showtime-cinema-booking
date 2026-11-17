import styles from "./ProgramPlan.module.css";
import MovieListItem from "./MovieListItem";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { BACKEND_URL } from "../../constants";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../ui/LoadingSpinner";
import MainButton from "../ui/MainButton";
import { AnimatePresence, motion } from "framer-motion";
import ProgramPlanFilter from "./ProgramPlanFilter";
import useQueryParams from "../../hooks/useQueryParams";
import { Film } from "react-bootstrap-icons";

const ProgramPlan = (props) => {
  const { getParameter, setParameter, deleteParameter } = useQueryParams();

  const [movies, setMovies] = useState(null);
  const [timeFilter, setTimeFilter] = useState(() => getParameter("time") || "all");
  const [fskFilter, setFskFilter] = useState(() => {
    const fskParams = getParameter("fsk");
    return fskParams ? fskParams.split(",") : [];
  });
  const [genreFilter, setGenreFilter] = useState(() => {
    const genreParams = getParameter("genres");
    return genreParams ? genreParams.split(",") : [];
  });
  const [ageOptions, setAgeOptions] = useState([]);
  const [genreOptions, setGenreOptions] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { fetch, isFetching } = useFetch();

  const loadMovies = useCallback(() => {
    setHasError(false);
    setErrorMessage("");
    fetch
      .get(`${BACKEND_URL}/movies?screenings=true`)
      .then((res) => {
        if (res.status === 200 && Array.isArray(res.data)) {
          setMovies(res.data);
          setHasError(false);

          const genres = [];
          res.data.forEach((movie) => {
            movie.genres?.forEach((genre) => {
              if (!genres.includes(genre)) genres.push(genre);
            });
          });
          setGenreOptions(genres.sort());

          const ages = [];
          res.data.forEach((movie) => {
            if (movie.release?.ageRestriction !== undefined) {
              const age = movie.release.ageRestriction.toString();
              if (!ages.includes(age)) ages.push(age);
            }
          });
          setAgeOptions(ages.sort((a, b) => Number(a) - Number(b)));
        } else {
          setMovies([]);
          setHasError(true);
          setErrorMessage(res.message || "Failed to load movies from the server.");
        }
      })
      .catch((err) => {
        setMovies([]);
        setHasError(true);
        setErrorMessage(err?.message || "Server connection failed.");
      });
  }, [fetch]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const genreFilterHandler = (genres) => {
    if (genres.length > 0) setParameter("genres", genres.join(","));
    else deleteParameter("genres");
    setGenreFilter(genres);
  };

  const fskFilterHandler = (fsk) => {
    if (fsk.length > 0) setParameter("fsk", fsk.join(","));
    else deleteParameter("fsk");
    setFskFilter(fsk);
  };

  const timeFilterHandler = (time) => {
    if (time && time !== "all") setParameter("time", time);
    else deleteParameter("time");
    setTimeFilter(time);
  };

  const filteredMovies = (movies || [])
    .filter((movie) => {
      if (timeFilter === "all" || !timeFilter) return true;
      if (!movie.screenings || movie.screenings.length === 0) return false;

      if (timeFilter === "today") {
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
        return movie.screenings.some((s) => s.weekday === today);
      } else if (timeFilter === "weekend") {
        return movie.screenings.some((s) =>
          ["Friday", "Saturday", "Sunday"].includes(s.weekday)
        );
      }
      return true;
    })
    .filter((movie) => {
      if (genreFilter.length === 0) return true;
      return genreFilter.every((g) => movie.genres?.includes(g));
    })
    .filter((movie) => {
      if (fskFilter.length === 0) return true;
      return fskFilter.includes(movie.release?.ageRestriction?.toString());
    });

  const genreOptionsData = useMemo(
    () =>
      genreOptions.map((genre) => ({
        value: genre,
        checked: genreFilter.includes(genre),
      })),
    [genreOptions, genreFilter]
  );

  const ageOptionsData = useMemo(
    () =>
      ageOptions.map((age) => ({
        value: age,
        checked: fskFilter.includes(age),
      })),
    [ageOptions, fskFilter]
  );

  const timeOptionsData = {
    default: timeFilter,
    options: [
      { text: "Full Schedule", value: "all" },
      { text: "Today", value: "today" },
      { text: "This Weekend", value: "weekend" },
    ],
  };

  return (
    <div className={styles.container}>
      {isFetching && <LoadingSpinner />}

      {!isFetching && movies && movies.length > 0 && (
        <>
          <ProgramPlanFilter
            timeOptions={timeOptionsData}
            genreOptions={genreOptionsData}
            ageOptions={ageOptionsData}
            setTimeFilter={timeFilterHandler}
            setGenreFilter={genreFilterHandler}
            setFskFilter={fskFilterHandler}
          />

          {filteredMovies.length > 0 ? (
            <motion.div className={styles.movieGrid} layout>
              <AnimatePresence>
                {filteredMovies.map((movie, i) => (
                  <MovieListItem key={movie._id || movie.title || i} movie={movie} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className={styles.emptyState}>
              <Film size={44} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No movies available right now</h3>
              <p className={styles.emptySubtext}>
                No movies match your selected filter criteria. Try choosing a different date or genre.
              </p>
            </div>
          )}
        </>
      )}

      {!isFetching && hasError && (
        <div className={styles.emptyState}>
          <Film size={48} className={styles.emptyIcon} style={{ color: "#ef4444" }} />
          <h3 className={styles.emptyTitle}>Unable to load movies</h3>
          <p className={styles.emptySubtext} style={{ color: "#f87171" }}>
            {errorMessage || "The movie service is currently unreachable. Please try again."}
          </p>
          <div className="mt-3">
            <MainButton onClick={loadMovies}>Try Again</MainButton>
          </div>
        </div>
      )}

      {!isFetching && !hasError && (!movies || movies.length === 0) && (
        <div className={styles.emptyState}>
          <Film size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No movies available right now</h3>
          <p className={styles.emptySubtext}>
            Please check back soon for our latest cinema releases and screenings.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgramPlan;
