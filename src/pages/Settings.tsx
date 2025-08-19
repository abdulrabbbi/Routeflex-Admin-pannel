"use client";

import { useState, useMemo } from "react";
import { MdPerson, MdSecurity, MdPalette } from "react-icons/md";
import { UpdatePassword, UpdateMe } from "../api/authService";
import { UpdatePasswordPayload, PreferencesPayload } from "../types/auth";
import { getImageUrl } from "../utils/getImageUrl";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: File | string | null;
}

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profileData, setProfileData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    profilePicture: null as File | null,
  });

  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user.profilePicture ? getImageUrl(user.profilePicture) : null
  );

  const [passwordData, setPasswordData] = useState<UpdatePasswordPayload>({
    currentPassword: "",
    newPassword: "",
    passwordConfirm: "",
  });

  const [preferences, setPreferences] = useState<PreferencesPayload>({
    language: "english",
    theme: "light",
    twoFactor: true,
  });

 const handleProfileSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const payload = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      profilePicture: profileData.profilePicture, 
    };

    const response = await UpdateMe(payload);

    const updatedUser = {
      ...user,
      ...response.user, 
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    toast.success("Profile updated successfully!");

    setProfileData({
      firstName: response.user.firstName || "",
      lastName: response.user.lastName || "",
      email: response.user.email || "",
      profilePicture: null,
    });
    setProfilePictureUrl(
      response.user.profilePicture
        ? getImageUrl(response.user.profilePicture)
        : null
    );
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Profile update failed");
  } finally {
    setLoading(false);
  }
};

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setProfileData((prev) => ({
        ...prev,
        profilePicture: file,
      }));
      setProfilePictureUrl(URL.createObjectURL(file));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (passwordData.newPassword !== passwordData.passwordConfirm) {
        throw new Error("Passwords do not match");
      }
      await UpdatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        passwordConfirm: passwordData.passwordConfirm,
      });
      toast.success("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        passwordConfirm: "",
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = () => {
    toast.success("Preferences saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1e1e38] mb-6">Settings</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
              <nav className="space-y-2">
                {[
                  { id: "profile", icon: MdPerson, label: "Profile" },
                  { id: "security", icon: MdSecurity, label: "Security" },
                  { id: "preferences", icon: MdPalette, label: "Preferences" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg ${
                      activeTab === item.id
                        ? "bg-[#f3f4f8] text-[#1e1e38]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="col-span-3 p-6">
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1e1e38]">
                      Profile Picture
                    </label>
                    <div className="mt-1 flex items-center">
                      <img
                        src={profilePictureUrl ?? "images/avatar.png"}
                        alt="Profile"
                        className="h-16 w-16 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />

                      <label className="ml-4 px-4 py-2 border border-[#22c55e] text-[#22c55e] rounded-lg hover:bg-[#22c55e] hover:text-white cursor-pointer">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePictureChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1e1e38]">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          firstName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1e1e38]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          lastName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1e1e38]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "security" && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#1e1e38]">
                      Change Password
                    </h3>
                    <div className="mt-4 space-y-4">
                      <input
                        type="password"
                        placeholder="Current Password"
                        className="block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        className="block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                        value={passwordData.passwordConfirm}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            passwordConfirm: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-[#1e1e38]">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security
                      </p>
                    </div>
                    <div className="flex h-6 items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]"
                        checked={preferences.twoFactor}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            twoFactor: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1e1e38]">
                      Language
                    </label>
                    <select
                      className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                      value={preferences.language}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          language: e.target.value,
                        })
                      }
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1e1e38]">
                      Theme
                    </label>
                    <select
                      className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                      value={preferences.theme}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          theme: e.target.value,
                        })
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="button"
                      onClick={handlePreferencesSave}
                      className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
