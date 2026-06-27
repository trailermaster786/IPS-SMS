"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, Clock, Route, User } from "lucide-react";

interface StudentRouteRecord {
  id: string;
  stopName: string | null;
  route: {
    id: string;
    name: string;
    stops: string;
    departureTime: string;
    arrivalTime: string;
    vehicle: {
      name: string;
      plateNumber: string;
      driverName: string | null;
      driverPhone: string | null;
      type: string;
    };
  };
}

export default function StudentTransportPage() {
  const [assignedRoutes, setAssignedRoutes] = useState<StudentRouteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransport();
  }, []);

  const fetchTransport = async () => {
    try {
      const response = await fetch("/api/student/transport");
      if (response.ok) {
        setAssignedRoutes(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch transport:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
          My Transport
        </h1>
        <p className="text-gray-500 mt-1">View your assigned route and vehicle details</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : assignedRoutes.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-12 text-center">
            <Bus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No route assigned</p>
            <p className="text-sm text-gray-400 mt-1">
              You haven&apos;t been assigned to any transport route yet.
              <br />
              Contact the admin to get assigned.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 stagger-children">
          {assignedRoutes.map((sr) => (
            <Card key={sr.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{sr.route.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {sr.route.stops}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {sr.route.vehicle.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Bus className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="text-sm font-medium text-gray-900">{sr.route.vehicle.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{sr.route.vehicle.plateNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Schedule</p>
                      <p className="text-sm font-medium text-gray-900">
                        {sr.route.departureTime} — {sr.route.arrivalTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Your Stop</p>
                      <p className="text-sm font-medium text-gray-900">
                        {sr.stopName || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {sr.route.vehicle.driverName && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>Driver: <span className="font-medium text-gray-700">{sr.route.vehicle.driverName}</span></span>
                    {sr.route.vehicle.driverPhone && (
                      <span className="text-gray-400">• {sr.route.vehicle.driverPhone}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
