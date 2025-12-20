import { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sliders, Eye, MapPin, Users, TrendingUp, AlertCircle, Loader2, DollarSign, Clock, Trash2 } from 'lucide-react';
import { Opportunity, OpportunityPipelineResponse, OpportunityStage as OpportunityStageMap } from '@/types/opportunities';
import { formatProjectValue } from '@/utils/opportunityUtils';
import { useDeleteOpportunity } from '@/hooks/opportunities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type PipelineManagementContentProps = {
  opportunities: Opportunity[];
  pipelineData?: OpportunityPipelineResponse;
  isLoading: boolean;
}

// Declare global Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const DEFAULT_COORDINATE = { lat: 39.8283, lng: -98.5795 };

const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.8067, lng: -86.7911 },
  AK: { lat: 61.3707, lng: -152.4044 },
  AZ: { lat: 33.7298, lng: -111.4312 },
  AR: { lat: 34.9697, lng: -92.3731 },
  CA: { lat: 36.1162, lng: -119.6816 },
  CO: { lat: 39.0598, lng: -105.3111 },
  CT: { lat: 41.5978, lng: -72.7554 },
  DE: { lat: 39.3185, lng: -75.5071 },
  FL: { lat: 27.7663, lng: -81.6868 },
  GA: { lat: 33.0406, lng: -83.6431 },
  HI: { lat: 21.0943, lng: -157.4983 },
  ID: { lat: 44.2405, lng: -114.4788 },
  IL: { lat: 40.3495, lng: -88.9861 },
  IN: { lat: 39.8494, lng: -86.2583 },
  IA: { lat: 42.0115, lng: -93.2105 },
  KS: { lat: 38.5266, lng: -96.7265 },
  KY: { lat: 37.6681, lng: -84.6701 },
  LA: { lat: 31.1695, lng: -91.8678 },
  ME: { lat: 44.6939, lng: -69.3819 },
  MD: { lat: 39.0639, lng: -76.8021 },
  MA: { lat: 42.2302, lng: -71.5301 },
  MI: { lat: 43.3266, lng: -84.5361 },
  MN: { lat: 45.6945, lng: -93.9002 },
  MS: { lat: 32.7416, lng: -89.6787 },
  MO: { lat: 38.4561, lng: -92.2884 },
  MT: { lat: 46.9219, lng: -110.4544 },
  NE: { lat: 41.1254, lng: -98.2681 },
  NV: { lat: 38.3135, lng: -117.0554 },
  NH: { lat: 43.4525, lng: -71.5639 },
  NJ: { lat: 40.2989, lng: -74.5210 },
  NM: { lat: 34.8405, lng: -106.2485 },
  NY: { lat: 42.1657, lng: -74.9481 },
  NC: { lat: 35.6301, lng: -79.8064 },
  ND: { lat: 47.5289, lng: -99.7840 },
  OH: { lat: 40.3888, lng: -82.7649 },
  OK: { lat: 35.5653, lng: -96.9289 },
  OR: { lat: 44.5720, lng: -122.0709 },
  PA: { lat: 40.5908, lng: -77.2098 },
  RI: { lat: 41.6809, lng: -71.5118 },
  SC: { lat: 33.8569, lng: -80.9450 },
  SD: { lat: 44.2998, lng: -99.4388 },
  TN: { lat: 35.7478, lng: -86.6923 },
  TX: { lat: 31.0545, lng: -97.5635 },
  UT: { lat: 40.15, lng: -111.8624 },
  VT: { lat: 44.0459, lng: -72.7107 },
  VA: { lat: 37.7693, lng: -78.1690 },
  WA: { lat: 47.4009, lng: -121.4905 },
  WV: { lat: 38.4912, lng: -80.9545 },
  WI: { lat: 44.2685, lng: -89.6165 },
  WY: { lat: 42.7560, lng: -107.3025 }
};

const STATE_NAME_TO_CODE: Record<string, keyof typeof STATE_COORDINATES> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO',
  Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID',
  Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA',
  Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH',
  Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA',
  Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY'
};

const getCoordinateForLocation = (location?: string | null) => {
  if (!location) return DEFAULT_COORDINATE;
  const segments = location.split(',').map(segment => segment.trim()).filter(Boolean);
  const candidate = segments.length > 1 ? segments[segments.length - 1] : segments[0];
  const upperCandidate = candidate.toUpperCase();
  if (upperCandidate.length === 2 && STATE_COORDINATES[upperCandidate]) {
    return STATE_COORDINATES[upperCandidate];
  }

  const code = STATE_NAME_TO_CODE[candidate as keyof typeof STATE_NAME_TO_CODE];
  if (code && STATE_COORDINATES[code]) {
    return STATE_COORDINATES[code];
  }

  return DEFAULT_COORDINATE;
};

