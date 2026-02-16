import { getBusinessProducts } from "@/actions/businesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatKES, formatNumber } from "@/lib/formatters";
import { EmptyState } from "@/components/shared/empty-state";
import { Package } from "lucide-react";

export default async function BusinessProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getBusinessProducts(id);

  return (
    <div className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{products.length} Products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <EmptyState icon={Package} title="No products" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Selling</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const lowStock = product.track_inventory && product.quantity <= product.low_stock_threshold;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{product.sku || "-"}</TableCell>
                        <TableCell className="text-right text-sm">{formatKES(product.cost_price)}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{formatKES(product.selling_price)}</TableCell>
                        <TableCell className="text-right">
                          <span className={lowStock ? "text-destructive font-medium" : ""}>
                            {formatNumber(product.quantity)}
                          </span>
                          {lowStock && <span className="text-xs text-destructive ml-1">LOW</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
