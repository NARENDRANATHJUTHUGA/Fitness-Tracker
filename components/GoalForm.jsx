'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function GoalForm({ onSuccess, userId }) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [currentValue, setCurrentValue] = useState('0')
  const [unit, setUnit] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [category, setCategory] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const goalData = {
        id: `goal_${Date.now()}`,
        user_id: userId,
        title,
        description,
        target_value: parseFloat(targetValue),
        current_value: parseFloat(currentValue),
        unit,
        target_date: targetDate,
        category,
        status: 'active',
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('goals')
        .insert([goalData])

      if (error) throw error

      toast.success('Goal created successfully!')
      
      // Reset form
      setTitle('')
      setDescription('')
      setTargetValue('')
      setCurrentValue('0')
      setUnit('')
      setTargetDate('')
      setCategory('')

      onSuccess()

    } catch (error) {
      console.error('Error creating goal:', error)
      toast.error('Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Goal Title</Label>
        <Input
          id="title"
          placeholder="e.g., Run 5K in under 25 minutes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strength">Strength</SelectItem>
            <SelectItem value="endurance">Endurance</SelectItem>
            <SelectItem value="weight">Weight Loss</SelectItem>
            <SelectItem value="muscle">Muscle Gain</SelectItem>
            <SelectItem value="flexibility">Flexibility</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="currentValue">Current</Label>
          <Input
            id="currentValue"
            type="number"
            step="0.1"
            placeholder="0"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="targetValue">Target</Label>
          <Input
            id="targetValue"
            type="number"
            step="0.1"
            placeholder="100"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            placeholder="e.g., kg, miles, reps"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="targetDate">Target Date</Label>
        <Input
          id="targetDate"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe your goal and motivation..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Create Goal'}
      </Button>
    </form>
  )
}