'use client'

import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, signIn, signUp, signOut } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Dumbbell, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock,
  Plus,
  Trophy,
  Flame,
  Activity,
  User,
  CheckCircle,
  BarChart3,
  Zap,
  Star,
  ArrowRight,
  Play
} from 'lucide-react'
import WorkoutForm from '@/components/WorkoutForm'
import GoalForm from '@/components/GoalForm'
import ProgressChart from '@/components/ProgressChart'

export default function FitnessTracker() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  
  // Fitness data states
  const [workouts, setWorkouts] = useState([])
  const [goals, setGoals] = useState([])
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    completedGoals: 0,
    streak: 0
  })

  useEffect(() => {
    // Check initial auth state
    getCurrentUser().then(user => {
      setUser(user)
      if (user) {
        fetchUserData(user.id)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          fetchUserData(session.user.id)
        } else {
          setWorkouts([])
          setGoals([])
          setStats({ totalWorkouts: 0, weeklyWorkouts: 0, completedGoals: 0, streak: 0 })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (userId) => {
    try {
      // Fetch workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*, exercises(*)')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false })

      if (workoutsError) throw workoutsError
      setWorkouts(workoutsData || [])

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (goalsError) throw goalsError
      setGoals(goalsData || [])

      // Calculate stats
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const weeklyWorkouts = workoutsData?.filter(w => 
        new Date(w.workout_date) >= oneWeekAgo
      ).length || 0
      
      const completedGoals = goalsData?.filter(g => 
        g.current_value >= g.target_value
      ).length || 0

      setStats({
        totalWorkouts: workoutsData?.length || 0,
        weeklyWorkouts,
        completedGoals,
        streak: calculateStreak(workoutsData || [])
      })

    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load user data')
    }
  }

  const calculateStreak = (workouts) => {
    if (!workouts.length) return 0
    
    let streak = 0
    const today = new Date()
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.workout_date) - new Date(a.workout_date))
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].workout_date)
      const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (authMode === 'signin') {
        await signIn(email, password)
        toast.success('Welcome back!')
      } else {
        await signUp(email, password, { name })
        toast.success('Account created successfully!')
      }
      
      setEmail('')
      setPassword('')
      setName('')
      setShowAuth(false)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      setActiveTab('home')
      setShowAuth(false)
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Landing Page
  if (!user && !showAuth) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">FitTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => { setAuthMode('signin'); setShowAuth(true) }}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => { setAuthMode('signup'); setShowAuth(true) }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-100 -z-10"></div>
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center -z-10"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1599552692549-e3ce4a23cac9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHx3b3Jrb3V0JTIwbW90aXZhdGlvbnxlbnwwfHx8Ymx1ZXwxNzU2OTA4NDcyfDA&ixlib=rb-4.1.0&q=85)' 
            }}
          ></div>
          
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8">
              <Badge className="mb-4 px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                <Star className="h-4 w-4 mr-1" />
                Your Personal Fitness Companion
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Transform Your Fitness Journey
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track workouts, set achievable goals, monitor progress, and stay motivated with our comprehensive fitness tracking platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="px-8 py-3 text-lg"
                onClick={() => { setAuthMode('signup'); setShowAuth(true) }}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-lg"
                onClick={() => { setAuthMode('signin'); setShowAuth(true) }}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="mt-12 flex justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Free to Start
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                No Credit Card
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Instant Setup
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to keep you motivated and on track with your fitness goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div 
                  className="w-full h-48 bg-cover bg-center rounded-lg mb-6"
                  style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1704374897290-e24c66184d78?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxmaXRuZXNzJTIwdHJhY2tpbmd8ZW58MHx8fGJsdWV8MTc1NjkwODQ2NXww&ixlib=rb-4.1.0&q=85)' 
                  }}
                ></div>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Dumbbell className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Workout Tracking</CardTitle>
                  <CardDescription>
                    Log your exercises, sets, reps, and weights. Track both strength training and cardio activities with detailed insights.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div 
                  className="w-full h-48 bg-cover bg-center rounded-lg mb-6"
                  style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1589860518300-9eac95f784d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHw0fHxmaXRuZXNzJTIwdHJhY2tpbmd8ZW58MHx8fGJsdWV8MTc1NjkwODQ2NXww&ixlib=rb-4.1.0&q=85)' 
                  }}
                ></div>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Goal Setting</CardTitle>
                  <CardDescription>
                    Set SMART fitness goals and track your progress. From weight loss to strength gains, achieve what matters to you.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-6 flex items-center justify-center">
                  <BarChart3 className="h-20 w-20 text-white" />
                </div>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Progress Analytics</CardTitle>
                  <CardDescription>
                    Visualize your fitness journey with beautiful charts and insights. See your improvement over time and stay motivated.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Why Choose FitTracker?
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Stay Motivated</h3>
                      <p className="text-muted-foreground">
                        Track your streaks, celebrate achievements, and get motivated with progress insights.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Data-Driven Results</h3>
                      <p className="text-muted-foreground">
                        Make informed decisions with detailed analytics and progress tracking.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Achieve Your Goals</h3>
                      <p className="text-muted-foreground">
                        Set realistic targets and watch as you consistently reach new milestones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:pl-12">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">5K+</div>
                    <div className="text-muted-foreground mb-6">Active Users</div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">98%</div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">4.9★</div>
                        <div className="text-sm text-muted-foreground">User Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Join thousands of users who have already started their fitness journey with FitTracker.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="px-8 py-3 text-lg"
              onClick={() => { setAuthMode('signup'); setShowAuth(true) }}
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="font-semibold">FitTracker</span>
            </div>
            <p>&copy; 2024 FitTracker. All rights reserved. Built with ❤️ for fitness enthusiasts.</p>
          </div>
        </footer>
      </div>
    )
  }

  // Authentication Screen
  if (!user && showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <button 
                onClick={() => setShowAuth(false)}
                className="absolute left-4 top-4 p-2 hover:bg-muted rounded-full"
              >
                ←
              </button>
              <div className="p-3 bg-primary rounded-full">
                <Dumbbell className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">FitTracker</CardTitle>
            <CardDescription>
              {authMode === 'signin' ? 'Welcome back!' : 'Join the fitness revolution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={authMode === 'signup'}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="font-medium text-primary hover:underline"
                >
                  {authMode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main App Dashboard (when user is logged in)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">FitTracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.user_metadata?.name || user.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger 
                value="home" 
                className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Activity className="h-4 w-4" />
                <span>Home</span>
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="py-6">
              <TabsContent value="home" className="mt-0">
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Workouts
                        </CardTitle>
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          This Week
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.weeklyWorkouts}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Goals Achieved
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.completedGoals}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Streak
                        </CardTitle>
                        <Flame className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.streak}</div>
                        <p className="text-xs text-muted-foreground">days</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Plus className="h-5 w-5" />
                          <span>Log Workout</span>
                        </CardTitle>
                        <CardDescription>
                          Record your latest training session
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WorkoutForm 
                          onSuccess={() => fetchUserData(user.id)} 
                          userId={user.id}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="h-5 w-5" />
                          <span>Set New Goal</span>
                        </CardTitle>
                        <CardDescription>
                          Define your next fitness target
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <GoalForm 
                          onSuccess={() => fetchUserData(user.id)}
                          userId={user.id}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Workouts */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Workouts</CardTitle>
                      <CardDescription>Your latest training sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {workouts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No workouts yet. Log your first workout above!
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {workouts.slice(0, 5).map((workout) => (
                            <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h3 className="font-medium">{workout.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(workout.workout_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {workout.duration} min
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <div className="space-y-6">
                  {/* Progress Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Workout Progress</CardTitle>
                      <CardDescription>Your training activity over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProgressChart workouts={workouts} />
                    </CardContent>
                  </Card>

                  {/* Goals Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Goals Progress</CardTitle>
                      <CardDescription>Track your fitness objectives</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {goals.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No goals set yet. Create your first goal to start tracking progress!
                        </p>
                      ) : (
                        <div className="space-y-6">
                          {goals.map((goal) => (
                            <div key={goal.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium">{goal.title}</h3>
                                <span className="text-sm text-muted-foreground">
                                  {goal.current_value}/{goal.target_value} {goal.unit}
                                </span>
                              </div>
                              <Progress 
                                value={(goal.current_value / goal.target_value) * 100}
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                Target: {new Date(goal.target_date).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="mt-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Your account details and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{user.user_metadata?.name || 'User'}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{stats.totalWorkouts}</div>
                          <div className="text-sm text-muted-foreground">Total Workouts</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{stats.completedGoals}</div>
                          <div className="text-sm text-muted-foreground">Goals Achieved</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Motivational Quote</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-lg font-medium italic text-center py-4">
                        "The groundwork for all happiness is good health."
                        <footer className="text-sm text-muted-foreground mt-2">
                          - Leigh Hunt
                        </footer>
                      </blockquote>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </nav>
    </div>
  )
}