import Button from "react-bootstrap/esm/Button";
import LoginForm from "../components/authentication/forms/LoginForm";
import Container from "../components/ui/Container";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import styles from "./Login.module.css";
import useAuth from "../hooks/useAuth";
import { useState } from "react";

const Login = (props) => {
  const { login, isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const submitHandler = async (user) => {
    setIsFetching(true);
    setError(null);
    await login(user.username, user.password).then((res) => {
      setIsFetching(false);
      const isSuccess = res === true || res?.success;
      if (!isSuccess) {
        setError(res?.message || "Login failed");
        return;
      }

      if (location.state?.from) {
        navigate(location.state.from);
      } else {
        navigate("/");
      }
    });
  };

  if (isLoggedIn) return <Navigate to="/" />;

  return (
    <Container>
      <div className={styles.login}>
        <h1>Login</h1>
        <LoginForm
          error={error}
          onSubmit={submitHandler}
          isLoading={isFetching}
        />
        <hr />
        <Link to="/register">
          <Button variant="secondary">Register</Button>
        </Link>
      </div>
    </Container>
  );
};

export default Login;
