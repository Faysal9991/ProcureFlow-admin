"use client";

import Link from "next/link";
import { Inbox, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/client";
import type { BudgetTransaction } from "../types";
import {
  formatBudgetCurrency,
  formatBudgetDateTime,
  getBudgetTransactionTypeLabel,
  getBudgetTransactionVariant,
} from "../utils";

type BudgetTransactionTableProps = {
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  transactions: BudgetTransaction[];
};

export function BudgetTransactionTable({
  error,
  isError,
  isLoading,
  transactions,
}: BudgetTransactionTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[120px_120px_1fr_160px]"
              >
                {Array.from({ length: 4 }).map((__, childIndex) => (
                  <div key={childIndex} className="h-4 rounded-md bg-muted" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Transactions unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {getApiErrorMessage(error)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No transactions yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reservations, releases, consumption, and adjustments will appear
                here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Purchase Request</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Badge variant={getBudgetTransactionVariant(transaction.type)}>
                    {getBudgetTransactionTypeLabel(transaction.type)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatBudgetCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="min-w-52 text-muted-foreground">
                  {transaction.note || "Not set"}
                </TableCell>
                <TableCell className="min-w-44">
                  {transaction.purchaseRequestId ? (
                    <Link
                      className="text-primary hover:underline"
                      href={`/purchase-requests/${transaction.purchaseRequestId}`}
                    >
                      {transaction.purchaseRequestId}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Not linked</span>
                  )}
                </TableCell>
                <TableCell className="min-w-40 text-muted-foreground">
                  {transaction.createdBy.name || transaction.createdBy.role}
                </TableCell>
                <TableCell className="min-w-40 text-muted-foreground">
                  {formatBudgetDateTime(transaction.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
