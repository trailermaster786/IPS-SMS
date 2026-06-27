"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Bus,
  Route,
  Users,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Clock,
  UserPlus,
  X,
  Car,
} from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  capacity: number;
  driverName: string | null;
  driverPhone: string | null;
  type: string;
  _count: { routes: number };
}

interface RouteItem {
  id: string;
  name: string;
  vehicleId: string;
  stops: string;
  departureTime: string;
  arrivalTime: string;
  vehicle: Vehicle;
  _count: { studentRoutes: number };
}

interface Student {
  id: string;
  userId: string;
  admissionNumber: string;
  user: { fullName: string };
}

export default function TransportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<"vehicles" | "routes">("vehicles");
  const [isLoading, setIsLoading] = useState(true);

  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);

  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    plateNumber: "",
    capacity: "",
    driverName: "",
    driverPhone: "",
    type: "Bus",
  });

  const [routeForm, setRouteForm] = useState({
    name: "",
    vehicleId: "",
    stops: "",
    departureTime: "",
    arrivalTime: "",
  });

  const [assignForm, setAssignForm] = useState({
    studentId: "",
    routeId: "",
    stopName: "",
  });

  useEffect(() => {
    if (session && session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehicleRes, routeRes, studentRes] = await Promise.all([
        fetch("/api/admin/transport/vehicles"),
        fetch("/api/admin/transport/routes"),
        fetch("/api/admin/students"),
      ]);

      if (vehicleRes.ok) setVehicles(await vehicleRes.json());
      if (routeRes.ok) setRoutes(await routeRes.json());

      if (studentRes.ok) {
        const studentList = await studentRes.json();
        setStudents(
          studentList.map((s: any) => ({
            id: s.id,
            userId: s.userId,
            admissionNumber: s.admissionNumber,
            user: { fullName: s.user.fullName },
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch transport data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalStudentsOnRoutes = routes.reduce((acc, r) => acc + r._count.studentRoutes, 0);
  const totalCapacity = vehicles.reduce((acc, v) => acc + v.capacity, 0);
  const availableSeats = totalCapacity - totalStudentsOnRoutes;

  const resetVehicleForm = () => {
    setVehicleForm({ name: "", plateNumber: "", capacity: "", driverName: "", driverPhone: "", type: "Bus" });
    setEditingVehicle(null);
  };

  const resetRouteForm = () => {
    setRouteForm({ name: "", vehicleId: "", stops: "", departureTime: "", arrivalTime: "" });
    setEditingRoute(null);
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingVehicle
        ? `/api/admin/transport/vehicles/${editingVehicle.id}`
        : "/api/admin/transport/vehicles";
      const method = editingVehicle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleForm),
      });

      if (response.ok) {
        toast({
          title: editingVehicle ? "Vehicle updated" : "Vehicle created",
          description: `${vehicleForm.name} has been ${editingVehicle ? "updated" : "added"} successfully.`,
        });
        setVehicleDialogOpen(false);
        resetVehicleForm();
        fetchData();
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error || "Something went wrong", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save vehicle", variant: "destructive" });
    }
  };

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRoute
        ? `/api/admin/transport/routes/${editingRoute.id}`
        : "/api/admin/transport/routes";
      const method = editingRoute ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeForm),
      });

      if (response.ok) {
        toast({
          title: editingRoute ? "Route updated" : "Route created",
          description: `${routeForm.name} has been ${editingRoute ? "updated" : "created"} successfully.`,
        });
        setRouteDialogOpen(false);
        resetRouteForm();
        fetchData();
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error || "Something went wrong", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save route", variant: "destructive" });
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/transport/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignForm),
      });

      if (response.ok) {
        toast({ title: "Student assigned", description: "Student has been assigned to the route." });
        setAssignDialogOpen(false);
        setAssignForm({ studentId: "", routeId: "", stopName: "" });
        fetchData();
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error || "Something went wrong", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to assign student", variant: "destructive" });
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      const response = await fetch(`/api/admin/transport/vehicles/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast({ title: "Vehicle deleted" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete vehicle", variant: "destructive" });
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      const response = await fetch(`/api/admin/transport/routes/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast({ title: "Route deleted" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete route", variant: "destructive" });
    }
  };

  if (session?.user?.role !== "ADMIN") return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
            Transport Management
          </h1>
          <p className="text-gray-500 mt-1">Manage vehicles, routes, and student assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Total Vehicles", value: vehicles.length, icon: Bus, gradient: "from-emerald-500 to-teal-600" },
          { label: "Total Routes", value: routes.length, icon: Route, gradient: "from-blue-500 to-indigo-600" },
          { label: "Students on Routes", value: totalStudentsOnRoutes, icon: Users, gradient: "from-violet-500 to-purple-600" },
          { label: "Available Seats", value: availableSeats, icon: Car, gradient: "from-amber-500 to-orange-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("vehicles")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "vehicles"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Vehicles
        </button>
        <button
          onClick={() => setActiveTab("routes")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "routes"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Routes
        </button>
      </div>

      {activeTab === "vehicles" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={vehicleDialogOpen}
              onOpenChange={(open) => {
                setVehicleDialogOpen(open);
                if (!open) resetVehicleForm();
              }}
            >
              <DialogTrigger render={<Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 rounded-xl px-5 h-11" />}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </DialogTrigger>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleVehicleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="v-name" className="text-sm font-medium text-gray-700">Vehicle Name</Label>
                    <Input
                      id="v-name"
                      placeholder="e.g. School Bus 1"
                      value={vehicleForm.name}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-plate" className="text-sm font-medium text-gray-700">Plate Number</Label>
                    <Input
                      id="v-plate"
                      placeholder="e.g. ABC-1234"
                      value={vehicleForm.plateNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-capacity" className="text-sm font-medium text-gray-700">Capacity</Label>
                    <Input
                      id="v-capacity"
                      type="number"
                      placeholder="e.g. 40"
                      value={vehicleForm.capacity}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-driver" className="text-sm font-medium text-gray-700">Driver Name</Label>
                    <Input
                      id="v-driver"
                      placeholder="e.g. John Doe"
                      value={vehicleForm.driverName}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-phone" className="text-sm font-medium text-gray-700">Driver Phone</Label>
                    <Input
                      id="v-phone"
                      placeholder="e.g. +1234567890"
                      value={vehicleForm.driverPhone}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="v-type" className="text-sm font-medium text-gray-700">Type</Label>
                    <Select value={vehicleForm.type} onValueChange={(val) => setVehicleForm({ ...vehicleForm, type: val ?? "Bus" })}>
                      <SelectTrigger className="h-11 rounded-xl w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bus">Bus</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Minibus">Minibus</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    {editingVehicle ? "Update Vehicle" : "Create Vehicle"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white/80">
              <CardContent className="p-12 text-center">
                <Bus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No vehicles yet</p>
                <p className="text-sm text-gray-400">Add your first vehicle to get started</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Routes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">{vehicle.plateNumber}</Badge>
                        </TableCell>
                        <TableCell>{vehicle.capacity}</TableCell>
                        <TableCell>{vehicle.driverName || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{vehicle.type}</Badge>
                        </TableCell>
                        <TableCell>{vehicle._count.routes}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setEditingVehicle(vehicle);
                                setVehicleForm({
                                  name: vehicle.name,
                                  plateNumber: vehicle.plateNumber,
                                  capacity: String(vehicle.capacity),
                                  driverName: vehicle.driverName || "",
                                  driverPhone: vehicle.driverPhone || "",
                                  type: vehicle.type,
                                });
                                setVehicleDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "routes" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Dialog
              open={assignDialogOpen}
              onOpenChange={(open) => {
                setAssignDialogOpen(open);
                if (!open) setAssignForm({ studentId: "", routeId: "", stopName: "" });
              }}
            >
              <DialogTrigger render={<Button variant="outline" className="rounded-xl px-5 h-11" />}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Student
              </DialogTrigger>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Assign Student to Route</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAssignSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Select Student</Label>
                    <Select value={assignForm.studentId} onValueChange={(val) => setAssignForm({ ...assignForm, studentId: val ?? "" })}>
                      <SelectTrigger className="h-11 rounded-xl w-full">
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.user.fullName} ({student.admissionNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Select Route</Label>
                    <Select value={assignForm.routeId} onValueChange={(val) => setAssignForm({ ...assignForm, routeId: val ?? "" })}>
                      <SelectTrigger className="h-11 rounded-xl w-full">
                        <SelectValue placeholder="Choose a route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.name} ({route.vehicle.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="a-stop" className="text-sm font-medium text-gray-700">Stop Name</Label>
                    <Input
                      id="a-stop"
                      placeholder="e.g. Main Street Corner"
                      value={assignForm.stopName}
                      onChange={(e) => setAssignForm({ ...assignForm, stopName: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    Assign Student
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog
              open={routeDialogOpen}
              onOpenChange={(open) => {
                setRouteDialogOpen(open);
                if (!open) resetRouteForm();
              }}
            >
              <DialogTrigger render={<Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 rounded-xl px-5 h-11" />}>
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </DialogTrigger>
              <DialogContent className="rounded-2xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {editingRoute ? "Edit Route" : "Add New Route"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRouteSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="r-name" className="text-sm font-medium text-gray-700">Route Name</Label>
                    <Input
                      id="r-name"
                      placeholder="e.g. Morning Route - North"
                      value={routeForm.name}
                      onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Vehicle</Label>
                    <Select value={routeForm.vehicleId} onValueChange={(val) => setRouteForm({ ...routeForm, vehicleId: val ?? "" })}>
                      <SelectTrigger className="h-11 rounded-xl w-full">
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} ({v.plateNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-stops" className="text-sm font-medium text-gray-700">Stops (comma-separated)</Label>
                    <Input
                      id="r-stops"
                      placeholder="e.g. Main St, Oak Ave, School Gate"
                      value={routeForm.stops}
                      onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })}
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="r-depart" className="text-sm font-medium text-gray-700">Departure Time</Label>
                      <Input
                        id="r-depart"
                        type="time"
                        value={routeForm.departureTime}
                        onChange={(e) => setRouteForm({ ...routeForm, departureTime: e.target.value })}
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="r-arrive" className="text-sm font-medium text-gray-700">Arrival Time</Label>
                      <Input
                        id="r-arrive"
                        type="time"
                        value={routeForm.arrivalTime}
                        onChange={(e) => setRouteForm({ ...routeForm, arrivalTime: e.target.value })}
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    {editingRoute ? "Update Route" : "Create Route"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : routes.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white/80">
              <CardContent className="p-12 text-center">
                <Route className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No routes yet</p>
                <p className="text-sm text-gray-400">Create your first route to get started</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm animate-fade-in-up">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Stops</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Arrival</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell>{route.vehicle.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[200px]">{route.stops}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {route.departureTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {route.arrivalTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{route._count.studentRoutes}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setEditingRoute(route);
                                setRouteForm({
                                  name: route.name,
                                  vehicleId: route.vehicleId,
                                  stops: route.stops,
                                  departureTime: route.departureTime,
                                  arrivalTime: route.arrivalTime,
                                });
                                setRouteDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteRoute(route.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
