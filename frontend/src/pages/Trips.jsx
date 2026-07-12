import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Plus,
  X,
  AlertTriangle,
  Check,
  ArrowRight,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Map,
  Truck
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Pagination } from '../components/ui/pagination';

const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Trips = () => {
  const { user, hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);
  const isDriver = hasRole(['Driver']);
  const canModifyStatus = isManager || isDriver;

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form State (New Trip)
  const [showAddModal, setShowAddModal] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [revenue, setRevenue] = useState('');

  // Complete Trip Form State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [finalOdo, setFinalOdo] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [selectedTripCurrentOdo, setSelectedTripCurrentOdo] = useState(0);

  const [currentDate] = useState(new Date());
  const today = currentDate.getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchTripsAndAssets = async () => {
    setLoading(true);
    try {
      const tripRes = await api.get(`/trips?page=${page}&search=${encodeURIComponent(search)}`);
      setTrips(tripRes.data.data);
      setTotalPages(tripRes.data.pages);

      const vehicleRes = await api.get('/vehicles');
      setVehicles(vehicleRes.data);

      const driverRes = await api.get('/drivers');
      setDrivers(driverRes.data);
    } catch (err) {
      setError('Failed to fetch data from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTripsAndAssets();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available');

  const openAddModal = () => {
    setSource('');
    setDestination('');
    setVehicleId('');
    setDriverId('');
    setCargoWeight('');
    setPlannedDistance('');
    setRevenue('');
    setError('');
    setShowAddModal(true);
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const selectedVehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    const selectedDriver = drivers.find(d => d.id === parseInt(driverId));

    if (!selectedVehicle || !selectedDriver) {
      setError('Please select a valid vehicle and driver.');
      return;
    }

    if (parseFloat(cargoWeight) > selectedVehicle.max_load_capacity) {
      setError(`Cargo weight exceeds the vehicle max load capacity of ${selectedVehicle.max_load_capacity} kg.`);
      return;
    }

    const expiry = new Date(selectedDriver.license_expiry_date);
    if (expiry < new Date()) {
      setError('Cannot dispatch: Selected driver license has expired.');
      return;
    }

    try {
      await api.post('/trips', {
        source,
        destination,
        vehicle_id: parseInt(vehicleId),
        driver_id: parseInt(driverId),
        cargo_weight: parseFloat(cargoWeight),
        planned_distance: parseFloat(plannedDistance),
        revenue: parseFloat(revenue || 0)
      });
      setSuccess('Trip schedule drafted successfully.');
      setShowAddModal(false);
      fetchTripsAndAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip planning entry.');
    }
  };

  const handleDispatch = async (tripId) => {
    setError('');
    setSuccess('');
    try {
      await api.post(`/trips/${tripId}/dispatch`);
      setSuccess('Trip dispatched successfully. Vehicle and driver status set to On Trip.');
      fetchTripsAndAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch trip.');
    }
  };

  const handleCancel = async (tripId) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/trips/${tripId}/cancel`);
      setSuccess('Trip cancelled successfully.');
      fetchTripsAndAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel trip.');
    }
  };

  const openCompleteModal = (trip) => {
    setSelectedTripId(trip.id);
    setSelectedTripCurrentOdo(trip.vehicle_odometer || 0);
    setFinalOdo((trip.vehicle_odometer + trip.planned_distance).toString());
    setFuelConsumed('');
    setFuelCost('');
    setError('');
    setShowCompleteModal(true);
  };

  const handleCompleteTrip = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const odoVal = parseFloat(finalOdo);
    if (odoVal <= selectedTripCurrentOdo) {
      setError(`Final odometer must be strictly greater than start odometer of ${selectedTripCurrentOdo} km.`);
      return;
    }

    try {
      await api.post(`/trips/${selectedTripId}/complete`, {
        final_odometer: odoVal,
        fuel_consumed: parseFloat(fuelConsumed || 0),
        fuel_cost: parseFloat(fuelCost || 0)
      });
      setSuccess('Trip completed. Odometer, Fuel logs, and Expense ledgers updated successfully.');
      setShowCompleteModal(false);
      fetchTripsAndAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete trip.');
    }
  };

  const activeTrips = trips.filter(t => t.status === 'Dispatched' || t.status === 'Draft');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold min-w-[120px] text-center">{monthName}</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {isManager && (
          <Button
            onClick={openAddModal}
            className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Plan Trip
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm font-medium border border-emerald-500/20">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Calendar & Active Trips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 animate-slide-in-up shadow-lg">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => (
              <button
                key={day}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                  transition-all duration-300 hover:scale-110 border border-transparent
                  ${
                    day === today
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "hover:bg-secondary hover:border-border text-foreground"
                  }
                  ${day < today ? "opacity-40" : ""}
                `}
              >
                {day}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 animate-slide-in-up shadow-lg" style={{ animationDelay: '100ms' }}>
          <h3 className="font-semibold text-lg mb-4">Active & Planned Trips</h3>
          <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2">
            {activeTrips.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-8">No active trips for today.</p>
            ) : (
              activeTrips.map((trip, index) => {
                const isDispatched = trip.status === 'Dispatched';
                const color = isDispatched ? 'bg-indigo-500' : 'bg-slate-400';
                return (
                  <div
                    key={trip.id}
                    className="p-3 rounded-lg border border-border hover:shadow-md transition-all duration-300 cursor-pointer animate-slide-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-12 rounded-full ${color}`} />
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-sm flex items-center gap-1.5">
                          {trip.source} <ArrowRight className="w-3 h-3 text-muted-foreground" /> {trip.destination}
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium">{trip.driver_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={isDispatched ? "default" : "secondary"} className="text-[10px]">
                            {trip.status}
                          </Badge>
                          <span className="text-[10px] flex items-center gap-1 text-muted-foreground">
                            <Truck className="w-3 h-3" /> {trip.vehicle_reg}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Trips Registry Data Table */}
      <Card className="p-6 mt-6 shadow-lg animate-slide-in-up" style={{ animationDelay: '300ms' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <h3 className="font-semibold text-lg">All Trips Registry</h3>
          <Input 
            placeholder="Search trips (source/dest)..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-64"
          />
        </div>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground font-medium">Loading scheduled dispatches...</div>
        ) : trips.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-medium italic">
            No trips scheduled. Click "Plan Trip" to assign drivers and vehicles.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Cargo Weight</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{t.source}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        <span className="font-semibold text-foreground">{t.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{t.vehicle_reg}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t.vehicle_model}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-foreground">{t.driver_name}</p>
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">{t.cargo_weight} kg</TableCell>
                    <TableCell className="font-medium text-muted-foreground">{t.planned_distance} km</TableCell>
                    <TableCell className="font-mono font-bold text-emerald-500">${t.revenue?.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={`
                          ${t.status === 'Draft' ? 'bg-secondary text-secondary-foreground border-border' : ''}
                          ${t.status === 'Dispatched' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                          ${t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                          ${t.status === 'Cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}
                        `}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {t.status === 'Draft' && isManager && (
                          <Button
                            size="sm"
                            onClick={() => handleDispatch(t.id)}
                            className="h-7 text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                          >
                            <Play className="w-3 h-3 mr-1" /> Dispatch
                          </Button>
                        )}
                        {t.status === 'Dispatched' && canModifyStatus && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openCompleteModal(t)}
                              className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancel(t.id)}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {(t.status === 'Completed' || t.status === 'Cancelled') && (
                          <span className="text-xs font-medium text-muted-foreground italic">No actions</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {!loading && trips.length > 0 && (
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        )}
      </Card>

      {/* PLAN TRIP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">Plan New Dispatch</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateTrip} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source *</label>
                  <Input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Warehouse A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination *</label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Retail Outlet B"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assign Vehicle *</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Available Vehicle...</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} - {v.model} (Max Load: {v.max_load_capacity}kg)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assign Driver *</label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Available Driver...</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (License: {d.license_category}, Expiry: {new Date(d.license_expiry_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cargo (kg) *</label>
                  <Input
                    type="number"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    placeholder="200"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dist (km) *</label>
                  <Input
                    type="number"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    placeholder="120"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rev ($) *</label>
                  <Input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    placeholder="400"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Draft Trip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP LOGS MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">Complete Trip Metrics</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCompleteModal(false)} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCompleteTrip} className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium leading-relaxed">
                Completing this trip requires logging operational costs. A fuel log will be auto-generated along with corresponding expense ledgers.
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Final Odometer (km) * (Start: {selectedTripCurrentOdo})
                </label>
                <Input
                  type="number"
                  value={finalOdo}
                  onChange={(e) => setFinalOdo(e.target.value)}
                  placeholder={`${selectedTripCurrentOdo + 100}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fuel Consumed (L) *</label>
                  <Input
                    type="number"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    placeholder="15"
                    min="0.1"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fuel Cost ($) *</label>
                  <Input
                    type="number"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder="30"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
                <Button variant="outline" type="button" onClick={() => setShowCompleteModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Complete Trip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
