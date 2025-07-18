"use client";

import React, { useState } from "react";
import { Download, RotateCcw, ChevronDown, ChevronUp, ChevronRight, DollarSign, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentUser } from "@/global";
import EquityLayout from "@/app/equity/Layout";
import Placeholder from "@/components/Placeholder";
import WaterfallChartPro from "@/components/WaterfallChartPro";
import ExitAmountControl from "@/components/ExitAmountControl";
import { usePlayground } from "@/lib/equity-modeling/store";
import { useLoadCapTable } from "@/lib/equity-modeling/useLoadCapTable";
import { formatMoneyFromCents, formatCompactMoney } from "@/utils/formatMoney";
import ShareClassTermsPanel from "@/components/equity-modeling/ShareClassTermsPanel";
import ConvertibleTermsPanel from "@/components/equity-modeling/ConvertibleTermsPanel";

type SidebarTab = 'exit' | 'terms';

export default function WaterfallPlaygroundPage() {
  const user = useCurrentUser();
  const isAdmin = !!user.roles.administrator;
  const isLawyer = !!user.roles.lawyer;
  
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('exit');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [hoveredPayout, setHoveredPayout] = useState<any>(null);
  const [expandedInvestors, setExpandedInvestors] = useState<Set<string>>(new Set());
  
  // Playground state
  const {
    scenario,
    payouts,
    isCalculating,
    updateExitAmount,
    resetToDefaults,
    exportConfiguration,
    hasUnsavedChanges,
  } = usePlayground();
  
  // Load cap table data from database
  const { isLoading: isLoadingCapTable, error: loadError } = useLoadCapTable();

  // Check authorization
  if (!isAdmin && !isLawyer) {
    return (
      <EquityLayout>
        <Placeholder>You don't have permission to access the waterfall playground.</Placeholder>
      </EquityLayout>
    );
  }

  // Loading state
  if (isLoadingCapTable) {
    return (
      <EquityLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading cap table data...</p>
          </div>
        </div>
      </EquityLayout>
    );
  }

  // Error state
  if (loadError) {
    return (
      <EquityLayout>
        <Placeholder>
          <div className="text-red-600">
            Failed to load cap table data: {loadError.message}
          </div>
        </Placeholder>
      </EquityLayout>
    );
  }

  const handleExport = () => {
    const config = exportConfiguration();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waterfall-scenario-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <EquityLayout
      headerActions={
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="small" 
            onClick={resetToDefaults}
            disabled={!hasUnsavedChanges}
          >
            <RotateCcw className="size-4 mr-2" />
            Reset
          </Button>
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleExport}
          >
            <Download className="size-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      <div className="flex gap-6" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Left Sidebar */}
        <div className="w-[420px] flex-shrink-0">
          <Card className={`flex flex-col ${sidebarTab === 'exit' ? 'h-auto' : 'h-full'}`}>
            {/* Sidebar Tabs */}
            <div className="p-2">
              <nav className="flex gap-1">
                <button
                  onClick={() => setSidebarTab('exit')}
                  className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    sidebarTab === 'exit'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="size-4" />
                  Exit Amount
                </button>
                <button
                  onClick={() => setSidebarTab('terms')}
                  className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    sidebarTab === 'terms'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="size-4" />
                  Terms
                </button>
              </nav>
            </div>

            {/* Sidebar Content */}
            <div className={`p-6 ${sidebarTab === 'terms' ? 'flex-1 overflow-y-auto' : ''}`}>
              {sidebarTab === 'exit' ? (
                <div className="space-y-6">
                  <ExitAmountControl
                    exitAmountCents={scenario.exitAmountCents}
                    onExitAmountChange={updateExitAmount}
                  />
                  <div className="text-sm text-gray-500 border-t pt-4">
                    <p className="flex items-start gap-2">
                      <span className="text-gray-400">💡</span>
                      <span>Low exits favor liquidation preferences, high exits favor common shareholders</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <ShareClassTermsPanel className="shadow-none border-0 p-0" />
                  <hr className="border-gray-200" />
                  <ConvertibleTermsPanel className="shadow-none border-0 p-0" />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Main Area - Always Show Waterfall */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Waterfall Chart - Always Visible */}
          <Card className="flex-1 p-6 min-h-0">
            <div className="h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Liquidation Waterfall</h3>
              <div className="flex-1 min-h-0">
                <WaterfallChartPro
                  payouts={payouts}
                  exitAmountCents={scenario.exitAmountCents}
                  onPayoutHover={setHoveredPayout}
                  highlightedPayoutId={hoveredPayout?.id}
                  isCalculating={isCalculating}
                  hideHeader={true}
                  isCompressed={showBreakdown}
                  className="h-full"
                />
              </div>
            </div>
          </Card>

          {/* Breakdown - Expandable */}
          <Card className={`overflow-hidden transition-all duration-300 flex flex-col ${showBreakdown ? 'flex-1' : 'flex-none'}`}>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Investor Breakdown</span>
              {showBreakdown ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
            </button>
            
            {showBreakdown && (
              <div className="border-t border-gray-200 flex-1 overflow-hidden flex flex-col">
                <div className="p-6 overflow-y-auto flex-1">
                  {isCalculating ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mr-3" />
                      Calculating...
                    </div>
                  ) : payouts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-lg font-medium">No Payouts</div>
                      <div className="text-sm">Configure your cap table to see distributions</div>
                    </div>
                  ) : (() => {
                    // Group payouts by investor
                    const investorGroups = payouts.reduce((acc, payout) => {
                      if (!acc[payout.investorName]) {
                        acc[payout.investorName] = {
                          name: payout.investorName,
                          payouts: [],
                          totalAmount: 0,
                        };
                      }
                      acc[payout.investorName].payouts.push(payout);
                      acc[payout.investorName].totalAmount += Number(payout.payoutAmountCents);
                      return acc;
                    }, {} as Record<string, { name: string; payouts: typeof payouts; totalAmount: number }>);
                    
                    const totalExitAmount = Number(scenario.exitAmountCents);
                    const sortedInvestors = Object.values(investorGroups).sort((a, b) => b.totalAmount - a.totalAmount);
                    
                    return (
                      <div className="space-y-1">
                        {sortedInvestors.map((investor) => {
                          const percentage = (investor.totalAmount / totalExitAmount) * 100;
                          const isExpanded = expandedInvestors.has(investor.name);
                          
                          return (
                            <div key={investor.name} className="border border-gray-200 rounded-lg overflow-hidden">
                              {/* Investor Summary Row */}
                              <div
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => {
                                  const newExpanded = new Set(expandedInvestors);
                                  if (isExpanded) {
                                    newExpanded.delete(investor.name);
                                  } else {
                                    newExpanded.add(investor.name);
                                  }
                                  setExpandedInvestors(newExpanded);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <ChevronRight 
                                      className={`size-4 text-gray-400 transition-transform ${
                                        isExpanded ? 'rotate-90' : ''
                                      }`} 
                                    />
                                    <span className="font-medium text-gray-900">{investor.name}</span>
                                    <span className="text-sm text-gray-500">
                                      ({investor.payouts.length} {investor.payouts.length === 1 ? 'holding' : 'holdings'})
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    {/* Percentage Bar */}
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 bg-gray-100 rounded-full h-2">
                                        <div 
                                          className="bg-gray-600 h-full rounded-full transition-all"
                                          style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-sm text-gray-600 w-12 text-right">
                                        {percentage.toFixed(1)}%
                                      </span>
                                    </div>
                                    
                                    {/* Total Amount */}
                                    <span className="font-semibold text-gray-900 w-20 text-right">
                                      {formatCompactMoney(investor.totalAmount)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="bg-gray-50 border-t border-gray-200">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="text-left px-4 py-2 font-medium">Share Class</th>
                                        <th className="text-right px-4 py-2 font-medium">Shares</th>
                                        <th className="text-right px-4 py-2 font-medium">Liquidation</th>
                                        <th className="text-right px-4 py-2 font-medium">Participation</th>
                                        <th className="text-right px-4 py-2 font-medium">Common</th>
                                        <th className="text-right px-4 py-2 font-medium">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {investor.payouts.map((payout) => (
                                        <tr 
                                          key={payout.id}
                                          className={`border-t border-gray-100 ${
                                            hoveredPayout?.id === payout.id ? 'bg-blue-50' : ''
                                          }`}
                                          onMouseEnter={() => setHoveredPayout(payout)}
                                          onMouseLeave={() => setHoveredPayout(null)}
                                        >
                                          <td className="px-4 py-2 text-gray-700">{payout.shareClassName}</td>
                                          <td className="px-4 py-2 text-right text-gray-600">
                                            {payout.numberOfShares.toLocaleString()}
                                          </td>
                                          <td className="px-4 py-2 text-right text-gray-600">
                                            {payout.liquidationPreferenceAmount > 0 
                                              ? formatCompactMoney(payout.liquidationPreferenceAmount)
                                              : '-'
                                            }
                                          </td>
                                          <td className="px-4 py-2 text-right text-gray-600">
                                            {payout.participationAmount > 0 
                                              ? formatCompactMoney(payout.participationAmount)
                                              : '-'
                                            }
                                          </td>
                                          <td className="px-4 py-2 text-right text-gray-600">
                                            {payout.commonProceedsAmount > 0 
                                              ? formatCompactMoney(payout.commonProceedsAmount)
                                              : '-'
                                            }
                                          </td>
                                          <td className="px-4 py-2 text-right font-medium text-gray-900">
                                            {formatCompactMoney(payout.payoutAmountCents)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </EquityLayout>
  );
}