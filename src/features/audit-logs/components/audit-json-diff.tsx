import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditJsonValue } from "../types";
import {
  getChangedFieldRows,
  stringifyJson,
} from "../utils";

type AuditJsonDiffProps = {
  newData?: AuditJsonValue;
  oldData?: AuditJsonValue;
};

export function AuditJsonDiff({ newData, oldData }: AuditJsonDiffProps) {
  const changedFields = getChangedFieldRows(oldData, newData);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Changed Fields</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {changedFields.length > 0 ? (
            <div className="space-y-2">
              {changedFields.map((field) => (
                <div
                  key={field.field}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <Badge variant="info">{field.field}</Badge>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <JsonValuePreview label="Old" value={field.oldValue} />
                    <JsonValuePreview label="New" value={field.newValue} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No changed fields were captured for this audit entry.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <JsonBlock label="Old Data JSON" value={oldData} />
        <JsonBlock label="New Data JSON" value={newData} />
      </div>
    </div>
  );
}

function JsonValuePreview({
  label,
  value,
}: {
  label: string;
  value?: AuditJsonValue;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <pre className="mt-1 max-h-28 overflow-auto rounded-md bg-muted p-2 text-xs text-foreground">
        {stringifyJson(value)}
      </pre>
    </div>
  );
}

function JsonBlock({
  label,
  value,
}: {
  label: string;
  value?: AuditJsonValue;
}) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs leading-5 text-foreground">
          {stringifyJson(value)}
        </pre>
      </CardContent>
    </Card>
  );
}
