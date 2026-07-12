import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, AlertTriangle, AlertOctagon, Check, MoreHorizontal, Phone, Award } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Pagination } from '../components/ui/pagination';

const Drivers = () => {
  const { hasRole } = useContext(AuthContext);
  const canModify = hasRole(['Fleet Manager', 'Safety Officer']);

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('Class A');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('100');
  const [status, setStatus] = useState('Available');

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/drivers?page=${page}&search=${encodeURIComponent(search)}`);
      setDrivers(response.data.data);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError('Failed to fetch driver list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrivers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setLicenseNumber('');
    setLicenseCategory('Class A');
    setLicenseExpiryDate('');
    setContactNumber('');
    setSafetyScore('100');
    setStatus('Available');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (d) => {
    setEditingId(d.id);
    setName(d.name);
    setLicenseNumber(d.license_number);
    setLicenseCategory(d.license_category);
    setLicenseExpiryDate(d.license_expiry_date.split('T')[0]);
    setContactNumber(d.contact_number);
    setSafetyScore(d.safety_score.toString());
    setStatus(d.status);
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/drivers/${id}`);
      setSuccess('Driver deleted successfully.');
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete driver.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      license_number: licenseNumber,
      license_category: licenseCategory,
      license_expiry_date: licenseExpiryDate,
      contact_number: contactNumber,
      safety_score: parseFloat(safetyScore),
      status
    };

    if (!name || !licenseNumber || !licenseExpiryDate || !contactNumber) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/drivers/${editingId}`, payload);
        setSuccess('Driver information updated successfully.');
      } else {
        await api.post('/drivers', payload);
        setSuccess('Driver registered successfully.');
      }
      setShowModal(false);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver details.');
    }
  };

  const isLicenseExpired = (expiryStr) => {
    const expiry = new Date(expiryStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry < today;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Driver Registry</h2>
          <p className="text-muted-foreground mt-1 font-medium">Manage driver credentials, safety records, and assignments.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input 
            placeholder="Search drivers..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-64"
          />
          {canModify && (
            <Button
              onClick={openAddModal}
              className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Register Driver
            </Button>
          )}
        </div>
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

      {/* Drivers List (Grid format based on team-content) */}
      <div className="mt-6">
        {loading ? (
          <div className="py-12 text-center text-muted-foreground font-medium">Loading operator database...</div>
        ) : drivers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-medium italic">
            No drivers registered. Click "Register Driver" to seed entries.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((d, index) => {
              const expired = isLicenseExpired(d.license_expiry_date);
              const isLowScore = d.safety_score < 70;
              const initials = d.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              
              return (
                <Card
                  key={d.id}
                  className="p-6 hover:shadow-lg transition-all duration-300 animate-slide-in flex flex-col"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${d.name}`} alt={d.name} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    
                    {canModify && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(d)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{d.name}</h3>
                      <p className="text-sm text-muted-foreground">{d.license_category} License</p>
                    </div>

                    <div className="flex gap-2">
                      <Badge 
                        variant={d.status === 'Available' ? 'default' : (d.status === 'On Trip' ? 'secondary' : 'destructive')}
                      >
                        {d.status}
                      </Badge>
                      {expired && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" /> Expired
                        </Badge>
                      )}
                    </div>

                    <div className="pt-4 mt-auto border-t border-border space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Award className="w-4 h-4"/> Safety Score</span>
                        <span className={`font-semibold ${isLowScore ? 'text-destructive' : (d.safety_score >= 85 ? 'text-emerald-500' : 'text-amber-500')}`}>
                          {d.safety_score} / 100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">License No.</span>
                        <span className="font-mono">{d.license_number}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Expiry</span>
                        <span>{new Date(d.license_expiry_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border mt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent border-input" onClick={() => window.location.href = `tel:${d.contact_number}`}>
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        {d.contact_number}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {!loading && drivers.length > 0 && (
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        )}
      </div>

      {/* CRUD Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">
                {editingId ? 'Edit Driver Info' : 'Register Operator'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    License Number *
                  </label>
                  <Input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="LIC-JOHN123"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    License Category
                  </label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    License Expiry Date *
                  </label>
                  <Input
                    type="date"
                    value={licenseExpiryDate}
                    onChange={(e) => setLicenseExpiryDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact Number *
                  </label>
                  <Input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+123456789"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Safety Score (0 - 100)
                  </label>
                  <Input
                    type="number"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? 'Save Changes' : 'Register Driver'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
