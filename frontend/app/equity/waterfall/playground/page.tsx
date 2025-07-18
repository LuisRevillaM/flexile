"use client";

import React, { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentCompany, useCurrentUser } from "@/global";
import EquityLayout from "@/app/equity/Layout";
import Placeholder from "@/components/Placeholder";
import WaterfallChartPro from "@/components/WaterfallChartPro";
import ExitAmountControl from "@/components/ExitAmountControl";
import { usePlayground } from "@/lib/equity-modeling/store";
import { useLoadCapTable } from "@/lib/equity-modeling/useLoadCapTable";
import { formatMoneyFromCents } from "@/utils/formatMoney";
import ShareClassTermsPanel from "@/components/equity-modeling/ShareClassTermsPanel";
import ConvertibleTermsPanel from "@/components/equity-modeling/ConvertibleTermsPanel";

export default function WaterfallPlaygroundPage() {
  const company = useCurrentCompany();
  const user = useCurrentUser();
  const isAdmin = !!user.roles.administrator;
  const isLawyer = !!user.roles.lawyer;
  
  const [hoveredPayout, setHoveredPayout] = useState<any>(null);
  
  // Playground state - must be called before any conditional returns
  const {
    investors,
    shareClasses,
    shareHoldings,
    convertibleSecurities,
    scenario,
    payouts,
    isCalculating,
    updateExitAmount,
    resetToDefaults,
    exportConfiguration,
    hasUnsavedChanges,
  } = usePlayground();
  
  // Load cap table data from database - must be called before any conditional returns
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
    a.download = `waterfall-scenario-${scenario.name.replace(/\s+/g, '-')}.json`;
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Waterfall Playground</h1>
          <p className="text-gray-600">Configure cap table terms and see real-time liquidation scenarios</p>
        </div>

        {/* Sticky Visualization Section */}
        <div className="sticky top-0 z-10 bg-white pb-6">
          <Card className="p-6">
            <div className="space-y-4">
              {/* Exit Amount Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exit Amount
                </label>
                <ExitAmountControl
                  exitAmountCents={scenario.exitAmountCents}
                  onExitAmountChange={updateExitAmount}
                />
              </div>

              {/* Waterfall Chart */}
              <div>
                <WaterfallChartPro
                  payouts={payouts}
                  exitAmountCents={scenario.exitAmountCents}
                  onPayoutHover={setHoveredPayout}
                  highlightedPayoutId={hoveredPayout?.id}
                  isCalculating={isCalculating}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Scrollable Configuration Area */}
        <div className="space-y-6">
          {/* Configuration Panels */}
          <ShareClassTermsPanel />
          <ConvertibleTermsPanel />

          {/* Detailed Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
            
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
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
          </Card>
        </div>
      </div>
    </EquityLayout>
  );
}