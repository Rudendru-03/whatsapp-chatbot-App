"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const ViewFlows = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await fetch("/api/flows");
        if (!response.ok) throw new Error("Failed to fetch flows");
        const result = await response.json();
        setData(result?.data || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, []);

  if (error) return <div>Failed to load flows</div>;

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Flows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Validation Errors</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  </TableRow>
                ))
              ) : (
                data.map((flow) => (
                  <TableRow key={flow.id}>
                    <TableCell className="font-medium">{flow.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          flow.status === "PUBLISHED" ? "default" :
                            flow.status === "DRAFT" ? "secondary" :
                              "destructive"
                        }
                      >
                        {flow.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{flow.categories?.join(", ") || "None"}</TableCell>
                    <TableCell>
                      {flow.validation_errors?.length > 0
                        ? flow.validation_errors.join(", ")
                        : "No errors"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{flow.id}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}