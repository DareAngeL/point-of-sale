import { useEffect } from "react";
import "./main-window.css";
import { Link, useNavigate } from "react-router-dom";
import { useService } from "../../../hooks/serviceHooks";

const MainWindow = (() => {
  const navigate = useNavigate();
  const { getData } = useService<any>("gethddserial");

  useEffect(() => {
    console.log("Main Window initialized");
    const fetchAPI = async () => {
      await getData("", async (res) => {
        if (res.data.length > 0) {
          localStorage.setItem("serialnum", res.data);
        }
      });
    };
    fetchAPI();

    navigate("/pages/login");
  }, []);

  return (
    <>
      <section className="">
        <div className="main-background">
          <div className=" mb-8">
            <h1 className=" font-montserrat text-[3rem] w-[500px] text-center">
              Welcome to the Point of Sale system
            </h1>
          </div>
          <Link to="pages/login" className=" text-white">
            <button className="rounded-full bg-slate-600 w-[200px] h-[50px] hover:bg-[#3e516b]">
              Get Started
            </button>
          </Link>
        </div>
      </section>
    </>
  );
});

export default MainWindow;
