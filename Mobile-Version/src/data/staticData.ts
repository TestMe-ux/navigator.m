/**
 * Static Data for Navigator Mobile App
 * This file contains mock/static data for the Overview and Demand pages
 */

export interface KPIData {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}

export interface HealthScoreData {
  overallScore: number;
  parity: number;
  rate: number;
  demand: number;
}

export interface SummaryData {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

export interface FilterData {
  wow: {
    summary: SummaryData[];
  };
  mom: {
    summary: SummaryData[];
  };
  yoy: {
    summary: SummaryData[];
  };
}

export interface InsightData {
  id: string;
  text: string;
}

export interface OverviewData {
  insights: InsightData[];
  kpi: KPIData[];
  healthScore: HealthScoreData;
  rateTrends: {
    labels: string[];
    values: number[];
  };
  marketDemand: {
    current: number;
    previous: number;
    change: number;
  };
}

export interface DemandData extends FilterData {
  calendar: {
    date: string;
    demand: number;
    occupancy: number;
  }[];
  trends: {
    labels: string[];
    values: number[];
  };
  events: {
    id: string;
    name: string;
    date: string;
    type: 'event' | 'holiday';
    impact: 'high' | 'medium' | 'low';
  }[];
}

// Overview Page Static Data
export const overviewData: OverviewData = {
  insights: [
    {
      id: '1',
      text: 'based on demand, increase rate by 4%',
    },
    {
      id: '2',
      text: 'parity score below threshold, review competitor rates',
    },
    {
      id: '3',
      text: 'high demand forecasted for next week, optimize pricing',
    },
  ],
  kpi: [
    {
      id: 'parity-score',
      title: 'Parity Score',
      value: '87.5%',
      subtitle: 'Overall rate parity',
      icon: 'security',
      color: '#008FFF',
    },
    {
      id: 'avg-daily-rate',
      title: 'Average Daily Rate',
      value: '$245.80',
      subtitle: 'Average rate per day',
      icon: 'attach-money',
      color: '#10b981',
    },
    {
      id: 'price-positioning',
      title: 'Price Positioning',
      value: '2nd',
      subtitle: 'Market position',
      icon: 'trending-up',
      color: '#f59e0b',
    },
  ],
  healthScore: {
    overallScore: 82,
    parity: 87.5,
    rate: 78.2,
    demand: 80.5,
  },
  rateTrends: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [220, 235, 245, 250, 260, 280, 275],
  },
  marketDemand: {
    current: 78.5,
    previous: 72.3,
    change: 8.6,
  },
};

// Demand Page Static Data
export const demandData: DemandData = {
  wow: {
    summary: [
      {
        id: 'demand-index',
        title: 'Demand Index',
        value: '78.5',
        change: '+6.2%',
        icon: 'trending-up',
        color: '#008FFF',
      },
      {
        id: 'hotel-adr',
        title: 'Hotel ADR',
        value: '$245.80',
        change: '+3.5%',
        icon: 'attach-money',
        color: '#10b981',
      },
      {
        id: 'revpar',
        title: 'RevPAR',
        value: '$193.15',
        change: '+4.8%',
        icon: 'bar-chart',
        color: '#f59e0b',
      },
      {
        id: 'occupancy',
        title: 'Occupancy',
        value: '78.5%',
        change: '+2.1%',
        icon: 'hotel',
        color: '#8b5cf6',
      },
    ],
  },
  mom: {
    summary: [
      {
        id: 'demand-index',
        title: 'Demand Index',
        value: '78.5',
        change: '+12.4%',
        icon: 'trending-up',
        color: '#008FFF',
      },
      {
        id: 'hotel-adr',
        title: 'Hotel ADR',
        value: '$245.80',
        change: '+8.2%',
        icon: 'attach-money',
        color: '#10b981',
      },
      {
        id: 'revpar',
        title: 'RevPAR',
        value: '$193.15',
        change: '+10.5%',
        icon: 'bar-chart',
        color: '#f59e0b',
      },
      {
        id: 'occupancy',
        title: 'Occupancy',
        value: '78.5%',
        change: '+5.3%',
        icon: 'hotel',
        color: '#8b5cf6',
      },
    ],
  },
  yoy: {
    summary: [
      {
        id: 'demand-index',
        title: 'Demand Index',
        value: '78.5',
        change: '+15.8%',
        icon: 'trending-up',
        color: '#008FFF',
      },
      {
        id: 'hotel-adr',
        title: 'Hotel ADR',
        value: '$245.80',
        change: '+12.6%',
        icon: 'attach-money',
        color: '#10b981',
      },
      {
        id: 'revpar',
        title: 'RevPAR',
        value: '$193.15',
        change: '+18.2%',
        icon: 'bar-chart',
        color: '#f59e0b',
      },
      {
        id: 'occupancy',
        title: 'Occupancy',
        value: '78.5%',
        change: '+4.9%',
        icon: 'hotel',
        color: '#8b5cf6',
      },
    ],
  },
  calendar: [
    {date: '2024-01-15', demand: 75, occupancy: 72},
    {date: '2024-01-16', demand: 78, occupancy: 75},
    {date: '2024-01-17', demand: 82, occupancy: 78},
    {date: '2024-01-18', demand: 85, occupancy: 80},
    {date: '2024-01-19', demand: 88, occupancy: 85},
    {date: '2024-01-20', demand: 92, occupancy: 88},
    {date: '2024-01-21', demand: 90, occupancy: 87},
    {date: '2024-01-22', demand: 85, occupancy: 82},
    {date: '2024-01-23', demand: 80, occupancy: 78},
    {date: '2024-01-24', demand: 78, occupancy: 75},
    {date: '2024-01-25', demand: 82, occupancy: 80},
    {date: '2024-01-26', demand: 88, occupancy: 85},
    {date: '2024-01-27', demand: 90, occupancy: 88},
    {date: '2024-01-28', demand: 85, occupancy: 82},
  ],
  trends: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [72, 75, 78, 78.5],
  },
  events: [
    {
      id: '1',
      name: 'New Year Celebration',
      date: '2024-01-01',
      type: 'holiday',
      impact: 'high',
    },
    {
      id: '2',
      name: 'Business Conference',
      date: '2024-01-15',
      type: 'event',
      impact: 'high',
    },
    {
      id: '3',
      name: 'Music Festival',
      date: '2024-01-20',
      type: 'event',
      impact: 'medium',
    },
    {
      id: '4',
      name: 'Valentine\'s Day',
      date: '2024-02-14',
      type: 'holiday',
      impact: 'medium',
    },
    {
      id: '5',
      name: 'Sports Championship',
      date: '2024-01-25',
      type: 'event',
      impact: 'high',
    },
  ],
};


