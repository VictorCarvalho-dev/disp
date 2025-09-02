"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';

export const DashboardChart = ({ data }) => {
  // Check if we're displaying hourly data (when isHourly flag is true)
  const isHourlyView = data.length > 0 && data[0].isHourly;
  
  // Sort data appropriately based on view type
  const sortedData = [...data].sort((a, b) => {
    if (isHourlyView) {
      // For hourly data, sort by hour number (extract number from '0h', '1h', etc.)
      const hourA = parseInt(a.date, 10);
      const hourB = parseInt(b.date, 10);
      return hourA - hourB;
    } else if (a.fullDate && b.fullDate) {
      // For daily data, sort by date
      return new Date(a.fullDate) - new Date(b.fullDate);
    }
    return 0;
  });

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>Disparos {isHourlyView ? 'por Hora' : 'por Dia'}</CardTitle>
        <CardDescription>
          {isHourlyView 
            ? 'Acompanhe a distribuição dos disparos por horário' 
            : 'Acompanhe a evolução dos seus disparos ao longo do tempo'}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={isHourlyView ? 'preserveStartEnd' : 0}
              tickFormatter={(value) => isHourlyView ? value : value}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [value, 'Disparos']}
              labelFormatter={(label) => isHourlyView ? `Hora: ${label}` : `Dia: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="shots" 
              name="Disparos"
              stroke="#16a34a" 
              strokeWidth={2}
              dot={!isHourlyView}
              activeDot={{ r: 6 }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
