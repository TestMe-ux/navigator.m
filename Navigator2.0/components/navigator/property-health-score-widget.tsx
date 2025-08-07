"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, AlertCircle, TrendingUp, DollarSign, Bed, Plane, MapPin, Globe, Building2, Wallet, CheckCircle } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { getOTAChannels, getOTARankOnAllChannel } from "@/lib/otarank"
import { useDateContext } from "../date-context"
import localStorageService from "@/lib/localstorage"

interface ChannelData {
  name: string
  icon: React.ElementType
  iconColor: string
  ranking?: {
    value: string
    change?: number
    total: string
    compset: string
  }
  reviewScore?: {
    value: string
    compset: string
  }
  parityIssues?: {
    count: number
    avgLoss: number
  }
}

const channelData: ChannelData[] = [
  {
    name: "Booking.com",
    icon: Bed,
    iconColor: "text-blue-600",
    ranking: {
      value: "6",
      change: -2,
      total: "19",
      compset: "1st"
    },
    reviewScore: {
      value: "0/10",
      compset: "--"
    },
    parityIssues: {
      count: 42,
      avgLoss: 45
    }
  },
  {
    name: "Expedia",
    icon: Plane,
    iconColor: "text-yellow-600",
    ranking: {
      value: "10",
      change: 2,
      total: "476",
      compset: "1st"
    },
    reviewScore: {
      value: "9.8/10",
      compset: "3rd"
    },
    parityIssues: {
      count: 8,
      avgLoss: 85
    }
  },
  {
    name: "Tripadvisor",
    icon: MapPin,
    iconColor: "text-green-600",
    ranking: {
      value: "1",
      change: 0,
      total: "1",
      compset: "1st"
    },
    reviewScore: {
      value: "5/5",
      compset: "1st"
    },
    parityIssues: {
      count: 5,
      avgLoss: 75
    }
  },
  {
    name: "Agoda",
    icon: Globe,
    iconColor: "text-red-500",
    parityIssues: {
      count: 3,
      avgLoss: 92
    }
  },
  {
    name: "Hotels.com",
    icon: Building2,
    iconColor: "text-red-600",
    ranking: {
      value: "8",
      change: 1,
      total: "25",
      compset: "2nd"
    },
    reviewScore: {
      value: "8.5/10",
      compset: "2nd"
    },
    parityIssues: {
      count: 18,
      avgLoss: 58
    }
  },
  {
    name: "Priceline",
    icon: Wallet,
    iconColor: "text-blue-500",
    ranking: {
      value: "12",
      change: -1,
      total: "89",
      compset: "3rd"
    },
    reviewScore: {
      value: "7.2/10",
      compset: "4th"
    },
    parityIssues: {
      count: 6,
      avgLoss: 78
    }
  }
]

function parseScore(score: any) {
  return score === "NA" ? 0 : parseFloat(score);
}
// Generate revenue manager insights based on channel data
const generateRevenueManagerInsights = (channels: ChannelData[]) => {
  const insights = []

  // Check for parity issues
  const channelsWithIssues = channels.filter(c => c.parityIssues && c.parityIssues.avgLoss > 0)
  if (channelsWithIssues.length > 0) {
    const worstChannel = channelsWithIssues.reduce((worst, current) =>
      (current.parityIssues?.avgLoss || 0) > (worst.parityIssues?.avgLoss || 0) ? current : worst
    )
    insights.push({
      type: 'critical',
      icon: AlertCircle,
      title: 'Immediate Action Required',
      description: `${worstChannel.name} has ${worstChannel.parityIssues?.avgLoss}% parity loss with ${worstChannel.parityIssues?.count} issues`,
      action: 'Fix rate parity issues',
      priority: 'high'
    })
  }

  // Check for ranking opportunities
  const channelsWithRanking = channels.filter(c => c.ranking)
  const improvableRankings = channelsWithRanking.filter(c => parseInt(c.ranking!.value) > 5)
  if (improvableRankings.length > 0) {
    insights.push({
      type: 'opportunity',
      icon: TrendingUp,
      title: 'Ranking Optimization',
      description: `Improve visibility on ${improvableRankings.map(c => c.name).join(', ')} to increase bookings`,
      action: 'Optimize channel presence',
      priority: 'medium'
    })
  }

  // Check for review score issues
  const reviewIssues = channels.filter(c => c.reviewScore && parseFloat(c.reviewScore.value) < 4.0)
  if (reviewIssues.length > 0) {
    insights.push({
      type: 'warning',
      icon: AlertCircle,
      title: 'Review Score Alert',
      description: `${reviewIssues[0].name} has low review scores affecting conversion rates`,
      action: 'Improve guest experience',
      priority: 'medium'
    })
  }

  // Revenue opportunity insight
  const totalPotentialLoss = channels.reduce((sum, c) => sum + Math.abs(c.parityIssues?.avgLoss || 0), 0)
  if (totalPotentialLoss > 0) {
    insights.push({
      type: 'revenue',
      icon: DollarSign,
      title: 'Revenue Recovery Opportunity',
      description: `Fixing parity issues could recover up to ${Math.round(totalPotentialLoss / channels.length)}% average revenue`,
      action: 'Prioritize high-impact fixes',
      priority: 'high'
    })
  }

  return insights.slice(0, 3) // Return top 3 insights
}

