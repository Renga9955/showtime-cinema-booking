import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useQueryParams = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const setParameter = useCallback(
    (param, value) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set(param, value);
      navigate(`?${searchParams.toString()}`);
    },
    [location.search, navigate]
  );

  const getParameter = useCallback(
    (param) => {
      const searchParams = new URLSearchParams(location.search);
      return searchParams.get(param);
    },
    [location.search]
  );

  const deleteParameter = useCallback(
    (param) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete(param);
      navigate(`?${searchParams.toString()}`);
    },
    [location.search, navigate]
  );

  return { setParameter, getParameter, deleteParameter };
};

export default useQueryParams;
