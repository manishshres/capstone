import React from "react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-glaucous-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-base text-glaucous-800">
          {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
