import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Services = () => {
  const [description, setDescription] = useState("");
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/organization/services",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDescription(response.data.description || "");
        setServices(response.data.serviceList || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        showToast("Failed to load services. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleNewServiceChange = (e) => {
    setNewService(e.target.value);
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const handleEditService = (index, value) => {
    const updatedServices = [...services];
    updatedServices[index] = value;
    setServices(updatedServices);
  };

  const handleDeleteService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/organization/services",
        {
          description,
          serviceList: services,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showToast("Services updated successfully.", "success");
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to update services. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row">
      <nav className="w-full md:w-48 bg-white shadow-md rounded-md p-4 mb-4 md:mr-4 md:mb-0">
        <ul className="space-y-2">
          <li className="p-2 rounded">
            <Link to="/profile">Profile</Link>
          </li>
          <li className="bg-blue-100 p-2 rounded">
            <Link to="/services">Services</Link>
          </li>
          <li className="p-2">
            <Link to="/inventory">Inventory</Link>
          </li>
          <li className="p-2">
            <Link to="/hours">Hours</Link>
          </li>
        </ul>
      </nav>
      <div className="flex-grow">
        <h2 className="text-3xl font-extrabold text-center text-black mb-6">
          Services
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-md px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              rows="3"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="List of services provided by the organization just shelter, food bank, employment."
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="newService"
            >
              Add New Service
            </label>
            <div className="flex">
              <input
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="newService"
                type="text"
                placeholder="Enter new service"
                value={newService}
                onChange={handleNewServiceChange}
              />
              <button
                type="button"
                onClick={handleAddService}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
              >
                Add
              </button>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Services List</h3>
            {services.map((service, index) => (
              <div key={index} className="flex mb-2">
                <input
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  value={service}
                  onChange={(e) => handleEditService(index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleEditService(index, service)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteService(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Services;
