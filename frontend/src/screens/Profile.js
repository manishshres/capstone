import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { authState } = useContext(AuthContext);
  const isOrg = authState.user && authState.user.accountType === "org";
  const { t } = useTranslation();

  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    latitude: "",
    longitude: "",
    email: "",
    website: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const url = isOrg ? "/api/organization/profile" : "/api/user/profile";

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error(
          t("profile.errorFetching", {
            type: isOrg ? t("profile.org") : t("profile.user"),
          })
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [isOrg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const url = isOrg ? "/api/organization/profile" : "/api/user/profile";

      await axios.put(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(t("profile.successSaving"));
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("profile.errorSaving"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-16rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const inputClasses =
    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isOrg ? t("profile.org") : t("profile.user")} {t("profile.title")}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {t("profile.description")}{" "}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className={labelClasses}>
                {t("profile.nameLabel")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={inputClasses}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {isOrg && (
              <div>
                <label htmlFor="type" className={labelClasses}>
                  {t("profile.typeLabel")}
                </label>
                <select
                  id="type"
                  name="type"
                  className={inputClasses}
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t("profile.selectType")}</option>
                  <option value="shelter">{t("profile.shelterOption")}</option>
                  <option value="foodbank">
                    {t("profile.foodBankOption")}
                  </option>
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label htmlFor="address" className={labelClasses}>
                {t("profile.addressLabel")}
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className={inputClasses}
                value={formData.address}
                onChange={handleChange}
                required={isOrg}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address2" className={labelClasses}>
                {t("profile.streetLabel")}
              </label>
              <input
                id="address2"
                name="address2"
                type="text"
                className={inputClasses}
                value={formData.address2}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="city" className={labelClasses}>
                {t("profile.cityLabel")}
              </label>
              <input
                id="city"
                name="city"
                type="text"
                className={inputClasses}
                value={formData.city}
                onChange={handleChange}
                required={isOrg}
              />
            </div>

            <div>
              <label htmlFor="state" className={labelClasses}>
                {t("profile.stateLabel")}
              </label>
              <select
                id="state"
                name="state"
                className={inputClasses}
                value={formData.state}
                onChange={handleChange}
                required={isOrg}
              >
                <option value="">Select state...</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="zip" className={labelClasses}>
                {t("profile.zipLabel")}
              </label>
              <input
                id="zip"
                name="zip"
                type="text"
                className={inputClasses}
                value={formData.zip}
                onChange={handleChange}
                required={isOrg}
              />
            </div>

            <div>
              <label htmlFor="phone" className={labelClasses}>
                {t("profile.phoneLabel")}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={inputClasses}
                value={formData.phone}
                onChange={handleChange}
                required={isOrg}
              />
            </div>

            {isOrg && (
              <>
                <div>
                  <label htmlFor="latitude" className={labelClasses}>
                    {t("profile.latitude")}
                  </label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="text"
                    className={inputClasses}
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="longitude" className={labelClasses}>
                    {t("profile.longitude")}
                  </label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="text"
                    className={inputClasses}
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className={labelClasses}>
                {t("profile.emailLabel")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`${inputClasses} bg-gray-50`}
                value={formData.email}
                onChange={handleChange}
                disabled
                required
              />
            </div>

            {isOrg && (
              <div>
                <label htmlFor="website" className={labelClasses}>
                  {t("profile.websiteLabel")}
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  className={inputClasses}
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  {t("profile.saving")}
                </>
              ) : (
                t("profile.saveButton")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