const formatStageLabel = (stage: string) => stage.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const getRiskLabel = (risk?: string | null) => {
  if (risk === 'high_risk') return 'High';
  if (risk === 'medium_risk') return 'Medium';
  if (risk === 'low_risk') return 'Low';
  return 'Unspecified';
};

const getRiskBadgeClasses = (riskLabel: string) => {
  switch (riskLabel) {
    case 'High':
      return 'bg-[#FDE8E8] text-[#9B1C1C]';
    case 'Medium':
      return 'bg-[#FEF3C7] text-[#92400E]';
    case 'Low':
      return 'bg-[#DEF7EC] text-[#03543F]';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const formatMatchScore = (score?: number | null) => {
  if (typeof score !== 'number') return '—';
  return `${Math.round(score)}%`;
};

const formatPipelineValue = (value: number) => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export const PipelineManagementContent = memo(({ opportunities, pipelineData, isLoading }: PipelineManagementContentProps) => {
  const navigate = useNavigate();
  const deleteOpportunityMutation = useDeleteOpportunity();
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [hoveredOpportunity, setHoveredOpportunity] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<{ id: string; name: string } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const pipelineOpportunities = useMemo(
    () => opportunities.filter((opp) => opp.stage && opp.stage !== OpportunityStageMap.LEAD),
    [opportunities]
  );

  const transformedOpportunities = useMemo(() => {
    return pipelineOpportunities.map((opp) => {
      const riskLabel = getRiskLabel(opp.risk_level);
      return {
        id: opp.id,
        customId: opp.custom_id,
        name: opp.project_name,
        stage: formatStageLabel(opp.stage || OpportunityStageMap.LEAD),
        rawStage: opp.stage,
        location: opp.state || 'Unknown',
        marketSector: opp.market_sector || 'General',
        projectValueNumeric: opp.project_value || 0,
        projectValueDisplay: opp.project_value ? formatProjectValue(opp.project_value) : 'TBD',
        matchScore: typeof opp.match_score === 'number' ? Math.max(Math.min(opp.match_score, 100), 0) : null,
        riskLabel,
        createdAt: opp.created_at,
        deadline: opp.deadline,
      };
    });
  }, [pipelineOpportunities]);

  const mapLocations = useMemo(() => {
    return transformedOpportunities.map((opp, index) => {
      const coords = getCoordinateForLocation(opp.location);
      const jitter = (index % 5) * 0.02;
      const color = opp.riskLabel === 'High' ? '#EF4444' : opp.riskLabel === 'Medium' ? '#F59E0B' : '#10B981';
      return {
        id: opp.id,
        name: opp.name,
        location: opp.location,
        lat: coords.lat + jitter,
        lng: coords.lng + jitter,
        matchScore: opp.matchScore ?? 0,
        projectValue: opp.projectValueNumeric,
        sector: opp.marketSector,
        projectValueDisplay: opp.projectValueDisplay,
        stage: opp.stage,
        riskLabel: opp.riskLabel,
        color
      };
    });
  }, [transformedOpportunities]);

  const pipelineSummary = useMemo(() => {
    const totalOpportunities = pipelineData?.total_opportunities ?? pipelineOpportunities.length;
    const totalPipelineValue = pipelineData?.total_value ?? pipelineOpportunities.reduce((sum, opp) => sum + (opp.project_value || 0), 0);

    const valuedOpportunities = pipelineOpportunities.filter((opp) => opp.project_value);
    const averageDealSize = valuedOpportunities.length
      ? valuedOpportunities.reduce((sum, opp) => sum + (opp.project_value || 0), 0) / valuedOpportunities.length
      : 0;

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const createdThisWeek = pipelineOpportunities.filter((opp) => new Date(opp.created_at) >= weekAgo).length;

    const inProgressCount = pipelineOpportunities.filter((opp) => opp.stage !== OpportunityStageMap.WON && opp.stage !== OpportunityStageMap.LOST).length;
    const wonCount = pipelineOpportunities.filter((opp) => opp.stage === OpportunityStageMap.WON).length;
    const highRiskCount = pipelineOpportunities.filter((opp) => opp.risk_level === 'high_risk').length;

    const matchScores = pipelineOpportunities
      .map((opp) => opp.match_score)
      .filter((score): score is number => typeof score === 'number');
    const averageMatchScore = matchScores.length
      ? matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length
      : null;

    const dueSoonCount = pipelineOpportunities.filter((opp) => {
      if (!opp.deadline) return false;
      const deadlineDate = new Date(opp.deadline);
      return deadlineDate >= now && deadlineDate <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }).length;

    const stageDurations = pipelineData?.average_time_in_stage ?? {};
    const durationValues = Object.values(stageDurations).filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));
    const averageStageDays = durationValues.length
      ? durationValues.reduce((sum, value) => sum + value, 0) / durationValues.length
      : 0;

    return {
      totalOpportunities,
      totalPipelineValue,
      averageDealSize,
      createdThisWeek,
      inProgressCount,
      wonCount,
      highRiskCount,
      averageMatchScore,
      dueSoonCount,
      averageStageDays,
    };
  }, [pipelineOpportunities, pipelineData]);

  const pipelineCards = useMemo(() => (
    [
      {
        title: 'Total Opportunities',
        value: pipelineSummary.totalOpportunities.toString(),
        helper: pipelineSummary.createdThisWeek > 0
          ? `${pipelineSummary.createdThisWeek} created in last 7 days`
          : 'No new opportunities this week',
        icon: TrendingUp,
        iconBg: 'bg-[#EFF6FF]',
        iconColor: 'text-[#2563EB]'
      },
      {
        title: 'Pipeline Value',
        value: formatPipelineValue(pipelineSummary.totalPipelineValue),
        helper: pipelineSummary.averageDealSize > 0
          ? `Avg deal ${formatPipelineValue(pipelineSummary.averageDealSize)}`
          : 'Awaiting valued deals',
        icon: DollarSign,
        iconBg: 'bg-[#F0FDF4]',
        iconColor: 'text-[#16A34A]'
      },
      {
        title: 'Deals In Flight',
        value: pipelineSummary.inProgressCount.toString(),
        helper: `Won: ${pipelineSummary.wonCount}`,
        icon: Users,
        iconBg: 'bg-[#E0E7FF]',
        iconColor: 'text-[#4338CA]'
      },
      {
        title: 'Average Match Score',
        value: pipelineSummary.averageMatchScore !== null
          ? `${Math.round(pipelineSummary.averageMatchScore)}%`
          : '—',
        helper: pipelineSummary.dueSoonCount > 0
          ? `${pipelineSummary.dueSoonCount} deadlines in 14 days`
          : 'No urgent deadlines',
        icon: Sliders,
        iconBg: 'bg-[#FEF3C7]',
        iconColor: 'text-[#D97706]'
      },
      {
        title: 'High Risk Deals',
        value: pipelineSummary.highRiskCount.toString(),
        helper: pipelineSummary.highRiskCount > 0 ? 'Requires attention' : 'All stable',
        icon: AlertCircle,
        iconBg: 'bg-[#FEE2E2]',
        iconColor: 'text-[#DC2626]'
      },
      {
        title: 'Avg Days In Stage',
        value: pipelineSummary.averageStageDays > 0
          ? `${Math.round(pipelineSummary.averageStageDays)} days`
          : '—',
        helper: 'Across active pipeline stages',
        icon: Clock,
        iconBg: 'bg-[#DBEAFE]',
        iconColor: 'text-[#1E40AF]'
      }
    ]
  ), [pipelineSummary]);

  const formatDeadline = useCallback((deadline?: string | null) => {
    if (!deadline) return '—';
    const parsed = new Date(deadline);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString();
  }, []);

  const renderMarkers = useCallback((map: any) => {
    if (!window.google) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    mapLocations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: location.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: location.color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 220px;">
            <h3 style="margin: 0 0 6px 0; color: #111827; font-size: 14px; font-weight: 600;">${location.name}</h3>
            <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">${location.location}</p>
            <p style="margin: 0 0 4px 0; color: #2563EB; font-size: 12px; font-weight: 600;">${location.stage} • ${location.sector}</p>
            <p style="margin: 0 0 4px 0; color: #10B981; font-size: 12px; font-weight: 600;">${location.projectValueDisplay}</p>
            <p style="margin: 0; color: #374151; font-size: 11px;">Match Score: ${Math.round(location.matchScore)}% | Risk: ${location.riskLabel}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [mapLocations]);

  useEffect(() => {
    const initGoogleMap = () => {
      if (!window.google || !mapRef.current) {
        return;
      }

      try {
        // Create map centered on Texas
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 6,
          center: { lat: 31.9686, lng: -99.9018 }, // Center of Texas
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry.fill',
              stylers: [{ color: '#f8f9fa' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e3f2fd' }]
            },
            {
              featureType: 'administrative.country',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#374151' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT,
          }
        });
        setMapLoading(false);
        setMapError(null);

      mapInstanceRef.current = map;
      renderMarkers(map);
       
      } catch (err) {
        setMapError('create failed. Please check the console for details.');
        setMapLoading(false);
      }
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        setMapError('Google Maps API key not found');
        setMapLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleMap();
      };
      script.onerror = (error) => {
        setMapError('Load failed Maps API. Please check your API key.');
        setMapLoading(false);
      };
      document.head.appendChild(script);
    } else {
      if (!mapInstanceRef.current) {
        initGoogleMap();
      } else {
        renderMarkers(mapInstanceRef.current);
      }
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [renderMarkers]);

  return (
    <div className="mx-8 my-6">
      
      <div className="grid grid-cols-12 gap-8 mb-8">
        
        <div className="col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pipelineCards.map((card) => (
            <div key={card.title} className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#161950]/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[#6B7280] text-sm font-medium font-['Inter']">{card.title}</div>
                <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform duration-200 ${card.iconBg}`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-[#111827] text-3xl sm:text-4xl font-bold font-['Inter'] leading-none">{card.value}</div>
                <div className="text-xs font-medium text-[#6B7280]">{card.helper}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-6">
          <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#111827] text-xl font-bold font-['Inter']">AI-Enhanced Geospatial Intelligence</h3>
              <div className="relative">
                <select 
                  value={selectedLayer}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  className="appearance-none px-4 py-2 bg-white rounded-lg border border-[#D1D5DB] text-[#374151] text-sm font-medium hover:border-[#9CA3AF] focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 transition-all cursor-pointer shadow-sm pr-8"
                >
                  <option value="all">All Layers</option>
                  <option value="opportunities">Opportunities</option>
                  <option value="offices">Our Offices</option>
                  <option value="competitors">Competitors</option>
                </select>
                <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              </div>
            </div>

            <div className="relative h-[320px] rounded-xl mb-6 overflow-hidden border border-[#E5E7EB] shadow-lg">
              
              <div 
                ref={mapRef}
                className="w-full h-full rounded-xl"
                style={{ minHeight: '320px' }}
              />

              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-[#161950]" />
                  <div className="text-sm font-semibold text-[#374151]">Texas Region</div>
                </div>
                <div className="text-xs text-[#6B7280]">{mapLocations.length} Active Opportunities</div>
              </div>

              {(mapLoading || mapError || !window.google) && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] flex items-center justify-center">
                  <div className="text-center p-6">
                    {mapError ? (
                      <>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <MapPin className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#374151] mb-2">Map Error</h3>
                        <p className="text-sm text-[#6B7280] mb-4 max-w-sm">{mapError}</p>
                        <button 
                          onClick={() => {
                            setMapLoading(true);
                            setMapError(null);
                            window.location.reload();
                          }}
                          className="px-4 py-2 bg-[#161950] text-white rounded-lg text-sm font-medium hover:bg-[#0f1440] transition-colors"
                        >
                          Retry
                        </button>
                      </>
                    ) : mapLoading ? (
                      <>
                        <div className="animate-spin w-8 h-8 border-4 border-[#161950] border-t-transparent rounded-full mx-auto mb-2"></div>
                        <div className="text-sm text-[#6B7280]">Loading Map...</div>
                        <div className="text-xs text-[#9CA3AF] mt-1">This may take a few seconds</div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-[#161950] rounded-xl flex items-center justify-center mx-auto mb-4">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#374151] mb-2">Initializing Map...</h3>
                        <div className="animate-spin w-6 h-6 border-2 border-[#161950] border-t-transparent rounded-full mx-auto mb-2"></div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#10B981] border-2 border-white shadow-sm"></div>
                  <span className="text-[#374151] text-sm font-medium">80%+ Win Probability</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#F59E0B] border-2 border-white shadow-sm"></div>
                  <span className="text-[#374151] text-sm font-medium">60-79% Win Probability</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#EF4444] border-2 border-white shadow-sm"></div>
                  <span className="text-[#374151] text-sm font-medium">Below 60% Win Probability</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#8B5CF6] border-2 border-white shadow-sm"></div>
                  <span className="text-[#374151] text-sm font-medium">90%+ AI Match Score</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#3B82F6] border-2 border-white shadow-sm"></div>
                  <span className="text-[#374151] text-sm font-medium">Our Offices</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#6B7280] border-2 border-white shadow-sm"></div>
                  <span className="text-[#374151] text-sm font-medium">Competitor Offices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
        
        <div className="px-8 py-6 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FAFAFA] to-[#F9FAFB]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#111827] text-2xl font-bold font-['Inter'] mb-2">AI-Enhanced Pipeline Management</h3>
              <p className="text-[#6B7280] text-base font-['Inter']">Track and manage your sales opportunities across different stages</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-5 py-3 bg-white rounded-xl border border-[#D1D5DB] flex items-center gap-2 hover:bg-[#F9FAFB] hover:border-[#9CA3AF] transition-all text-[#374151] text-sm font-semibold shadow-sm">
                <Sliders className="w-4 h-4" />
                Filters
              </button>
              <button className="px-5 py-3 bg-[#161950] text-white rounded-xl flex items-center gap-2 hover:bg-[#0f1440] hover:scale-105 transition-all text-sm font-semibold shadow-lg">
                <Eye className="w-4 h-4" />
                View All
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Opportunity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Stage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Sector</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Match Score</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Risk</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Deadline</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-6 w-6 text-[#161950] mr-2" />
                      <span className="text-[#6B7280]">Loading opportunities...</span>
                    </div>
                  </td>
                </tr>
              ) : transformedOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-[#6B7280]">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-[#D1D5DB]" />
                      <p className="text-lg font-medium mb-2">No opportunities in pipeline</p>
                      <p className="text-sm">Create opportunities to see them in your pipeline.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transformedOpportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    className="hover:bg-[#F8FAFC] transition-all duration-200 group cursor-pointer"
                    onClick={() => {
                      const opportunityId = opp.customId || opp.id;
                      navigate(`/module/opportunities/pipeline/${opportunityId}`);
                    }}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#161950] to-[#0f1440] rounded-xl flex items-center justify-center text-white font-bold text-sm mr-4 group-hover:scale-110 transition-transform duration-200">
                          {opp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#111827] group-hover:text-[#161950] transition-colors">{opp.name}</div>
                          <div className="text-xs text-[#6B7280]">ID: {opp.customId || opp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#EDE9FE] text-[#5B21B6] rounded-full">
                        {opp.stage}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#6B7280]" />
                        <span className="text-sm font-medium text-[#374151]">{opp.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#EFF6FF] text-[#1E40AF] rounded-full">
                        {opp.marketSector}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#111827]">{opp.projectValueDisplay}</div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      {opp.matchScore !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-[#E5E7EB] rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                opp.matchScore >= 80 ? 'bg-[#10B981]' :
                                opp.matchScore >= 60 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                              }`}
                              style={{ width: `${opp.matchScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-[#374151]">{formatMatchScore(opp.matchScore)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#6B7280]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getRiskBadgeClasses(opp.riskLabel)}`}>
                        {opp.riskLabel}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#374151]">{formatDeadline(opp.deadline)}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const opportunityId = opp.customId || opp.id;
                            navigate(`/module/opportunities/analysis?opportunityId=${opportunityId}`);
                          }}
                          className="text-[#161950] hover:text-[#0f1440] transition-all duration-200 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#EFF6FF] group/btn"
                        >
                          <span className="text-sm font-semibold">AI Insight</span>
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpportunityToDelete({ id: opp.id, name: opp.name });
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700 transition-all duration-200 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 group/delete"
                          title="Delete opportunity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Opportunity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{opportunityToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setOpportunityToDelete(null);
              }}
              disabled={deleteOpportunityMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (opportunityToDelete) {
                  try {
                    await deleteOpportunityMutation.mutateAsync(opportunityToDelete.id);
                    setDeleteConfirmOpen(false);
                    setOpportunityToDelete(null);
                  } catch (error) {
                    // Error is handled by the mutation hook
                  }
                }
              }}
              disabled={deleteOpportunityMutation.isPending}
            >
              {deleteOpportunityMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

PipelineManagementContent.displayName = 'PipelineManagementContent';
