"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "@/lib/actions/service-catalog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { NewService, Service } from "@/lib/db/schema";

export default function ServiceCatalogPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<NewService>>({
    name: "",
    serviceCode: "",
    referenceFormat: "",
    commissionRate: "0",
    fixedCommission: null,
    creditLimit: null,
    dailyLimit: null,
    isActive: true,
  });

  // Fetch all services
  const {
    data: servicesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-services"],
    queryFn: () => getAllServices(user),
    enabled: !!user,
  });

  // Create service mutation
  const createMutation = useMutation({
    mutationFn: (data: NewService) => createService(user, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-services"] });
      toast.success("Service created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create service");
    },
  });

  // Update service mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewService> }) =>
      updateService(user, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-services"] });
      toast.success("Service updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update service");
    },
  });

  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(user, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-services"] });
      toast.success("Service deactivated successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate service");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      serviceCode: "",
      referenceFormat: "",
      commissionRate: "0",
      fixedCommission: null,
      creditLimit: null,
      dailyLimit: null,
      isActive: true,
    });
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      serviceCode: service.serviceCode,
      referenceFormat: service.referenceFormat,
      commissionRate: service.commissionRate,
      fixedCommission: service.fixedCommission,
      creditLimit: service.creditLimit,
      dailyLimit: service.dailyLimit,
      isActive: service.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData as NewService);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to deactivate this service?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load services. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const services = servicesData?.data || [];

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Service Catalog Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Edit Service" : "Add New Service"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceCode">Service Code</Label>
                    <Input
                      id="serviceCode"
                      value={formData.serviceCode}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceCode: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="referenceFormat">Reference Format</Label>
                    <Input
                      id="referenceFormat"
                      value={formData.referenceFormat}
                      onChange={(e) =>
                        setFormData({ ...formData, referenceFormat: e.target.value })
                      }
                      placeholder="e.g., ^[0-9]{10}$"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      step="0.0001"
                      value={formData.commissionRate}
                      onChange={(e) =>
                        setFormData({ ...formData, commissionRate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fixedCommission">Fixed Commission ($)</Label>
                    <Input
                      id="fixedCommission"
                      type="number"
                      step="0.01"
                      value={formData.fixedCommission || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fixedCommission: e.target.value || null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="creditLimit">Credit Limit ($)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      step="0.01"
                      value={formData.creditLimit || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          creditLimit: e.target.value || null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dailyLimit">Daily Limit ($)</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      step="0.01"
                      value={formData.dailyLimit || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dailyLimit: e.target.value || null,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingService ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Fixed Commission</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.serviceCode}</TableCell>
                  <TableCell>{service.commissionRate}%</TableCell>
                  <TableCell>
                    {service.fixedCommission ? `$${service.fixedCommission}` : "-"}
                  </TableCell>
                  <TableCell>
                    {service.creditLimit ? `$${service.creditLimit}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        disabled={!service.isActive}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
