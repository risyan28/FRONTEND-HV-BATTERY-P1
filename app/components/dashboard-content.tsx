import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, CreditCard, DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react"

interface DashboardContentProps {
  currentPage: string
}

export function DashboardContent({ currentPage }: DashboardContentProps) {
  if (currentPage !== "Dashboard") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent font-mono">
              {currentPage}
            </h1>
            <p className="text-slate-600 mt-2 font-mono">Welcome to the {currentPage.toLowerCase()} section.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200"
            >
              <CardHeader>
                <CardTitle className="text-slate-900 font-mono">Sample Card {i + 1}</CardTitle>
                <CardDescription className="text-slate-600 font-mono">
                  This is a sample card for {currentPage}
                </CardDescription>
              </CardHeader>
              <CardContent className="font-mono">
                <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500 font-mono">Content for {currentPage}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent font-mono">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-lg font-mono">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 font-mono">Total Revenue</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="font-mono">
            <div className="text-3xl font-bold text-slate-900 font-mono">$45,231.89</div>
            <div className="flex items-center text-xs text-slate-600 mt-2 font-mono">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-600 font-medium font-mono">+20.1%</span> from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200 bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 font-mono">Subscriptions</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="font-mono">
            <div className="text-3xl font-bold text-slate-900 font-mono">+2,350</div>
            <div className="flex items-center text-xs text-slate-600 mt-2 font-mono">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-600 font-medium font-mono">+180.1%</span> from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200 bg-gradient-to-br from-white to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 font-mono">Sales</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="font-mono">
            <div className="text-3xl font-bold text-slate-900 font-mono">+12,234</div>
            <div className="flex items-center text-xs text-slate-600 mt-2 font-mono">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-600 font-medium font-mono">+19%</span> from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-blue-200 bg-gradient-to-br from-white to-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 font-mono">Active Now</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="font-mono">
            <div className="text-3xl font-bold text-slate-900 font-mono">+573</div>
            <div className="flex items-center text-xs text-slate-600 mt-2 font-mono">
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-600 font-medium font-mono">-2%</span> from last hour
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 font-mono">Overview</CardTitle>
            <CardDescription className="text-slate-600 font-mono">Your revenue for the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 font-mono">
            <div className="h-[350px] w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-slate-100">
              <p className="text-slate-500 text-lg font-mono">Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-slate-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 font-mono">Recent Sales</CardTitle>
            <CardDescription className="text-slate-600 font-mono">You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent className="font-mono">
            <div className="space-y-6">
              {[
                { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+$1,999.00" },
                { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+$39.00" },
                { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+$299.00" },
                { name: "William Kim", email: "will@email.com", amount: "+$99.00" },
                { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+$39.00" },
              ].map((sale, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4 font-mono">
                    {sale.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-slate-900 font-mono">{sale.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{sale.email}</p>
                  </div>
                  <div className="font-semibold text-slate-900 font-mono">{sale.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 font-mono">Project Progress</CardTitle>
            <CardDescription className="text-slate-600 font-mono">Current project completion status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 font-mono">
            {[
              { name: "Website Redesign", progress: 75, color: "bg-blue-500" },
              { name: "Mobile App", progress: 45, color: "bg-purple-500" },
              { name: "API Integration", progress: 90, color: "bg-green-500" },
            ].map((project, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900 font-mono">{project.name}</span>
                  <span className="text-slate-600 font-mono">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${project.color} transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 font-mono">Team Activity</CardTitle>
            <CardDescription className="text-slate-600 font-mono">Recent team member activities</CardDescription>
          </CardHeader>
          <CardContent className="font-mono">
            <div className="space-y-4">
              {[
                { action: "Created new task", user: "John Doe", time: "2 hours ago", status: "active" },
                { action: "Updated project", user: "Jane Smith", time: "4 hours ago", status: "completed" },
                { action: "Added comment", user: "Mike Johnson", time: "6 hours ago", status: "pending" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold font-mono">
                    {activity.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-slate-900 font-mono">{activity.action}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "active"
                        ? "default"
                        : activity.status === "completed"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs font-mono"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 font-mono">Quick Actions</CardTitle>
            <CardDescription className="text-slate-600 font-mono">Frequently used actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 font-mono">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent hover:bg-blue-50 border-slate-200 transition-colors font-mono"
            >
              <Users className="mr-3 h-4 w-4 text-blue-600" />
              Add New User
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent hover:bg-purple-50 border-slate-200 transition-colors font-mono"
            >
              <CreditCard className="mr-3 h-4 w-4 text-purple-600" />
              Create Invoice
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent hover:bg-green-50 border-slate-200 transition-colors font-mono"
            >
              <Activity className="mr-3 h-4 w-4 text-green-600" />
              Generate Report
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent hover:bg-orange-50 border-slate-200 transition-colors font-mono"
            >
              <DollarSign className="mr-3 h-4 w-4 text-orange-600" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
