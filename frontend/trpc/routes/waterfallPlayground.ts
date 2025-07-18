import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { 
  companyInvestors,
  companyInvestorEntities,
  users,
  shareClasses, 
  shareHoldings, 
  convertibleSecurities,
  convertibleInvestments 
} from "@/db/schema";
import { companyProcedure, createRouter } from "@/trpc";

export const waterfallPlaygroundRouter = createRouter({
  // Get all cap table data needed for waterfall playground
  getCapTableData: companyProcedure.query(async ({ ctx }) => {
    if (!ctx.companyAdministrator && !ctx.companyLawyer) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    try {
      // Fetch all investor entities (non-user investors)
      const investorEntities = await db
        .select()
        .from(companyInvestorEntities)
        .where(eq(companyInvestorEntities.companyId, ctx.company.id));

      // Fetch all user investors with their user data
      const userInvestors = await db
        .select({
          id: companyInvestors.externalId,
          userId: users.externalId,
          name: users.legalName,
          email: users.email,
          totalShares: companyInvestors.totalShares,
          totalOptions: companyInvestors.totalOptions,
        })
        .from(companyInvestors)
        .innerJoin(users, eq(companyInvestors.userId, users.id))
        .where(eq(companyInvestors.companyId, ctx.company.id));

      // Combine both types of investors
      const allInvestors = [
        ...investorEntities.map(inv => ({
          id: inv.externalId,
          name: inv.name || 'Unknown Entity',
          email: inv.email,
          isEntity: true,
        })),
        ...userInvestors.map(inv => ({
          id: inv.id,
          name: inv.name || 'Unknown User',
          email: inv.email,
          isEntity: false,
        })),
      ];

      // Fetch all share classes - start with basic fields
      const shareClassesData = await db
        .select()
        .from(shareClasses)
        .where(eq(shareClasses.companyId, ctx.company.id));

      // Fetch all share holdings
      const shareHoldingsData = await db
        .select()
        .from(shareHoldings)
        .innerJoin(companyInvestors, eq(shareHoldings.companyInvestorId, companyInvestors.id))
        .innerJoin(shareClasses, eq(shareHoldings.shareClassId, shareClasses.id))
        .where(eq(shareClasses.companyId, ctx.company.id));

      // Fetch all convertible securities
      const convertibleSecuritiesData = await db
        .select()
        .from(convertibleSecurities)
        .innerJoin(companyInvestors, eq(convertibleSecurities.companyInvestorId, companyInvestors.id))
        .innerJoin(convertibleInvestments, eq(convertibleSecurities.convertibleInvestmentId, convertibleInvestments.id))
        .where(eq(companyInvestors.companyId, ctx.company.id));

      // Transform the data to a simpler format
      return {
        investors: allInvestors,
        shareClasses: shareClassesData.map((sc, index) => ({
          id: sc.id,
          name: sc.name,
          preferred: sc.name.toLowerCase().includes('preferred'),
          originalIssuePriceInDollars: sc.originalIssuePriceInDollars,
          // Default waterfall terms since they don't exist in DB
          liquidationPreferenceMultiple: sc.name.toLowerCase().includes('preferred') ? 1.0 : 0,
          participating: false,
          participationCapMultiple: null,
          seniorityRank: sc.name.toLowerCase().includes('preferred') ? index : 999, // Preferred classes get priority
        })),
        shareHoldings: shareHoldingsData.map(sh => ({
          id: sh.share_holdings.id,
          investorId: sh.company_investors.externalId,
          shareClassId: sh.share_holdings.shareClassId,
          numberOfShares: sh.share_holdings.numberOfShares,
          sharePriceUsd: sh.share_holdings.sharePriceUsd,
          totalAmountInCents: sh.share_holdings.totalAmountInCents,
          issuedAt: sh.share_holdings.issuedAt,
        })),
        convertibleSecurities: convertibleSecuritiesData.map(cs => ({
          id: cs.convertible_securities.id,
          investorId: cs.company_investors.externalId,
          convertibleType: cs.convertible_investments.convertibleType,
          principalValueInCents: cs.convertible_securities.principalValueInCents,
          // Properties may not exist in DB yet, use safe access
          valuationCapInDollars: (cs.convertible_investments as any).valuationCapInDollars || null,
          discountRate: (cs.convertible_investments as any).discountRate || null,
          interestRate: (cs.convertible_investments as any).interestRate || null,
          maturityDate: (cs.convertible_investments as any).maturityDate || null,
          issuedAt: cs.convertible_securities.issuedAt,
        })),
      };
    } catch (error) {
      console.error('Error fetching cap table data:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch cap table data',
        cause: error,
      });
    }
  }),
});