import React from "react";
import {
  Search,
  BookOpen,
  Play,
  FileText,
  Users,
  ChevronRight,
  Sparkles,
  Bot,
  Brain,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LearningDiscovery() {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
       e.preventDefault();
       setIsSearchOpen(true);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
        <main className="container mx-auto px-4 py-8 space-y-8 md:space-y-12">
          {/* SECTION 1: SMART DISCOVERY (Sticky Top Bar) */}
          <section className="space-y-4">
              <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input 
                      className="pl-12 h-12 text-lg shadow-sm border-slate-200 focus-visible:ring-blue-500" 
                      placeholder="Search for &quot;student panic attack in class&quot;..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                  />
              </div>
          </section>

          {/* SECTION 2: MY GROWTH COMPASS */}
          <section>
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">MY GROWTH COMPASS</h2>
              </div>
              
              <div className="flex flex-col gap-6 md:gap-8 bg-white p-4 md:p-6 rounded-xl border shadow-sm">
                  
                  {/* 1. Total Learning Area - Impact Metrics */}
                  <div className="w-full border-b border-slate-100 pb-8">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Learning Hours</h3>
                       <div className="flex items-baseline gap-2 mb-2">
                           <span className="text-3xl md:text-4xl font-bold text-slate-900">58</span>
                           <span className="text-xl text-slate-400">/ 60 Hours</span>
                       </div>
                       <Progress value={53} className="h-2 mb-2" />
                       <p className="text-sm text-emerald-600 font-medium">On track to meet annual goal</p>
                  </div>

                  {/* 2. TGM Dimensions - Bar Chart & Profile Skew */}
                  <div className="w-full border-b border-slate-100 pb-8">
                       <div className="flex flex-col md:flex-row gap-8 items-center">
                           <div className="flex-1 w-full">
                               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">TGM Dimension Profile</h3>
                               <div className="h-64 w-full">
                                  {/* Custom SVG Bar Chart */}
                                  <svg viewBox="0 0 400 220" className="w-full h-full">
                                      {/* Grid Lines */}
                                      <line x1="40" y1="190" x2="380" y2="190" stroke="#e2e8f0" strokeWidth="1" />
                                      <line x1="40" y1="150" x2="380" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                      <line x1="40" y1="110" x2="380" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                      
                                      {/* Y Axis Label */}
                                      <text x="35" y="40" textAnchor="end" className="text-[10px] fill-slate-400 font-medium">Hours</text>

                                      {/* Bar 1: Ethical (16h) */}
                                      <rect x="60" y="60" width="40" height="130" fill="#3b82f6" rx="2" />
                                      <text x="80" y="55" textAnchor="middle" className="text-[11px] fill-slate-700 font-bold">16h</text>
                                      <text x="80" y="205" textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">Ethical</text>
                                      
                                      {/* Bar 2: Competent (18h) */}
                                      <rect x="125" y="45" width="40" height="145" fill="#2563eb" rx="2" />
                                      <text x="145" y="40" textAnchor="middle" className="text-[11px] fill-slate-700 font-bold">18h</text>
                                      <text x="145" y="205" textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">Competent</text>

                                      {/* Bar 3: Collaborative (9h) */}
                                      <rect x="190" y="115" width="40" height="75" fill="#60a5fa" rx="2" />
                                      <text x="210" y="110" textAnchor="middle" className="text-[11px] fill-slate-700 font-bold">9h</text>
                                      <text x="210" y="205" textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">Collab.</text>

                                      {/* Bar 4: Leader (6h) */}
                                      <rect x="255" y="140" width="40" height="50" fill="#93c5fd" rx="2" />
                                      <text x="275" y="135" textAnchor="middle" className="text-[11px] fill-slate-700 font-bold">6h</text>
                                      <text x="275" y="205" textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">Leader</text>

                                      {/* Bar 5: Community (9h) */}
                                      <rect x="320" y="120" width="40" height="70" fill="#60a5fa" rx="2" />
                                      <text x="340" y="115" textAnchor="middle" className="text-[11px] fill-slate-700 font-bold">9h</text>
                                      <text x="340" y="205" textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">Community</text>
                                  </svg>
                               </div>
                           </div>
                       </div>
                  </div>

                  {/* 3. Learning Trend Line Chart (New) */}
                  <div className="w-full border-b border-slate-100 pb-8">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Learning Hours Trend (Monthly)</h3>
                      <div className="h-64 w-full">
                               {/* Chart Logic calculated within render for simplicity */}
                               {(() => {
                                   const trendData = [
                                       { month: "Jul", user: 2, peer: 5 },
                                       { month: "Aug", user: 5, peer: 7 },
                                       { month: "Sep", user: 15, peer: 13 },
                                       { month: "Oct", user: 3, peer: 8 },
                                       { month: "Nov", user: 0, peer: 5 },
                                       { month: "Dec", user: 2, peer: 5 },
                                   ];
                                   const startX = 100;
                                   const stepX = 120;
                                   const zeroY = 170;
                                   const pxPerHour = 7.5; // (170 - 20) / 20h = 150/20 = 7.5

                                   const getPoint = (val: number, index: number) => {
                                       const x = startX + (index * stepX);
                                       const y = zeroY - (val * pxPerHour);
                                       return `${x},${y}`;
                                   };

                                   const userPoints = trendData.map((d, i) => getPoint(d.user, i)).join(" ");
                                   const peerPoints = trendData.map((d, i) => getPoint(d.peer, i)).join(" ");

                                   return (
                                       <svg viewBox="0 0 800 200" className="w-full h-full">
                                           {/* Y-axis Grid */}
                                           <line x1="50" y1="170" x2="780" y2="170" stroke="#e2e8f0" strokeWidth="1" />
                                           <line x1="50" y1="132" x2="780" y2="132" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                           <line x1="50" y1="95" x2="780" y2="95" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                           <line x1="50" y1="57" x2="780" y2="57" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                           <line x1="50" y1="20" x2="780" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                           
                                           {/* Y-axis Labels */}
                                           <text x="40" y="174" textAnchor="end" className="text-[10px] fill-slate-400">0h</text>
                                           <text x="40" y="99" textAnchor="end" className="text-[10px] fill-slate-400">10h</text>
                                           <text x="40" y="24" textAnchor="end" className="text-[10px] fill-slate-400">20h</text>

                                           {/* X-axis Labels */}
                                           {trendData.map((d, i) => (
                                               <text key={d.month} x={startX + (i * stepX)} y="190" textAnchor="middle" className="text-[10px] fill-slate-500">{d.month}</text>
                                           ))}

                                           {/* Peer Avg Line (Gray, Dashed) */}
                                           <polyline points={peerPoints} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
                                           
                                           {/* User Line (Blue, Bold) */}
                                           <polyline points={userPoints} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                           
                                           {/* Data Points for User */}
                                           {trendData.map((d, i) => (
                                               <circle key={i} cx={startX + (i * stepX)} cy={zeroY - (d.user * pxPerHour)} r="4" fill="#2563eb" />
                                           ))}

                                           {/* Legend */}
                                           <g transform="translate(650, 20)">
                                               <line x1="0" y1="0" x2="20" y2="0" stroke="#2563eb" strokeWidth="3" />
                                               <text x="25" y="4" className="text-[10px] fill-slate-600">You</text>
                                               <line x1="60" y1="0" x2="80" y2="0" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                                               <text x="85" y="4" className="text-[10px] fill-slate-600">Peers Avg</text>
                                           </g>
                                       </svg>
                                   );
                               })()}
                      </div>
                  </div>

                  {/* 4. The Growth Nudge (AI) */}
                  <div className="w-full">
                       <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                            
                            <div className="flex gap-4 mb-6 relative z-10">
                               <div className="bg-white p-2.5 rounded-full shadow-sm border border-amber-100 h-fit">
                                   <Bot className="h-6 w-6 text-amber-600" />
                               </div>
                               <div>
                                   <h4 className="font-bold text-slate-800 text-lg">AI Growth Insight</h4>
                                   <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                       "Hi <strong>Danial</strong>, I noticed your learning momentum has slowed since the September peak. While you are excelling as a <strong>Competent Professional (18h)</strong>, your <strong>Transformational Leader (6h)</strong> dimension could use a boost to achieve a balanced profile."
                                   </p>
                               </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200/50 p-4 relative z-10">
                                <h5 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Sparkles className="h-3 w-3" />Recommended Next Steps: Leadership & Community
                                </h5>
                                
                                <div className="space-y-3">
                                    {/* Recommendation 1: Course */}
                                    <div className="flex items-start gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                                        <div className="bg-blue-100 text-blue-700 p-1.5 rounded-md mt-0.5">
                                            <Play className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1">
                                            <h6 className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">Leading Change in Schools</h6>
                                            <p className="text-xs text-slate-500">Video Course • 2.5 Hours</p>
                                        </div>
                                    </div>

                                    {/* Recommendation 2: Reading */}
                                    <div className="flex items-start gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                                        <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md mt-0.5">
                                            <BookOpen className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1">
                                            <h6 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">The Adaptive Leader: A Guide</h6>
                                            <p className="text-xs text-slate-500">Article Series • 45 Mins</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                       </div>
                  </div>

              </div>
          </section>

          {/* SECTION 3: ACTIVE PURSUITS */}
          <section>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-6">Continue Your Learning</h2>
              <ScrollArea className="w-full whitespace-nowrap pb-4">
                  <div className="flex w-max space-x-4">
                      {/* Item 1 */}
                      <Card className="w-[300px] shrink-0">
                          <div className="h-32 bg-slate-100 relative rounded-t-xl overflow-hidden">
                               <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50">
                                  <Play className="h-10 w-10 text-slate-400" />
                               </div>
                               <Badge className="absolute top-3 left-3 bg-blue-600">VIDEO MODULE</Badge>
                          </div>
                          <CardContent className="p-4">
                              <h3 className="font-bold text-lg mb-1 truncate">Fostering Student Well-being</h3>
                              <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                                  <span>Outcome 1</span>
                                  <span>60%</span>
                              </div>
                              <Progress value={60} className="h-2 mb-4" />
                              <Button className="w-full" variant="outline">
                                  RESUME <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                          </CardContent>
                      </Card>

                      {/* Item 2 */}
                      <Card className="w-[300px] shrink-0">
                           <div className="h-32 bg-slate-100 relative rounded-t-xl overflow-hidden">
                               <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50">
                                  <FileText className="h-10 w-10 text-slate-400" />
                               </div>
                               <Badge className="absolute top-3 left-3 bg-indigo-600">ARTICLE SERIES</Badge>
                          </div>
                          <CardContent className="p-4">
                              <h3 className="font-bold text-lg mb-1 truncate">Leading Change Management</h3>
                              <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                                  <span>Outcome 4</span>
                                  <span>20%</span>
                              </div>
                              <Progress value={20} className="h-2 mb-4" />
                              <Button className="w-full" variant="outline">
                                  RESUME <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                          </CardContent>
                      </Card>

                      {/* Item 3 */}
                      <Card className="w-[300px] shrink-0">
                           <div className="h-32 bg-slate-100 relative rounded-t-xl overflow-hidden">
                               <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50">
                                  <Users className="h-10 w-10 text-slate-400" />
                               </div>
                               <Badge className="absolute top-3 left-3 bg-emerald-600">WORKSHOP</Badge>
                          </div>
                          <CardContent className="p-4">
                              <h3 className="font-bold text-lg mb-1 truncate">Digital Literacy & AI</h3>
                              <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                                  <span>Outcome 2</span>
                                  <span>90%</span>
                              </div>
                              <Progress value={90} className="h-2 mb-4" />
                              <Button className="w-full" variant="outline">
                                  RESUME <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                          </CardContent>
                      </Card>
                      
                       <Card className="w-[100px] shrink-0 border-dashed flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                          <div className="text-center p-4">
                              <div className="w-10 h-10 rounded-full bg-slate-200 mx-auto flex items-center justify-center mb-2">
                                  <ChevronRight className="h-5 w-5 text-slate-500" />
                              </div>
                              <span className="text-xs font-medium text-slate-500">View All</span>
                          </div>
                      </Card>

                  </div>
                  <ScrollBar orientation="horizontal" />
              </ScrollArea>
          </section>

          {/* SECTION 4: LEARNING PORTFOLIO */}
          <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                   <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">LEARNING PORTFOLIO</h2>
                   <div className="flex gap-2">
                      <Select defaultValue="all">
                          <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="2025" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="2025">2025</SelectItem>
                              <SelectItem value="2024">2024</SelectItem>
                          </SelectContent>
                      </Select>
                   </div>
              </div>
              
              <Card>
                  <div className="overflow-x-auto">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead className="w-[220px]">DATE</TableHead>
                                  <TableHead>COURSE NAME</TableHead>
                                  <TableHead>TGM OUTCOME</TableHead>
                                  <TableHead className="text-right">HRS</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {/* Dec 2025 (Competent) */}
                              <TableRow>
                                  <TableCell className="font-medium text-slate-500">Dec 05, 2025</TableCell>
                                  <TableCell className="font-medium">Advanced Pedagogical Practices</TableCell>
                                  <TableCell><Badge variant="secondary" className="font-normal">Competent Professional</Badge></TableCell>
                                  <TableCell className="text-right">10.0</TableCell>
                              </TableRow>

                              {/* Nov 2025 (Competent & Collaborative) */}
                              <TableRow>
                                  <TableCell className="font-medium text-slate-500">Nov 28, 2025</TableCell>
                                  <TableCell className="font-medium">Assessment Literacy Masterclass</TableCell>
                                  <TableCell><Badge variant="secondary" className="font-normal">Competent Professional</Badge></TableCell>
                                  <TableCell className="text-right">8.0</TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="font-medium text-slate-500">Nov 15, 2025</TableCell>
                                  <TableCell className="font-medium">Peer Support Strategies</TableCell>
                                  <TableCell><Badge variant="secondary" className="font-normal">Collaborative Learner</Badge></TableCell>
                                  <TableCell className="text-right">5.0</TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="font-medium text-slate-500">Nov 02, 2025</TableCell>
                                  <TableCell className="font-medium">Learning beyond Education</TableCell>
                                  <TableCell><Badge variant="secondary" className="font-normal">Collaborative Learner</Badge></TableCell>
                                  <TableCell className="text-right">4.0</TableCell>
                              </TableRow>

                              {/* Oct 2025 (Leader) */}
                              <TableRow>
                                  <TableCell className="font-medium text-slate-500">Oct 20, 2025</TableCell>
                                  <TableCell className="font-medium">Communication for Leadership</TableCell>
                                  <TableCell><Badge variant="secondary" className="font-normal">Transformational Leader</Badge></TableCell>
                                  <TableCell className="text-right">6.0</TableCell>
                              </TableRow>

                              {/* Sep 2025 (Community) */}
                              <TableRow>
                                  <TableCell className="font-medium text-slate-500">Sep 15, 2025</TableCell>
                                  <TableCell className="font-medium">Building Partnerships</TableCell>
                                  <TableCell><Badge variant="secondary" className="font-normal">Community Builder</Badge></TableCell>
                                  <TableCell className="text-right">5.0</TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="font-medium text-slate-500">Sep 10, 2025</TableCell>
                                  <TableCell className="font-medium">Understanding Local Context</TableCell>
                                  <TableCell><Badge variant="secondary" className="font-normal">Community Builder</Badge></TableCell>
                                  <TableCell className="text-right">4.0</TableCell>
                              </TableRow>

                              {/* Jan 2025 (Ethical) - Moved to bottom as it is earliest in the year */}
                              <TableRow>
                                  <TableCell className="font-medium text-slate-500">Jan 15, 2025</TableCell>
                                  <TableCell className="font-medium">Professional Ethics Workshop</TableCell>
                                  <TableCell><Badge variant="secondary" className="font-normal">Ethical Educator</Badge></TableCell>
                                  <TableCell className="text-right">14.0</TableCell>
                              </TableRow>
                              <TableRow>
                                  <TableCell className="font-medium text-slate-500">Jan 10, 2025</TableCell>
                                  <TableCell className="font-medium">Ethics in Research</TableCell>
                                  <TableCell><Badge variant="secondary" className="font-normal">Ethical Educator</Badge></TableCell>
                                  <TableCell className="text-right">2.0</TableCell>
                              </TableRow>
                          </TableBody>
                      </Table>
                  </div>
                  <div className="p-4 border-t bg-slate-50 text-center">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          View All History <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                  </div>
              </Card>
          </section>

        </main>
        
        {/* Floating Action Button: EduAssist */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative group">
              <div className="absolute bottom-full right-0 mb-4 w-64 bg-white p-4 rounded-xl shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto origin-bottom-right">
                  <p className="text-sm text-slate-700">"I can help you find a course or summarize a topic"</p>
                  <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-b border-r border-slate-100 rotate-45 transform"></div>
              </div>
              <Button size="lg" className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 p-0 flex items-center justify-center">
                  <Brain className="h-7 w-7 text-white" />
              </Button>
          </div>
        </div>

        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 border-slate-200 bg-white" 
                        />
                    </div>
                </div>
                <ScrollArea className="max-h-[70vh]">
                    <div className="p-6 space-y-8">
                        
                        {/* Section 1: AI Explanation */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-600">
                                <Sparkles className="h-4 w-4" />
                                <h4 className="text-sm font-bold uppercase tracking-wider">AI Knowledge Summary</h4>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 leading-relaxed text-sm">
                                <p>
                                    <strong>Student distress</strong> manifests through drastic behavioral changes, academic decline, emotional volatility, and social withdrawal, often triggered by stress, anxiety, or personal crises. Key signs include excessive absences, poor hygiene, in-class outbursts, and mentions of hopelessness or self-harm. Early intervention, open communication, and referrals to counseling services are vital support strategies.
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Course Suggestions */}
                        <div className="space-y-4">
                             <div className="flex items-center gap-2 text-blue-600">
                                <BookOpen className="h-4 w-4" />
                                <h4 className="text-sm font-bold uppercase tracking-wider">Recommended Resources</h4>
                            </div>
                            <div className="grid gap-3">
                                <div className="p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                         <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Course</Badge>
                                         <span className="text-xs text-slate-400">45m</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-blue-700 mb-1">Crisis Intervention Strategies</h4>
                                    <p className="text-xs text-slate-500">Learn to identify early warning signs and de-escalate emotional crises.</p>
                                </div>
                                <div className="p-3 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                         <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">Article</Badge>
                                         <span className="text-xs text-slate-400">10m read</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-700 mb-1">Understanding Student Anxiety</h4>
                                    <p className="text-xs text-slate-500">A guide on recognizing the difference between stress and clinical anxiety.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </ScrollArea>
                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
                   Press <kbd className="font-sans border rounded px-1 bg-white">Esc</kbd> to close
                </div>
            </DialogContent>
        </Dialog>

      </div>
    </ScrollArea>
  );
}
