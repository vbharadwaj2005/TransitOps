import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, AlertTriangle, Check, Gauge, DollarSign, Truck } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';

const Vehicles = () => {
  const { hasRole } = useContext(AuthContext);
  const isManager = hasRole(['Fleet Manager']);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [regNum, setRegNum] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Truck');
  const [maxLoad, setMaxLoad] = useState('');
  const [odometer, setOdometer] = useState('0');
  const [acqCost, setAcqCost] = useState('');
  const [status, setStatus] = useState('Available');

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (err) {
      setError('Failed to fetch vehicle list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setRegNum('');
    setModel('');
    setType('Truck');
    setMaxLoad('');
    setOdometer('0');
    setAcqCost('');
    setStatus('Available');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setEditingId(v.id);
    setRegNum(v.registration_number);
    setModel(v.model);
    setType(v.type);
    setMaxLoad(v.max_load_capacity.toString());
    setOdometer(v.odometer.toString());
    setAcqCost(v.acquisition_cost.toString());
    setStatus(v.status);
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/vehicles/${id}`);
      setSuccess('Vehicle deleted successfully.');
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      registration_number: regNum,
      model,
      type,
      max_load_capacity: parseFloat(maxLoad),
      odometer: parseFloat(odometer),
      acquisition_cost: parseFloat(acqCost),
      status
    };

    if (!regNum || !model || !maxLoad || !acqCost) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/vehicles/${editingId}`, payload);
        setSuccess('Vehicle updated successfully.');
      } else {
        await api.post('/vehicles', payload);
        setSuccess('Vehicle registered successfully.');
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle data.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Vehicle Registry</h2>
          <p className="text-muted-foreground mt-1 font-medium">Manage and track fleet assets, statuses, and specifications.</p>
        </div>
        {isManager && (
          <Button
            onClick={openAddModal}
            className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register Vehicle
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-fade-in">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm font-medium border border-emerald-500/20 animate-fade-in">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Vehicles Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground font-medium">Loading fleet information...</div>
        ) : vehicles.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-medium italic">
            No vehicles registered. Click "Register Vehicle" to add fleet assets.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v, index) => {
              const initials = v.registration_number.substring(0, 2).toUpperCase();
              
              return (
                <Card
                  key={v.id}
                  className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-in flex flex-col"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${v.registration_number}`} alt={v.registration_number} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    
                    {isManager && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(v)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{v.registration_number}</h3>
                      <p className="text-sm text-muted-foreground">{v.model} • {v.type}</p>
                    </div>

                    <div className="flex gap-2">
                      <Badge 
                        variant={v.status === 'Available' ? 'default' : (v.status === 'On Trip' ? 'secondary' : (v.status === 'In Shop' ? 'outline' : 'destructive'))}
                        className={v.status === 'In Shop' ? 'text-amber-500 border-amber-500/20' : ''}
                      >
                        {v.status}
                      </Badge>
                    </div>

                    <div className="pt-4 mt-auto border-t border-border space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Truck className="w-4 h-4"/> Max Load</span>
                        <span className="font-semibold">
                          {v.max_load_capacity.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Gauge className="w-4 h-4"/> Odometer</span>
                        <span className="font-mono">{v.odometer.toLocaleString()} km</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-4 h-4"/> Acq. Cost</span>
                        <span className="font-semibold text-emerald-500">${v.acquisition_cost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">
                {editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Registration No *
                  </label>
                  <Input
                    value={regNum}
                    onChange={(e) => setRegNum(e.target.value)}
                    placeholder="REG-V05"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Model/Name *
                  </label>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ford Transit"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Vehicle Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Box Truck">Box Truck</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Max Capacity (kg) *
                  </label>
                  <Input
                    type="number"
                    value={maxLoad}
                    onChange={(e) => setMaxLoad(e.target.value)}
                    placeholder="500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Odometer (km)
                  </label>
                  <Input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Acquisition Cost ($) *
                  </label>
                  <Input
                    type="number"
                    value={acqCost}
                    onChange={(e) => setAcqCost(e.target.value)}
                    placeholder="25000"
                    min="0"
                    required
                  />
                </div>
              </div>

              {editingId && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? 'Save Changes' : 'Register Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
