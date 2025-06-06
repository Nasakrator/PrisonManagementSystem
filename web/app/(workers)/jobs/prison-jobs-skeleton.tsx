import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function JobDashboardSkeleton() {
    return (
        <div className="container mx-auto py-6 space-y-6 max-w-5xl">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start">
                <div>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
            </div>

            {/* Summary Bar Skeleton */}
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-12" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Skeleton */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Skeleton className="h-4 w-24" />
                                </TableHead>
                                <TableHead className="flex justify-center">
                                    <Skeleton className="h-4 w-16" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-40" />
                                    </TableCell>
                                    <TableCell className="flex justify-center">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
