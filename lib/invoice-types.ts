// Invoice Builder Types

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceParty {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  
  // Dates
  issueDate: string;
  dueDate: string;
  
  // Parties
  from: InvoiceParty;
  to: InvoiceParty;
  
  // Line items
  items: InvoiceLineItem[];
  
  // Totals
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  
  // Additional
  notes?: string;
  terms?: string;
  currency: string;
  
  // Branding
  logoUrl?: string;
  accentColor?: string;
}

export interface InvoiceBuilderState {
  isOpen: boolean;
  isBuilding: boolean;
  currentStep: "idle" | "gathering" | "building" | "complete";
  invoice: InvoiceData | null;
  buildProgress: number;
  buildSteps: BuildStep[];
}

export interface BuildStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete";
  detail?: string;
}

// Default empty invoice
export const createEmptyInvoice = (): InvoiceData => ({
  id: `inv-${Date.now()}`,
  invoiceNumber: `INV-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
  status: "draft",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  from: {
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  },
  to: {
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  },
  items: [],
  subtotal: 0,
  taxRate: 0,
  taxAmount: 0,
  discountRate: 0,
  discountAmount: 0,
  total: 0,
  currency: "USD",
  accentColor: "#e11d48", // Rose color to match brand
});

// Parse invoice data from AI response
export const parseInvoiceFromAI = (content: string): Partial<InvoiceData> | null => {
  try {
    // Look for JSON block in the response (with or without "json" language tag)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1].trim();
      // Make sure it looks like JSON
      if (jsonStr.startsWith("{")) {
        const parsed = JSON.parse(jsonStr);
        return parsed;
      }
    }
    
    // Try to find JSON object anywhere in the content
    const jsonObjectMatch = content.match(/\{[\s\S]*"(?:from|to|items)"[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        const parsed = JSON.parse(jsonObjectMatch[0]);
        return parsed;
      } catch {
        // Try to extract just the first complete JSON object
        let braceCount = 0;
        let startIdx = -1;
        for (let i = 0; i < content.length; i++) {
          if (content[i] === "{") {
            if (startIdx === -1) startIdx = i;
            braceCount++;
          } else if (content[i] === "}") {
            braceCount--;
            if (braceCount === 0 && startIdx !== -1) {
              const jsonStr = content.substring(startIdx, i + 1);
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.from || parsed.to || parsed.items) {
                  return parsed;
                }
              } catch {
                // Continue looking
              }
            }
          }
        }
      }
    }
    
    // Try to parse the entire content as JSON
    if (content.trim().startsWith("{")) {
      return JSON.parse(content.trim());
    }
    
    return null;
  } catch (e) {
    console.error("Failed to parse invoice JSON:", e);
    return null;
  }
};

// Calculate invoice totals
export const calculateInvoiceTotals = (invoice: InvoiceData): InvoiceData => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (invoice.discountRate / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (invoice.taxRate / 100);
  const total = taxableAmount + taxAmount;
  
  return {
    ...invoice,
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
};

// Format currency
export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// Invoice builder system prompt
export const INVOICE_BUILDER_SYSTEM_PROMPT = `You are an invoice builder assistant. IMPORTANT: You MUST generate invoice JSON data in your response.

CRITICAL RULES:
1. ALWAYS include a \`\`\`json code block with invoice data in EVERY response
2. Use reasonable defaults for any missing information
3. If the user mentions a price/amount, use that exact amount
4. Generate realistic placeholder names if not provided (e.g., "Your Business Name", "Client Name")

When the user asks to create an invoice, IMMEDIATELY generate the JSON with whatever information they provided. Fill in sensible defaults for anything not specified.

REQUIRED FORMAT - Include this in every response:

\`\`\`json
{
  "from": {
    "name": "Your Business Name",
    "email": "you@business.com",
    "address": "123 Main Street",
    "city": "Traverse City",
    "state": "MI",
    "zip": "49684"
  },
  "to": {
    "name": "Client Name",
    "email": "client@email.com",
    "address": "456 Oak Avenue",
    "city": "Traverse City",
    "state": "MI",
    "zip": "49684"
  },
  "items": [
    {
      "description": "Service Description",
      "quantity": 1,
      "unitPrice": 100.00,
      "total": 100.00
    }
  ],
  "taxRate": 0,
  "discountRate": 0,
  "notes": "Thank you for your business!",
  "terms": "Payment due within 30 days"
}
\`\`\`

Examples:
- "Invoice for $500 web design" → Generate JSON with items: [{ description: "Web Design Services", quantity: 1, unitPrice: 500, total: 500 }]
- "Bill John for 3 hours at $150/hr" → Generate JSON with to.name: "John", items: [{ description: "Consulting Services", quantity: 3, unitPrice: 150, total: 450 }]
- "Create an invoice" → Generate JSON with placeholder data that can be edited

After the JSON block, you can add a brief message asking if they want to modify anything. But ALWAYS include the JSON block first.`;
