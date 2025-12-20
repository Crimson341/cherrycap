"use client";

import React, { useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  FileText,
  Check,
  Loader2,
  Sparkles,
  Receipt,
  Printer,
  Copy,
  ChevronRight,
  Edit3,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  InvoiceData,
  InvoiceLineItem,
  BuildStep,
  formatCurrency,
  calculateInvoiceTotals,
} from "@/lib/invoice-types";
import { cn } from "@/lib/utils";

interface InvoiceBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  isBuilding: boolean;
  buildSteps: BuildStep[];
  onInvoiceUpdate?: (invoice: InvoiceData) => void;
}

// Lazy load PDF libraries for client-side only
const generatePDF = async (element: HTMLElement, filename: string): Promise<void> => {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");
  
  // Create canvas from element
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });
  
  // Create PDF
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });
  
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
};

// Invoice Preview Component
const InvoicePreview: React.FC<{
  invoice: InvoiceData;
  isBuilding: boolean;
}> = ({ invoice, isBuilding }) => {
  const calculatedInvoice = calculateInvoiceTotals(invoice);

  return (
    <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-[600px] mx-auto">
      {/* Invoice Header */}
      <div
        className="p-6 text-white"
        style={{ backgroundColor: invoice.accentColor || "#e11d48" }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">INVOICE</h1>
            <p className="text-white/80 text-sm mt-1">
              #{invoice.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                invoice.status === "draft" && "bg-white/20 text-white",
                invoice.status === "pending" && "bg-yellow-400 text-yellow-900",
                invoice.status === "paid" && "bg-green-400 text-green-900",
                invoice.status === "overdue" && "bg-red-400 text-red-900"
              )}
            >
              {invoice.status === "draft" && isBuilding && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Body */}
      <div className="p-6 space-y-6">
        {/* Dates Row */}
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">
              Issue Date
            </p>
            <p className="text-gray-900 font-medium mt-1">
              {invoice.issueDate || "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs uppercase tracking-wider">
              Due Date
            </p>
            <p className="text-gray-900 font-medium mt-1">
              {invoice.dueDate || "—"}
            </p>
          </div>
        </div>

        {/* From / To Section */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
              From
            </p>
            <div className="text-sm text-gray-900">
              <p className="font-semibold">
                {invoice.from.name || (
                  <span className="text-gray-300 italic">Your Business</span>
                )}
              </p>
              {invoice.from.email && (
                <p className="text-gray-600">{invoice.from.email}</p>
              )}
              {invoice.from.address && <p>{invoice.from.address}</p>}
              {(invoice.from.city || invoice.from.state || invoice.from.zip) && (
                <p>
                  {[invoice.from.city, invoice.from.state, invoice.from.zip]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
              Bill To
            </p>
            <div className="text-sm text-gray-900">
              <p className="font-semibold">
                {invoice.to.name || (
                  <span className="text-gray-300 italic">Client Name</span>
                )}
              </p>
              {invoice.to.email && (
                <p className="text-gray-600">{invoice.to.email}</p>
              )}
              {invoice.to.address && <p>{invoice.to.address}</p>}
              {(invoice.to.city || invoice.to.state || invoice.to.zip) && (
                <p>
                  {[invoice.to.city, invoice.to.state, invoice.to.zip]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs uppercase tracking-wider text-gray-500 pb-2">
                  Description
                </th>
                <th className="text-center text-xs uppercase tracking-wider text-gray-500 pb-2 w-16">
                  Qty
                </th>
                <th className="text-right text-xs uppercase tracking-wider text-gray-500 pb-2 w-24">
                  Price
                </th>
                <th className="text-right text-xs uppercase tracking-wider text-gray-500 pb-2 w-24">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length > 0 ? (
                invoice.items.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100"
                  >
                    <td className="py-3 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-center">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="py-3 text-sm text-gray-900 font-medium text-right">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-gray-400 text-sm italic"
                  >
                    {isBuilding ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding line items...
                      </div>
                    ) : (
                      "No items yet"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">
                {formatCurrency(calculatedInvoice.subtotal, invoice.currency)}
              </span>
            </div>
            {calculatedInvoice.discountRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Discount ({calculatedInvoice.discountRate}%)
                </span>
                <span className="text-green-600">
                  -{formatCurrency(calculatedInvoice.discountAmount, invoice.currency)}
                </span>
              </div>
            )}
            {calculatedInvoice.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Tax ({calculatedInvoice.taxRate}%)
                </span>
                <span className="text-gray-900">
                  {formatCurrency(calculatedInvoice.taxAmount, invoice.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-900">Total</span>
              <span style={{ color: invoice.accentColor || "#e11d48" }}>
                {formatCurrency(calculatedInvoice.total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
            {invoice.notes && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Terms & Conditions
                </p>
                <p className="text-sm text-gray-600">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 text-center text-xs"
        style={{
          backgroundColor: `${invoice.accentColor || "#e11d48"}10`,
          color: invoice.accentColor || "#e11d48",
        }}
      >
        Thank you for your business!
      </div>
    </div>
  );
};

// Build Progress Component
const BuildProgress: React.FC<{
  steps: BuildStep[];
  isBuilding: boolean;
}> = ({ steps, isBuilding }) => {
  if (steps.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-rose-400" />
        <span className="text-sm font-medium text-white">
          {isBuilding ? "Building Invoice..." : "Invoice Ready"}
        </span>
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-colors",
              step.status === "active" && "bg-rose-500/10",
              step.status === "complete" && "bg-green-500/10"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                step.status === "pending" && "bg-gray-700 text-gray-500",
                step.status === "active" && "bg-rose-500/20 text-rose-400",
                step.status === "complete" && "bg-green-500/20 text-green-400"
              )}
            >
              {step.status === "complete" ? (
                <Check className="h-3 w-3" />
              ) : step.status === "active" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm truncate",
                  step.status === "pending" && "text-gray-500",
                  step.status === "active" && "text-rose-300",
                  step.status === "complete" && "text-green-300"
                )}
              >
                {step.label}
              </p>
              {step.detail && step.status === "active" && (
                <p className="text-xs text-gray-500 truncate">{step.detail}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Invoice Edit Form Component
const InvoiceEditForm: React.FC<{
  invoice: InvoiceData;
  onUpdate: (invoice: InvoiceData) => void;
}> = ({ invoice, onUpdate }) => {
  const updateField = (path: string, value: string | number) => {
    const keys = path.split(".");
    const newInvoice = { ...invoice };
    let current: Record<string, unknown> = newInvoice;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
    
    onUpdate(calculateInvoiceTotals(newInvoice as InvoiceData));
  };

  const updateItem = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    const newItems = [...invoice.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      total: field === "quantity" 
        ? Number(value) * newItems[index].unitPrice
        : field === "unitPrice"
          ? newItems[index].quantity * Number(value)
          : newItems[index].total,
    };
    onUpdate(calculateInvoiceTotals({ ...invoice, items: newItems }));
  };

  const addItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    onUpdate(calculateInvoiceTotals({ ...invoice, items: [...invoice.items, newItem] }));
  };

  const removeItem = (index: number) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    onUpdate(calculateInvoiceTotals({ ...invoice, items: newItems }));
  };

  return (
    <div className="space-y-6">
      {/* Invoice Number & Dates */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Receipt className="h-4 w-4 text-rose-400" />
          Invoice Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Invoice #</label>
            <Input
              value={invoice.invoiceNumber}
              onChange={(e) => updateField("invoiceNumber", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Issue Date</label>
            <Input
              type="date"
              value={invoice.issueDate}
              onChange={(e) => updateField("issueDate", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
            <Input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* From (Business) */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">From (Your Business)</h3>
        <div className="space-y-2">
          <Input
            placeholder="Business Name"
            value={invoice.from.name}
            onChange={(e) => updateField("from.name", e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
          />
          <Input
            placeholder="Email"
            value={invoice.from.email || ""}
            onChange={(e) => updateField("from.email", e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
          />
          <Input
            placeholder="Address"
            value={invoice.from.address || ""}
            onChange={(e) => updateField("from.address", e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="City"
              value={invoice.from.city || ""}
              onChange={(e) => updateField("from.city", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
            <Input
              placeholder="State"
              value={invoice.from.state || ""}
              onChange={(e) => updateField("from.state", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
            <Input
              placeholder="ZIP"
              value={invoice.from.zip || ""}
              onChange={(e) => updateField("from.zip", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* To (Client) */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Bill To (Client)</h3>
        <div className="space-y-2">
          <Input
            placeholder="Client Name"
            value={invoice.to.name}
            onChange={(e) => updateField("to.name", e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
          />
          <Input
            placeholder="Email"
            value={invoice.to.email || ""}
            onChange={(e) => updateField("to.email", e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
          />
          <Input
            placeholder="Address"
            value={invoice.to.address || ""}
            onChange={(e) => updateField("to.address", e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="City"
              value={invoice.to.city || ""}
              onChange={(e) => updateField("to.city", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
            <Input
              placeholder="State"
              value={invoice.to.state || ""}
              onChange={(e) => updateField("to.state", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
            <Input
              placeholder="ZIP"
              value={invoice.to.zip || ""}
              onChange={(e) => updateField("to.zip", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Line Items</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={addItem}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {invoice.items.map((item, index) => (
            <div key={item.id} className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333] space-y-2">
              <div className="flex items-start gap-2">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  className="flex-1 bg-[#0f0f0f] border-[#333] text-white h-9 text-sm"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeItem(index)}
                  className="h-9 w-9 text-gray-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    className="bg-[#0f0f0f] border-[#333] text-white h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Price</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                    className="bg-[#0f0f0f] border-[#333] text-white h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Total</label>
                  <div className="h-9 px-3 flex items-center bg-[#0f0f0f] border border-[#333] rounded-md text-sm text-gray-400">
                    {formatCurrency(item.total, invoice.currency)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {invoice.items.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-[#333] rounded-lg">
              No items yet. Click "Add Item" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Tax & Discount */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Tax & Discount</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tax Rate (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={invoice.taxRate}
              onChange={(e) => updateField("taxRate", Number(e.target.value))}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Discount (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={invoice.discountRate}
              onChange={(e) => updateField("discountRate", Number(e.target.value))}
              className="bg-[#1a1a1a] border-[#333] text-white h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Notes & Terms</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <Textarea
              placeholder="Thank you for your business!"
              value={invoice.notes || ""}
              onChange={(e) => updateField("notes", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white text-sm min-h-[60px]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Payment Terms</label>
            <Textarea
              placeholder="Payment due within 30 days"
              value={invoice.terms || ""}
              onChange={(e) => updateField("terms", e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white text-sm min-h-[60px]"
            />
          </div>
        </div>
      </div>

      {/* Totals Summary */}
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.discountRate > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount ({invoice.discountRate}%)</span>
              <span>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Tax ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-[#333]">
            <span>Total</span>
            <span className="text-rose-400">{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Invoice Builder Component
export const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({
  isOpen,
  onClose,
  invoice,
  isBuilding,
  buildSteps,
  onInvoiceUpdate,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const invoiceContentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");

  const handleExportPDF = useCallback(async () => {
    if (!invoiceContentRef.current || !invoice) return;
    
    setIsExporting(true);
    try {
      await generatePDF(invoiceContentRef.current, `${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsExporting(false);
    }
  }, [invoice]);

  const handleInvoiceUpdate = useCallback((updatedInvoice: InvoiceData) => {
    onInvoiceUpdate?.(updatedInvoice);
  }, [onInvoiceUpdate]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full sm:w-[500px] md:w-[600px] bg-[#0f0f0f] border-l border-[#1f1f1f] z-40 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-600/20 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Invoice Builder</h2>
                <p className="text-xs text-gray-500">
                  {isBuilding
                    ? "Building your invoice..."
                    : invoice
                    ? `Invoice ${invoice.invoiceNumber}`
                    : "Start building"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {invoice && !isBuilding && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(invoice, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Tabs - Only show when invoice exists and not building */}
          {invoice && !isBuilding && (
            <div className="flex border-b border-[#1f1f1f]">
              <button
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                  activeTab === "preview"
                    ? "text-rose-400 border-b-2 border-rose-400 bg-rose-500/5"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                  activeTab === "edit"
                    ? "text-rose-400 border-b-2 border-rose-400 bg-rose-500/5"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Build Progress */}
            {buildSteps.length > 0 && isBuilding && (
              <BuildProgress steps={buildSteps} isBuilding={isBuilding} />
            )}

            {/* Invoice Content */}
            {invoice ? (
              activeTab === "edit" && !isBuilding ? (
                <InvoiceEditForm invoice={invoice} onUpdate={handleInvoiceUpdate} />
              ) : (
                <div ref={previewRef} className="transform scale-[0.85] origin-top">
                  <div ref={invoiceContentRef}>
                    <InvoicePreview invoice={invoice} isBuilding={isBuilding} />
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-600/20 flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Ready to Build
                </h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Tell me about the invoice you want to create. Include client
                  details, services, and amounts.
                </p>
                <div className="mt-6 space-y-2 text-left w-full max-w-xs">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                    Try saying:
                  </p>
                  {[
                    "Create an invoice for web design services",
                    "Bill John Smith $500 for consulting",
                    "Invoice for 3 hours of work at $150/hr",
                  ].map((example, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-400 p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]"
                    >
                      <ChevronRight className="h-3 w-3 text-rose-400" />
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {invoice && !isBuilding && (
            <div className="p-4 border-t border-[#1f1f1f] bg-[#0a0a0a]">
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  className="border-[#333] text-white hover:bg-[#1f1f1f]"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InvoiceBuilder;
