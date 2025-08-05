import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { 
  VictoryChart, VictoryLine, VictoryBar, VictoryPie,
  VictoryTheme, VictoryAxis, VictoryLabel 
} from 'victory';
import { ResponsiveLine, ResponsiveBar, ResponsivePie } from '@nivo/core';
import { Line, Bar, Pie } from '@nivo/core';
import * as d3 from 'd3';
import { 
  calculateCategoryStatistics, 
  calculateMonthlyTrends,
  calculateGrowthRate,
  exportStatistics 
} from '../utils/statistics';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Download,
  BarChart3,
  PieChart,
  Activity,
  Calendar
} from 'lucide-react';

interface StatisticsData {
  categoryStats: Record<string, any>;
  monthlyTrends: Array<{ month: string; amount: number }>;
  growthRate: {
    monthlyGrowth: number;
    yearlyGrowth: number;
    newSubscriptions: number;
    cancelledSubscriptions: number;
  };
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
];

export function AdvancedStatistics() {
  const { user } = useAuth();
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user]);

  const loadStatistics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [categoryStats, monthlyTrends, growthRate] = await Promise.all([
        calculateCategoryStatistics(user.uid),
        calculateMonthlyTrends(user.uid),
        calculateGrowthRate(user.uid)
      ]);

      setData({
        categoryStats,
        monthlyTrends,
        growthRate
      });
    } catch (error) {
      console.error('통계 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    if (!user) return;

    try {
      const exportedData = await exportStatistics(user.uid, format);
      
      // 파일 다운로드
      const blob = new Blob([exportedData], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statistics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('내보내기 실패:', error);
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="text-green-500" />;
    if (growth < 0) return <TrendingDown className="text-red-500" />;
    return <Minus className="text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen relative">
        <div className="text-center py-8">
          <p className="text-gray-500">통계 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // Recharts 데이터 변환
  const rechartsData = Object.entries(data.categoryStats).map(([category, stats]) => ({
    name: category,
    value: stats.totalMonthlyKrw,
    count: stats.count
  }));

  const trendData = data.monthlyTrends.map(item => ({
    month: item.month,
    amount: item.amount
  }));

  // Victory 데이터 변환
  const victoryData = Object.entries(data.categoryStats).map(([category, stats]) => ({
    x: category,
    y: stats.totalMonthlyKrw
  }));

  // D3 히트맵 데이터
  const heatmapData = data.monthlyTrends.map((trend, index) => ({
    month: trend.month,
    value: trend.amount,
    index
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            고급 통계 대시보드
          </h1>
          <p className="text-gray-600">
            구독 패턴과 지출 트렌드를 다차원으로 분석합니다
          </p>
        </div>

        {/* 성장률 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">월간 성장률</p>
                  <p className={`text-2xl font-bold ${getGrowthColor(data.growthRate.monthlyGrowth)}`}>
                    {data.growthRate.monthlyGrowth.toFixed(1)}%
                  </p>
                </div>
                {getGrowthIcon(data.growthRate.monthlyGrowth)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">연간 성장률</p>
                  <p className={`text-2xl font-bold ${getGrowthColor(data.growthRate.yearlyGrowth)}`}>
                    {data.growthRate.yearlyGrowth.toFixed(1)}%
                  </p>
                </div>
                {getGrowthIcon(data.growthRate.yearlyGrowth)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">새 구독</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data.growthRate.newSubscriptions}
                  </p>
                </div>
                <TrendingUp className="text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">취소된 구독</p>
                  <p className="text-2xl font-bold text-red-600">
                    {data.growthRate.cancelledSubscriptions}
                  </p>
                </div>
                <TrendingDown className="text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 내보내기 버튼 */}
        <div className="flex gap-2 mb-6">
          <Button onClick={() => handleExport('json')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            JSON 내보내기
          </Button>
          <Button onClick={() => handleExport('csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            CSV 내보내기
          </Button>
        </div>

        {/* 차트 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="recharts">Recharts</TabsTrigger>
            <TabsTrigger value="victory">Victory</TabsTrigger>
            <TabsTrigger value="d3">D3.js</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 카테고리별 분포 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    카테고리별 지출 분포
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={rechartsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {rechartsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 월별 트렌드 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    월별 지출 트렌드
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recharts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recharts 막대 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    카테고리별 구독 수 (Recharts)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={rechartsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recharts 선형 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    월별 트렌드 (Recharts)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#82ca9d" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="victory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Victory 막대 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    카테고리별 지출 (Victory)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={20}
                    height={300}
                  >
                    <VictoryAxis
                      tickFormat={(t) => t}
                      style={{
                        tickLabels: { fontSize: 8, angle: -45 }
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      tickFormat={(t) => `${t}원`}
                    />
                    <VictoryBar
                      data={victoryData}
                      style={{
                        data: { fill: "#8884d8" }
                      }}
                    />
                  </VictoryChart>
                </CardContent>
              </Card>

              {/* Victory 원형 차트 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    카테고리 분포 (Victory)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VictoryPie
                    data={victoryData}
                    colorScale="qualitative"
                    height={300}
                    labelComponent={<VictoryLabel style={{ fontSize: 8 }} />}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="d3" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* D3 히트맵 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    월별 지출 히트맵 (D3)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div id="d3-heatmap" className="w-full h-64"></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 상세 통계 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>상세 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(data.categoryStats).map(([category, stats]) => (
                  <div key={category} className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{category}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">구독 수:</span>
                        <Badge variant="secondary">{stats.count}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">월 지출:</span>
                        <span className="font-medium">
                          {stats.totalMonthlyKrw.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">연 지출:</span>
                        <span className="font-medium">
                          {stats.totalYearlyKrw.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 