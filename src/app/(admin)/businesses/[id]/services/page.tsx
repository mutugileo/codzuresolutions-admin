import { getBusinessServices } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";
import { Scissors, Users } from "lucide-react";

export default async function BusinessServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { services, providers } = await getBusinessServices(id);

  return (
    <div className="pt-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{services.length} Services</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <EmptyState icon={Scissors} title="No services defined" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead className="text-right">Base Price</TableHead>
                  <TableHead>Commission Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell className="font-medium">{svc.name}</TableCell>
                    <TableCell className="text-right">{formatKES(svc.base_price)}</TableCell>
                    <TableCell className="text-sm">{svc.commission_type || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={svc.is_active ? "default" : "secondary"}>
                        {svc.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{providers.length} Service Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <EmptyState icon={Users} title="No service providers" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((prov) => (
                  <TableRow key={prov.id}>
                    <TableCell className="font-medium">{prov.full_name}</TableCell>
                    <TableCell className="text-sm">{prov.role || "-"}</TableCell>
                    <TableCell className="text-sm">{prov.phone_number || "-"}</TableCell>
                    <TableCell className="text-sm">
                      {prov.commission_type === "PERCENTAGE"
                        ? `${prov.commission_rate}%`
                        : `KES ${prov.flat_fee}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={prov.is_active ? "default" : "secondary"}>
                        {prov.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
