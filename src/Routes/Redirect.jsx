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
    try {
      const data = JSON.parse(decodeURIComponent(rawData));
      localStorage.setItem("token", data?.data?.token);
      localStorage.setItem("user", JSON.stringify(data?.data?.user));
      dispatch(addUserDetails(data?.data));
      navigate("/");
    } catch (e) {
      window.location.href = `https://one.rdfmis.com/`;
    }
  }, [rawData]);
  return;
};

export default Redirect;
