import React, { useEffect, useRef } from "react";
import { Business } from "../types";
import { MapPin } from "lucide-react";

interface MapContainerProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onMarkerClick: (business: Business) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  businesses,
  selectedBusiness,
  onMarkerClick,
}) => {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Map
  useEffect(() => {
    if (containerRef.current && !mapRef.current && (window as any).L) {
      const L = (window as any).L;

      // Default view (approx center of US or generic) if no businesses
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([39.8283, -98.5795], 4);
      
      // Dark Matter Tiles (CartoDB) - Perfect for "Midnight" theme
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      // Add Zoom Control bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
    }

    return () => {
       // Cleanup if needed
    }
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapRef.current || !(window as any).L) return;
    const L = (window as any).L;
    const map = mapRef.current;

    // Clear existing markers not in current list (or just clear all for simplicity in this demo)
    Object.values(markersRef.current).forEach((marker: any) => marker.remove());
    markersRef.current = {};

    if (businesses.length === 0) return;

    const bounds = L.latLngBounds([]);

    businesses.forEach((biz) => {
      // Create custom icon
      const isSelected = selectedBusiness?.id === biz.id;
      
      const iconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-4 h-4 rounded-full ${isSelected ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]' : 'bg-slate-400'} transition-all duration-300"></div>
          ${isSelected ? '<div class="absolute w-8 h-8 bg-cyan-500/30 rounded-full animate-ping"></div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "bg-transparent border-none",
        html: iconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([biz.lat, biz.lng], { icon: customIcon })
        .addTo(map)
        .on("click", () => {
          onMarkerClick(biz);
        });

      // Bind Popup
      const popupContent = `
        <div class="p-1 min-w-[200px]">
          <h3 class="font-bold text-slate-100 text-sm mb-1">${biz.name}</h3>
          <div class="flex items-center text-xs text-yellow-500 mb-2">
            ${"★".repeat(Math.round(biz.rating))}${"☆".repeat(5 - Math.round(biz.rating))}
            <span class="ml-1 text-slate-400">(${biz.rating})</span>
          </div>
          <p class="text-xs text-slate-300 italic border-l-2 border-cyan-500 pl-2">
            ${biz.salesPitch}
          </p>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        offset: [0, -10],
        closeButton: false,
        className: 'custom-popup'
      });

      markersRef.current[biz.id] = marker;
      bounds.extend([biz.lat, biz.lng]);
    });

    // Fit bounds if not a single selection fly-to
    if (!selectedBusiness) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

  }, [businesses]); // Don't depend on selectedBusiness for *creating* markers to avoid flicker, handle selection styling separately or smartly

  // Handle Selection (FlyTo)
  useEffect(() => {
    if (!mapRef.current || !selectedBusiness || !(window as any).L) return;
    const map = mapRef.current;
    
    // Fly to location
    map.flyTo([selectedBusiness.lat, selectedBusiness.lng], 16, {
      duration: 1.5,
      easeLinearity: 0.25
    });

    // Open popup
    const marker = markersRef.current[selectedBusiness.id];
    if (marker) {
      setTimeout(() => marker.openPopup(), 1500); // Open after fly animation
    }
    
    // Update icon styles for selection state
    Object.keys(markersRef.current).forEach(id => {
       const m = markersRef.current[id];
       const isSel = id === selectedBusiness.id;
       const L = (window as any).L;
       
       const iconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-4 h-4 rounded-full ${isSel ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]' : 'bg-slate-400'} transition-all duration-300"></div>
          ${isSel ? '<div class="absolute w-8 h-8 bg-cyan-500/30 rounded-full animate-ping"></div>' : ''}
        </div>
      `;
      
      const newIcon = L.divIcon({
        className: "bg-transparent border-none",
        html: iconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      
      m.setIcon(newIcon);
    });

  }, [selectedBusiness]);

  return <div ref={containerRef} className="w-full h-full bg-slate-900 z-0" />;
};

export default MapContainer;
