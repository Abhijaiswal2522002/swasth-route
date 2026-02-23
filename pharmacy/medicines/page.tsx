'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useState } from 'react';

export default function PharmacyMedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const medicines = [
    { id: 1, name: 'Aspirin 500mg', quantity: 500, price: 50, reorderLevel: 100 },
    { id: 2, name: 'Paracetamol 650mg', quantity: 300, price: 45, reorderLevel: 100 },
    { id: 3, name: 'Ibuprofen 400mg', quantity: 200, price: 75, reorderLevel: 50 },
    { id: 4, name: 'Vitamin D3 2000IU', quantity: 50, price: 120, reorderLevel: 50 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medicines Inventory</h1>
          <p className="text-muted-foreground">Manage your medicine stock</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Medicine
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary/20 bg-card focus:outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="text-left p-4 font-semibold">Medicine Name</th>
              <th className="text-left p-4 font-semibold">Quantity</th>
              <th className="text-left p-4 font-semibold">Price</th>
              <th className="text-left p-4 font-semibold">Reorder Level</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine.id} className="border-b border-primary/5 hover:bg-primary/5">
                <td className="p-4 font-medium">{medicine.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    medicine.quantity > medicine.reorderLevel
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                  }`}>
                    {medicine.quantity} units
                  </span>
                </td>
                <td className="p-4">₹{medicine.price}</td>
                <td className="p-4">{medicine.reorderLevel}</td>
                <td className="p-4 flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
