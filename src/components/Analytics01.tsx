"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Activity,
  CreditCard,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const revenueData = [
  { month: "Jan", revenue: 4500, orders: 120 },
  { month: "Feb", revenue: 5200, orders: 150 },
  { month: "Mar", revenue: 4800, orders: 140 },
  { month: "Apr", revenue: 6100, orders: 180 },
  { month: "May", revenue: 5900, orders: 170 },
  { month: "Jun", revenue: 7200, orders: 210 },
  { month: "Jul", revenue: 8400, orders: 250 },
];

const categoryData = [
  { name: "Electronics", value: 400, color: "#3b82f6" },
  { name: "Fashion", value: 300, color: "#10b981" },
  { name: "Home", value: 200, color: "#f59e0b" },
  { name: "Beauty", value: 100, color: "#ef4444" },
];

const visitData = [
  { day: "Mon", visits: 2400 },
  { day: "Tue", visits: 1398 },
  { day: "Wed", visits: 9800 },
  { day: "Thu", visits: 3908 },
  { day: "Fri", visits: 4800 },
  { day: "Sat", visits: 3800 },
  { day: "Sun", visits: 4300 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "Orders",
    color: "#10b981",
  },
  visits: {
    label: "Visits",
    color: "#3b82f6",
  },
};

const Analytics01 = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-background text-foreground">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>CSV Format</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>PDF Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Share Link</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Check Updates
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          change="+20.1% from last month"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend="up"
        />
        <StatCard
          title="Active Users"
          value="+2350"
          change="+180.1% from last month"
          icon={<Users className="h-4 w-4 text-primary" />}
          trend="up"
        />
        <StatCard
          title="Sales"
          value="+12,234"
          change="+19% from last month"
          icon={<CreditCard className="h-4 w-4 text-primary" />}
          trend="up"
        />
        <StatCard
          title="Active Now"
          value="+573"
          change="+201 since last hour"
          icon={<Activity className="h-4 w-4 text-primary" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Revenue Chart */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">
                Revenue Overview
              </CardTitle>
              <CardDescription>
                Monthly performance data for the current year
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                <TrendingUp className="mr-1 h-3 w-3" /> Growth: 24%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted/30"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12 }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm pt-4 border-t border-border/20">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total revenue for the last 7 months
            </div>
          </CardFooter>
        </Card>

        {/* Sales by Category */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Distribution of sales across top departments
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={"cell-" + index} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Visits */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Weekly Visits</CardTitle>
            <CardDescription>
              Daily user traffic across the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={visitData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted/30"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5, fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="visits"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Transactions / Activity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>You made 265 sales this month.</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <TransactionItem
                name="Olivia Martin"
                email="olivia.martin@email.com"
                amount="+$1,999.00"
                avatar="https://github.com/shadcn.png"
              />
              <TransactionItem
                name="Jackson Lee"
                email="jackson.lee@email.com"
                amount="+$39.00"
                avatar="https://github.com/shadcn.png"
              />
              <TransactionItem
                name="Isabella Nguyen"
                email="isabella.nguyen@email.com"
                amount="+$299.00"
                avatar="https://github.com/shadcn.png"
              />
              <TransactionItem
                name="William Kim"
                email="will@email.com"
                amount="+$99.00"
                avatar="https://github.com/shadcn.png"
              />
              <TransactionItem
                name="Sofia Davis"
                email="sofia.davis@email.com"
                amount="+$39.00"
                avatar="https://github.com/shadcn.png"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, trend }: any) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/20 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3 text-primary" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-destructive" />
          )}
          <span
            className={
              trend === "up"
                ? "text-primary font-medium"
                : "text-destructive font-medium"
            }
          >
            {change.split(" ")[0]}
          </span>
          {change.split(" ").slice(1).join(" ")}
        </p>
      </CardContent>
    </Card>
  );
};

const TransactionItem = ({ name, email, amount, avatar }: any) => {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-9 w-9 border border-border/50">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{name}</p>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
      <div className="font-medium text-sm">{amount}</div>
    </div>
  );
};

export default Analytics01;
