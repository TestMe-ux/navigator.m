"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, History, MoreVertical, Trash2, Edit, CheckCircle, X, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from "lucide-react"
import { LoadingSkeleton, GlobalProgressBar } from "@/components/loading-skeleton"

//api calling 
import { getChannels } from "@/lib/channels"
import { getActiveCompset } from "@/lib/compset"
import { getAlerts, getHistoryAlerts, saveAlerts, updateAlerts } from "@/lib/alerts"
import { useSelectedProperty, useUserDetail } from "@/hooks/use-local-storage"
import { AlertUI, AlertUpdate, Channel, CompSet } from "./alertType"
import { convertAlertsToUI } from "./alertConverters"
import { toast } from "@/hooks/use-toast"
import { channel } from "diagnostics_channel"
import { getOTAChannels } from "@/lib/otarank"

// Mock compset data
// const compsetHotelsData = [
//   'All Compset Hotels', 'Marriott Executive Apartments Mayfair', 'Chaidee Mansion',
//   'Sukhumvit 12 Bangkok Hotel', 'Holiday Inn Bangkok Silom', 'Marriott Executive Apartments Sukhumvit Park',
//   'Grand Palace Hotel', 'Bangkok Marriott Hotel Sukhumvit', 'The Peninsula Bangkok',
//   'Mandarin Oriental Bangkok', 'Shangri-La Hotel Bangkok'
// ]

// Mock competition data
// const competitionHotelsData = [
//   'All Competition Hotels', 'Anantara Siam Bangkok Hotel', 'The St. Regis Bangkok',
//   'Four Seasons Hotel Bangkok', 'InterContinental Bangkok', 'Hilton Bangkok',
//   'Hyatt Regency Bangkok', 'Novotel Bangkok Sukhumvit', 'Pullman Bangkok King Power',
//   'Centara Grand at CentralWorld', 'Amari Watergate Bangkok'
// ]

// Mock competitor ranking data
// const rankCompetitorHotelsData = [
//   'All Competitor Hotels', 'Anantara Siam Bangkok Hotel', 'The St. Regis Bangkok',
//   'Four Seasons Hotel Bangkok', 'InterContinental Bangkok', 'Hilton Bangkok',
//   'Hyatt Regency Bangkok', 'Novotel Bangkok Sukhumvit', 'Pullman Bangkok King Power',
//   'Centara Grand at CentralWorld', 'Amari Watergate Bangkok'
// ]


