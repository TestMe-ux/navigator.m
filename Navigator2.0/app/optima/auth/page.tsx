"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessurl, saveSwitchAccessUrl } from "@/lib/userManagement";
import { LocalStorageService, LoginResponse } from "@/lib/localstorage";
import { GetPackageDetails, GetSIDListforUser } from "@/lib/login";
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card";

// export enum AllFeature {
//     Report_DetailData = 'Report_DetailData',
//     Demand = 'Demand',
//     OTARank = 'OTARank',
//     Review = 'Review'
// }

export default function AuthBlankSecure() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stayLoggedIn, setStayLoggedIn] = useState(false)
    const [paramAuth, setParamAuth] = useState<string | null>(null);
    const [paramSid, setParamSid] = useState<number | null>(null);
    const [selectedHotel, setSelectedHotel] = useState<any>(null)
    const [hotelOptions, setHotelOptions] = useState<any>([])
    const [dataLoaded, setDataLoaded] = useState(false);
    const [showContent, setShowContent] = useState(false);
    //const [enumAllFeature, setSelectedFeature] = useState<AllFeature>(AllFeature.Demand);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Simulate data loading
                await new Promise((resolve) => setTimeout(resolve, 2000)); // replace with actual data fetch
                setDataLoaded(true);
            } catch (err) {
                console.error(err);
                setDataLoaded(true); // still mark as loaded to hide loader
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (dataLoaded) {
            const timer = setTimeout(() => {
                setShowContent(true); // show page after delay
            }, 500); // delay in ms (500ms here)
            return () => clearTimeout(timer);
        }
    }, [dataLoaded]);

    useEffect(() => {

        const unifiedauth = searchParams.get("unifiedauth");
        const sidParam = searchParams.get("sid");

        // Do nothing if not present yet (Next.js hydration)
        if (!unifiedauth || !sidParam) return;

        const parsedSid = Number(sidParam);
        if (isNaN(parsedSid)) {
            console.warn("Invalid SID parameter, redirecting to login");
            router.replace("/login");
            return;
        }

        setParamAuth(unifiedauth);
        setParamSid(parsedSid);

    }, [searchParams, router]);

    useEffect(() => {
        if (!paramAuth || !paramSid) return; // Wait for params
        const autoLogin = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    accessUrlDetails(paramAuth,paramSid),
                    new Promise((res) => setTimeout(res, 9000)), // optional delay
                ]);
            } catch (err) {
                console.error("Auto-login failed:", err);
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        autoLogin();
    }, [paramAuth, paramSid]);


    const accessUrlDetails = async (authToken: string,paramSID:number) => {
        
        try {
            const resAcc = await getAccessurl({ unifiedauth: authToken, flagOptima: 2 });
            if (resAcc.status) {
                console.log("resAcc", resAcc)

                if (!resAcc.body.operationType) {
                   
                    const baseUrl = resAcc.body.userDetails.applicationURL;
                    const redirectUrl =  `${baseUrl}auth?unifiedauth=${authToken}&sid=${paramSID}`;

                    console.log("Redirecting to Classic Optima:", redirectUrl);

                    // Option 1: Redirect in same tab
                    window.location.href = redirectUrl;
                }

                const loginSuccess = handleSuccessfulLogin(resAcc, false);
                //await SaveSwitchAccessUrlData(resAcc.body.userDetails);
                if (loginSuccess) {
                    await GetSIDListbyUserId(resAcc.body);
                    setDataLoaded(true);
                } else {
                    toast({
                        title: "Authorized",
                        description: resAcc.message || "Login failed. Please check credentials.",
                        variant: "error",
                        duration: 5000,
                    });

                }
            } else {
                toast({
                    title: "Authorized",
                    description: resAcc.message || "Incorrect Username, Please try again.",
                    variant: "error",
                    duration: 5000,
                });
                // const validSid =
                // typeof paramSid === "number" && !isNaN(paramSid) && paramSid > 0;
                const redirectUrl = resAcc.body.userDetails.applicationURL + `/auth?unifiedauth=${authToken}&sid=${paramSID}`;

                console.log("Redirecting to Classic Optima:", redirectUrl);
                window.location.href = redirectUrl;
                //router.replace("/login");
            }
        } catch (error) {
            console.error("Error accessing URL details:", error);
            router.replace("/login");
        } finally {
            setLoading(false);
        }
    };

    // const SaveSwitchAccessUrlData = async (userDetails: any) => {
    //     if (!paramAuth || paramSid === null) return;
    //     try {
    //         const switchAccUrlUser = {
    //             accessToken: userDetails.accessToken || paramAuth,
    //             userID: Number(userDetails.userId),
    //             sId: paramSid,
    //             isSwitching: 2,
    //             iPAddress: "",
    //         };
    //         const res = await saveSwitchAccessUrl(switchAccUrlUser);
    //         console.log(res.status ? "SwitchAccessUrlData saved" : "Failed to save switchAccessUrlData");
    //     } catch (error) {
    //         console.error("Error saving SwitchAccessUrlData:", error);
    //     }
    // };

    const GetSIDListbyUserId = async (userResponse: any) => {

        try {
            // 1. Get user details
            const userdetail = LocalStorageService.getUserDetails();
            if (!userdetail?.userId) {
                console.error("User details not found");
                router.replace("/login");
                return;
            }

            // 2. Fetch SID list
            const response = await GetSIDListforUser({ UserID: userdetail.userId });
            if (!response.status) {
                console.error("Failed to get SID list");
                return;
            }

            const properties = response.body || [];
            LocalStorageService.setItem("Properties", properties);
            setDateFormat();

            let defaultProperty = null;

            // 3. Safely handle `paramSid`
            const validSid =
                typeof paramSid === "number" && !isNaN(paramSid) && paramSid > 0;

            if (properties.length > 0) {
                const selectedIndex = validSid
                    ? properties.findIndex((x: any) => x.sid === paramSid)
                    : -1;

                // fallback to first property if no match
                defaultProperty =
                    selectedIndex !== -1 ? properties[selectedIndex] : properties[0];

                LocalStorageService.setItem("SelectedProperty", defaultProperty);
                setSelectedHotel(defaultProperty);
                setHotelOptions(properties);

                await getPackageDetail(response, userResponse);
            }
             else {
                console.warn("No properties found.");
            }

            // 4. Handle navigation cases
            if (properties.length > 1) {
                router.push("/");
            } else if (properties.length === 1) {
                router.push("/");
            } else {
                // 5. No authorized properties
                try {
                    const resAcc = await getAccessurl({
                        unifiedauth: paramAuth,
                        flagOptima: 3,
                    });

                    LocalStorageService.clear();                    
                    toast({
                        title: "Authorized",
                        description: "This property is not authorized for 'New Navigator' version.",
                        variant: "error",
                        duration: 5000,
                    });

                    // Redirect safely using fallback
                    const baseUrl = resAcc.body.userDetails.applicationURL;
                    window.location.href = `${baseUrl}auth?unifiedauth=${paramAuth}&sid=${paramSid ?? 0}`;
                } catch (error) {
                    console.error("Fallback access URL failed:", error);
                    router.replace("/login");
                }
            }
        } catch (error) {
            console.error("Error in GetSIDListbyUserId:", error);
            router.replace("/login");
        }
    };



    const setDateFormat = () => {
        let fromDate = new Date();
        let toDate = new Date();
        toDate.setDate(fromDate.getDate() + 7);
        const lblSelectedDate = "Next 7 Days";

        // Format dates using moment
        const fromDateStr = format(fromDate, "yyyy-MM-dd");
        const toDateStr = format(toDate, "yyyy-MM-dd");

        // Extract day, month, year
        const startDay = parseInt(fromDateStr.slice(8, 10), 10);
        const endDay = parseInt(toDateStr.slice(8, 10), 10);

        const startMonth = new Date(fromDateStr + "T00:00:00").toLocaleString("default", { month: "short" });
        const endMonth = new Date(toDateStr + "T00:00:00").toLocaleString("default", { month: "short" });

        const startYear = fromDateStr.slice(2, 4);
        const endYear = toDateStr.slice(2, 4);

        // Construct formatted date range
        let formattedDateRange = "";
        if (startYear === endYear) {
            if (startMonth === endMonth) {
                formattedDateRange = `${startDay} - ${endDay} ${startMonth}'${startYear}`;
            } else {
                formattedDateRange = `${startDay} ${startMonth} - ${endDay} ${endMonth}'${startYear}`;
            }
        } else {
            formattedDateRange = `${startDay} ${startMonth}'${startYear} - ${endDay} ${endMonth}'${endYear}`;
        }

        // Store in localStorage
        localStorage.setItem(
            "globalFilter",
            JSON.stringify({
                fromDate: fromDateStr,
                toDate: toDateStr,
                selectedDays: 7,
                dateFormatText: formattedDateRange,
                delta: 7,
                deltaFlag: 2,
            })
        );
    };

    const getPackageDetail = (response: any, userResponse: any) => {
        GetPackageDetails({ sid: response.sid })
            .then((responsePack) => {
                if (!responsePack?.status) {
                    toast({
                        title: "Error",
                        description: "Failed to load package details.",
                        variant: "error",
                        duration: 4000,
                    });
                    return;
                }

                const packageBody = responsePack.body;
                const currentDateUTC = new Date().toISOString();
                LocalStorageService.setItem("packageDetails", JSON.stringify(packageBody));

                const pghEndDate = LocalStorageService.getpghEndDate?.(); // assuming you have this method
                const isExistingUser = packageBody.isExistingUser ?? false;

                // ✅ 1. Expiry and renewal check
                if (pghEndDate && pghEndDate < currentDateUTC && !isExistingUser) {
                    router.push("/renew");
                    return;
                }

                if (!response?.body?.length || response.body.length <= 0) {
                    localStorage.clear();
                    toast({
                        title: "Error",
                        description: "User not found in any subscribed property.",
                        variant: "error",
                        duration: 4000,
                    });
                    return;
                }

                const isRategainUser = userResponse.userDetails.loginName
                    ?.toUpperCase()
                    .endsWith("@RATEGAIN.COM");

                const property = response.body[0];
                let rawData = LocalStorageService.getItem("SelectedProperty");
                let selectedProperty: any = {};
                try {
                    if (typeof rawData === "string") {
                        // Only parse if it's a string
                        selectedProperty = JSON.parse(rawData);
                    } else if (typeof rawData === "object" && rawData !== null) {
                        // Already an object
                        selectedProperty = rawData;
                    } else {
                        // null or invalid
                        selectedProperty = {};
                    }
                } catch (err) {
                    console.error("Error parsing SelectedProperty:", err);
                    selectedProperty = {};
                }

                // const activeMenus = selectedProperty?.activeMenus ?? [];
                // const isDemandActive = activeMenus
                //     .toString()
                //     .toUpperCase()
                //     .includes(enumAllFeature.toUpperCase());

                if (isRategainUser) {
                    router.push("/"); //overview page
                    return;
                }

                if (pghEndDate && pghEndDate < currentDateUTC && !isExistingUser) {
                    router.push("/renew");
                    return;
                }
                const defaultLandingPage = property.defaultLandingPage?.toLowerCase() || "overview";

                // if (defaultLandingPage.includes(enumAllFeature.toLowerCase())) {
                //     if (isDemandActive) {
                //         router.push("/" + defaultLandingPage);
                //     } else if (!isExistingUser) {
                //         router.push("/rate-trend");
                //     } else {
                //         router.push("/"); //overview page
                //     }
                // } else 
                if (!isExistingUser && pghEndDate > currentDateUTC) {
                    router.push("/rate-trend");
                } else {
                    router.push("/" + defaultLandingPage);
                }

            })
            .catch((err) => {
                console.error("Error loading package details:", err);
                toast({
                    title: "Error",
                    description: "Failed to load package details.",
                    variant: "error",
                    duration: 4000,
                });
                router.replace("/login");
            });
    }

    if (loading || !showContent) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
                <div className="w-full max-w-md px-4">
                    <Card className="shadow-2xl border border-white/20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin text-white mx-auto" />
                                <p className="text-white font-medium">
                                    Checking authentication...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        );
    }

    // ✅ Render page content or redirect after delay
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
            <div className="w-full max-w-md px-4">
                <Card className="shadow-2xl border border-white/20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="space-y-4">
                            <Loader2 className="w-10 h-10 animate-spin text-white mx-auto" />
                            <p className="text-white font-medium">
                                Loading fetch details...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

}

function handleSuccessfulLogin(response: LoginResponse, stayLoggedIn: boolean = false) {

    if (response.status) {
        // Clear existing localStorage
        LocalStorageService.clear();

        // Store user details
        LocalStorageService.setUserDetails(response.body.userDetails);

        // Store user token
        LocalStorageService.setUserToken(LocalStorageService.getAccessToken() || '');

        // Calculate and store refresh time
        const refreshTime = new Date(response.body.expiration);
        LocalStorageService.setRefreshTime(refreshTime.getTime());

        // Store access token
        LocalStorageService.setAccessToken(response.body.token);

        // Set login status
        LocalStorageService.setLoginStatus(true);

        return true;
    } else {
        // Set login status to false on failure
        LocalStorageService.setLoginStatus(false);
        return false;
    }
}



