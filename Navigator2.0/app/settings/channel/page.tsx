"use client"

import { useState, useEffect, useMemo, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, History, Edit, Trash2, X, CheckCircle } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { deleteChannel, getAllChannelList, getChannelHistory } from "@/lib/channels"
import { useSelectedProperty, useUserDetail } from "@/hooks/use-local-storage"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function ChannelSettingsPage() {
  const [channels, setChannels] = useState<any>([])
  const [channelHistory, setChannelHistory] = useState<any>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  // const [showSnackbar, setShowSnackbar] = useState(false)
  // const [showDeleteSnackbar, setShowDeleteSnackbar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [channelToDelete, setChannelToDelete] = useState<any>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProperty] = useSelectedProperty();
  const [userDetails] = useUserDetail();
  const { toast } = useToast();
  // Auto-hide snackbar after 5 seconds
  // useEffect(() => {
  //   if (showSnackbar) {
  //     const timer = setTimeout(() => {
  //       setShowSnackbar(false)
  //     }, 5000)
  //     return () => clearTimeout(timer)
  //   }
  // }, [showSnackbar])

  // Auto-hide delete snackbar after 5 seconds
  // useEffect(() => {
  //   if (showDeleteSnackbar) {
  //     const timer = setTimeout(() => {
  //       setShowDeleteSnackbar(false)
  //     }, 5000)
  //     return () => clearTimeout(timer)
  //   }
  // }, [showDeleteSnackbar])

  // Simulate loading effect on component mount
  useEffect(() => {
    if (!selectedProperty?.sid) return;

    const fetchChannels = async () => {
      try {
        const response: any = await getAllChannelList({
          SID: selectedProperty.sid,
          isMetaSite: true,
          bForceFresh: false,
        });

        if (response?.status) {
          setChannels(response.body.filter((x:any) => x.isActive === true) || []);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true); // Start loading before fetch
    fetchChannels();

  }, [selectedProperty?.sid]);
  useEffect(() => {
    if (!selectedProperty?.sid || !showChangeHistory) return;

    const fetchChannelHistory = async () => {
      try {
        const response: any = await getChannelHistory({
          SID: selectedProperty.sid
        });

        if (response?.status) {
          setChannelHistory(response.body || []);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchChannelHistory();

  }, [showChangeHistory]);


  const filteredChannels = useMemo(() => {
    if (channels.length === 0) return [];
    const search = (searchValue || searchTerm || '').toLowerCase();

    return channels.filter(
      (channel: any) =>
        channel.name.toLowerCase().includes(search) ||
        channel.createdBy.toLowerCase().includes(search)
    );
  }, [channels, searchValue, searchTerm]);

  const handleDeleteChannel = (channel: any) => {
    setChannelToDelete(channel)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteChannel = () => {
    debugger
    if (!!channelToDelete) {
      setChannels((prev: any) => prev.filter((channel: any) => channel.cid !== channelToDelete.cid))
      const filtersValue = {
        channelId: channelToDelete.cid,
        channelName: channelToDelete.name,
        SID: selectedProperty?.sid,
        isNew: channelToDelete.isNew,
        createdBy: userDetails?.userId
      }
      deleteChannel(filtersValue).then((response) => {
        if (response?.status) {
          toast({
            description: "Channel Deleted!!",
            variant: "success",
            duration: 3000,
          })
        }
        else {
          toast({
            title: "Error",
            description: "Something went wrong. Please try again!",
            variant: "error",
            duration: 5000,
          });
          // setShowDeleteSnackbar(true)
        }
      }).finally(() => {
        setShowDeleteConfirm(false)
        setChannelToDelete(null)
      });

    }
  }

  const cancelDeleteChannel = () => {
    setShowDeleteConfirm(false)
    setChannelToDelete(null)
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

  const getStatusBadge = (status: string) => {
    if (status === "Requested") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 text-xs">
          {status}
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 text-xs">
        {status}
      </Badge>
    )
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

              {/* Channels Table Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-1/2"></div>
                  </div>
                </div>
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b">
                    <div className="grid grid-cols-5 gap-4">
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>

                  {/* Table Rows */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-4 py-4 border-b last:border-b-0">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-6 w-16 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
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
            <span className="text-xl font-semibold text-foreground">Channel Management</span>
            <p className="text-sm text-muted-foreground">
              Manage distribution channels, monitor booking sources, and track channel performance
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
                    <p>Search By Channel Name</p>
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
        </div>
      </div>

      {/* Channels Table */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg">
                    Channel Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    Created On
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                    Created By
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredChannels.map((channel: any, index: any) => {
                  const isLastRow = index === filteredChannels.length - 1;
                  return (
                    <tr key={channel.cid} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                      <td className={`px-4 py-2 whitespace-nowrap ${isLastRow ? 'rounded-bl-lg' : ''}`}>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-black dark:text-white">
                            {channel.name}
                          </div>
                          {channel.isActive === false && (
                            <div className="ml-2">
                              {getStatusBadge("Requested")}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {format(channel.createdDate, "dd MMM''yy")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {channel.createdBy}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap text-center ${isLastRow ? 'rounded-br-lg' : ''}`}>
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => channel.isActive && handleDeleteChannel(channel)}
                                  disabled={!channel.isActive}
                                  className={`h-6 w-6 p-0 ${channel.isActive
                                    ? "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    : "text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white">
                                <p>{channel.isActive ? "Delete Channel" : "Disabled"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Change History Modal */}
      <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
        <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Channel Change History</DialogTitle>
            <DialogDescription>
              Shows the history of all the changes made to channel settings
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex-1 overflow-hidden">
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg h-full">
              <div className="h-[300px] overflow-y-auto border-b border-gray-200 dark:border-gray-700 mb-2.5">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800 align-top">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-28">
                        Channel
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                        Action Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-28">
                        Created/Modified By
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-48">
                        Email
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                        Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900">
                    {channelHistory.map((changeWithId: any, index: any) => {
                      const isLastRow = index === channelHistory.length - 1;
                      return (
                        <tr key={changeWithId.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                          <td className={`px-4 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''} w-28`}>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {changeWithId.channelName}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                            {format(changeWithId.createdDate, "dd MMM''yy")}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-28">
                            <div className="truncate">
                              {changeWithId.createdByName}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-48">
                            <div className="truncate">
                              {changeWithId.createdByEmail}
                            </div>
                          </td>
                          <td className={`px-4 py-2 whitespace-nowrap text-sm border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''} w-20`}>
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                              ${changeWithId.activity === 'Modified' || changeWithId.activity === 'Updated'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : changeWithId.activity === 'Created' || changeWithId.activity === 'Activated' || changeWithId.activity === 'Added'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : changeWithId.activity === 'Deleted' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                }`}>
                                {changeWithId.activity}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Add padding to ensure last row is visible */}
                    {/* <tr>
                      <td colSpan={5} className="h-4"></td>
                    </tr> */}
                  </tbody>
                  {/* Add blank space after table */}
                  {/* <div className="h-2.5"></div> */}
                </table>
              </div>
            </div>
          </div>

          {/* <div className="border-t border-gray-300 dark:border-gray-600 mt-2"></div> */}

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
            <DialogTitle className="text-xl font-semibold text-black">Delete Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this channel? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={cancelDeleteChannel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteChannel}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      {/* {showSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                Channel updated successfully
              </span>
            </div>
          </div>
        </div>
      )} */}

      {/* Delete Success Snackbar */}
      {/* {showDeleteSnackbar && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                Channel deleted successfully
              </span>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}