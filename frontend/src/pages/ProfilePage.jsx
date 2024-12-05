import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Trash, X } from 'lucide-react';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, deleteAccount } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser.fullName,
    email: authUser.email,
    currentPassword: "",
    newPassword: "",
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleRemoveProfilePicture = async () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      const defaultAvatar = '/avatar.png';  // Correct relative path to the public folder
  
      try {
        await updateProfile({ profilePic: defaultAvatar });
        setSelectedImg(defaultAvatar);  // Update the state to reflect the default avatar
      } catch (error) {
        console.error("Error in updating profile:", error);
      }
    }
  };
  
  
  

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      await deleteAccount();
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      fullName: formData.fullName,
      email: formData.email,
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    };
  
    if (selectedImg) {
      updateData.profilePic = selectedImg;
    }
  
    await updateProfile(updateData);
    setIsModalOpen(false);
  };

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: '#2a303c',
      padding: '2rem',
      borderRadius: '0.5rem',
      width: '90%',
      maxWidth: '500px',
    },
    closeButton: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'white',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    input: {
      padding: '0.5rem',
      borderRadius: '0.25rem',
      border: '1px solid #4b5563',
      backgroundColor: '#1f2937',
      color: 'white',
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      cursor: 'pointer',
    },
  };

  return (
    <div className="pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none scale-150" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
            <button
              onClick={handleRemoveProfilePicture}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
            >
              Remove Profile Picture
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              Update Profile
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center gap-2"
            >
              <Trash className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <button style={modalStyles.closeButton} onClick={() => setIsModalOpen(false)}>
              <X />
            </button>
            <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
            <form onSubmit={handleSubmit} style={modalStyles.form}>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
                style={modalStyles.input}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                style={modalStyles.input}
              />
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Current Password"
                style={modalStyles.input}
              />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="New Password (optional)"
                style={modalStyles.input}
              />
              <button type="submit" style={modalStyles.button}>
                {isUpdatingProfile ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

