import { useState, useEffect } from "react";
import { Trash2, UserPlus, User, Loader } from "lucide-react";
import api from "../services/api";

interface UserType {
  _id: string;
  username: string;
  email: string;
}

const Users = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);

    if (newUser.username.length < 3) {
      setCreateError("Username must be at least 3 characters");
      setIsCreating(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      setCreateError("Please enter a valid email address");
      setIsCreating(false);
      return;
    }

    if (newUser.password.length < 6) {
      setCreateError("Password must be at least 6 characters");
      setIsCreating(false);
      return;
    }

    try {
      const res = await api.post("/users", newUser);
      setUsers([...users, res.data]);
      setNewUser({ username: "", email: "", password: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create user", err);
      setCreateError(
        "Failed to create user. Email or username might be taken."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Create New User
          </h3>
          {createError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">
              {createError}
            </div>
          )}
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              required
            />
            <div className="md:col-span-3 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-gray-500">Loading users...</div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-700 rounded-full">
                  <User className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{user.username}</h4>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(user._id)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Users;
