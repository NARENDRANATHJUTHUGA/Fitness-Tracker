'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'

export default function WorkoutForm({ onSuccess, userId }) {
  const [loading, setLoading] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [workoutType, setWorkoutType] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState([
    {
      name: '',
      sets: '',
      reps: '',
      weight: '',
      duration: ''
    }
  ])

  const addExercise = () => {
    setExercises([...exercises, {
      name: '',
      sets: '',
      reps: '',
      weight: '',
      duration: ''
    }])
  }

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index, field, value) => {
    const updatedExercises = exercises.map((exercise, i) => 
      i === index ? { ...exercise, [field]: value } : exercise
    )
    setExercises(updatedExercises)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create workout record
      const workoutData = {
        id: `workout_${Date.now()}`,
        user_id: userId,
        name: workoutName,
        type: workoutType,
        duration: parseInt(duration) || 0,
        notes: notes,
        workout_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert([workoutData])
        .select()
        .single()

      if (workoutError) throw workoutError

      // Create exercise records
      const exerciseData = exercises
        .filter(ex => ex.name.trim())
        .map(exercise => ({
          id: `exercise_${Date.now()}_${Math.random()}`,
          workout_id: workout.id,
          name: exercise.name,
          sets: parseInt(exercise.sets) || null,
          reps: parseInt(exercise.reps) || null,
          weight: parseFloat(exercise.weight) || null,
          duration: parseInt(exercise.duration) || null,
          created_at: new Date().toISOString()
        }))

      if (exerciseData.length > 0) {
        const { error: exerciseError } = await supabase
          .from('exercises')
          .insert(exerciseData)

        if (exerciseError) throw exerciseError
      }

      toast.success('Workout logged successfully!')
      
      // Reset form
      setWorkoutName('')
      setWorkoutType('')
      setDuration('')
      setNotes('')
      setExercises([{
        name: '',
        sets: '',
        reps: '',
        weight: '',
        duration: ''
      }])

      onSuccess()

    } catch (error) {
      console.error('Error logging workout:', error)
      toast.error('Failed to log workout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="workoutName">Workout Name</Label>
          <Input
            id="workoutName"
            placeholder="e.g., Morning Run"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="workoutType">Type</Label>
          <Select value={workoutType} onValueChange={setWorkoutType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strength">Strength Training</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="flexibility">Flexibility</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          placeholder="30"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Exercises</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExercise}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Exercise
          </Button>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {exercises.map((exercise, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Exercise {index + 1}</Badge>
                {exercises.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Sets"
                  type="number"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Reps"
                  type="number"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                />
                <Input
                  placeholder="Weight (kg)"
                  type="number"
                  step="0.5"
                  value={exercise.weight}
                  onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                />
                <Input
                  placeholder="Duration (min)"
                  type="number"
                  value={exercise.duration}
                  onChange={(e) => updateExercise(index, 'duration', e.target.value)}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="How did you feel? Any observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logging...' : 'Log Workout'}
      </Button>
    </form>
  )
}