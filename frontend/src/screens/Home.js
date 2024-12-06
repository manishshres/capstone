import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-black sm:text-5xl md:text-6xl">
          {t("home.heading")}
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-glaucous-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          {t("home.subheading")}
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              to="/login"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-saffron hover:bg-saffron-600 md:py-4 md:text-lg md:px-10 transition duration-300"
            >
              {t("home.login")}
            </Link>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-3">
            <Link
              to="/register"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-glaucous hover:bg-glaucous-600 md:py-4 md:text-lg md:px-10 transition duration-300"
            >
              {t("home.register")}
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <img src="home.png" alt="Home page " />
        </div>
      </div>
    </div>
  );
};

export default Home;
