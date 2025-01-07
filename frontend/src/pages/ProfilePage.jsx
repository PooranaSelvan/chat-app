import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Trash, X } from 'lucide-react';

const ProfilePage = () => {
  // getting details from store - zustand.
  const { authUser, isUpdatingProfile, updateProfile, deleteAccount } = useAuthStore();


  const [selectedImg, setSelectedImg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser.fullName,
    email: authUser.email,
    currentPassword: "",
    newPassword: "",
  });

  // uploading image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      // upload image to server via zustand.
      await updateProfile({ profilePic: base64Image });
    };
  };

  // removing avatar
  const handleRemoveProfilePicture = async () => {
    // if yes remove avatar.
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      const defaultAvatar = '/avatar.png'; 
  
      try {
        await updateProfile({ profilePic: defaultAvatar });
        setSelectedImg(defaultAvatar);  // Update the state to reflect the default avatar
      } catch (error) {
        console.error("Error in updating profile:", error);
      }
    }
  };
  
  // deleting account permanantly.
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      await deleteAccount();
    }
  };

  // updating profile form handling.
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // 
  const handleSubmit = async (e) => {
    e.preventDefault();

    // updated data stored in new obj.
    const updateData = {
      fullName: formData.fullName,
      email: formData.email,
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    };
  
    // if img selected - add that into the updateObj
    if (selectedImg) {
      updateData.profilePic = selectedImg;
    }
  
    // updating state.
    await updateProfile(updateData);
    setIsModalOpen(false);
  };

  return (
    <div className="pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar Updating */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img src={selectedImg || authUser.profilePic || "/avatar.png"} alt="Profile" className="size-32 rounded-full object-cover border-4"/>
              {formData.email === "test1@gmail.com" ? (
                null
              ) : (
                <label htmlFor="avatar-upload" className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none scale-150" : ""}
                `}>
                  <Camera className="w-5 h-5 text-base-200" />
                  <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUpdatingProfile}/>
                </label>
              )}
            </div>
            {formData.email === "test1@gmail.com" ? (
              null
            ) : (
              <button onClick={handleRemoveProfilePicture} className="text-red-500 hover:text-red-600">Remove Profile Picture</button>  
            )}
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
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            {/* Opening Pop Over for EditProfile */}
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200">
              Update Profile
            </button>
            {/* Deleting Profile */}
            <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center gap-2">
              <Trash className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Updating PopOver */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-base-100 p-8 rounded-lg w-[90%] max-w-[500px] relative">
            <button className="absolute -top-6 -right-2 text-white hover:text-gray-300" onClick={() => setIsModalOpen(false)}>
              <X />
            </button>
            <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" className="p-2 rounded-md border border-gray-600 bg-base-100"/>
              {/* Email */}
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="p-2 rounded-md border border-gray-600 bg-base-100"/>
              {/* Current Password */}
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} placeholder="Current Password" className="p-2 rounded-md border border-gray-600 bg-base-100"/>
              {/* New Password */}
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="New Password" className="p-2 rounded-md border border-gray-600 bg-base-100"/>
              {/* Update Profile */}
              {formData.email === "test1@gmail.com" ? (
                null ) : (
                  <button type="submit" className="p-2 rounded-md border-none bg-blue-500 text-white cursor-pointer">
                    {isUpdatingProfile ? "Updating..." : "Update Profile"}
                  </button>
                )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;

