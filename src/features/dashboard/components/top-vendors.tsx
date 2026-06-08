"use client";

import { Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import type { TopVendorItem } from "../types";
import { formatCurrency, formatNumber } from "../utils";
import { getSectionErrorMessage, SectionState } from "./section-state";

type TopVendorsProps = {
  data?: TopVendorItem[];
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isUnavailable?: boolean;
};

export function TopVendors({
  data,
  error,
  isError,
  isLoading,
  isUnavailable,
}: TopVendorsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Top Vendors</CardTitle>
            <CardDescription>Vendors ranked by purchase order amount.</CardDescription>
          </div>
          <Building2 className="size-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {isUnavailable ? (
          <SectionState
            message="Vendor ranking is not available for this role."
            title="Not available for this role"
            type="unavailable"
          />
        ) : isLoading ? (
          <SectionState title="Loading top vendors" type="loading" />
        ) : isError ? (
          <SectionState
            message={getSectionErrorMessage(error)}
            title="Top vendors unavailable"
            type="error"
          />
        ) : !data?.length ? (
          <SectionState
            message="No vendor spend was found for this filter range."
            title="No vendor activity"
            type="empty"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>POs</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((vendor) => (
                <TableRow key={vendor.vendorId}>
                  <TableCell className="font-medium">
                    {vendor.vendorName}
                  </TableCell>
                  <TableCell>{formatNumber(vendor.poCount)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right font-medium">
                    {formatCurrency(vendor.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
