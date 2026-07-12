import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileDown,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Fuel,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Car,
  Activity
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const Analytics = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Sorting
  const [sortField, setSortField] = useState('roi');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/reports');
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch analytics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedReports = [...reports].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDownloadCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      'Vehicle ID',
      'Registration Number',
      'Model',
      'Type',
      'Status',
      'Distance Traveled (km)',
      'Fuel Consumed (Liters)',
      'Fuel Cost ($)',
      'Maintenance Cost ($)',
      'Total Operational Cost ($)',
      'Revenue ($)',
      'Fuel Efficiency (km/L)',
      'ROI (%)'
    ];

    const rows = reports.map((r) => [
      r.vehicle_id,
      `"${r.registration_number}"`,
      `"${r.model}"`,
      `"${r.type}"`,
      `"${r.status}"`,
      r.distance_traveled,
      r.fuel_consumed,
      r.fuel_cost,
      r.maintenance_cost,
      r.operational_cost,
      r.revenue,
      r.fuel_efficiency,
      (r.roi * 100).toFixed(2)
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `transitops_fleet_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate Aggregates
  const totalVehicles = reports.length;
  const totalRevenue = reports.reduce((acc, curr) => acc + curr.revenue, 0);
  const avgRoi = totalVehicles > 0 ? reports.reduce((acc, curr) => acc + curr.roi, 0) / totalVehicles : 0;
  const avgEfficiency = totalVehicles > 0 ? reports.reduce((acc, curr) => acc + curr.fuel_efficiency, 0) / totalVehicles : 0;

  const stats = [
    {
      title: "Total Tracked Assets",
      value: totalVehicles,
      change: "+12%",
      trend: "up",
      icon: Car,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Total Revenue",
      value: `$${(totalRevenue / 1000).toFixed(1)}k`,
      change: "+5.2%",
      trend: "up",
      icon: DollarSign,
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Average ROI",
      value: `${(avgRoi * 100).toFixed(1)}%`,
      change: "+1.1%",
      trend: "up",
      icon: Activity,
      color: "bg-indigo-500",
      textColor: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      title: "Avg Fuel Efficiency",
      value: `${avgEfficiency.toFixed(1)}`,
      subtitle: "km/L",
      change: "-0.2",
      trend: "down",
      icon: Fuel,
      color: "bg-amber-500",
      textColor: "text-amber-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  if (loading && reports.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-end mb-4">
          <div className="h-9 w-32 bg-muted rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-muted rounded-xl mt-6"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Actions */}
      <div className="flex justify-end">
        <Button
          onClick={handleDownloadCSV}
          disabled={reports.length === 0}
          variant="outline"
          className="h-9 text-sm transition-all duration-300 hover:shadow-md hover:scale-105 bg-transparent"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Export CSV Report
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: `${index * 100}ms` }}
            className={`bg-card text-foreground p-4 transition-all duration-500 ease-out animate-slide-in-up cursor-pointer ${
              hoveredCard === index ? "scale-105 shadow-2xl" : "shadow-lg"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
                </div>
                <h3 className="text-xs font-medium opacity-90">{stat.title}</h3>
              </div>
              <div
                className={`w-6 h-6 rounded-full bg-primary flex items-center justify-center transition-transform duration-300 ${
                  hoveredCard === index ? "rotate-45" : ""
                }`}
              >
                <ArrowUpRight className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2">
              {stat.value}
              {stat.subtitle && <span className="text-sm font-medium text-muted-foreground ml-1">{stat.subtitle}</span>}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium opacity-80">
              {stat.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-500" />
              )}
              <span className={stat.trend === "up" ? "text-emerald-500" : "text-rose-500"}>{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Reports Table */}
      <Card className="p-6 mt-6 shadow-lg animate-slide-in-up" style={{ animationDelay: '400ms' }}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Fleet Financial Performance</h3>
          <p className="text-sm text-muted-foreground">Comprehensive metrics on vehicle ROIs and costs.</p>
        </div>

        {reports.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-medium italic">
            No active fleet operations data found to generate reports.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="cursor-pointer" onClick={() => handleSort('registration_number')}>
                    <div className="flex items-center gap-1">Registration <ArrowUpDown className="w-3 h-3 text-muted-foreground" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-1">Type <ArrowUpDown className="w-3 h-3 text-muted-foreground" /></div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('distance_traveled')}>
                    <div className="flex items-center justify-end gap-1">Distance (km) <ArrowUpDown className="w-3 h-3 text-muted-foreground" /></div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('fuel_efficiency')}>
                    <div className="flex items-center justify-end gap-1">Efficiency (km/L) <ArrowUpDown className="w-3 h-3 text-muted-foreground" /></div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('operational_cost')}>
                    <div className="flex items-center justify-end gap-1">Op. Cost <ArrowUpDown className="w-3 h-3 text-muted-foreground" /></div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('revenue')}>
                    <div className="flex items-center justify-end gap-1">Revenue <ArrowUpDown className="w-3 h-3 text-muted-foreground" /></div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('roi')}>
                    <div className="flex items-center justify-end gap-1">ROI % <ArrowUpDown className="w-3 h-3 text-muted-foreground" /></div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReports.map((r) => {
                  const roiPercent = r.roi * 100;
                  const isHighRoi = roiPercent >= 15;
                  const isLowEfficiency = r.fuel_efficiency > 0 && r.fuel_efficiency < 3.5;

                  return (
                    <TableRow key={r.vehicle_id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-foreground">{r.registration_number}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{r.model}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">{r.type}</TableCell>
                      <TableCell className="text-right font-medium">{r.distance_traveled.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 font-medium">
                          <span>{r.fuel_efficiency.toFixed(2)}</span>
                          {isLowEfficiency && (
                            <Fuel className="w-3.5 h-3.5 text-amber-500" title="Low Fuel Efficiency Warning" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-muted-foreground">${r.operational_cost.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">${r.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 font-bold">
                          <span className={roiPercent < 0 ? 'text-destructive' : roiPercent > 0 ? 'text-emerald-500' : 'text-muted-foreground'}>
                            {roiPercent.toFixed(2)}%
                          </span>
                          {isHighRoi ? (
                            <TrendingUp className="w-3 h-3 text-emerald-500" title="High ROI Asset" />
                          ) : roiPercent < 0 ? (
                            <TrendingDown className="w-3 h-3 text-destructive" title="Negative ROI Warning" />
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Analytics;
