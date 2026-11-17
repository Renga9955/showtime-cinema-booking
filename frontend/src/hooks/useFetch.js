import { useState, useCallback, useMemo, useRef } from "react";
import useFlash from "./useFlash";
import useUser from "./useUser";

const useFetch = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState();
  const { createMessage } = useFlash();
  const { removeUser } = useUser();

  const createMessageRef = useRef(createMessage);
  createMessageRef.current = createMessage;

  const removeUserRef = useRef(removeUser);
  removeUserRef.current = removeUser;

  const clearErrorMsg = useCallback(() => setErrorMsg(), []);

  const request = useCallback(async (url, options) => {
    setIsFetching(true);
    setErrorMsg();
    let rtn;
    let res;
    try {
      res = await fetch(url, options);
      const data = await res.json();
      if (res.status !== 200) setErrorMsg(data.message);
      if (res.status === 401 && data?.tokenExpired) {
        removeUserRef.current();
        createMessageRef.current({
          header: "Session expired",
          text: "Please log in again",
          variant: "danger",
        });
      }
      rtn = { status: res.status, ...data };
    } catch (err) {
      rtn = {
        status: res?.status || 400,
        message: res?.status !== 200 && "Server request failed",
      };
      res?.status !== 200 && setErrorMsg("Server request failed");
    }
    setIsFetching(false);
    return rtn;
  }, []);

  const get = useCallback(
    async (url) => {
      const res = await request(url, {
        method: "GET",
        credentials: "include",
      });
      return res;
    },
    [request]
  );

  const post = useCallback(
    async (url, body) => {
      const res = await request(url, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return res;
    },
    [request]
  );

  const put = useCallback(
    async (url, body) => {
      const res = await request(url, {
        method: "PUT",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return res;
    },
    [request]
  );

  const patch = useCallback(
    async (url, body) => {
      const res = await request(url, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return res;
    },
    [request]
  );

  const deleteRq = useCallback(
    async (url, body) => {
      const res = await request(url, {
        method: "DELETE",
        credentials: "include",
      });
      return res;
    },
    [request]
  );

  const fetchRequest = useMemo(
    () => ({
      get,
      post,
      put,
      patch,
      delete: deleteRq,
    }),
    [get, post, put, patch, deleteRq]
  );

  return { fetch: fetchRequest, isFetching, errorMsg, clearErrorMsg };
};

export default useFetch;
