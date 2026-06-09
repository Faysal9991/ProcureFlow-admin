"use client";

import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/client";
import type { ComparisonQuotation, RFQComparison } from "../types";
import { formatCurrency } from "../utils";

type QuotationComparisonTableProps = {
  canSelect: boolean;
  comparison?: RFQComparison;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onSelect: (quotation: ComparisonQuotation) => void;
};

export function QuotationComparisonTable({
  canSelect,
  comparison,
  error,
  isError,
  isLoading,
  onSelect,
}: QuotationComparisonTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quotation Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </CardContent>
      </Card>
    );
  }

  if (!comparison || comparison.quotations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
            No quotations have been submitted yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quotation Ranking</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Quotation</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparison.quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">#{quotation.rank}</TableCell>
                  <TableCell className="min-w-44">
                    <div className="flex items-center gap-2">
                      {quotation.rank === 1 ? (
                        <Trophy className="size-4 text-warning" />
                      ) : null}
                      {quotation.vendor.name}
                    </div>
                  </TableCell>
                  <TableCell>{quotation.quotationNumber || "Not set"}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(quotation.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={quotation.isSelected ? "success" : "default"}>
                      {quotation.isSelected ? "Selected" : "Submitted"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      {canSelect && !quotation.isSelected ? (
                        <Button
                          size="sm"
                          onClick={() => onSelect(quotation)}
                        >
                          Select
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item Price Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                {comparison.quotations.map((quotation) => (
                  <TableHead key={quotation.id}>{quotation.vendor.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparison.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-56">
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit}
                    </p>
                  </TableCell>
                  {comparison.quotations.map((quotation) => {
                    const quotationItem = quotation.items.find(
                      (candidate) => candidate.rfqItemId === item.id,
                    );
                    return (
                      <TableCell key={`${quotation.id}-${item.id}`}>
                        {quotationItem ? (
                          <div>
                            <p className="font-medium">
                              {formatCurrency(quotationItem.unitPrice)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(quotationItem.totalPrice)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
