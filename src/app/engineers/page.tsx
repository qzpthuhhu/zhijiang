'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { Users, Search, CheckCircle, Star, Briefcase, MessageSquare, Calendar, MapPin, Mail } from 'lucide-react';

export default function EngineersPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [engineerProfiles, setEngineerProfiles] = useState<any[]>([]);
  const [filteredEngineers, setFilteredEngineers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // 模拟工程师数据
  const mockEngineers = [
    {
      id: '1',
      years_experience: 5,
      specialties: ['OpenClaw', 'Claude Code', 'Python', 'JavaScript'],
      bio: '5年AI工具部署经验，专注于OpenClaw和Claude Code的安装配置，曾为多家企业提供技术支持',
      has_freelance_experience: true,
      engineer_status: 'approved',
      location: '北京',
      response_time: '24小时内',
      rating: 4.8,
      completed_orders: 23
    },
    {
      id: '2',
      years_experience: 3,
      specialties: ['RAG', '知识库', '向量数据库', 'LangChain'],
      bio: '3年RAG方案经验，擅长企业知识库搭建和优化，熟悉各种向量数据库',
      has_freelance_experience: true,
      engineer_status: 'approved',
      location: '上海',
      response_time: '12小时内',
      rating: 4.6,
      completed_orders: 15
    },
    {
      id: '3',
      years_experience: 8,
      specialties: ['多Agent系统', 'AI架构', '系统设计', 'Python'],
      bio: '8年AI系统架构经验，专注于多Agent系统设计和开发，曾主导多个大型AI项目',
      has_freelance_experience: true,
      engineer_status: 'approved',
      location: '深圳',
      response_time: '48小时内',
      rating: 4.9,
      completed_orders: 31
    },
    {
      id: '4',
      years_experience: 2,
      specialties: ['Vibe Coding', '前端开发', 'React', 'JavaScript'],
      bio: '2年前端开发经验，擅长Vibe Coding和React开发，提供代码答疑和项目指导',
      has_freelance_experience: false,
      engineer_status: 'approved',
      location: '广州',
      response_time: '6小时内',
      rating: 4.5,
      completed_orders: 8
    },
    {
      id: '5',
      years_experience: 6,
      specialties: ['OpenClaw', 'Claude Code', 'Linux', 'DevOps'],
      bio: '6年DevOps经验，擅长Linux系统和AI工具部署，提供全方位的技术支持',
      has_freelance_experience: true,
      engineer_status: 'approved',
      location: '杭州',
      response_time: '36小时内',
      rating: 4.7,
      completed_orders: 19
    }
  ];

  const mockProfiles = [
    {
      id: '1',
      display_name: '张工程师',
      email: 'zhang@example.com'
    },
    {
      id: '2',
      display_name: '李专家',
      email: 'li@example.com'
    },
    {
      id: '3',
      display_name: '王架构师',
      email: 'wang@example.com'
    },
    {
      id: '4',
      display_name: '赵开发',
      email: 'zhao@example.com'
    },
    {
      id: '5',
      display_name: '陈运维',
      email: 'chen@example.com'
    }
  ];

  useEffect(() => {
    const loadEngineers = async () => {
      try {
        // 模拟加载数据
        setEngineers(mockEngineers);
        setEngineerProfiles(mockProfiles);
        setFilteredEngineers(mockEngineers);
        setLoading(false);
      } catch (error) {
        console.error('Error loading engineers:', error);
        setLoading(false);
      }
    };

    loadEngineers();
  }, []);

  useEffect(() => {
    // 筛选工程师
    let result = engineers;

    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(engineer => {
        const profile = engineerProfiles.find(p => p.id === engineer.id);
        return (
          (profile?.display_name?.toLowerCase() || '').includes(term) ||
          (engineer.specialties?.some((s: string) => s.toLowerCase().includes(term)) || false) ||
          (engineer.bio?.toLowerCase() || '').includes(term)
        );
      });
    }

    // 按经验筛选
    if (experienceFilter !== 'all') {
      const minExperience = parseInt(experienceFilter);
      result = result.filter(engineer => engineer.years_experience >= minExperience);
    }

    // 按技能筛选
    if (skillFilter !== 'all') {
      result = result.filter(engineer => 
        engineer.specialties?.includes(skillFilter) || false
      );
    }

    // 按地区筛选
    if (locationFilter !== 'all') {
      result = result.filter(engineer => engineer.location === locationFilter);
    }

    setFilteredEngineers(result);
  }, [engineers, engineerProfiles, searchTerm, experienceFilter, skillFilter, locationFilter]);

  const getEngineerProfile = (engineerId: string) => {
    return engineerProfiles.find(p => p.id === engineerId);
  };

  const handleAiQuestion = async () => {
    if (!aiMessage.trim()) return;

    setAiLoading(true);
    try {
      // 模拟AI回复
      setTimeout(() => {
        let response = '';
        const message = aiMessage.toLowerCase();
        
        if (message.includes('openclaw') && message.includes('windows')) {
          response = '根据您的需求，我推荐张工程师（北京），他有5年OpenClaw安装经验，擅长Windows平台部署，响应时间24小时内，完成过23个相关订单，评分4.8分。';
        } else if (message.includes('rag') || message.includes('知识库')) {
          response = '推荐李专家（上海），他专注于RAG方案，有3年经验，熟悉各种向量数据库，响应时间12小时内，评分4.6分。';
        } else if (message.includes('agent') || message.includes('多智能体')) {
          response = '王架构师（深圳）是多Agent系统专家，有8年经验，曾主导多个大型AI项目，评分4.9分，是您的最佳选择。';
        } else {
          response = '根据您的需求，我建议您浏览我们的工程师列表，使用筛选功能找到最适合您项目的专家。';
        }
        
        setAiResponse(response);
        setAiLoading(false);
      }, 1000);
    } catch (error) {
      console.error('AI error:', error);
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="container py-12 text-center">加载中...</div>;
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">寻找工程师</h1>
        <p className="text-slate-600">浏览平台认证的专业工程师，找到适合您项目的技术专家</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧筛选和搜索 */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">搜索工程师</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      id="search" 
                      placeholder="输入工程师姓名、技能或关键词" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">工作年限</Label>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger id="experience">
                      <SelectValue placeholder="选择工作年限" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="1">1年以上</SelectItem>
                      <SelectItem value="3">3年以上</SelectItem>
                      <SelectItem value="5">5年以上</SelectItem>
                      <SelectItem value="10">10年以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill">专业技能</Label>
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger id="skill">
                      <SelectValue placeholder="选择技能" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="OpenClaw">OpenClaw</SelectItem>
                      <SelectItem value="Claude Code">Claude Code</SelectItem>
                      <SelectItem value="RAG">RAG</SelectItem>
                      <SelectItem value="多Agent系统">多Agent系统</SelectItem>
                      <SelectItem value="Vibe Coding">Vibe Coding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">地区</Label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="选择地区" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="北京">北京</SelectItem>
                      <SelectItem value="上海">上海</SelectItem>
                      <SelectItem value="深圳">深圳</SelectItem>
                      <SelectItem value="广州">广州</SelectItem>
                      <SelectItem value="杭州">杭州</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredEngineers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">暂无符合条件的工程师</h3>
              <p className="text-slate-500">请尝试调整筛选条件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEngineers.map((engineer) => {
                const profile = getEngineerProfile(engineer.id);
                return (
                  <Card key={engineer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{profile?.display_name || '未设置昵称'}</CardTitle>
                          <CardDescription>{profile?.email}</CardDescription>
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          已认证
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">{engineer.years_experience} 年经验</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">{engineer.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{engineer.rating} 分</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">{engineer.response_time}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">擅长领域</p>
                        <div className="flex flex-wrap gap-2">
                          {engineer.specialties?.map((specialty: string, index: number) => (
                            <span key={index} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                              {specialty}
                            </span>
                          )) || (
                            <span className="text-sm text-slate-500">未设置</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">个人简介</p>
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {engineer.bio || '未设置个人简介'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="w-4 h-4" />
                        <span>已完成 {engineer.completed_orders} 个订单</span>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">
                          查看详情
                        </Button>
                        <Button variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          联系
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* 右侧AI助手 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>AI助手</CardTitle>
              <CardDescription>智能推荐工程师</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">示例问题：</p>
                <ul className="space-y-1 text-sm text-blue-600">
                  <li className="cursor-pointer hover:underline" onClick={() => setAiMessage('我想在Windows电脑上安装OpenClaw，帮我推荐工程师')}>• 我想在Windows电脑上安装OpenClaw</li>
                  <li className="cursor-pointer hover:underline" onClick={() => setAiMessage('我需要搭建企业知识库，推荐RAG专家')}>• 我需要搭建企业知识库</li>
                  <li className="cursor-pointer hover:underline" onClick={() => setAiMessage('我想开发多Agent系统，找个架构师')}>• 我想开发多Agent系统</li>
                </ul>
              </div>
              <div>
                <Label htmlFor="ai-message">输入您的需求</Label>
                <Textarea 
                  id="ai-message"
                  placeholder="例如：我想在Windows电脑上安装OpenClaw，帮我推荐工程师"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleAiQuestion}
                disabled={aiLoading || !aiMessage.trim()}
              >
                {aiLoading ? '思考中...' : '获取推荐'}
              </Button>
              {aiResponse && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-800">{aiResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}