'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export default function ProgressChart({ workouts }) {
  // Prepare data for the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30)
  const dateRange = eachDayOfInterval({
    start: thirtyDaysAgo,
    end: new Date()
  })

  const chartData = dateRange.map(date => {
    const dayWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.workout_date)
      return workoutDate.toDateString() === date.toDateString()
    })

    return {
      date: format(date, 'MMM dd'),
      workouts: dayWorkouts.length,
      totalDuration: dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
    }
  })

  if (workouts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No workout data yet</p>
          <p className="text-sm">Start logging workouts to see your progress!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workout Frequency Chart */}
      <div>
        <h3 className="text-lg font-medium mb-4">Daily Workout Count (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar 
              dataKey="workouts" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Duration Chart */}
      <div>
        <h3 className="text-lg font-medium mb-4">Daily Workout Duration (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value) => [`${value} minutes`, 'Total Duration']}
            />
            <Line 
              type="monotone" 
              dataKey="totalDuration" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}