export function PropertyHealthScoreWidget(props: any) {
  const [selectedProperty, setSelectedProperty] = useState<any>(localStorageService.get('SelectedProperty'))
  const pendingFetchRef = useRef(false);
  const lastDatesRef = useRef<{ start: string | null; end: string | null }>({ start: null, end: null });
  const isFetchingRef = useRef(false); // avoid overlapping requests
  const [otachannel, setotachannel] = useState<any[]>([]);
  const [otaRankOnChannel, setotaRankOnChannel] = useState<any>([]);
  const [combinedData, setCombinedData] = useState<any>([]);
  const { startDate, endDate, setDateRange } = useDateContext()
  // Calculate overall summary stats
  const totalChannels = channelData.length
  const channelsWithIssues = channelData.filter(c => c.parityIssues && c.parityIssues.avgLoss > 0).length
  const totalParityIssues = channelData.reduce((sum, c) => sum + (c.parityIssues?.count || 0), 0)

  // Generate insights for revenue manager
  const insights = generateRevenueManagerInsights(channelData)
  const isEmptyObject = (obj: any) =>
    obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  useEffect(() => {
    if (!startDate || !endDate) return;

    const startKey = startDate.toISOString();
    const endKey = endDate.toISOString();

    if (lastDatesRef.current.start === startKey && lastDatesRef.current.end === endKey) return;

    lastDatesRef.current = { start: startKey, end: endKey };
    pendingFetchRef.current = true;

    if (props?.parityData && !isEmptyObject(props.parityData)) {
      pendingFetchRef.current = false;
      fetchOtaAndRanks(); // defined below
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (!pendingFetchRef.current) return;
    if (!props?.parityData || isEmptyObject(props.parityData)) return;

    pendingFetchRef.current = false;
    fetchOtaAndRanks();
  }, [props?.parityData]);

  const fetchOtaAndRanks = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1) get OTA channels
      const chRes = await getOTAChannels({ SID: selectedProperty?.sid });
      if (!chRes?.status) {
        setotachannel([]); // or keep previous
        setotaRankOnChannel([]);
        return;
      }
      const otach = chRes.body ?? chRes ?? [];
      setotachannel(otach);
      // setOtaChannels(otach);

      // 2) get OTA rank on all channels
      const rankRes = await getOTARankOnAllChannel({
        SID: selectedProperty?.sid,
        CheckInDateStart: startDate?.toUTCString(),
        CheckInEndDate: endDate?.toUTCString(),
      });

      if (!rankRes?.status) {
        setotaRankOnChannel([]);
        return;
      }

      const flatranOnChaneel = Array.isArray(rankRes.body) ? rankRes.body.flat() : [];
      // Map by otaId for faster lookup (ensure types match)

      const merged = otach.map((item: any) => {
        // try to match using cid or name; adapt if your id keys differ
        const relatedData = flatranOnChaneel.filter((r: any) => String(r.otaId) === String(item.cid));
        return {
          ...item,
          data: relatedData,
        };
      });

      setotaRankOnChannel(merged);

      // 3) combine with the parity that we currently have (if any)
      if (props?.parityData && !isEmptyObject(props.parityData)) {
        combineRankParity(merged, props.parityData);
      } else {
        // parity missing — still set combined with ota-only rows (optional)
        const otaOnly = merged.map((m: any) => ({ ...m, parity: null }));
        setCombinedData(otaOnly);
      }
    } catch (err) {
      console.error('fetchOtaAndRanks error', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [startDate, endDate, props?.parityData]); 

  useEffect(() => {
    if (!otaRankOnChannel || otaRankOnChannel.length === 0) return;
    if (!props?.parityData || isEmptyObject(props.parityData)) return;

    combineRankParity(otaRankOnChannel, props.parityData);
  }, [otaRankOnChannel, props?.parityData]);

  const combineRankParity = useCallback((otarankdata: any[], parityData: any) => {
    if (!Array.isArray(otarankdata)) return setCombinedData([]);
    const parityArr = parityData?.otaViolationChannelRate?.violationChannelRatesCollection ?? [];

    const parityMap = new Map<string, any>();
    for (const p of parityArr) {
      const nameKey = String(p.channelName ?? p.name ?? '').toLowerCase().trim();
      if (!nameKey) continue;
      parityMap.set(nameKey, p);
    }

    const merged = [
      ...otarankdata.map((a1: any) => {
        const key = String(a1.name ?? a1.channelName ?? a1.cid ?? '').toLowerCase().trim();
        const match = parityMap.get(key);
        if (match) parityMap.delete(key);
        return match
          ? {
            ...a1,
            channelIcon: match.channelIcon ?? a1.channelIcon,
            isBrand: match.isBrand ?? a1.isBrand,
            rank: match.rank ?? a1.rank,
            channelWisewinMeetLoss: match.channelWisewinMeetLoss ?? a1.channelWisewinMeetLoss,
            parityRaw: match,
          }
          : { ...a1, parityRaw: null };
      }),
      ...Array.from(parityMap.values()).map((a2: any) => ({
        name: a2.channelName ?? a2.name,
        cid: a2.channelName ?? a2.name,
        url: a2.channelIcon,
        isBrand: a2.isBrand,
        rank: a2.rank,
        channelWisewinMeetLoss: a2.channelWisewinMeetLoss,
        data: [],
        parityRaw: a2,
      })),
    ];

    const filtered = merged.filter(item => {
      const cw = item.channelWisewinMeetLoss;
      const hasChannelWisewin =
        !!cw && !(typeof cw === 'object' && Object.keys(cw).length === 0) &&
        !(cw?.parityScore <= 0);

      const hasData = Array.isArray(item.data) ? item.data.length > 0 : !!item.data;
      return hasChannelWisewin || hasData;
    });

    setCombinedData(filtered);
    console.log('mergedOTAPARITY', filtered);
  }, []);
  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="space-y-2">
              <CardTitle className="text-minimal-title text-foreground">Property Health Score</CardTitle>
              <p className="text-minimal-body text-muted-foreground">Channel performance and parity monitoring</p>
            </div>
          </div>

          {/* Enhanced Summary Stats */}
          <div className="flex items-center gap-minimal-md">
            <div className="card-minimal p-3 text-center">
              <div className="text-2xl font-semibold text-foreground tracking-tight">{combinedData?.length}</div>
              <div className="text-minimal-caption text-muted-foreground">Channels</div>
            </div>
            <div className="card-minimal p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className={`text-2xl font-semibold tracking-tight ${props?.parityData?.totalviolationCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {props?.parityData?.totalviolationCount}
                </span>
                {props?.parityData?.totalviolationCount > 0 ? (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="text-minimal-caption text-muted-foreground">Total Violations</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">


        {/* Channel Cards Grid - Enhanced with MUI styling and better spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 -mt-2.5">
          {combinedData.map((channel: any) => {
            // const Icon = channel.channelIcon
            const sortedData = [...channel.data].sort((a, b) => parseScore(a.score) - parseScore(b.score));
            const subsOtaranData = channel.data.filter((xy: any) => xy.propertyID == 246342)
            const Subindex = sortedData.findIndex((h: any) => h.propertyID === 246342);
            return (
              <Card key={channel.name} className="hover:shadow-xl hover:scale-[1.01] transition-all duration-300 transform-gpu cursor-default">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2.5">
                    {/* <Icon className={`w-4 h-4 ${channel.iconColor}`} /> */}
                    <img src={channel.url} className="w-4 h-4" alt={channel.name} />
                    <h4 className="text-base font-medium text-foreground">{channel.name}</h4>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 px-4 pb-3">
                  <div className="grid grid-cols-3 gap-4">

                    {/* Ranking Metric - Optimized */}
                    <div className="text-center space-y-2">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ranking</div>
                      {subsOtaranData.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-lg font-semibold text-foreground">{subsOtaranData[0]?.otaRank}</span>
                            {subsOtaranData[0]?.changeInRank !== undefined && subsOtaranData[0]?.changeInRank !== 0 && (
                              <span className={`text-xs font-medium flex items-center ${subsOtaranData[0]?.changeInRank > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                                }`}>
                                {subsOtaranData[0]?.changeInRank > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {Math.abs(subsOtaranData[0]?.changeInRank)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            of 500
                          </div>
                        </div>
                      ) : (
                        <div className="text-base text-muted-foreground">--</div>
                      )}
                    </div>

                    {/* Review Score - Optimized */}
                    <div className="text-center space-y-2">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Reviews</div>
                      {subsOtaranData.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-foreground">{subsOtaranData[0]?.score}</div>
                          <div className="text-xs text-muted-foreground"> {Subindex + 1}</div>
                        </div>
                      ) : (
                        <div className="text-base text-muted-foreground">--</div>
                      )}
                    </div>

                    {/* Parity Issues - Optimized */}
                    <div className="text-center space-y-2">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Parity</div>
                      {channel?.channelWisewinMeetLoss?.parityScore > 0 ? (
                        <div className="space-y-1">
                          <div className={`text-lg font-semibold${channel?.channelWisewinMeetLoss?.parityScore <= 70 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                            {channel?.channelWisewinMeetLoss?.parityScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {channel?.channelWisewinMeetLoss?.violationCount ?? 0} issues
                          </div>
                        </div>
                      ) : (
                        <div className="text-base text-muted-foreground">--</div>
                      )}
                    </div>
                  </div>


                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
