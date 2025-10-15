import { memo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sliders, Eye, MapPin, Users, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Opportunity } from '../../../types/opportunities';

interface PipelineOpportunity {
  id: string;
  custom_id?: string;
  name: string;
  city: string;
  type: string;
  projectValue: string;
  winProbability: string;
  relationshipGoal: string;
  riskLevel: string;
  crossSells: string;
}

type PipelineManagementContentProps = {
  opportunities: Opportunity[];
  isLoading: boolean;
}

// Declare global Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const PipelineManagementContent = memo(({ opportunities, isLoading }: PipelineManagementContentProps) => {
  const navigate = useNavigate();
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [hoveredOpportunity, setHoveredOpportunity] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const transformedOpportunities: PipelineOpportunity[] = opportunities.map((opp) => ({
    id: opp.id,
    custom_id: opp.custom_id,
    name: opp.project_name,
    city: opp.state || 'Unknown',
    type: opp.market_sector || 'General',
    projectValue: opp.project_value ? `$${(opp.project_value / 1000000).toFixed(1)}M` : 'TBD',
    winProbability: opp.match_score ? `${opp.match_score}%` : 'TBD',
    relationshipGoal: '75%', // Placeholder - would need additional API field
    riskLevel: opp.risk_level === 'high_risk' ? 'High' : opp.risk_level === 'medium_risk' ? 'Medium' : 'Low',
    crossSells: 'N/A', // Placeholder - would need additional API field
  }));

  const mapLocations = transformedOpportunities.map((opp, index) => {
    const baseCoords = [
      { lat: 30.2672, lng: -97.7431 }, // Austin
      { lat: 32.7767, lng: -96.7970 }, // Dallas
      { lat: 29.7604, lng: -95.3698 }, // Houston
    ];
    const coord = baseCoords[index % baseCoords.length];
    
    let color = '#10B981'; // Green for low risk
    if (opp.riskLevel === 'Medium') color = '#F59E0B'; // Yellow
    if (opp.riskLevel === 'High') color = '#EF4444'; // Red
    
    return {
      id: opp.id,
      name: opp.name,
      city: opp.city,
      lat: coord.lat + (Math.random() - 0.5) * 0.1, // Add some variation
      lng: coord.lng + (Math.random() - 0.5) * 0.1,
      winProbability: parseInt(opp.winProbability.replace('%', '')) || 0,
      projectValue: parseFloat(opp.projectValue.replace(/[$,M]/g, '')) || 0,
      type: opp.type,
      color
    };
  });

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

      // Create markers for each location
      mapLocations.forEach((location) => {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
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

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${location.name}</h3>
              <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 12px;">${location.city}</p>
              <p style="margin: 0 0 4px 0; color: #10B981; font-size: 12px; font-weight: 600;">$${location.projectValue}M • ${location.winProbability}% win</p>
              <p style="margin: 0; color: #374151; font-size: 11px;">Type: ${location.type}</p>
            </div>
          `
        });

        // Add click listener to marker
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      });
      
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
      initGoogleMap();
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  return (
    <div className="mx-8 my-6">
      
      <div className="grid grid-cols-12 gap-8 mb-8">
        
        <div className="col-span-6 grid grid-cols-2 gap-6">
          
          <div className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#4338CA]/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#6B7280] text-sm font-medium font-['Inter']">Total Opportunities</div>
              <div className="p-2 bg-[#EFF6FF] rounded-lg group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-5 h-5 text-[#2563EB]" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-[#111827] text-4xl font-bold font-['Inter']">8</div>
              <div className="px-2 py-1 bg-[#DEF7EC] rounded-md text-[#03543F] text-xs font-semibold mb-1">
                +3 this week
              </div>
            </div>
          </div>

          
          <div className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#4338CA]/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#6B7280] text-sm font-medium font-['Inter']">Gross Pipeline Value</div>
              <div className="p-2 bg-[#F0FDF4] rounded-lg group-hover:scale-110 transition-transform duration-200">
                <Users className="w-5 h-5 text-[#16A34A]" />
              </div>
            </div>
            <div className="text-[#111827] text-4xl font-bold font-['Inter']">$127.8 M</div>
          </div>

          
          <div className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#4338CA]/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#6B7280] text-sm font-medium font-['Inter']">Created This week</div>
              <div className="p-2 bg-[#FEF3C7] rounded-lg group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-5 h-5 text-[#92400E]" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-[#111827] text-4xl font-bold font-['Inter']">12</div>
              <div className="px-2 py-1 bg-[#FDE8E8] rounded-md text-[#9B1C1C] text-xs font-semibold mb-1">
                -10%
              </div>
            </div>
          </div>

          
          <div className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#4338CA]/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#6B7280] text-sm font-medium font-['Inter']">Average Win Probability</div>
              <div className="p-2 bg-[#FEF3C7] rounded-lg group-hover:scale-110 transition-transform duration-200">
                <AlertCircle className="w-5 h-5 text-[#92400E]" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-[#111827] text-4xl font-bold font-['Inter']">67%</div>
              <div className="px-2 py-1 bg-[#FEF3C7] rounded-md text-[#92400E] text-xs font-semibold mb-1">
                +2% this week
              </div>
            </div>
          </div>

          
          <div className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#4338CA]/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#6B7280] text-sm font-medium font-['Inter']">High Risk Alert</div>
              <div className="p-2 bg-[#FEE2E2] rounded-lg group-hover:scale-110 transition-transform duration-200">
                <AlertCircle className="w-5 h-5 text-[#DC2626]" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-[#111827] text-4xl font-bold font-['Inter']">2</div>
              <div className="px-2 py-1 bg-[#FDE8E8] rounded-md text-[#9B1C1C] text-xs font-semibold mb-1">
                Require immediate action
              </div>
            </div>
          </div>

          
          <div className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-lg hover:border-[#4338CA]/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#6B7280] text-sm font-medium font-['Inter']">Due for Booking</div>
              <div className="p-2 bg-[#F0FDF4] rounded-lg group-hover:scale-110 transition-transform duration-200">
                <MapPin className="w-5 h-5 text-[#16A34A]" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-[#111827] text-4xl font-bold font-['Inter']">8</div>
              <div className="px-2 py-1 bg-[#DEF7EC] rounded-md text-[#03543F] text-xs font-semibold mb-1">
                +3 this week
              </div>
            </div>
          </div>
        </div>

        
        <div className="col-span-6">
          <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#111827] text-xl font-bold font-['Inter']">AI-Enhanced Geospatial Intelligence</h3>
              <div className="relative">
                <select 
                  value={selectedLayer}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  className="appearance-none px-4 py-2 bg-white rounded-lg border border-[#D1D5DB] text-[#374151] text-sm font-medium hover:border-[#9CA3AF] focus:border-[#4338CA] focus:ring-2 focus:ring-[#4338CA]/20 transition-all cursor-pointer shadow-sm pr-8"
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
                  <MapPin className="w-4 h-4 text-[#4338CA]" />
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
                          className="px-4 py-2 bg-[#4338CA] text-white rounded-lg text-sm font-medium hover:bg-[#3730A3] transition-colors"
                        >
                          Retry
                        </button>
                      </>
                    ) : mapLoading ? (
                      <>
                        <div className="animate-spin w-8 h-8 border-4 border-[#4338CA] border-t-transparent rounded-full mx-auto mb-2"></div>
                        <div className="text-sm text-[#6B7280]">Loading Map...</div>
                        <div className="text-xs text-[#9CA3AF] mt-1">This may take a few seconds</div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-[#4338CA] rounded-xl flex items-center justify-center mx-auto mb-4">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#374151] mb-2">Initializing Map...</h3>
                        <div className="animate-spin w-6 h-6 border-2 border-[#4338CA] border-t-transparent rounded-full mx-auto mb-2"></div>
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
              <button className="px-5 py-3 bg-[#4338CA] text-white rounded-xl flex items-center gap-2 hover:bg-[#3730A3] hover:scale-105 transition-all text-sm font-semibold shadow-lg">
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">City</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Project Value</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Win Probability</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Relationship Goal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Risk Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Cross Sells</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-[#374151] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F1F5F9]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-6 w-6 text-[#4338CA] mr-2" />
                      <span className="text-[#6B7280]">Loading opportunities...</span>
                    </div>
                  </td>
                </tr>
              ) : transformedOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
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
              const opportunityId = opp.custom_id || opp.id;
              navigate(`/module/opportunities/pipeline/${opportunityId}`);
            }}
                >
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4338CA] to-[#3730A3] rounded-xl flex items-center justify-center text-white font-bold text-sm mr-4 group-hover:scale-110 transition-transform duration-200">
                        {opp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#111827] group-hover:text-[#4338CA] transition-colors">{opp.name}</div>
                        <div className="text-xs text-[#6B7280]">ID: {opp.custom_id || opp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#6B7280]" />
                      <span className="text-sm font-medium text-[#374151]">{opp.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#EFF6FF] text-[#1E40AF] rounded-full">
                      {opp.type}
                    </span>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="text-sm font-bold text-[#111827]">{opp.projectValue}</div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#E5E7EB] rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            parseInt(opp.winProbability) >= 80 ? 'bg-[#10B981]' :
                            parseInt(opp.winProbability) >= 60 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                          }`}
                          style={{ width: `${opp.winProbability}` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-[#374151]">{opp.winProbability}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#E5E7EB] rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-[#4338CA]"
                          style={{ width: `${opp.relationshipGoal}` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-[#374151]">{opp.relationshipGoal}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                      opp.riskLevel === 'Low' ? 'bg-[#DEF7EC] text-[#03543F]' :
                      opp.riskLevel === 'Medium' ? 'bg-[#FEF3C7] text-[#92400E]' :
                      'bg-[#FDE8E8] text-[#9B1C1C]'
                    }`}>
                      {opp.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#F3E8FF] text-[#7C3AED] rounded-full">
                      {opp.crossSells}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const opportunityId = opp.custom_id || opp.id;
                  navigate(`/module/opportunities/analysis?opportunityId=${opportunityId}`);
                }}
                      className="text-[#4338CA] hover:text-[#3730A3] transition-all duration-200 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#EFF6FF] group/btn"
                    >
                      <span className="text-sm font-semibold">AI Insight</span>
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

PipelineManagementContent.displayName = 'PipelineManagementContent';
