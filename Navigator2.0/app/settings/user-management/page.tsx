"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Trash2, History, User, MoreVertical, Edit, CheckCircle, X, Camera } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getActivePageMaster, getUserHistory, getUsers, addUpdateUser, uploadImage } from "@/lib/userManagement"
import { useSelectedProperty, useUserDetail } from "@/hooks/use-local-storage"
import { toast } from "@/hooks/use-toast"


const userRoles = ["Admin", "Property User"] //, "Manager", "Viewer"
//const landingPages = ["Overview", "Demand", "Rate Evolution", "Business Intelligence", "Cluster", "Price Planner", "Reports", "Settings", "Analytics"]

export default function UserManagementPage() {
  //const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddUser, setShowAddUser] = useState(false)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showDeleteSnackbar, setShowDeleteSnackbar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any | null>(null)
  //const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [selectedProperty] = useSelectedProperty()
  const [userDetails] = useUserDetail();
  const [apiUsers, setUsersDetails] = useState<any[]>([]);
  const [apiActivePageMaster, setActivePageMaster] = useState<any[]>([]);
  const [apiUserHistory, setUserHistory] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<ProfileImage | null>(null);
  const [inputChanged, setInputChanged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  //const [editUser, setEditingUser] = useState<any[]>([]);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)

  interface ProfileImage {
    imageName: string,
    imagePath: any
  }
  // Add User form state
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    userRole: "",
    emailId: "",
    interfaceAccess: false,
    emailAccess: false,
    defaultLandingPageText: "",
    appPageMasterId: "",
    userID: ""
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    const day = date.toLocaleString('en-GB', { day: '2-digit' });
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.toLocaleString('en-GB', { year: '2-digit' });

    return `${day} ${month}' ${year}`;
  };



  const fetchUserData = useCallback(async () => {
    if (!selectedProperty?.sid) {
      console.log("[fetchUserData] Skipped: No SID provided.");
      return;
    }
    setIsLoading(true);
    try {
      // Run both APIs in parallel
      const [usersResponse, pageMasterResponse, userHistoryResponse] = await Promise.all([
        getUsers({ SID: selectedProperty.sid, bForceFresh: false }),
        getActivePageMaster(),
        getUserHistory({ SID: selectedProperty.sid, bForceFresh: false })
      ]);

      if (usersResponse.status) {
        setUsersDetails(usersResponse.body);
      } else {
        setUsersDetails([]);
      }
      if (pageMasterResponse.status) {
        setActivePageMaster(pageMasterResponse.body);
      } else {
        setActivePageMaster([]);
      }
      if (userHistoryResponse.status) {
        setUserHistory(userHistoryResponse.body);
      } else {
        setUserHistory([]);
      }

    } catch (error) {
      console.error("[fetchUserData] API call failed:", error);
      setUsersDetails([]);
      setActivePageMaster([]);
      setUserHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProperty?.sid]);


  useEffect(() => {
    fetchUserData();
  }, [selectedProperty?.sid, fetchUserData]);


  // Auto-hide snackbar after 5 seconds
  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => {
        setShowSnackbar(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSnackbar])

  // Auto-hide delete snackbar after 5 seconds
  useEffect(() => {
    if (showDeleteSnackbar) {
      const timer = setTimeout(() => {
        setShowDeleteSnackbar(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showDeleteSnackbar])

  // Simulate loading effect on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // Show loading for 3 seconds

    return () => clearTimeout(timer)
  }, [])

  const filteredUsers = apiUsers.filter(
    (user) =>
      user.firstName.toLowerCase().includes((searchValue || searchTerm).toLowerCase()) ||
      user.lastName.toLowerCase().includes((searchValue || searchTerm).toLowerCase()) ||
      user.email.toLowerCase().includes((searchValue || searchTerm).toLowerCase()) ||
      user.userRoleText.toLowerCase().includes((searchValue || searchTerm).toLowerCase()) ||
      user.defaultLandingPageText.toLowerCase().includes((searchValue || searchTerm).toLowerCase()),
  )

  const toggleUserAccess = (userId: number, accessType: "emailAccess" | "interfaceAccess") => {
    setUsersDetails((prev) => prev.map((user) => (Number(user.userId) === userId ?
      { ...user, [accessType]: !user[accessType] } : user)))
  }
  function isRateGainMail(email: any) {
    const domain = "rategain.com";
    if (email != undefined && email != null && email.indexOf(domain) != -1) {
      return true;
    }
    return false;

  }
  const handleAddUser = async () => {
    debugger
    if (newUser.firstName && newUser.lastName && newUser.userRole && newUser.emailId && newUser.defaultLandingPageText) {
      // ImagePath:newUser.imagePath "/placeholder.svg?height=32&width=32",
      const mapUserRole = (role: string): number => {
        switch (role) {
          case "Admin":
            return 2;
          case "Property User":
            return 1;
          default:
            return 0; // fallback if role not found
        }
      };
      if (isRateGainMail(newUser.emailId)) {
        toast({
          description: "Email having rategain.com is invalid.",
          variant: "default",
          duration: 3000,
        })
        return;
      }
      const filtersValues: any = {}
      if (profileImage?.imagePath != undefined) {
        filtersValues.imagePath = profileImage?.imagePath;
        filtersValues.imageName = profileImage?.imageName;
      }
      filtersValues.firstName = newUser.firstName;
      filtersValues.lastName = newUser.lastName;
      filtersValues.email = newUser.emailId;
      filtersValues.pghAccess = newUser.interfaceAccess;
      filtersValues.pghReportEmail = newUser.emailAccess;
      filtersValues.defaultLandingPage = newUser.appPageMasterId;
      filtersValues.createdBy = userDetails?.userId;
      filtersValues.sID = selectedProperty?.sid;
      filtersValues.userRoleID = mapUserRole(newUser.userRole);
      filtersValues.userRoleText = newUser.userRole;
      filtersValues.updatedBy = userDetails?.userId.toString();
      filtersValues.currentUserRole = userDetails?.userRoletext;
      if (newUser.userID === null && newUser.userID === "") {
        filtersValues.OperationAddorUpdate = 0;
      } else if (newUser.userID !== null && newUser.userID !== "") {
        filtersValues.userID = Number(newUser.userID);
        filtersValues.OperationAddorUpdate = 1;
        filtersValues.isNewOptimaDelete = false;
      }

      const response = await addUpdateUser(filtersValues);

      if (response.status && response.body) {
        if (apiActivePageMaster.length > 0) {
          const pageName = apiActivePageMaster.find(
            (page) => page.appPageMasterId === filtersValues.defaultLandingPage
          )?.name ?? "";
          const newUser = {
            ...filtersValues,
            defaultLandingPageText: pageName, // store the text
          };
        }

        //if (newUser.userID == null && newUser.userID == "") {
        //   setUsersDetails((prev) => [newUser, ...prev]);
        //} else if (newUser.userID !== null && newUser.userID !== "") {
        //   setUsersDetails((prev) => {
        //     const filtered = prev.filter(user => user.userID === newUser.userID);
        //     console.log("apiUsers after updated:", filtered);
        //     return prev; // keep state same
        //   });
        //}

        toast({
          description: (newUser.userID == null && newUser.userID == "") ? "User added successfully" : "User updated successfully",
          variant: "success",
          duration: 3000,
        })
        handleCancelAddUser(),
          // setUsersDetails((prev) => [filtersValues, ...prev])
          //  setShowSnackbar(true)

          await fetchUserData();
      }
      else {
        toast({
          title: "Error",
          description: response.message || "Something went wrong. Please try again!",
          variant: "error",
          duration: 5000,
        })
      }
    }
  }

  const handleCancelAddUser = () => {
    setNewUser({
      firstName: "",
      lastName: "",
      userRole: "",
      emailId: "",
      interfaceAccess: false,
      emailAccess: false,
      defaultLandingPageText: "",
      appPageMasterId: "",
      userID: ""
    })
    setProfileImage(null)
    setShowAddUser(false)
    setIsEditUserOpen(false)
  }

  const handleDeleteUser = (userRow: any) => {
    setUserToDelete(userRow)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      debugger
      let filtersValues = {
        userID: userToDelete.userID,
        firstName: userToDelete.firstName,
        lastName: userToDelete.lastName,
        email: userToDelete.email,
        pghReportEmail: userToDelete.pghReportEmail,
        pghAccess: userToDelete.pghAccess,
        userRoleID: userToDelete.userRoleID,
        userRoleText: userToDelete.userRoleText,
        sid: selectedProperty?.sid,
        isDeleted: true,
        isNewOptimaDelete: null,
        IsNewOptimaDelete: true,
        currentUserRole: null,
        CurrentUserRole: userDetails?.userRoletext,
        operationAddorUpdate: 0,
        OperationAddorUpdate: 1,
        defaultLandingPage: userToDelete.defaultLandingPage,
        defaultLandingPageText: userToDelete.defaultLandingPageText,
        pghAccessText: userToDelete.pghAccess == true ? "Yes" : "No",
        pghReportEmailText: userToDelete.pghReportEmail == true ? "Yes" : "No",
        loginName: userToDelete.email,
        password: null,
        createdOn: userToDelete.createdOn,
        createdBy: Number(userToDelete.createdBy),
        updatedBy: userToDelete.updatedBy,
        imagePath: userToDelete.imagePath,
        imageName: userToDelete.imageName,

      }

      const response = await addUpdateUser(filtersValues);

      if (response.status && response.body) {
        console.log("apiUsers before delete:", userToDelete);

        setUsersDetails((prev) => {
          const filtered = prev.filter(user => user.userID !== userToDelete.userID);
          console.log("apiUsers after delete:", filtered);
          return filtered;
        });
        //setUsersDetails((prev) => prev.filter((user) => user.userID !== userDetails?.userId))
        setShowDeleteConfirm(false)
        setUserToDelete(null)
        // setShowDeleteSnackbar(true)
        toast({
          description: "User delete successfully",
          variant: "success",
          duration: 3000,
        })
        // await fetchUserData();
      }
      else {
        if (userToDelete.userRoleText != "Admin") {
          toast({
            title: "Error",
            description: "Property user cannnot delete other users.",
            variant: "error",
            duration: 5000,
          })
        }
        else {
          toast({
            title: "Error",
            description: response.message || "Something went wrong. Please try again!",
            variant: "error",
            duration: 5000,
          })
        }

      }
      // setUsersDetails((prev) => prev.filter((user) => user.id !== userToDelete))
      // setShowDeleteConfirm(false)
      // setUserToDelete(null)
      // setShowDeleteSnackbar(true)
    }
  }

  const cancelDeleteUser = () => {
    setShowDeleteConfirm(false)
    setUserToDelete(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files.length > 0) {
      const ProfilePic = e.target.files[0];
      if (!ProfilePic) {
        console.warn("No file selected");
        return;
      }
      setIsUploading(true);
      try {
        var form_data = new FormData();
        form_data.append("flag", "1");
        form_data.append("profileimage", ProfilePic);

        const imageResponse = await uploadImage(form_data);

        if (imageResponse.status && imageResponse.body) {
          setProfileImage({
            imagePath: imageResponse.body[0],
            imageName: imageResponse.body[1],
          });
          console.log("Image uploaded successfully:", imageResponse.body);
        } else {
          toast({
            description: "Image upload failed!!",
            variant: "error",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
      // const reader = new FileReader();
      // reader.onload = async (e) => {
      //   const base64String = e.target?.result as string;
      //   setProfileImage({ imagePath: base64String, imageName: file.name });


      // };

      // reader.readAsDataURL(file); // convert file to base64

      // Reset input so same file can be uploaded again

      // setInputChanged(prev => !prev);
    }
    // const file = event.target.files?.[0]
    // if (file) {
    //   const reader = new FileReader()
    //   reader.onload = (e) => {
    //     //setProfileImage(e.target?.result as string)
    //     setProfileImage({
    //       imageName: file.name,
    //       imagePath: e.target?.result as string
    //     });
    //   }
    //   reader.readAsDataURL(file)
    // }
  }

  const triggerFileInput = () => {
    const fileInput = document.getElementById('profile-image-upload') as HTMLInputElement
    fileInput?.click()
  }

  const handleEditUser = async (userEdit: any) => {
    debugger
    //setEditingUser(userEdit)
    setNewUser({
      firstName: userEdit.firstName,
      lastName: userEdit.lastName,
      userRole: userEdit.userRoleText,
      emailId: userEdit.email,
      interfaceAccess: userEdit.pghReportEmail,
      emailAccess: userEdit.pghAccess,
      defaultLandingPageText: userEdit.defaultLandingPageText,
      appPageMasterId: userEdit.defaultLandingPage,
      userID: userEdit.userID
    })
    setIsEditUserOpen(true)
  }
  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchValue("")
    }
  }

  const clearSearch = () => {
    setSearchValue("")
    setSearchTerm("")
    setShowSearch(false)
  }

  // Show loading state when data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
        <GlobalProgressBar />
        <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-6 lg:py-8 xl:py-10">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="space-y-6">
              {/* Header Skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="space-y-1">
                    <div className="h-6 w-48 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-4 w-64 bg-gray-300 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 bg-gray-300 animate-pulse rounded"></div>
                  <div className="h-9 w-32 bg-gray-300 animate-pulse rounded"></div>
                </div>
              </div>

              {/* Search Bar Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-3/4"></div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-80 bg-gray-300 animate-pulse rounded"></div>
                    <div className="h-10 w-24 bg-gray-300 animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-1/2"></div>
                  </div>
                </div>
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b">
                    <div className="grid grid-cols-7 gap-4">
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>

                  {/* Table Rows */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-4 py-4 border-b last:border-b-0">
                      <div className="grid grid-cols-7 gap-4 items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-300 animate-pulse rounded-full"></div>
                          <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        </div>
                        <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-6 w-12 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-8 w-8 bg-gray-300 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="space-y-1">
            <span className="text-xl font-semibold text-foreground">User Management</span>
            <p className="text-sm text-muted-foreground">
              Manage user accounts, permissions, and access controls for your organization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Icon/Field */}
          <div className="flex items-center gap-2">
            {!showSearch ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={toggleSearch}
                      className="flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search By User Name</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="relative">
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..."
                  className="w-[120px] h-9 px-3 pr-8 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 hover:bg-gray-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowChangeHistory(true)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Change History
          </Button>
          <Button
            onClick={() => setShowAddUser(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>


      {/* Users Table */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg">
                    User Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    Email ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    User Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    Email Access
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    Interface Access
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    Default Landing Page
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((userValue, index) => {
                  const isLastRow = index === filteredUsers.length - 1;
                  return (
                    <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                      <td className={`px-4 py-2 whitespace-nowrap ${isLastRow ? 'rounded-bl-lg' : ''}`}>
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2">

                            {!userValue?.imagePath ? (
                              <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <img
                                src={userValue.imagePath}
                                alt="User"
                                className="w-6 h-6 rounded-full profileImage"
                              />
                            )}

                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {userValue.firstName}  {userValue.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {userValue.email}

                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {userValue.userRoleText}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <Switch disabled
                          checked={userValue.pghReportEmail}
                          onCheckedChange={() => toggleUserAccess(userValue.userID, "emailAccess")}
                          className="scale-75"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <Switch disabled
                          checked={userValue.pghAccess}
                          onCheckedChange={() => toggleUserAccess(userValue.userID, "interfaceAccess")}
                          className="scale-75"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {userValue.defaultLandingPageText}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-center ${isLastRow ? 'rounded-br-lg' : ''}`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(userValue)} // <-- add your edit handler here
                                className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-6 w-6 p-0"
                              >
                                <Edit className="w-3 h-3" /> {/* lucide-react Edit icon */}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black text-white text-xs">
                              <p>Edit User</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(userValue)}
                                className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black text-white text-xs">
                              <p>Delete User</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-black">Add User</DialogTitle>

              {/* Profile Image Upload */}
              <div className="relative">
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={triggerFileInput}
                  className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 hover:border-gray-400 transition-colors group"
                >
                  {profileImage?.imagePath ? (
                    <img
                      src={profileImage?.imagePath}
                      alt="Property"
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* First Row: First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  First Name<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Last Name<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
              </div>
            </div>

            {/* Second Row: User Role and Email ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  User Role<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={newUser.userRole}
                  onValueChange={(value) => setNewUser((prev) => ({ ...prev, userRole: value }))}
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto [&>div]:max-h-60 [&>div]:overflow-y-auto">
                    {userRoles.map((role) => (
                      <SelectItem key={role} value={role} className="pl-3 [&>span:first-child]:hidden">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Email ID<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  type="email"
                  value={newUser.emailId}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, emailId: e.target.value }))}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
              </div>
            </div>

            {/* Third Row: Default Landing Page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Default Landing Page<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={newUser.appPageMasterId?.toString() ?? ""}
                  onValueChange={(value) => {
                    const selectedPage = apiActivePageMaster.find(
                      (page) => page.appPageMasterId.toString() === value
                    );
                    if (selectedPage) {
                      setNewUser((prev) => ({
                        ...prev,
                        appPageMasterId: selectedPage.appPageMasterId, // key
                        defaultLandingPageText: selectedPage.name,         // value
                      }));
                    }
                  }}
                >
                  {/* <Select
                  value={newUser.defaultLandingPage}
                  onValueChange={(value) => setNewUser((prev) => ({
                    ...prev,
                    defaultLandingPage: value
                  }))}
                > */}
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select landing page" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto [&>div]:max-h-60 [&>div]:overflow-y-auto">
                    {Array.isArray(apiActivePageMaster) && apiActivePageMaster.length > 0 ? (
                      apiActivePageMaster.map((page) => (
                        <SelectItem
                          key={page.appPageMasterId}
                          value={page.appPageMasterId.toString()}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          {page.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No pages found</div>
                    )}
                  </SelectContent>

                  {/* <SelectContent className="max-h-60 overflow-y-auto [&>div]:max-h-60 [&>div]:overflow-y-auto">
                    {landingPages.map((page) => (
                      <SelectItem key={page} value={page} className="pl-3 [&>span:first-child]:hidden">
                        {page}
                      </SelectItem>
                    ))}
                  </SelectContent> */}
                </Select>
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Access Options
                </Label>
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interface-access"
                      checked={newUser.interfaceAccess}
                      onCheckedChange={(checked) => setNewUser((prev) => ({ ...prev, interfaceAccess: !!checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Label htmlFor="interface-access" className="text-sm text-gray-700 cursor-pointer">
                      Interface Access
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-access"
                      checked={newUser.emailAccess}
                      onCheckedChange={(checked) => setNewUser((prev) => ({ ...prev, emailAccess: !!checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Label htmlFor="email-access" className="text-sm text-gray-700 cursor-pointer">
                      Email Access
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancelAddUser}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={
                !newUser.firstName ||
                !newUser.lastName ||
                !newUser.userRole ||
                !newUser.emailId ||
                !newUser.defaultLandingPageText
              }
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change History Modal */}
      <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
        <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">User Change History</DialogTitle>
            <DialogDescription>
              Shows the history of all the changes
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex-1 overflow-hidden">
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg h-full">
              <div className="h-[400px] overflow-y-auto border-b border-gray-200 dark:border-gray-700 mb-2.5">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800 align-top">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                        User Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-24">
                        User Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-40">
                        Email ID
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                        Email Access
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-24">
                        Interface Access
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                        Default Landing Page
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                        Created/Modified By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {apiUserHistory && apiUserHistory.length > 0 ? (
                      Array.from({ length: 50 }, (_, index) => {
                        const baseData = [...apiUserHistory];
                        const change = baseData[index % baseData.length];
                        if (!change) return null;
                        const changeWithId = {
                          ...change,
                          id: index + 1,
                          name: `${change.firstName} ${change.lastName}`,
                          userType: change.userRoleText,
                          email: change.email,
                          emailAccess: change.pghReportEmail,
                          interfaceAccess: change.pghAccess,
                          defaultLandingPage: change.defaultLandingPageText,
                          date: formatDate(change.createdOn),
                          createdBy: `${change.updatedBy}`
                        };

                        const isLastRow = index === 49; // 50 items total, so last index is 49
                        return (
                          <tr key={changeWithId.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                            <td className={`px-4 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-32`}>
                              <div className="flex items-center">
                                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                  {!change?.imagePath ? (
                                    <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                  ) : (
                                    <img
                                      src={change.imagePath}
                                      alt="User"
                                      className="w-3 h-3 rounded-full profileImage"
                                    />
                                  )}
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={changeWithId.name}>
                                  {changeWithId.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-24">
                              <div className="truncate" title={changeWithId.userType}>
                                {changeWithId.userType}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-40">
                              <div className="truncate" title={changeWithId.email}>
                                {changeWithId.email}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                              {changeWithId.emailAccess ? "true" : "false"}
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-24">
                              {changeWithId.interfaceAccess ? "true" : "false"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-32">
                              <div className="truncate" title={changeWithId.defaultLandingPage}>
                                {changeWithId.defaultLandingPage}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                              {changeWithId.date}
                            </td>
                            <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''} w-32`}>
                              <div className="truncate" title={changeWithId.createdBy}>
                                {changeWithId.createdBy}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      < tr >
                        <td colSpan={8} className="h-4"></td>
                      </tr>
                    )}
                  </tbody>
                  {/* Add blank space after table */}
                  {/* <div className="h-2.5"></div> */}
                </table>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 dark:border-gray-600 mt-6"></div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowChangeHistory(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={cancelDeleteUser}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteUser}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-black">Edit User</DialogTitle>

              {/* Profile Image Upload */}
              <div className="relative">
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={triggerFileInput}
                  className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 hover:border-gray-400 transition-colors group"
                >
                  {profileImage?.imagePath ? (
                    <img
                      src={profileImage?.imagePath}
                      alt="Property"
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* First Row: First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  First Name<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Last Name<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
              </div>
            </div>

            {/* Second Row: User Role and Email ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  User Role<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select disabled={userDetails?.userRoletext !== 'Admin' || newUser.userRole === 'Admin'}
                  value={newUser.userRole}
                  onValueChange={(value) => setNewUser((prev) => ({ ...prev, userRole: value }))}
                >
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto [&>div]:max-h-60 [&>div]:overflow-y-auto">
                    {userRoles.map((role) => (
                      <SelectItem key={role} value={role} className="pl-3 [&>span:first-child]:hidden">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Email ID<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  disabled
                  type="email"
                  value={newUser.emailId}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, emailId: e.target.value }))}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                />
              </div>
            </div>

            {/* Third Row: Default Landing Page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Default Landing Page<span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={newUser.appPageMasterId?.toString() ?? ""}
                  onValueChange={(value) => {
                    const selectedPage = apiActivePageMaster.find(
                      (page) => page.appPageMasterId.toString() === value
                    );
                    if (selectedPage) {
                      setNewUser((prev) => ({
                        ...prev,
                        appPageMasterId: selectedPage.appPageMasterId, // key
                        defaultLandingPageText: selectedPage.name,         // value
                      }));
                    }
                  }}
                >
                  {/* <Select
                  value={newUser.defaultLandingPage}
                  onValueChange={(value) => setNewUser((prev) => ({
                    ...prev,
                    defaultLandingPage: value
                  }))}
                > */}
                  <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select landing page" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto [&>div]:max-h-60 [&>div]:overflow-y-auto">
                    {Array.isArray(apiActivePageMaster) && apiActivePageMaster.length > 0 ? (
                      apiActivePageMaster.map((page) => (
                        <SelectItem
                          key={page.appPageMasterId}
                          value={page.appPageMasterId.toString()}
                          className="pl-3 [&>span:first-child]:hidden"
                        >
                          {page.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No pages found</div>
                    )}
                  </SelectContent>

                  {/* <SelectContent className="max-h-60 overflow-y-auto [&>div]:max-h-60 [&>div]:overflow-y-auto">
                    {landingPages.map((page) => (
                      <SelectItem key={page} value={page} className="pl-3 [&>span:first-child]:hidden">
                        {page}
                      </SelectItem>
                    ))}
                  </SelectContent> */}
                </Select>
              </div>
              <div>
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Access Options
                </Label>
                <div className="flex items-center space-x-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="interface-access"
                      checked={newUser.interfaceAccess}
                      onCheckedChange={(checked) => setNewUser((prev) => ({ ...prev, interfaceAccess: !!checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Label htmlFor="interface-access" className="text-sm text-gray-700 cursor-pointer">
                      Interface Access
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-access"
                      checked={newUser.emailAccess}
                      onCheckedChange={(checked) => setNewUser((prev) => ({ ...prev, emailAccess: !!checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Label htmlFor="email-access" className="text-sm text-gray-700 cursor-pointer">
                      Email Access
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancelAddUser}
              className="h-9 px-4 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={
                !newUser.firstName ||
                !newUser.lastName ||
                !newUser.userRole ||
                !newUser.emailId ||
                !newUser.defaultLandingPageText
              }
              className="h-9 px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      {/* {
        showSnackbar && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">
                  User added successfully
                </span>
              </div>
            </div>
          </div>
        )
      } */}

      {/* Delete Success Snackbar */}
      {/* {
        showDeleteSnackbar && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">
                  User deleted successfully
                </span>
              </div>
            </div>
          </div>
        )
      } */}
    </div >
  )
}