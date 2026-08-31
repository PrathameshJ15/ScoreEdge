'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DBMS_QUESTION_CLUSTERS, MVP_SUBJECTS } from '@/data/sppuData';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Users,
  Database,
  DollarSign,
  Plus,
  Edit,
} from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'content' | 'verification' | 'users'>('content');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 md:p-8 rounded-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">ScoreEdge Admin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Content Management & Analytics</h1>
            <p className="text-xs text-slate-400 mt-1">Manage SPPU academic hierarchy, question verification pipeline, and entitlements.</p>
          </div>

          <Button variant="primary" className="gap-1.5 text-xs">
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <span className="text-xs text-slate-500 block">Total Subjects</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">142</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">+5 MVP Active</span>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-slate-500 block">Indexed PYQs</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">18,920</span>
            <span className="text-[11px] text-brand-600 font-semibold block mt-1">94% Verified</span>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-slate-500 block">Active Students</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">12,482</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">SE Computer Lead</span>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-slate-500 block">Premium Subscribers</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">1,240</span>
            <span className="text-[11px] text-amber-600 font-semibold block mt-1">₹60,760 Revenue</span>
          </Card>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-control text-xs font-bold transition-all ${
              activeTab === 'content' ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
            }`}
          >
            Subject & Unit Hierarchy
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 rounded-control text-xs font-bold transition-all ${
              activeTab === 'verification' ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
            }`}
          >
            Question Verification Pipeline
          </button>
        </div>

        {/* TAB 1: SUBJECT HIERARCHY */}
        {activeTab === 'content' && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active MVP Subjects</h2>
              <span className="text-xs text-slate-500">Showing SE Computer Engineering</span>
            </div>

            <div className="space-y-3">
              {MVP_SUBJECTS.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-control border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{s.name} ({s.shortName})</span>
                      <Badge variant="brand">Sem {s.semester}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">Code: {s.code} • {s.totalUnits} Units • {s.totalPYQs} PYQs</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <Edit className="w-3.5 h-3.5" /> Edit Units
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* TAB 2: VERIFICATION PIPELINE */}
        {activeTab === 'verification' && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pending Verification Queue</h2>
              <Badge variant="warning">3 Questions Need Review</Badge>
            </div>

            <div className="space-y-3">
              {DBMS_QUESTION_CLUSTERS.slice(0, 3).map((c) => (
                <div key={c.id} className="p-4 bg-white dark:bg-slate-900 rounded-control border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400">CLUSTER ID: {c.id}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.conceptName}</h3>
                    <span className="text-xs text-slate-500">Confidence: 96% • Proposed Priority: {c.priority}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" className="text-xs">
                      Approve & Publish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

      </main>

      <Footer />
    </div>
  );
}
