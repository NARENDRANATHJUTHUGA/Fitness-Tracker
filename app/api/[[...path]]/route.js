import { NextResponse } from 'next/server'
import { supabase, initializeDatabase } from '../../../lib/supabase.js'

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    await initializeDatabase()

    // Root endpoint - GET /
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "FitTracker API is running!" }))
    }

    // Workouts endpoints
    if (route === '/workouts' && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      
      if (!userId) {
        return handleCORS(NextResponse.json({ error: "userId is required" }, { status: 400 }))
      }

      const { data, error } = await supabase
        .from('workouts')
        .select('*, exercises(*)')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false })

      if (error) {
        console.error('Error fetching workouts:', error)
        return handleCORS(NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 }))
      }

      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/workouts' && method === 'POST') {
      const body = await request.json()
      
      if (!body.user_id || !body.name) {
        return handleCORS(NextResponse.json(
          { error: "user_id and name are required" }, 
          { status: 400 }
        ))
      }

      const workoutData = {
        id: `workout_${Date.now()}`,
        user_id: body.user_id,
        name: body.name,
        type: body.type,
        duration: body.duration || 0,
        notes: body.notes || '',
        workout_date: body.workout_date || new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert([workoutData])
        .select()
        .single()

      if (error) {
        console.error('Error creating workout:', error)
        return handleCORS(NextResponse.json({ error: "Failed to create workout" }, { status: 500 }))
      }

      return handleCORS(NextResponse.json(data))
    }

    // Goals endpoints
    if (route === '/goals' && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      
      if (!userId) {
        return handleCORS(NextResponse.json({ error: "userId is required" }, { status: 400 }))
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching goals:', error)
        return handleCORS(NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 }))
      }

      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/goals' && method === 'POST') {
      const body = await request.json()
      
      if (!body.user_id || !body.title) {
        return handleCORS(NextResponse.json(
          { error: "user_id and title are required" }, 
          { status: 400 }
        ))
      }

      const goalData = {
        id: `goal_${Date.now()}`,
        user_id: body.user_id,
        title: body.title,
        description: body.description || '',
        target_value: body.target_value,
        current_value: body.current_value || 0,
        unit: body.unit,
        target_date: body.target_date,
        category: body.category,
        status: 'active',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single()

      if (error) {
        console.error('Error creating goal:', error)
        return handleCORS(NextResponse.json({ error: "Failed to create goal" }, { status: 500 }))
      }

      return handleCORS(NextResponse.json(data))
    }

    // Exercises endpoints
    if (route === '/exercises' && method === 'POST') {
      const body = await request.json()
      
      if (!body.workout_id || !body.name) {
        return handleCORS(NextResponse.json(
          { error: "workout_id and name are required" }, 
          { status: 400 }
        ))
      }

      const exerciseData = {
        id: `exercise_${Date.now()}_${Math.random()}`,
        workout_id: body.workout_id,
        name: body.name,
        sets: body.sets || null,
        reps: body.reps || null,
        weight: body.weight || null,
        duration: body.duration || null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseData])
        .select()
        .single()

      if (error) {
        console.error('Error creating exercise:', error)
        return handleCORS(NextResponse.json({ error: "Failed to create exercise" }, { status: 500 }))
      }

      return handleCORS(NextResponse.json(data))
    }

    // User stats endpoint
    if (route === '/stats' && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      
      if (!userId) {
        return handleCORS(NextResponse.json({ error: "userId is required" }, { status: 400 }))
      }

      try {
        // Get workouts count
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('id, workout_date')
          .eq('user_id', userId)

        if (workoutsError) throw workoutsError

        // Get goals count
        const { data: goals, error: goalsError } = await supabase
          .from('goals')
          .select('id, current_value, target_value')
          .eq('user_id', userId)

        if (goalsError) throw goalsError

        // Calculate stats
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        const weeklyWorkouts = workouts?.filter(w => 
          new Date(w.workout_date) >= oneWeekAgo
        ).length || 0
        
        const completedGoals = goals?.filter(g => 
          g.current_value >= g.target_value
        ).length || 0

        const stats = {
          totalWorkouts: workouts?.length || 0,
          weeklyWorkouts,
          completedGoals,
          totalGoals: goals?.length || 0
        }

        return handleCORS(NextResponse.json(stats))
      } catch (error) {
        console.error('Error fetching stats:', error)
        return handleCORS(NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 }))
      }
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute