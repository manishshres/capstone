import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "components/Sidebar";

const Inventory = () => {
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/organization/inventory",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDescription(response.data.description || "");
        setItems(response.data.items || []);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        showToast("Failed to load inventory. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity) {
      setItems([...items, { ...newItem, quantity: Number(newItem.quantity) }]);
      setNewItem({ name: "", quantity: 0 });
    }
  };

  const handleEditItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = field === "quantity" ? Number(value) : value;
    setItems(updatedItems);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3000/api/organization/inventory",
        {
          description,
          items,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showToast("Inventory updated successfully.", "success");
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to update inventory. Please try again.", "error");
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
      <Sidebar />
      <div className="flex-grow">
        <h2 className="text-3xl font-extrabold text-center text-black mb-6">
          Inventory
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
              placeholder="Current inventory of essential items"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Add New Item
            </label>
            <div className="flex space-x-2">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                placeholder="Item name"
                name="name"
                value={newItem.name}
                onChange={handleNewItemChange}
              />
              <input
                className="shadow appearance-none border rounded w-24 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="number"
                placeholder="Quantity"
                name="quantity"
                value={newItem.quantity}
                onChange={handleNewItemChange}
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add
              </button>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Inventory List</h3>
            {items.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    handleEditItem(index, "name", e.target.value)
                  }
                />
                <input
                  className="shadow appearance-none border rounded w-24 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleEditItem(index, "quantity", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full py-2 px-4 bg-glaucous text-white font-semibold rounded-md shadow-md hover:bg-glaucous/90 focus:outline-none focus:ring-2 focus:ring-glaucous focus:ring-offset-2 transition duration-150 ease-in-out"
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

export default Inventory;
