"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Trash2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const ViewFlows = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    const deleteFlow = async (id: string) => {
        if (!confirm("Are you sure you want to delete this flow?")) return;
        try {
            const response = await fetch("/api/flows", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete flow");
            }

            setData((prevData) => prevData.filter((flow) => flow.id !== id));
        } catch (error) {
            console.error("Error deleting flow:", error);
        }
    };

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
                                <TableHead>Actions</TableHead>
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
                                        <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
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
                                        <TableCell className="text-right flex gap-2">
                                            {flow.preview?.preview_url ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Eye onClick={() => setPreviewUrl(flow.preview.preview_url)} className="cursor-pointer text-blue-500 hover:text-blue-700 transition" />
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl">
                                                        <DialogTitle>Flow Preview</DialogTitle>
                                                        {previewUrl && (
                                                            <iframe src={previewUrl} width="100%" height="800px" className="rounded-md border"></iframe>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <span className="text-muted-foreground">No Preview</span>
                                            )}
                                            <Trash2 onClick={() => deleteFlow(flow.id)} className="cursor-pointer text-red-500 hover:text-red-700 transition" />
                                        </TableCell>
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