export default function AlertsSettingsPage() {
  //const [alerts, setAlerts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [showDeleteSnackbar, setShowDeleteSnackbar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' | null }>({ key: null, direction: null })
  const [alertTypeFilter, setAlertTypeFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("ADR")
  const [isCompsetDropdownOpen, setIsCompsetDropdownOpen] = useState(false)

  const [compsetSearchTerm, setCompsetSearchTerm] = useState("")
  const compsetDropdownRef = useRef<HTMLDivElement>(null)
  const [isCompetitionDropdownOpen, setIsCompetitionDropdownOpen] = useState(false)

  const [competitionSearchTerm, setCompetitionSearchTerm] = useState("")
  const competitionDropdownRef = useRef<HTMLDivElement>(null)
  const [isRankCompetitorDropdownOpen, setIsRankCompetitorDropdownOpen] = useState(false)
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false)
  const [selectedRankCompetitorHotels, setSelectedRankCompetitorHotels] = useState<{ id: number; name: string }[]>([]);

  const [rankCompetitorSearchTerm, setRankCompetitorSearchTerm] = useState("")
  const rankCompetitorDropdownRef = useRef<HTMLDivElement>(null)
  const rankChannelDropdownRef = useRef<HTMLDivElement>(null)

  const [selectedProperty] = useSelectedProperty()
  const [userDetails] = useUserDetail();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [parityChannelIds, setParityChannelIds] = useState<string[]>([]);
  const [compSetList, setCompSets] = useState<CompSet[]>([]);
  const [subscriber, setSubscriber] = useState<CompSet | null>(null);
  const [alerts, setAlerts] = useState<AlertUI[]>([]);
  const [historyData, setHistoryData] = useState<AlertUI[]>([]);
  const [updateAlertRows, setUpdateAlertRows] = useState<string | null>(null);
  const [alertToDelete, setAlertToDelete] = useState<AlertUI | null>(null)
  const [allSelected, setAllSelected] = useState(true);
  const [channelSearchTerm, setChannelSearchTerm] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<number[]>([]);
  const [rankOTAChannelsData, setRankOTAChannelsData] = useState<any[]>([]);
  // Competitor ADR hotels
  const [compSetHotels, setCompSetHotels] = useState<{ hmid: number; name: string }[]>([]);
  const [selectedCompsetHotels, setSelectedCompsetHotels] = useState<string[]>([])
  // Select Competition hotels
  const [competitionHotels, setCompetitionHotels] = useState<{ hmid: number; name: string }[]>([]);
  const [selectedCompetitionHotels, setSelectedCompetitionHotels] = useState<string[]>([])
  const [alertsIds, setAlertsIds] = useState<any[]>([]);
  const allowedTypes = ["ADR", "Parity", "OTA Ranking"] as const;
  const [disabledTabs, setDisabledTabs] = useState({
    ADR: false,
    Parity: false,
    Rank: false,
  });
  const [editingAlert, setEditingAlert] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const channelCacheRef = useRef<number[]>([]);

  const [newAlert, setNewAlert] = useState({
    sendForEventsHolidays: false,
  })
  const [adr, setAdr] = useState({
    alertOn: "Subscriber",
    alertRule: "Increased",
    percentValue: "Absolute",
    thresholdValue: 1,
    wrtAlertOn: "Subscriber",
    currency: selectedProperty?.currencySymbol ?? "$",
    compsetList: [] as string[],    // array of selected competitor hotels
    wrtCompsetList: [] as string[],
  });

  const [parity, setParity] = useState<{
    selectedOption: number; // 1, 2, 3...
    alertOn: Record<number, string>;
    parityScoreValues: Record<number, number | "">; // Number inputs
    parityScoreBy: Record<number, "" | "Percentage" | "Absolute">;
    parityThresholdValue: Record<number, number | "">;
    currency1: string | undefined,
  }>({
    selectedOption: 1,
    alertOn: { 1: "wins" },
    parityScoreValues: {},
    parityScoreBy: {},
    parityThresholdValue: {},
    currency1: selectedProperty?.currencySymbol ?? "€",
  });

  const [rank, setRank] = useState<{
    alertOn: string;
    alertRule: string;
    rankThresholdValue: number;
    rankChannel: string;   // ✅ declare type properly
  }>({
    alertOn: "Subscriber",
    alertRule: "Increased",
    rankThresholdValue: 1,
    rankChannel: "",         // ✅ initial empty array
  });


  const handleOptionSelect = (option: number, objAlertFilter?: any) => {
    

    if (!selectedProperty) return
    setParity((prev) => {
      if (prev.selectedOption === option) return prev;

      const newState = { ...prev, selectedOption: option };

      // OPTION 1 - Channel Based
      if (option === 1) {
        newState.alertOn = { ...prev.alertOn, [1]: objAlertFilter?.AlertOn || prev.alertOn[1] || "wins" };

        // Restore or bind channel list
        if (objAlertFilter?.ChannelList?.length) {
          // Editing mode: backend data
          setSelectedChannels(objAlertFilter.ChannelList);
          setAllSelected(objAlertFilter.ChannelList.length === channels.length);
          channelCacheRef.current = objAlertFilter.ChannelList;
        } else if (channelCacheRef.current?.length) {
          // Switching back: restore cached list
          setSelectedChannels(channelCacheRef.current);
          setAllSelected(channelCacheRef.current.length === channels.length);
        } else {
          // Default empty
          setSelectedChannels([]);
          setAllSelected(false);
        }

      }

      // OPTION 2 - Increases/Decreases
      if (option === 2) {
        // newState.alertOn = { ...prev.alertOn, [2]: objAlertFilter?.AlertOn ?? prev.alertOn[2] ?? "" };
        //newState.alertOn = { ...prev.alertOn, [2]: objAlertFilter?.AlertOn || prev.alertOn[2] || "" };
        newState.alertOn = { ...prev.alertOn, [2]: objAlertFilter?.AlertOn ?? prev.alertOn[2] ?? "" };

        newState.parityScoreValues = {
          ...prev.parityScoreValues,
          [2]: objAlertFilter?.ThresholdValue != null ? Number(objAlertFilter.ThresholdValue) : "",
        };
        newState.parityScoreBy = { ...prev.parityScoreBy, [2]: objAlertFilter?.IsPercentage == undefined ? "" : "" },
          newState.currency1 = selectedProperty?.currencySymbol

        if (selectedChannels.length) {
          channelCacheRef.current = [...selectedChannels];
        }
        // Option 2 doesn’t use channels
        setSelectedChannels([]);
        setAllSelected(false);
      }

      // OPTION 3 - Falls Below / Rises Above
      if (option === 3) {
        newState.alertOn = { ...prev.alertOn, [3]: objAlertFilter?.AlertOn ?? prev.alertOn[3] ?? "" };

        // When updating parityThresholdValue
        newState.parityThresholdValue = {
          ...prev.parityThresholdValue,
          [3]: objAlertFilter?.ThresholdValue != null ? Number(objAlertFilter.ThresholdValue) : "",
        };

        newState.parityScoreBy = { ...prev.parityScoreBy, [3]: objAlertFilter?.IsPercentage ? "Percentage" : prev.parityScoreBy[3] || "Absolute" };

        if (selectedChannels.length) {
          channelCacheRef.current = [...selectedChannels];
        }
        // Option 3 doesn’t use channels
        setSelectedChannels([]);
        setAllSelected(false);
      }

      return newState;
    });
  };

  const alertMeChange = (value: string) => {
    setAdr((prev) => {
      let updated = { ...prev, alertOn: value };

      // Clear compsetList for Subscriber or Avg. Compset
      if (value === "Subscriber" || value === "Avg. Compset") {
        updated.compsetList = [];
      }

      // If alertRule is Crossed, update WRT values
      if (prev.alertRule === "Crossed") {
        updated.compsetList = [];
        updated.wrtCompsetList = [];
        updated.wrtAlertOn = value;
      }

      return updated;
    });
  };
  // Handler for "Has" change
  const handleADRChange = (value: string, type: "Has" | "By") => {
    setAdr((prev) => {
      const updated = { ...prev };

      if (type === "Has") {
        updated.alertRule = value;

        if (value === "Crossed") {
          // Crossed defaults to Absolute for "By"
          updated.percentValue = "Absolute";
          updated.currency = selectedProperty?.currencySymbol ?? "€";

          if (prev.alertOn === "Subscriber") {
            updated.wrtAlertOn = "Subscriber";
            updated.wrtCompsetList = [];
          } else if (prev.alertOn === "Competitor") {
            updated.wrtAlertOn = "Competitor";
            updated.wrtCompsetList = prev.compsetList || [];
          } else {
            // Avg. Compset
            updated.wrtAlertOn = "Avg. Compset";
            updated.wrtCompsetList = [];
          }
        } else {
          // Increased / Decreased
          updated.currency = prev.percentValue === "Absolute" ? prev.currency : "%";
          // if (prev.alertOn === "Subscriber") {
          //   updated.wrtAlertOn = "Subscriber";
          //   updated.wrtCompsetList = [];
          // } else if (prev.alertOn === "Competitor") {
          //   updated.wrtAlertOn = "Competitor";
          //   updated.wrtCompsetList = prev.compsetList || [];
          // } else {
          //   // Avg. Compset
          //   updated.wrtAlertOn = "Avg. Compset";
          //   updated.wrtCompsetList = [];
          // }
        }
      } else if (type === "By") {
        // By selection affects currency
        updated.percentValue = value;
        updated.currency = value === "Absolute" ? selectedProperty?.currencySymbol ?? "€" : "%";
      }

      return updated;
    });
  };


  const alertWRTChange = (value: string) => {
    setAdr((prev) => {
      const updated = { ...prev };

      // Update wrtAlertOn
      updated.wrtAlertOn = value;

      // If selecting Subscriber or Avg. Compset, clear WRTCompsetList
      if (value === "Subscriber" || value === "Avg. Compset") {
        updated.wrtCompsetList = [];
      }

      // If alertRule is Crossed, only clear compsetList when switching away from Competitor
      if (prev.alertRule === "Crossed" && value !== "Competitor") {
        updated.compsetList = [];
      }

      // Keep alertOn separate; only update if needed
      if (prev.alertRule === "Crossed") {
        updated.alertOn = value; // optional, if you want alertOn to match
      }

      return updated;
    });
  };

  //console.log("parity.parityScoreValues", parity.parityScoreValues);

  useEffect(() => {
    if (!selectedProperty) return;
    setAdr({
      alertOn: "Subscriber",
      alertRule: "Increased",
      percentValue: "Absolute",
      thresholdValue: 1,
      wrtAlertOn: "Subscriber",
      currency: selectedProperty?.currencySymbol ?? "€",
      compsetList: [] as string[],    // array of selected competitor hotels
      wrtCompsetList: [] as string[],
    });

    setParity({
      selectedOption: 1,
      alertOn: { 1: "wins" },
      parityScoreValues: {},
      parityScoreBy: {},
      parityThresholdValue: {},
      currency1: selectedProperty?.currencySymbol ?? "$",
    });

    setRank({
      alertOn: "Subscriber",
      alertRule: "Increased",
      rankThresholdValue: 1,
      rankChannel: "",
    });
  }, [selectedProperty])

  useEffect(() => {
    if (rankOTAChannelsData.length > 0 && !rank.rankChannel) {
      setRank((prev) => ({
        ...prev,
        rankChannel: String(rankOTAChannelsData[0].cid),
      }));
    }
  }, [rankOTAChannelsData]);



  const handleAddAlertClick = () => {
    // Reset tab state before applying
    setDisabledTabs({ ADR: false, Parity: false, Rank: false });
    // setParity(prev => ({ ...prev, selectedOption: 1 }));
    handleCancelAddAlert()

    if (!selectedProperty?.sid) return;

    setNewAlert({
      sendForEventsHolidays: false,
    });

    setParity({
      selectedOption: 1,
      alertOn: { 1: "wins" },
      parityScoreValues: {},
      parityScoreBy: {},
      parityThresholdValue: {},
      currency1: selectedProperty?.currencySymbol ?? "$",
    });
    // Open the Add Alert dialog
    setShowAddAlert(true);
    setIsEditMode(false);

    // Optional: set default tab to ADR
    setActiveTab("ADR");
  };




  useEffect(() => {
    if (!selectedProperty?.sid || !showChangeHistory) return;
    //setIsLoading(true);
    const fetchPropertyHistory = async () => {
      try {
        const historyResp = await getHistoryAlerts({ SID: selectedProperty.sid });
        if (historyResp.status) {
          const convertedHistory = convertAlertsToUI(
            historyResp.body,
            true,
            compSetList,
            channels
          );
          setHistoryData(convertedHistory);

        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPropertyHistory();
  }, [showChangeHistory]);




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


  useEffect(() => {

    fetchAlertData();
  }, [selectedProperty?.sid]);

  const fetchAlertData = async () => {
    if (!selectedProperty?.sid) return;

    try {
      setIsLoading(true);
      // Fetch channels + compSets in parallel
      const [channelsResponse, compSetsResponse, alertsResp, OTAChannelsResp] = await Promise.all([
        getChannels({ SID: selectedProperty.sid }), //GetChannelList calling
        getActiveCompset({ SID: selectedProperty.sid, includeSubscriber: true }), //GetActiveCompset calling 
        getAlerts({ SID: selectedProperty.sid }),
        getOTAChannels({ SID: selectedProperty.sid })
        //getHistoryAlerts({ SID: selectedProperty.sid, }) //historyAlertsResp
      ]);

      // ==== Process Channels ====
      if (channelsResponse.status) {
        const channelData: Channel[] = channelsResponse.body;
        setChannels(channelData);
        setParityChannelIds(channelData.map((c) => c.cid.toString())); // extract all channel IDs

      } else {
        console.error("Error fetching channels:", channelsResponse.message);
        return; // stop if error
      }

      // ==== Process CompSets ====
      if (compSetsResponse.status) {
        const compSetData: CompSet[] = compSetsResponse.body;
        const selectedHmid = selectedProperty?.hmid;

        // Separate subscriber + other compSets in one pass
        const filteredCompSets: CompSet[] = [];
        let matchedSubscriber: CompSet | null = null;


        for (const compSet of compSetData) {
          if (Number(compSet.hmid) === Number(selectedHmid)) {
            matchedSubscriber = compSet;
          } else {
            filteredCompSets.push(compSet);
          }
        }
        setCompSets(filteredCompSets);
        setSubscriber(matchedSubscriber);
        setCompSetHotels(
          filteredCompSets
            .filter(h => h.hmid !== undefined)
            .map(h => ({ hmid: h.hmid!, name: h.name }))
        );
        setCompetitionHotels(
          filteredCompSets
            .filter(h => h.hmid !== undefined)
            .map(h => ({ hmid: h.hmid!, name: h.name }))
        );

      } else {
        console.error("Error fetching compSets:", compSetsResponse.message);
        return; // stop if error
      }

      // ==== Process Alerts ====
      if (alertsResp.status) {
        const rawAlerts = alertsResp.body;
        const convertedAlerts = convertAlertsToUI(rawAlerts, false, compSetsResponse.body, channelsResponse.body);
        setAlerts(convertedAlerts);
        setAlertsIds(alertsResp.body)
      } else {
        console.error("Error fetching alerts:", alertsResp.message);
      }

      if (OTAChannelsResp.status) {
        const rankOTAChannelsResp = OTAChannelsResp.body;
        setRankOTAChannelsData(rankOTAChannelsResp);
      } else {
        console.error("Error fetching alerts:", OTAChannelsResp.message || "Unknown error");
      }
    } catch (error) {
      console.error("Unexpected error fetching data:", error);
    }
    finally {
      setIsLoading(false);
    }
  };


  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (compsetDropdownRef.current && !compsetDropdownRef.current.contains(event.target as Node)) {
        setIsCompsetDropdownOpen(false);
        setCompsetSearchTerm(""); // clear compset search
      }
      if (competitionDropdownRef.current && !competitionDropdownRef.current.contains(event.target as Node)) {
        setIsCompetitionDropdownOpen(false);
        setCompetitionSearchTerm(""); // clear competition search
      }

      if (rankChannelDropdownRef.current && !rankChannelDropdownRef.current.contains(event.target as Node)) {
        setIsChannelDropdownOpen(false); // close dropdown
        setChannelSearchTerm("");        // clear search input
      }

      if (rankCompetitorDropdownRef.current && !rankCompetitorDropdownRef.current.contains(event.target as Node)) {
        setIsRankCompetitorDropdownOpen(false);
        setRankCompetitorSearchTerm("");
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter compset hotels based on search term
  const filteredCompsetHotels = compSetHotels.filter(hotel =>
    hotel.name.toLowerCase().includes(compsetSearchTerm.toLowerCase())
  )

  // Filter competition hotels based on search term
  const filteredCompetitionHotels = competitionHotels.filter(hotel =>
    hotel.name.toLowerCase().includes(competitionSearchTerm.toLowerCase())
  )

  // Filter channel hotels based on search term
  const filteredChannel = channels.filter((ch) =>
    ch.name.toLowerCase().includes(channelSearchTerm.toLowerCase())
  );

  // Filter rank competitor hotels based on search term
  const filteredRankCompetitorHotels = compSetList.filter(hotel =>
    hotel.name.toLowerCase().includes(rankCompetitorSearchTerm.toLowerCase())
  )

  const handleChannelToggle = (cid: number) => {
    setSelectedChannels(prev => {
      let updated = [...prev];
      if (updated.includes(cid)) {
        updated = updated.filter(id => id !== cid);
      } else {
        updated.push(cid);
      }

      setAllSelected(updated.length === channels.length); // update allSelected
      return updated;
    });
  };

  const toggleAllChannels = () => {
    if (allSelected) {
      // Currently all selected → unselect all
      setSelectedChannels([]);
      setAllSelected(false);
    } else {
      // Not all selected → select all
      setSelectedChannels(channels.map(ch => ch.cid));
      setAllSelected(true);
    }
  };


  //const displayedChannels = allSelected ? channels.map(ch => ch.cid) : selectedChannels;


  const getSelectedChannelsText = () => {
    if (allSelected || selectedChannels.length === channels.length) return "All";
    if (selectedChannels.length === 0) return "Select All";

    const selectedObjs = channels.filter(ch => selectedChannels.includes(ch.cid));
    if (selectedObjs.length === 1) return selectedObjs[0].name;
    if (selectedObjs.length === 2) return selectedObjs.map(ch => ch.name).join(", ");
    return `${selectedObjs[0].name} +${selectedObjs.length - 1}`;
  };


  // Handle compset hotel selection
  const handleCompsetHotelToggle = (hotel: string) => {
    setSelectedCompsetHotels(prev => {
      let newHotels = [...prev];

      if (hotel === 'All Compset Hotels') {
        if (newHotels.includes('All Compset Hotels')) {
          newHotels = [];
        } else {
          const allHotelNames = compSetHotels.map(h => h.name);
          newHotels = [...allHotelNames, 'All Compset Hotels'];
        }
      } else {
        if (newHotels.includes(hotel)) {
          newHotels = newHotels.filter(h => h !== hotel && h !== 'All Compset Hotels');
        } else {
          newHotels.push(hotel);
          const individualHotels = compSetHotels.map(h => h.name);
          const selectedIndividualHotels = newHotels.filter(h => h !== 'All Compset Hotels');

          if (selectedIndividualHotels.length === individualHotels.length) {
            newHotels.push('All Compset Hotels');
          }
        }
      }

      return newHotels;
    });
  };


  // Handle competition hotel selection
  const handleCompetitionHotelToggle = (hotel: string) => {
    setSelectedCompetitionHotels(prev => {
      let newHotels = [...prev];

      if (hotel === 'All Competition Hotels') {
        if (newHotels.includes('All Competition Hotels')) {
          newHotels = [];
        } else {
          const allHotelNames = competitionHotels.map(h => h.name);
          newHotels = [...allHotelNames, 'All Competition Hotels'];
        }
      } else {
        if (newHotels.includes(hotel)) {
          newHotels = newHotels.filter(h => h !== hotel && h !== 'All Competition Hotels');
        } else {
          newHotels.push(hotel);
          const individualHotels = competitionHotels.map(h => h.name);
          const selectedIndividualHotels = newHotels.filter(h => h !== 'All Competition Hotels');

          if (selectedIndividualHotels.length === individualHotels.length) {
            newHotels.push('All Competition Hotels');
          }
        }
      }

      return newHotels;
    });
  };


  // Handle rank competitor hotel selection
  // const handleRankCompetitorHotelToggle = (hotel: string) => {
  //   setSelectedRankCompetitorHotels(prev => {
  //     let newHotels = [...prev]

  //     if (hotel === 'All Competitor Hotels') {
  //       if (newHotels.includes('All Competitor Hotels')) {
  //         newHotels = []
  //       } else {
  //         const allHotelNames = compSetList.map(h => h.name);
  //         newHotels = [...allHotelNames, 'All Competitor Hotels'];
  //         //newHotels = [...compSets]
  //       }
  //     } else {
  //       if (newHotels.includes(hotel)) {
  //         newHotels = newHotels.filter(h => h !== hotel)
  //         newHotels = newHotels.filter(h => h !== 'All Competitor Hotels')
  //       } else {
  //         newHotels.push(hotel)

  //         const individualHotels = compSetList.filter(h => h.name !== 'All Competitor Hotels')
  //         const selectedIndividualHotels = newHotels.filter(h => h !== 'All Competitor Hotels')

  //         if (selectedIndividualHotels.length === individualHotels.length) {
  //           if (!newHotels.includes('All Competitor Hotels')) {
  //             newHotels.push('All Competitor Hotels')
  //           }
  //         }
  //       }
  //     }

  //     return newHotels
  //   })
  // }

  type SortableAlertKeys = keyof Pick<AlertUI, 'type' | 'rule' | 'createdOn' | 'createdBy' | 'status'>;

  const filteredAlerts = alerts
    .filter((alert) => {
      const searchText = (searchValue || searchTerm).toLowerCase();
      const matchesSearch =
        alert.rule.toLowerCase().includes(searchText) ||
        alert.type.toLowerCase().includes(searchText);

      const matchesType = alertTypeFilter === "All" || alert.type === alertTypeFilter;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (!sortConfig.key || !sortConfig.direction) return 0;

      const key = sortConfig.key as SortableAlertKeys; // type-safe key
      const aValue = String(a[key]);
      const bValue = String(b[key]);

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });


  // const filteredAlerts = alerts.filter(
  //   (alert) => {
  //     const matchesSearch = alert.rule.toLowerCase().includes((searchValue || searchTerm).toLowerCase()) ||
  //       alert.type.toLowerCase().includes((searchValue || searchTerm).toLowerCase())

  //     const matchesType = alertTypeFilter === "All" || alert.type === alertTypeFilter

  //     return matchesSearch && matchesType
  //   }
  // ).sort((a, b) => {
  //   if (!sortConfig.key || !sortConfig.direction) return 0

  //   const aValue = a[sortConfig.key as keyof typeof a]
  //   const bValue = b[sortConfig.key as keyof typeof b]

  //   if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
  //   if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
  //   return 0
  // })

  const toggleAlertStatus = (alertValue: AlertUI, checked: boolean) => {
    if (!userDetails?.userId)
      return;
    setUpdateAlertRows(alertValue.AlertID);
    updateAlert(alertValue.AlertID, "active", alertValue.type, checked, Number(userDetails.userId))
  }
  const updateAlert = async (alertId: string, field: string, type: any, checked: boolean, UserId: number) => {
    let updateObj: AlertUpdate = {
      alerID: alertId,
      field: field,
      alertType: type,
      status: checked,
      CreatedBy: UserId
    }
    sendAlertUpdate(updateObj);
  }

  const sendAlertUpdate = async (alertData: AlertUpdate) => {
    try {
      const response = await updateAlerts(alertData);
      if (response?.status) {
        if (alertData.field === "delete") {
          toast({
            title: "Alert",
            description: (
              <div className="flex items-center gap-2">
                {/* <Trash2 className="w-4 h-4 text-red-500" /> */}
                <span>Record deleted successfully!</span>
              </div>
            ),
            variant: "destructive",
            duration: 3000,
          })
          setAlerts((prev) => prev.filter((alert) => alert.AlertID !== alertToDelete?.AlertID))
        }

        else if (alertData.field == "active") {
          toast({
            title: "Alert",
            description: (
              <div className="flex items-center gap-2">
                {/* <CheckCircle className="w-4 h-4 text-green-500" /> */}
                <span>Record updated successfully!</span>
              </div>
            ),
            variant: "success",
            duration: 3000,
          })

          setAlerts(prev =>
            prev.map(a =>
              a.AlertID === alertData.alerID ? { ...a, status: alertData.status } : a
            )
          );
        }

      } else {
        toast({
          title: "Alert",
          description: response.message || "Something went wrong while adding alert!",
          variant: "error",
          duration: 5000,
        });
        console.error(response?.message);
      }
    } catch (err) {
      console.error("Error updating alert:", err);
    } finally {
      setUpdateAlertRows(null);
    }
  }

  const saveAlertAPI = async (alertType: string, alertBody: any) => {
    console.log(alertType, alertBody)
    
    try {
      const responseAlert = await saveAlerts(alertType, alertBody);
      if (responseAlert.status) {
        toast({
          title: "Alert",
          description: (
            <div className="flex items-center gap-2">
              <span>Record {isEditMode ? "Edited" : "Added"} successfully!</span>
            </div>
          ),
          variant: "success",
          duration: 3000,
        })
        handleCancelAddAlert();
        await fetchAlertData();
      }
      else {
        toast({
          title: "Alert",
          description: responseAlert.message || "Something went wrong while adding alert!",
          variant: "error",
          duration: 5000,
        });
      }
    }
    catch (err) {
      console.error("Error added alert:", err);
    }
    finally {
      setShowAddAlert(false);
    }

  }

  const saveADRAlert = (alertId: any) => {
    let adrAlert: any = {
      AlertID: alertId,
      AlertOn: adr.alertOn,
      AlertRule: adr.alertRule,
      ThresholdValue: adr.thresholdValue,
      CurrentValue: 10,
      IsPercentage: adr.percentValue === "Absolute" ? false : true,
      WithRespectTo: adr.wrtAlertOn,
      EventDay: newAlert.sendForEventsHolidays,
      SID: selectedProperty?.sid,
      CreatedBy: userDetails?.userId
    }

    switch (adr.alertOn) {
      case "Subscriber": adrAlert.CompsetList = subscriber?.propertyID.toString();
        break;

      case "Competitor": adrAlert.CompsetList = selectedCompsetHotels.join(',');
        break;

      case "Avg. Compset": adrAlert.CompsetList = compSetList.map(c => c.propertyID).join(',');
        break;
    }

    switch (adr.wrtAlertOn) {
      case "Subscriber": adrAlert.WRTCompsetList = subscriber?.propertyID.toString();
        break;

      case "Competitor": adrAlert.WRTCompsetList = selectedCompetitionHotels.join(',');
        break;

      case "Avg. Compset": adrAlert.WRTCompsetList = compSetList.map(c => c.propertyID).join(',');
        break;
    }
    // api calling
    saveAlertAPI("ADR", adrAlert);
  };

  const saveParityAlert = (alertId: any) => {

    const isPercentage =
      parity.parityScoreBy[parity.selectedOption] !== "Absolute" &&
      parity.parityScoreBy[parity.selectedOption] !== undefined;

    const scoreVal = parity.parityScoreValues[parity.selectedOption];
    const threshVal = parity.parityThresholdValue[parity.selectedOption];

    const thresholdValue =
      (scoreVal !== undefined && scoreVal !== "" ? scoreVal :
        threshVal !== undefined && threshVal !== "" ? threshVal :
          0);

    let parityAlert: any = {
      AlertID: alertId,
      AlertOn: parity.alertOn[parity.selectedOption],
      SelectedOption: +parity.selectedOption,
      IsPercentage: isPercentage ? true : false,
      EventDay: newAlert.sendForEventsHolidays,
      CurrentValue: 10,
      ThresholdValue: thresholdValue,
      SID: selectedProperty?.sid,
      CreatedBy: userDetails?.userId
    }
    switch (+parity.selectedOption) {
      case 1: parityAlert.ChannelList = selectedChannels.join(',');
        parityAlert.ThresholdValue = 0;
        break;
      case 2:
        parityAlert.ThresholdValue = scoreVal;
        parityAlert.ChannelList = channels.map(c => c.cid).join(',');
        break;
      case 3:
        parityAlert.ThresholdValue = threshVal;
        parityAlert.ChannelList = channels.map(c => c.cid).join(',');
        break;
    }

    // api calling
    saveAlertAPI("Parity", parityAlert)

  };

  const saveRankAlert = (alertId: any) => {

    let rankAlert: any = {
      AlertID: alertId,
      AlertOn: rank.alertOn,
      AlertRule: rank.alertRule,
      EventDay: newAlert.sendForEventsHolidays,
      CurrentValue: 10,
      ThresholdValue: rank.rankThresholdValue,
      SID: selectedProperty?.sid,
      CreatedBy: userDetails?.userId,
      Channel: rank.rankChannel
    }

    if (rank.alertOn === "Subscriber") {
      rankAlert.CompID = subscriber?.propertyID;
    }
    else {
      rankAlert.CompID = selectedRankCompetitorHotels[0].id;
    }

    saveAlertAPI("OTARanking", rankAlert);


  };


  const handleAddAlert = () => {
    
    const isInvalid: boolean = validationMessage(activeTab);
    if (isInvalid) return; // stop execution if validation fails

    let alertId = isEditMode == true ? editingAlert.AlertId : "I";
    switch (activeTab) {
      case "ADR":
        saveADRAlert(alertId)
        break;
      case "Parity":
        saveParityAlert(alertId)
        break;
      case "Rank":
        saveRankAlert(alertId)
        break;
      default:
        console.log("Unknown tab:", activeTab);
        break;
    }

  }

  const validationMessage = (currentTabs: string): boolean => {
    let validMessage = "";

    // Competitor ADR / Select Competition validation
    if (currentTabs === "ADR") {

      if (adr.alertOn == "Competitor" && selectedCompsetHotels.length === 0) {
        validMessage = 'Please select compset from "Competitor ADR" list';
      }
      if (adr.wrtAlertOn == "Competitor" && selectedCompetitionHotels.length === 0) {
        validMessage = 'Please select compset from "Select Competition" list';
      }
      if (adr.thresholdValue <= 0) {
        validMessage = 'Threshold Value cannot be less than 1';
      }
    }
    if (currentTabs === "Parity") {

      const option = parity.selectedOption;
      if (option === 1) {
        const alertOnValue = parity.alertOn?.[0];
        const hasAlertOn = alertOnValue !== "";
        const hasSelectedChannel = selectedChannels.length === 0;

        if (!hasAlertOn && !hasSelectedChannel) {
          validMessage = "Please select at least one 'Alert me when' option and one Channel.";
        } else if (!hasAlertOn) {
          validMessage = "Please select at least one 'Alert me when Subscriber Hotel' option (Wins, Meets, or Loses).";
        } else if (hasSelectedChannel) {
          validMessage = "Please select at least one Channel.";
        }
      }
      if (option === 2) {
        const alertOnValue = parity.alertOn[option];
        const hasAlertOn = (alertOnValue !== "" && alertOnValue !== undefined);
        const threshold = parity.parityScoreValues?.[2];
        const scoreBy = parity.parityScoreBy?.[2];
        if (!hasAlertOn) {
          validMessage = "Please select at least one 'Alert me when Parity Score' option (Increases or Decreases).";
        }
        else if (!threshold) {
          validMessage = "Please enter a Parity Score.";
        } else if (!scoreBy) {
          validMessage = "Please select score type (Absolute or Percentage).";
        }
      }
      if (option === 3) {
        const alertOnValue = parity.alertOn[option];
        const hasAlertOn = (alertOnValue !== "" && alertOnValue !== undefined);
        const threshold = parity.parityThresholdValue?.[3];
        if (!hasAlertOn) {
          validMessage = "Please select at least one 'Alert me when Parity Score' option (Falls Below or Rises Above).";
        }

        else if (!threshold) {
          validMessage = "Please enter a Parity Score.";
        }
      }
    }

    // Optional: You can add similar logic for Parity and Rank tabs
    if (currentTabs === "Rank") {
      if (rank.alertOn !== "Subscriber" && !selectedRankCompetitorHotels.length) {
        validMessage = 'Please select compset from "Rank Competitor" list';
      }
      if (!rank.rankChannel.length) {
        validMessage = 'Please select channel from "On Channel" list';
      }
      if (rank.rankThresholdValue <= 0) {
        validMessage = '"By" Value cannot be less than 1';
      }

    }

    if (validMessage) {
      toast({
        title: "Alert",
        description: validMessage,
        variant: "destructive",
        duration: 3000,
      }); // or setErrorMessage(error)
      return true; // means validation failed
    }

    return false; // validation passed
  };



  useEffect(() => {
    if (!editingAlert || !competitionHotels.length) return;

    const preSelected = (editingAlert.WRTCompsetList || [])
      .map((hid: number | string) => String(hid)) // explicitly type as number|string
      .filter((hid: string) => competitionHotels.some(h => String(h.hmid) === hid));

    setSelectedCompetitionHotels(preSelected);

    const preSelectedCompSet = (editingAlert.CompsetList || [])
      .map((hid: number | string) => String(hid))
      .filter((hid: string) => competitionHotels.some(h => String(h.hmid) === hid));

    setSelectedCompsetHotels(preSelectedCompSet);
  }, [editingAlert, competitionHotels]);


  const handleEditAlert = (alertBody: any) => {
    
    if (!selectedProperty?.sid || !alertBody?.type) return;

    const isInvalid: boolean = validationMessage(activeTab);
    if (isInvalid) return; // stop execution if validation fails

    const objAlertFilter = alertsIds.find(x => x.AlertId === alertBody.AlertID);
    if (!objAlertFilter) return;

    setEditingAlert(objAlertFilter);

    setDisabledTabs({
      ADR: alertBody.type !== "ADR",
      Parity: alertBody.type !== "Parity",
      Rank: alertBody.type !== "Rank",
    });

    // Set active tab to the alert type being edited
    setActiveTab(alertBody.type);

    // === ADR ALERT ===
    if (alertBody.type === "ADR") {
      // Set ADR state
      setAdr({
        alertOn: objAlertFilter.AlertOn || "Subscriber",
        alertRule: objAlertFilter.AlertRule || "Increased",
        percentValue: objAlertFilter.IsPercentage ? "Percentage" : "Absolute",
        thresholdValue: objAlertFilter.ThresholdValue ?? 0,
        wrtAlertOn: objAlertFilter.WithRespectTo || "Subscriber",
        currency: selectedProperty?.currencySymbol ?? "€",
        compsetList: objAlertFilter.CompsetList || [],
        wrtCompsetList: objAlertFilter.WRTCompsetList || [],
      });

      // Set selected hotels
      setSelectedCompsetHotels((objAlertFilter.CompsetList || []).map(String));
      setSelectedCompetitionHotels((objAlertFilter.WRTCompsetList || []).map(String));
    }


    // === PARITY ALERT ===
    else if (alertBody.type === "Parity") {
      setActiveTab("Parity");
      setDisabledTabs({ ADR: true, Parity: false, Rank: true });
      setParity(prev => ({ ...prev, selectedOption: 1 }));
      const selectedOption = objAlertFilter.SelectedOption ?? 1;

      // Handle Channel selection for Option 1
      if (selectedOption === 1) {
        const allChannelsSelected =
          objAlertFilter.ChannelList?.length >= channels.length;

        setAllSelected(allChannelsSelected);
        setSelectedChannels(
          allChannelsSelected ? channels.map((ch) => ch.cid) : objAlertFilter.ChannelList || []
        );

        setChannelSearchTerm("");
      } else {
        setSelectedChannels([]);
        setAllSelected(false);
      }

      // Initialize parity state
      setParity(prev => {
        const selectedOption = objAlertFilter.SelectedOption ?? 1;

        // Keep previous state, but ensure all keys are defined
        const newState = {
          selectedOption,
          alertOn: {
            1: objAlertFilter?.SelectedOption === 1 ? objAlertFilter.AlertOn ?? "wins" : prev.alertOn[1] ?? "wins",
            2: objAlertFilter?.SelectedOption === 2 ? objAlertFilter.AlertOn ?? "Increases" : prev.alertOn[2] ?? "Increases",
            3: objAlertFilter?.SelectedOption === 3 ? objAlertFilter.AlertOn ?? "Falls Below" : prev.alertOn[3] ?? "Falls Below",
          },
          parityScoreValues: {
            2: selectedOption === 2 ? objAlertFilter.ThresholdValue ?? 0 : prev.parityScoreValues[2] ?? 0,
          },
          parityScoreBy: {
            2: selectedOption === 2
              ? objAlertFilter.IsPercentage
                ? "Percentage"
                : "Absolute"
              : prev.parityScoreBy[2] ?? "Absolute",
          },
          parityThresholdValue: {
            3: selectedOption === 3 ? objAlertFilter.ThresholdValue ?? 0 : prev.parityThresholdValue[3] ?? 0,
          },
          currency1: selectedProperty?.currencySymbol ?? "$",
        };

        return newState;
      });

    }


    // === RANK ALERT ===
    else if (alertBody.type === "OTA Ranking") {
      setActiveTab("Rank");
      setDisabledTabs({ ADR: true, Parity: true, Rank: false });
      
      setRank(prev => ({
        ...prev,
        alertOn: objAlertFilter.AlertOn || "Subscriber",
        compset: objAlertFilter.CompID || "",
        alertRule: objAlertFilter.AlertRule || "Increased",
        rankChannel: objAlertFilter.Channel != null ? String(objAlertFilter.Channel) : "", // convert to string
        rankThresholdValue: objAlertFilter.ThresholdValue ?? 0,
      }));


      // Bind competitor (Rank)
      if (objAlertFilter.CompID) {
        const comp = compSetList.find(c => String(c.hmid) === String(objAlertFilter.CompID));
        if (comp) {
          setSelectedRankCompetitorHotels([{ id: Number(comp.hmid), name: comp.name }]);
          setRank(prev => ({
            ...prev,
            compset: comp.hmid,
          }));
        }
      }


    }

    // === Common alert-level values ===
    setNewAlert({ sendForEventsHolidays: objAlertFilter.EventDay ?? false });

    // Open Add/Edit popup
    setShowAddAlert(true);
    setIsEditMode(true);
  };



  const handleCancelAddAlert = () => {
    setNewAlert({
      // Common
      sendForEventsHolidays: false,
    })
    setAdr({
      alertOn: "Subscriber",
      alertRule: "Increased",
      percentValue: "Absolute",
      thresholdValue: 1,
      wrtAlertOn: "Subscriber",
      currency: "€",
      compsetList: [] as string[],
      wrtCompsetList: [] as string[],
    });

    setAllSelected(true);
    setSelectedChannels(
      channels.map(ch => ch.cid)
    );

    setParity(prev => ({ ...prev, selectedOption: 1 }));

    setRank({
      alertOn: "Subscriber",
      alertRule: "Increased",
      rankThresholdValue: 1,
      rankChannel: ""
    });
    setSelectedRankCompetitorHotels([]);

    setActiveTab("ADR")
    setShowAddAlert(false)
    setIsEditMode(false);
  }

  const handleDeleteAlert = (alertDelete: AlertUI) => {
    setAlertToDelete(alertDelete); // store full object
    setShowDeleteConfirm(true);
  };


  const confirmDeleteAlert = () => {
    if (!userDetails?.userId)
      return;
    if (alertToDelete) {
      updateAlert(alertToDelete.AlertID, "delete", alertToDelete.type, true || false, Number(userDetails.userId))
      setShowDeleteConfirm(false)
      setAlertToDelete(null)
      //setShowDeleteSnackbar(true)
    }
  }

  const cancelDeleteAlert = () => {
    setShowDeleteConfirm(false)
    setAlertToDelete(null)
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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'
    }

    setSortConfig({ key: direction ? key : null, direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return null
    }

    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="w-3 h-3 font-bold text-blue-600" strokeWidth={2.5} />
    } else if (sortConfig.direction === 'desc') {
      return <ArrowDown className="w-3 h-3 font-bold text-blue-600" strokeWidth={2.5} />
    }

    return <ArrowUpDown className="w-3 h-3 font-bold text-blue-600" strokeWidth={2.5} />
  }

  const getHoverIcon = (key: string) => {
    if (sortConfig.key === key) {
      return null
    }
    return <ArrowUpDown className="w-3 h-3 font-bold text-gray-500 dark:text-gray-400" strokeWidth={2.5} />
  }

  const TruncatedTooltip = ({ children, content, className = "" }: { children: React.ReactNode, content: string, className?: string }) => {
    const [isOverflowing, setIsOverflowing] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (ref.current) {
        const element = ref.current
        setIsOverflowing(element.scrollWidth > element.clientWidth)
      }
    }, [content])

    if (isOverflowing) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div ref={ref} className={`${className} cursor-pointer`}>
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white text-xs">
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <div ref={ref} className={className}>
        {children}
      </div>
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

              {/* Alerts Table Skeleton */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-10">
                  <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
                    <div className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out w-1/2"></div>
                  </div>
                </div>
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-20 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                    </div>
                  </div>

                  {/* Table Rows */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-4 border-b last:border-b-0">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
                        <div className="h-4 w-28 bg-gray-300 animate-pulse rounded"></div>
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
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="space-y-1">
              <span className="text-xl font-semibold text-foreground">Alert Management</span>
              <p className="text-sm text-muted-foreground">
                Configure rate alerts, competitive monitoring, and automated notifications
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
                      <p>Search By Alert Rule</p>
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
              // onClick={() => setShowAddAlert(true)}
              onClick={handleAddAlertClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Add Alert
            </Button>
          </div>
        </div>

        {/* Alerts Table */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg">
                      <div
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('rule')}
                      >
                        Alert Rule
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('rule')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('rule')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                      <div className="relative w-40 h-8 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500">
                        <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
                          <SelectTrigger className="w-full h-full px-2 py-1 text-xs border-0 bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 [&>span:first-child]:hidden text-left">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="text-left">
                            <SelectItem value="All" className="text-left [&>span:first-child]:hidden pl-3">All</SelectItem>
                            <SelectItem value="ADR" className="text-left [&>span:first-child]:hidden pl-3">ADR</SelectItem>
                            <SelectItem value="Parity" className="text-left [&>span:first-child]:hidden pl-3">Parity</SelectItem>
                            <SelectItem value="OTA Ranking" className="text-left [&>span:first-child]:hidden pl-3">OTA Ranking</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Type:</span>
                            <span className="text-xs text-gray-700">{alertTypeFilter}</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                      <div
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('createdOn')}
                      >
                        Created Date
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('createdOn')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('createdOn')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                      <div
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => handleSort('createdBy')}
                      >
                        Created By
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          {getHoverIcon('createdBy')}
                        </span>
                        <span className="opacity-100 mt-0.5">
                          {getSortIcon('createdBy')}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    // 🌀 Show 3 placeholder rows while loading
                    <>
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : filteredAlerts.length === 0 ? (
                    // ⚠️ No alerts found
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                      >
                        No alerts found.
                      </td>
                    </tr>
                  ) : (filteredAlerts.map((alert, index) => {
                    const isLastRow = index === filteredAlerts.length - 1;
                    return (
                      <tr key={alert.AlertID} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}`}>
                        <td className={`px-4 py-2 whitespace-nowrap ${isLastRow ? 'rounded-bl-lg' : ''}`}>
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              <TruncatedTooltip
                                content={alert.rule}
                                className="truncate max-w-xs"
                              >
                                {alert.rule}
                              </TruncatedTooltip>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <Badge variant="secondary" className="text-xs">
                            {alert.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {alert.createdOn}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <TruncatedTooltip
                            content={alert.createdBy}
                            className="truncate max-w-32"
                          >
                            {alert.createdBy}
                          </TruncatedTooltip>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          {updateAlertRows === alert.AlertID ? (
                            // Show spinner while updating
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-blue-600 rounded-full animate-spin" />
                          ) : (
                            <Switch
                              checked={alert.status}
                              onCheckedChange={(checked) => toggleAlertStatus(alert, checked)}
                              disabled={updateAlertRows !== null}
                              className="scale-75"
                            />
                          )}
                        </td>
                        <td className={`px-4 py-2 whitespace-nowrap text-center ${isLastRow ? 'rounded-br-lg' : ''}`}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAlert(alert)}
                                  className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-6 w-6 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white text-xs">
                                <p>Edit Alert</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAlert(alert)}
                                  disabled={updateAlertRows !== null}
                                  className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-black text-white text-xs">
                                <p>Delete Alert</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Alert Modal */}
        <Dialog open={showAddAlert} onOpenChange={setShowAddAlert}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              {/* <DialogTitle className="text-xl font-semibold text-black">Alert Settings</DialogTitle> */}
              <DialogTitle className="text-xl font-semibold text-black">
                {isEditMode ? "Edit Alert Settings" : "Add Alert Settings"}
              </DialogTitle>
              <DialogDescription>
                Configure alerts for ADR, Parity, and Ranking monitoring.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex w-full bg-transparent border-b border-gray-200 p-0 h-auto justify-start rounded-none">
                  <TabsTrigger
                    value="ADR"
                    className="bg-transparent border-0 rounded-none px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    disabled={disabledTabs.ADR}
                  >
                    ADR
                  </TabsTrigger>
                  <TabsTrigger
                    value="Parity"
                    className="bg-transparent border-0 rounded-none px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    disabled={disabledTabs.Parity}
                  >
                    Parity
                  </TabsTrigger>
                  <TabsTrigger
                    value="Rank"
                    className="bg-transparent border-0 rounded-none px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    disabled={disabledTabs.Rank}
                  >
                    Rank
                  </TabsTrigger>
                </TabsList>

                {/* ADR Tab */}
                <TabsContent value="ADR" className="space-y-6 mt-6">
                  <div className="space-y-6">
                    {/* Alert me when */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-3">Alert me when</Label>
                      <RadioGroup
                        value={adr.alertOn}
                        onValueChange={(value) => alertMeChange(value)}
                        // onValueChange={(value) => setAdr((prev) => ({ ...prev, alertOn: value }))}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Subscriber" id="subscriber-adr" />
                          <Label htmlFor="subscriber-adr" className="text-sm font-normal">Subscriber ADR</Label>
                        </div>
                        <div className="flex items-center space-x-2 relative" ref={compsetDropdownRef}>
                          <RadioGroupItem value="Competitor" id="competitor-adr" />
                          <Label
                            htmlFor="competitor-adr"
                            className="flex items-center space-x-2 text-sm font-normal cursor-pointer"
                            onClick={() => setIsCompsetDropdownOpen(!isCompsetDropdownOpen)}
                          >
                            <span>Competitor ADR</span>
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          </Label>

                          {/* Competitor Hotels Dropdown */}
                          {isCompsetDropdownOpen && (
                            <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden min-w-80">
                              {/* Search Input */}
                              <div className="p-3 border-b border-gray-200">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <input
                                    type="text"
                                    placeholder="Search hotels..."
                                    value={compsetSearchTerm}
                                    onChange={(e) => setCompsetSearchTerm(e.target.value)}
                                    className="pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200 w-full"
                                  />
                                </div>
                              </div>

                              {/* Hotels List */}
                              <div className="max-h-40 overflow-y-auto">
                                {filteredCompsetHotels.map((hotel) => (
                                  <label
                                    key={hotel.hmid}
                                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedCompsetHotels.includes(String(hotel.hmid))} // ✅ convert to string
                                      onChange={() => handleCompsetHotelToggle(String(hotel.hmid))}
                                      className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <span className="text-sm text-gray-900 truncate" title={hotel.name}>
                                      {hotel.name.length > 32 ? `${hotel.name.substring(0, 32)}...` : hotel.name}
                                    </span>
                                  </label>
                                ))}
                                {filteredCompsetHotels.length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500">No hotels found</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Avg. Compset" id="avg-compset-adr" />
                          <Label htmlFor="avg-compset-adr" className="text-sm font-normal">Avg. Compset ADR</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Has */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-3">Has</Label>
                      <RadioGroup
                        value={adr.alertRule}
                        onValueChange={(value) => handleADRChange(value, "Has")}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Increased" id="increased" />
                          <Label htmlFor="increased" className="text-sm font-normal">Increased</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Decreased" id="decreased" />
                          <Label htmlFor="decreased" className="text-sm font-normal">Decreased</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Crossed" id="crossed" />
                          <Label htmlFor="crossed" className="text-sm font-normal">Crossed</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* By */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-3">By</Label>
                      <div className="space-y-4">
                        <RadioGroup
                          value={adr.percentValue}
                          onValueChange={(value) => {
                            // Force Absolute if alertRule is Crossed
                            const newValue =
                              adr.alertRule === "Crossed" ? "Absolute" : value;
                            setAdr((prev) => ({ ...prev, percentValue: newValue }));
                          }}
                          className="flex gap-6"
                        >
                          {/* Absolute */}
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Absolute" id="absolute" />
                            <Label htmlFor="absolute" className="text-sm font-normal">
                              Absolute
                            </Label>
                          </div>

                          {/* Percentage */}
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="Percentage"
                              id="percentage"
                              disabled={adr.alertRule === "Crossed"} // visually disable
                            />
                            <Label
                              htmlFor="percentage"
                              className={`text-sm font-normal ${adr.alertRule === "Crossed" ? "text-gray-400 cursor-not-allowed" : ""
                                }`}
                            >
                              Percentage
                            </Label>
                          </div>
                        </RadioGroup>



                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            value={adr.thresholdValue}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val > 0 || e.target.value === "") {
                                setAdr((prev) => ({ ...prev, thresholdValue: Number(e.target.value) }));
                              }
                            }}
                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                            placeholder="1"
                          />
                          <span className="text-sm text-gray-600"> {adr.percentValue === "Absolute" ? adr.currency : "%"}</span>
                          <span className="text-sm text-gray-600">With respect to</span>

                          <RadioGroup
                            value={adr.wrtAlertOn}
                            onValueChange={(value) => alertWRTChange(value)}
                            // onValueChange={(value) => setAdr((prev) => ({ ...prev, wrtAlertOn: value }))}
                            className="flex gap-4 ml-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Subscriber" id="subscriber-adr-ref" />
                              <Label htmlFor="subscriber-adr-ref" className="text-sm font-normal">Subscriber ADR</Label>
                            </div>
                            <div className="flex items-center space-x-2 relative" ref={competitionDropdownRef}>
                              <RadioGroupItem value="Competitor" id="select-competition" />
                              <Label
                                htmlFor="select-competition"
                                className="flex items-center space-x-2 text-sm font-normal cursor-pointer"
                                onClick={() => setIsCompetitionDropdownOpen(!isCompetitionDropdownOpen)}
                              >
                                <span>Select Competition</span>
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              </Label>

                              {/* Competition Hotels Dropdown */}
                              {isCompetitionDropdownOpen && (
                                <div className="absolute z-50 bottom-full mb-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden min-w-80">
                                  {/* Search Input */}
                                  <div className="p-3 border-b border-gray-200">
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                      <input
                                        type="text"
                                        placeholder="Search hotels..."
                                        value={competitionSearchTerm}
                                        onChange={(e) => setCompetitionSearchTerm(e.target.value)}
                                        className="pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200 w-full"
                                      />
                                    </div>
                                  </div>

                                  {/* Hotels List */}
                                  <div className="max-h-40 overflow-y-auto">
                                    {filteredCompetitionHotels.map((hotel) => (
                                      <label
                                        key={hotel.hmid}
                                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedCompetitionHotels.includes(String(hotel.hmid))} // convert to string
                                          onChange={() => handleCompetitionHotelToggle(String(hotel.hmid))} // convert to string
                                          className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="text-sm text-gray-900 truncate" title={hotel.name}>
                                          {hotel.name.length > 32 ? `${hotel.name.substring(0, 32)}...` : hotel.name}
                                        </span>
                                      </label>
                                    ))}
                                    {filteredCompetitionHotels.length === 0 && (
                                      <div className="px-3 py-2 text-sm text-gray-500">No hotels found</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Avg. Compset" id="avg-compset-adr-ref" />
                              <Label htmlFor="avg-compset-adr-ref" className="text-sm font-normal">Avg. Compset ADR</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Parity Tab */}
                <TabsContent value="Parity" className="space-y-6 mt-6">
                  <RadioGroup
                    value={parity.selectedOption.toString()}
                    onValueChange={(value) => setParity((prev) => ({ ...prev, selectedOption: Number(value) }))}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >

                    {/* Option 1 */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="option1"
                          checked={parity.selectedOption === 1}
                          onClick={() => handleOptionSelect(1, parity)}
                        />
                        <Label htmlFor="option1" className="text-sm font-medium">Option 1</Label>
                      </div>
                      <div className="pl-6 space-y-3">
                        <Label className="block text-sm font-medium text-gray-700 mb-3 mt-3">Alert me when Subscriber Hotel</Label>
                        <RadioGroup
                          value={(parity.alertOn[parity.selectedOption] ?? "").toString()}
                          onValueChange={(value) =>
                            setParity((prev) => ({
                              ...prev,
                              alertOn: { ...prev.alertOn, [prev.selectedOption]: value }
                            }))
                          }
                          className="flex gap-6"
                          disabled={parity.selectedOption !== 1}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Wins" id="wins" />
                            <Label htmlFor="wins" className="text-sm font-normal">Wins</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Meets" id="meets" />
                            <Label htmlFor="meets" className="text-sm font-normal">Meets</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Loses" id="loses" />
                            <Label htmlFor="loses" className="text-sm font-normal">Loses</Label>
                          </div>
                        </RadioGroup>

                        <Label className="block text-sm font-medium text-gray-700 mb-3 mt-3 pt-4">On Channels</Label>
                        <div className="relative w-64" ref={rankChannelDropdownRef}>
                          {/* Dropdown Trigger */}
                          <div
                            className={`flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer bg-white ${parity.selectedOption !== 1 ? "opacity-50 pointer-events-none" : ""
                              }`}
                            onClick={() => {
                              if (parity.selectedOption === 1) {
                                setIsChannelDropdownOpen(!isChannelDropdownOpen);
                              }
                            }}
                          >
                            <span>{getSelectedChannelsText()}</span>
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          </div>

                          {/* Dropdown Panel */}
                          {isChannelDropdownOpen && parity.selectedOption === 1 && (
                            <div className="absolute z-50 bottom-full mb-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                              {/* Search Input */}
                              <div className="p-2 border-b border-gray-200">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <input
                                    type="text"
                                    placeholder="Search channels..."
                                    value={channelSearchTerm}
                                    onChange={(e) => setChannelSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-2 py-1 text-sm border rounded-md focus:outline-none focus:border-gray-400"
                                  />
                                </div>
                              </div>

                              {/* Select All */}
                              <div className="px-3 py-2 border-b flex items-center sticky top-0 bg-white z-10">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={toggleAllChannels}
                                  className="mr-2"
                                />
                                <span>Select All</span>
                              </div>

                              {/* Scrollable Channel List */}
                              <div className="max-h-40 overflow-y-auto">
                                {filteredChannel
                                  .filter(ch => ch.name.toLowerCase().includes(channelSearchTerm.toLowerCase()))
                                  .map(ch => (
                                    <label key={ch.cid} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={allSelected || selectedChannels.includes(ch.cid)}
                                        onChange={() => handleChannelToggle(ch.cid)}
                                        className="mr-2"
                                      />
                                      {ch.name}
                                    </label>
                                  ))}

                                {filteredChannel.filter(ch =>
                                  ch.name.toLowerCase().includes(channelSearchTerm.toLowerCase())
                                ).length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-500">
                                      No channels found
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>



                        {/* <Select
                          value={newAlert.parityChannels}
                          onValueChange={(value) => setNewAlert((prev) => ({ ...prev, parityChannels: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Booking.com">Booking.com</SelectItem>
                            <SelectItem value="Expedia">Expedia</SelectItem>
                          </SelectContent>
                        </Select> */}
                      </div>
                    </div>

                    {/* Option 2 */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="option2"
                          checked={parity.selectedOption === 2}
                          onClick={() => handleOptionSelect(2, parity)}
                        />
                        <Label htmlFor="1" className="text-sm font-medium">Option 2</Label>
                      </div>

                      <div className="pl-6 space-y-3">
                        <Label className="block text-sm font-medium text-gray-700 mb-3 mt-3">Alert me when Parity Score</Label>

                        <RadioGroup
                          value={(parity.alertOn[parity.selectedOption] ?? "Increases").toString()} // fallback default
                          onValueChange={(value) => {
                            setParity((prev) => ({
                              ...prev,
                              alertOn: { ...prev.alertOn, [prev.selectedOption]: value },
                            }));
                          }}
                          className="flex gap-6"
                          disabled={parity.selectedOption !== 2}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Increased" id="increases" />
                            <Label htmlFor="increases" className="text-sm font-normal">
                              Increases
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Decreased" id="decreases" />
                            <Label htmlFor="decreases" className="text-sm font-normal">
                              Decreases
                            </Label>
                          </div>
                        </RadioGroup>


                        <Label className="block text-sm font-medium text-gray-700 mb-3 mt-3 pt-4">By (applicable for all channels)</Label>
                        <RadioGroup
                          value={parity.selectedOption === 2 ? parity.parityScoreBy[2] : undefined}
                          onValueChange={(value) =>
                            setParity(prev => ({
                              ...prev,
                              parityScoreBy: {
                                ...prev.parityScoreBy,
                                [prev.selectedOption]: value as "Percentage" | "Absolute"
                              }
                            }))
                          }
                          className="flex gap-6"
                          disabled={parity.selectedOption !== 2}
                        >


                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Absolute" id="parity-absolute" />
                            <Label htmlFor="parity-absolute" className="text-sm font-normal">Absolute</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Percentage" id="parity-percentage" />
                            <Label htmlFor="parity-percentage" className="text-sm font-normal">Percentage</Label>
                          </div>

                        </RadioGroup>

                        <div className="relative">
                          <Input
                            type="number"
                            value={parity.parityScoreValues[parity.selectedOption] ?? ""}
                            onChange={(e) => {
                              const input = e.target.value;

                              // Allow empty string so user can clear input
                              if (input === "" || input === "0") {
                                setParity(prev => ({
                                  ...prev,
                                  parityScoreValues: {
                                    ...prev.parityScoreValues,
                                    [prev.selectedOption]: ""
                                  }
                                }));
                                return;
                              }

                              let value = Number(input);
                              const scoreType = parity.parityScoreBy[parity.selectedOption];

                              // Ignore negative numbers only, allow zero
                              if (value < 0) return;

                              // Clamp percentage between 0-100
                              if (scoreType === "Percentage") {
                                value = Math.min(100, value);
                              }

                              setParity(prev => ({
                                ...prev,
                                parityScoreValues: {
                                  ...prev.parityScoreValues,
                                  [prev.selectedOption]: value
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                            placeholder="Parity Score"
                            disabled={parity.selectedOption !== 2}
                          />


                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-sm text-gray-500">
                              {parity.parityScoreBy[parity.selectedOption] === "Absolute"
                                ? parity.currency1
                                : parity.parityScoreBy[parity.selectedOption] === "Percentage"
                                  ? "%"
                                  : ""}
                            </span>
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* Option 3 */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="option3"
                          checked={parity.selectedOption === 3}
                          onClick={() => handleOptionSelect(3, parity)}
                        />
                        <Label htmlFor="option3" className="text-sm font-medium">Option 3</Label>
                      </div>
                      <div className="pl-6 space-y-3">
                        <Label className="block text-sm font-medium text-gray-700 mb-3 mt-3">Alert me when Parity Score</Label>
                        <RadioGroup
                          value={(parity.alertOn[parity.selectedOption] ?? "").toString()}
                          onValueChange={(value) => {
                           // console.log("Selected value:", parity.alertOn[parity.selectedOption]); // prints selected value                         
                            setParity((prev) => ({
                              ...prev,
                              alertOn: { ...prev.alertOn, [prev.selectedOption]: value }
                            }))
                          }}
                          className="flex gap-6"
                          disabled={parity.selectedOption !== 3}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Falls below" id="falls-below" />
                            <Label htmlFor="falls-below" className="text-sm font-normal">Falls Below</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Rises above" id="rises-above" />
                            <Label htmlFor="rises-above" className="text-sm font-normal">Rises Above</Label>
                          </div>
                        </RadioGroup>
                        <Label className="block text-sm font-medium text-gray-700 mb-3 mt-3 pt-4">By (applicable for all channels)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={parity.selectedOption === 3 ? parity.parityThresholdValue[3] : ""}
                            // value={parity.parityThresholdValue[parity.selectedOption] ?? ""}
                            onChange={(e) => {
                              const value = Number(e.target.value);

                              // Ignore negative numbers and zero
                              if (value <= 0) return;

                              setParity((prev) => ({
                                ...prev,
                                parityThresholdValue: {
                                  ...prev.parityThresholdValue,
                                  [prev.selectedOption]: value
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                            placeholder="Parity Score"
                            disabled={parity.selectedOption !== 3}
                          />

                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </TabsContent>

                {/* Rank Tab */}
                <TabsContent value="Rank" className="space-y-6 mt-6">
                  <div className="space-y-6">
                    {/* Alert me when */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-3">Alert me when</Label>
                      <RadioGroup
                        value={rank.alertOn}
                        onValueChange={(value) => {
                          setRank((prev) => ({ ...prev, alertOn: value }));
                          if (value === "Subscriber") {
                            // clear competitor hotels when switching back
                            setSelectedRankCompetitorHotels([]);
                          }
                        }}

                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Subscriber" id="subscriber-rank" />
                          <Label htmlFor="subscriber-rank" className="text-sm font-normal">Subscriber OTA Ranking</Label>
                        </div>
                        <div className="flex items-center space-x-2 relative" ref={rankCompetitorDropdownRef}>
                          <RadioGroupItem value="Competitor" id="competitor-rank" />
                          <Label
                            htmlFor="competitor-rank"
                            className="flex items-center space-x-2 text-sm font-normal cursor-pointer"
                            onClick={() => setIsRankCompetitorDropdownOpen(!isRankCompetitorDropdownOpen)}
                          >
                            <span> {selectedRankCompetitorHotels[0]?.name || "Competitor OTA Ranking"}</span>
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          </Label>

                          {/* Rank Competitor Dropdown */}
                          {isRankCompetitorDropdownOpen && (
                            <div className="absolute z-50 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden min-w-80">

                              {/* Search Input */}
                              <div className="p-3 border-b border-gray-200">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <Input
                                    placeholder="Search hotels..."
                                    value={rankCompetitorSearchTerm}
                                    onChange={(e) => setRankCompetitorSearchTerm(e.target.value)}
                                    className="pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                                  />
                                </div>
                              </div>

                              {/* Hotel Options */}
                              <div className="max-h-40 overflow-y-auto">
                                {filteredRankCompetitorHotels.map((hotel) => (
                                  <div
                                    key={hotel.hmid}
                                    onClick={() => {
                                      setSelectedRankCompetitorHotels([{ id: Number(hotel.hmid), name: hotel.name }]); // store both
                                      setRank(prev => ({
                                        ...prev,
                                        compset: hotel.hmid, // store selected id
                                      }));
                                      setIsRankCompetitorDropdownOpen(false);
                                    }}

                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-900 truncate ${selectedRankCompetitorHotels.some(selected => selected.id === hotel.hmid)
                                      ? "bg-gray-100 font-medium"
                                      : ""
                                      }`}

                                    title={hotel.name}
                                  >
                                    {hotel.name.length > 32 ? `${hotel.name.substring(0, 32)}...` : hotel.name}
                                  </div>
                                ))}

                                {filteredRankCompetitorHotels.length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500">
                                    No hotels found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      </RadioGroup>
                    </div>

                    {/* Has */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-3">Has</Label>
                      <RadioGroup
                        value={rank.alertRule}
                        onValueChange={(value) => setRank((prev) => ({ ...prev, alertRule: value }))}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Increased" id="rank-increased" />
                          <Label htmlFor="rank-increased" className="text-sm font-normal">Increased</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Decreased" id="rank-decreased" />
                          <Label htmlFor="rank-decreased" className="text-sm font-normal">Decreased</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* By and On Channel */}
                    <div className="flex gap-6 items-end">
                      <div className="flex-1">
                        <Label className="block text-sm font-medium text-gray-700 mb-3">By</Label>
                        <Input
                          type="number"
                          value={rank.rankThresholdValue === 0 ? "" : rank.rankThresholdValue}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setRank((prev) => ({
                              ...prev,
                              rankThresholdValue: raw === "" ? 0 : Number(raw),
                            }));
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:border-gray-200"
                          placeholder="1"
                        />

                      </div>
                      <div className="flex-1">
                        <Label className="block text-sm font-medium text-gray-700 mb-3">On Channel</Label>

                        <Select
                          value={rank.rankChannel}
                          onValueChange={(value) =>
                            setRank((prev) => ({ ...prev, rankChannel: value }))
                          }
                        >
                          <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none">
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>

                          <SelectContent side="top" position="popper" className="max-h-48 overflow-y-auto">
                            {rankOTAChannelsData.length > 0 ? (
                              rankOTAChannelsData.map((ch) => (
                                <SelectItem key={ch.cid} value={String(ch.cid)}>
                                  {ch.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">No channels found</div>
                            )}
                          </SelectContent>
                        </Select>



                        {/* <Select
                          value={newAlert.rankChannel}
                          onValueChange={(value) => setNewAlert((prev) => ({ ...prev, rankChannel: value }))}
                        >
                          <SelectTrigger className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                          <SelectContent side="top" position="popper">
                         
                          </SelectContent>
                        </Select> */}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Common Footer */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2">
                  <input
                    type="checkbox"
                    id="events-holidays"
                    checked={newAlert.sendForEventsHolidays}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, sendForEventsHolidays: e.target.checked }))}
                    className="w-4 h-4 mr-1 text-blue-600 bg-white border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label htmlFor="events-holidays" className="text-sm font-normal">
                    Send this alert only for events/holidays
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelAddAlert}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAlert}
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-black">Delete Alert</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this alert? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={cancelDeleteAlert}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteAlert}
                className="px-6 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change History Modal */}
        <Dialog open={showChangeHistory} onOpenChange={setShowChangeHistory}>
          <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Alert Change History</DialogTitle>
              <DialogDescription>
                View all changes made to alert settings.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 flex-1 overflow-hidden">
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg h-full">
                <div className="h-[400px] overflow-y-auto pb-4">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                      <tr className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800 align-top">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tl-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                          <div
                            className="flex items-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('rule')}
                          >
                            Alert Rule
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('rule')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('rule')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-24">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          <div
                            className="flex items-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('date')}
                          >
                            Action Date
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('date')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('date')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-32">
                          <div
                            className="flex items-center gap-1 cursor-pointer group"
                            onClick={() => handleSort('createdBy')}
                          >
                            Created/Modified By
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              {getHoverIcon('createdBy')}
                            </span>
                            <span className="opacity-100 mt-0.5">
                              {getSortIcon('createdBy')}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 capitalize tracking-wider rounded-tr-lg border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 align-top w-20">
                          Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8">
                            <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                          </td>
                        </tr>
                      ) : historyData && historyData.length > 0 ? (
                        historyData.map((changeWithId, index) => {
                          const isLastRow = index === historyData.length - 1;
                          return (
                            <tr
                              key={changeWithId.id}
                              className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'
                                }`}
                            >
                              {/* Rule */}
                              <td
                                className={`px-4 py-2 whitespace-nowrap border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-bl-lg' : ''
                                  } w-32`}
                              >
                                <TruncatedTooltip
                                  content={changeWithId.rule || ''}
                                  className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                                >
                                  {changeWithId.rule || ''}
                                </TruncatedTooltip>
                              </td>

                              {/* Type */}
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-24">
                                <Badge variant="secondary" className="text-xs">
                                  {changeWithId.type}
                                </Badge>
                              </td>

                              {/* Created On */}
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <span className="truncate">
                                  <TruncatedTooltip content={changeWithId.createdOn || ''}>
                                    {changeWithId.createdOn || ''}
                                  </TruncatedTooltip>
                                </span>
                              </td>

                              {/* Created By */}
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-32">
                                <span className="truncate">
                                  <TruncatedTooltip content={changeWithId.createdBy || ''}>
                                    {changeWithId.createdBy || ''}
                                  </TruncatedTooltip>
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 w-20">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeWithId.status
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    }`}
                                >
                                  {changeWithId.status ? 'Active' : 'Inactive'}
                                </span>
                              </td>

                              {/* Action */}
                              <td
                                className={`px-4 py-2 text-center text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 ${isLastRow ? 'rounded-br-lg' : ''
                                  } w-20`}
                              >
                                <TruncatedTooltip
                                  content={changeWithId.Action || ''}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${changeWithId.Action === 'Create'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : changeWithId.Action === 'Modified'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                      : changeWithId.Action === 'Deleted'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                    }`}
                                >
                                  {changeWithId.Action === 'Create'
                                    ? 'Added'
                                    : changeWithId.Action === 'Modified'
                                      ? 'Updated'
                                      : changeWithId.Action === 'Deleted'
                                        ? 'Deleted'
                                        : ''}
                                </TruncatedTooltip>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center h-4">
                            <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                              No history data available
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>

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

        {/* Success Snackbar */}
        {/* {showSnackbar && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">
                  Alert added successfully
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
                  Alert deleted successfully
                </span>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </TooltipProvider >
  )
}




