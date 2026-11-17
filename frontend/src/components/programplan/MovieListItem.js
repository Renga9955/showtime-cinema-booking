import styles from "./MovieListItem.module.css";
import { Link } from "react-router-dom";
import MainButton from "../ui/MainButton";
import AgeBadge from "../movies/AgeBadge";
import { TicketDetailedFill, Clock, Calendar3, Film } from "react-bootstrap-icons";
import { motion } from "framer-motion";
import { useState } from "react";

const MovieListItem = ({ movie }) => {
  const [imageError, setImageError] = useState(false);

  const posterSrc = movie.media?.images?.poster;
  const formattedDate = movie.startdate
    ? new Date(movie.startdate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : movie.release?.productionYear
    ? String(movie.release.productionYear)
    : null;

  const movieUrl = `/movies/${encodeURIComponent(movie.title)}`;

  return (
    <motion.div
      layout
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 15 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={styles.cardWrapper}
    >
      <div className={styles.movieCard}>
        {/* Poster Column / Top */}
        <Link to={movieUrl} className={styles.posterLink}>
          <div className={styles.posterContainer}>
            {posterSrc && !imageError ? (
              <img
                src={posterSrc}
                alt={movie.title}
                className={styles.posterImg}
                onError={() => setImageError(true)}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.posterPlaceholder}>
                <Film size={44} className={styles.placeholderIcon} />
                <span className={styles.placeholderTitle}>{movie.title}</span>
              </div>
            )}

            {/* Age Badge Overlay */}
            {movie.release?.ageRestriction !== undefined && (
              <div className={styles.badgeOverlay}>
                <AgeBadge>{movie.release.ageRestriction}</AgeBadge>
              </div>
            )}

            {/* Hover details overlay */}
            <div className={styles.hoverOverlay}>
              <span className={styles.viewDetailsPrompt}>View Details</span>
            </div>
          </div>
        </Link>

        {/* Content Info */}
        <div className={styles.cardContent}>
          <Link to={movieUrl} className={styles.titleLink}>
            <h3 className={styles.movieTitle} title={movie.title}>
              {movie.title}
            </h3>
          </Link>

          {movie.genres?.length > 0 && (
            <p className={styles.genreText} title={movie.genres.join(", ")}>
              {movie.genres.join(" • ")}
            </p>
          )}

          <div className={styles.metaRow}>
            {formattedDate && (
              <span className={styles.metaItem}>
                <Calendar3 size={12} className="me-1" />
                {formattedDate}
              </span>
            )}
            {movie.runtime && (
              <span className={styles.metaItem}>
                <Clock size={12} className="me-1" />
                {movie.runtime} min
              </span>
            )}
          </div>

          <div className={styles.actionContainer}>
            <Link to={movieUrl} className={styles.btnLink}>
              <MainButton className={styles.bookBtn}>
                <TicketDetailedFill size={15} /> Book Tickets
              </MainButton>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieListItem;
