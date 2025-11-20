import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { addUserDetails } from "../Redux/StateManagement/userLogin";

const Redirect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const rawData = query.get("data");

  useEffect(() => {
    const redirectFunction = async () => {
      try {
        const data = JSON.parse(decodeURIComponent(rawData));
        console.log("JSONdata: ", data);
        const res = await userLogin.post("/auth/login", data);
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        dispatch(addUserDetails(res?.data.data));
        navigate("/");
      } catch (e) {
        window.location.href = `https://one.rdfmis.com/`;
      }
    };

    redirectFunction();
  }, [rawData]);

  return;
};

export default Redirect;
