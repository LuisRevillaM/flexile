"use client";

import React, { useState } from "react";
import { Download, RotateCcw, ChevronDown, ChevronUp, DollarSign, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentUser } from "@/global";
import EquityLayout from "@/app/equity/Layout";
import Placeholder from "@/components/Placeholder";
import WaterfallChartPro from "@/components/WaterfallChartPro";
import ExitAmountControl from "@/components/ExitAmountControl";
import { usePlayground } from "@/lib/equity-modeling/store";
import { useLoadCapTable } from "@/lib/equity-modeling/useLoadCapTable";
import { formatMoneyFromCents } from "@/utils/formatMoney";
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Waterfall Playground</h1>
      </div>
      
      <div className="flex gap-6" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Left Sidebar */}
        <div className="w-[420px] flex-shrink-0">
          <Card className="h-full flex flex-col">
            {/* Sidebar Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setSidebarTab('exit')}
                  className={`flex-1 py-3 px-4 border-b-2 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    sidebarTab === 'exit'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className="size-4" />
                  Exit Amount
                </button>
                <button
                  onClick={() => setSidebarTab('terms')}
                  className={`flex-1 py-3 px-4 border-b-2 font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    sidebarTab === 'terms'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Settings className="size-4" />
                  Terms
                </button>
              </nav>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {sidebarTab === 'exit' ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Exit Scenario</h3>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exit Amount
                    </label>
                    <ExitAmountControl
                      exitAmountCents={scenario.exitAmountCents}
                      onExitAmountChange={updateExitAmount}
                    />
                    <p className="text-sm text-gray-500 mt-4">
                      <strong>Tip:</strong> Low exits favor liquidation preferences, high exits favor common shareholders
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <ShareClassTermsPanel className="shadow-none border-0 p-0" />
                  </div>
                  <div className="border-t pt-6">
                    <ConvertibleTermsPanel className="shadow-none border-0 p-0" />
                  </div>
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
          <Card className={`overflow-hidden transition-all duration-300 ${showBreakdown ? 'flex-1' : 'flex-none'}`}>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">Detailed Breakdown</span>
              {showBreakdown ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
            </button>
            
            {showBreakdown && (
              <div className="px-6 pb-6 border-t border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                {isCalculating ? (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
                    Calculating...
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-lg font-medium">No Payouts</div>
                    <div className="text-sm">Configure your cap table to see distributions</div>
                  </div>
                ) : (
                  <div className="overflow-auto mt-4 flex-1">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Investor</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-700">Share Class</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Shares</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Liquidation</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Participation</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Common</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-700">Total Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts.map((payout) => (
                          <tr 
                            key={payout.id} 
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              hoveredPayout?.id === payout.id ? 'bg-blue-50' : ''
                            }`}
                            onMouseEnter={() => setHoveredPayout(payout)}
                            onMouseLeave={() => setHoveredPayout(null)}
                          >
                            <td className="py-3 px-2 font-medium">{payout.investorName}</td>
                            <td className="py-3 px-2 text-gray-600">{payout.shareClassName}</td>
                            <td className="py-3 px-2 text-right">{payout.numberOfShares.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right">
                              {formatMoneyFromCents(payout.liquidationPreferenceAmount)}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {formatMoneyFromCents(payout.participationAmount)}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {formatMoneyFromCents(payout.commonProceedsAmount)}
                            </td>
                            <td className="py-3 px-2 text-right font-semibold">
                              {formatMoneyFromCents(payout.payoutAmountCents)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </EquityLayout>
  );
}