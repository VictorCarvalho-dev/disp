"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar as CalendarIcon, BarChart, Wifi, Link as LinkIcon, DivideSquare, Loader2 } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatCard } from './StatCard';
import { DashboardChart } from './DashboardChart';
import Cookies from "js-cookie";
import { postShots } from '@/app/_server-actions/dashboard';

export default function DashClient({ connections, totalConnections }) {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 6),
    to: new Date(),
  });
  const [period, setPeriod] = useState('7days');
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [statsData, setStatsData] = useState([
    {
      title: 'TOTAL DE DISPAROS',
      value: '0',
      change: '0%',
      icon: BarChart,
      changeColor: 'text-gray-500',
    },
    {
      title: 'MÉDIA POR DIA',
      value: '0',
      change: '0%',
      icon: DivideSquare,
      changeColor: 'text-gray-500',
    },
    {
      title: 'AGENDADOS',
      value: '0' ,
      change: '0%',
      icon: LinkIcon,
      changeColor: 'text-blue-500',
    },
    {
      title: 'CONEXÕES ATIVAS',
      value: connections,
      change: '0%',
      icon: Wifi,
      changeColor: 'text-green-500',
    },
  ]);

  
  const generateEmptyChartData = (startDate, endDate) => {
    const days = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    currentDate.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    while (currentDate <= end) {
      days.push({
        date: format(currentDate, 'dd/MM'),
        shots: 0,
        fullDate: new Date(currentDate)
      });
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      currentDate = nextDate;
    }
    
    return days;
  };

  const formatHourlyData = (hourlyData) => {
    return hourlyData.map(item => ({
      date: item.label, // This will be like '0h', '1h', etc.
      shots: Number(item.total) || 0,
      isHourly: true
    }));
  };

  const fetchData = useCallback(async (startDate, endDate) => {
    try {
      setIsLoading(true);
      
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      
      if (startDate < twoMonthsAgo) {
        startDate = twoMonthsAgo;
        setDateRange(prev => ({ ...prev, from: startDate }));
      }
      
      const isSameDay = startDate.toDateString() === endDate.toDateString();
      const start = startOfDay(startDate).toString();
      const end = endOfDay(endDate).toString();
      
      const response = await postShots(start, end);
      const { total, media, grafico, tabel, disparos } = response;
      
      let formattedChartData = [];
      
      if (isSameDay && grafico && grafico.length > 0 && grafico[0].label.includes('h')) {
        // Handle hourly data for single day selection
        formattedChartData = formatHourlyData(grafico);
      } else if (grafico && grafico.length > 0) {
        // Handle daily data for date range
        formattedChartData = grafico.map(item => {
          let dateValue;
          try {
            const [year, month, day] = item.label.split('-').map(Number);
            dateValue = new Date(year, month - 1, day);
            if (isNaN(dateValue.getTime())) {
              throw new Error('Invalid date');
            }
          } catch (e) {
            console.warn('Error parsing date:', item.label, e);
            dateValue = new Date();
          }
          
          return {
            date: format(dateValue, 'dd/MM'),
            shots: Number(item.total) || 0,
            fullDate: dateValue,
            isHourly: false
          };
        });
      } else {
        formattedChartData = generateEmptyChartData(startDate, endDate);
      }
      
      if (!isSameDay) {
        const expectedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        if (formattedChartData.length < expectedDays) {
          const existingDates = new Set(formattedChartData.map(d => d.date));
          let currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'dd/MM');
            if (!existingDates.has(dateStr)) {
              formattedChartData.push({
                date: dateStr,
                shots: 0,
                fullDate: new Date(currentDate),
                isHourly: false
              });
            }
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            currentDate = nextDate;
          }
          
          formattedChartData.sort((a, b) => 
            new Date(a.fullDate) - new Date(b.fullDate)
          );
        }
      }
      
      // Store table data
      if (tabel && Array.isArray(tabel)) {
        setTableData(tabel);
      } else {
        setTableData([]);
      }
      
      setStatsData([
        { 
          title: 'TOTAL DE DISPAROS',
          value: total.toLocaleString(),
          change: '0%',
          icon: BarChart,
          changeColor: 'text-gray-500',
        },
        { 
          title: 'MÉDIA POR DIA',
          value: media.toFixed(0),
          change: '0%',
          icon: DivideSquare,
          changeColor: 'text-gray-500',
        },
        { 
          title: 'AGENDADOS',
          value: disparos.toFixed(0),
          change: '0%',
          icon: DivideSquare,
          changeColor: 'text-gray-500',
        },
        ...statsData.slice(3)
      ]);
      
      setChartData(formattedChartData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateChange = (current, previous) => {
    if (previous === 0) return current === 0 ? '0%' : `+${current}%`;
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const handlePeriodChange = async (selectedPeriod) => {
    setPeriod(selectedPeriod);
    const toDate = new Date();
    let fromDate;

    if (selectedPeriod === '7days') {
      fromDate = subDays(toDate, 6);
    } else if (selectedPeriod === '14days') {
      fromDate = subDays(toDate, 13);
    } else if (selectedPeriod === '30days') {
      fromDate = subDays(toDate, 29);
    } else {
      return;
    }

    setDateRange({ from: fromDate, to: toDate });
    await fetchData(fromDate, toDate);
  };

  const handleDateSelect = async (newRange) => {
    if (!newRange?.from || !newRange?.to) return;
    
    const maxDate = new Date(newRange.from);
    maxDate.setMonth(maxDate.getMonth() + 2);
    
    if (newRange.to > maxDate) {
      newRange.to = maxDate;
    }
    
    setDateRange(newRange);
    setPeriod('custom');
    await fetchData(newRange.from, newRange.to);
  };

  useEffect(() => {
    const user = Cookies.get('user');
    if (!user) {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const toDate = new Date();
      const fromDate = subDays(toDate, 6); 
      await fetchData(fromDate, toDate);
    };
    
    fetchInitialData();
  }, [fetchData]);

  return (
    <div className="flex flex-col min-h-screen p-8 pt-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant={period === '7days' ? 'default' : 'outline'} 
            onClick={() => handlePeriodChange('7days')}
            disabled={isLoading}
          >
            {isLoading && period === '7days' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            7 dias
          </Button>
          <Button 
            variant={period === '14days' ? 'default' : 'outline'} 
            onClick={() => handlePeriodChange('14days')}
            disabled={isLoading}
          >
            {isLoading && period === '14days' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            14 dias
          </Button>
          <Button 
            variant={period === '30days' ? 'default' : 'outline'} 
            onClick={() => handlePeriodChange('30days')}
            disabled={isLoading}
          >
            {isLoading && period === '30days' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            30 dias
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            changeColor={stat.changeColor}
          />
        ))}
      </div>

      <div className="w-full" style={{ height: 'calc(100vh - 400px)', minHeight: '300px' }}>
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <DashboardChart data={chartData} />
        )}
      </div>

      {/* Table Section */}
      {!isLoading && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Detalhes por Conexão</h3>
          <div className="rounded-md border">
            {tableData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Conexão</TableHead>
                    <TableHead className="text-center">Sucessos</TableHead>
                    <TableHead className="text-center">Falhas</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Taxa de Sucesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => {
                    const total = row.sucessos + row.falhas;
                    const successRate = total > 0 ? ((row.sucessos / total) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <TableRow key={row._id}>
                        <TableCell className="font-medium">
                          {row.name || 'Conexão sem nome'}
                        </TableCell>
                        <TableCell className="text-center text-green-600 font-semibold">
                          {row.sucessos.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-red-600 font-semibold">
                          {row.falhas.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-semibold ${
                            parseFloat(successRate) >= 90 ? 'text-green-600' :
                            parseFloat(successRate) >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {successRate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">Nenhum dado para exibir</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}