export interface CatalogItem {
  price: string;
  unit?: string;
  sku?: string;
  minStock?: number;
}

export type CatalogEntry = Record<string, CatalogItem>;
export type CatalogType  = Record<string, CatalogEntry[]>;

export const CATALOG: CatalogType = {
  "Phone": [
    { "iPhone 14": { price: "$10,999.00", unit: "pieza", sku: "PHN-001" } },
    { "iPhone 15": { price: "$12,999.00", unit: "pieza", sku: "PHN-002" } },
    { "iPhone 16": { price: "$15,999.00", unit: "pieza", sku: "PHN-003" } },
    { "iPhone 17": { price: "$20,999.00", unit: "pieza", sku: "PHN-004" } },
  ],
  "Accesorios": [
    { "Cable USB-C":      { price: "$89.00",  unit: "pieza", sku: "ACC-001" } },
    { "Cargador 20W":    { price: "$199.00", unit: "pieza", sku: "ACC-002" } },
    { "Cargador MagSafe":{ price: "$349.00", unit: "pieza", sku: "ACC-003" } },
    { "AirPods 3ra Gen": { price: "$2,299.00",unit: "pieza", sku: "ACC-004" } },
    { "AirPods Pro 2":   { price: "$3,799.00",unit: "pieza", sku: "ACC-005" } },
  ],
  "Fundas": [
    { "Funda iPhone 14":      { price: "$149.00", unit: "pieza", sku: "FND-001" } },
    { "Funda iPhone 15":      { price: "$149.00", unit: "pieza", sku: "FND-002" } },
    { "Funda iPhone 16":      { price: "$169.00", unit: "pieza", sku: "FND-003" } },
    { "Funda iPhone 17":      { price: "$199.00", unit: "pieza", sku: "FND-004" } },
    { "Funda MagSafe iPhone 16": { price: "$299.00", unit: "pieza", sku: "FND-005" } },
  ],
  "Protectores": [
    { "Mica Vidrio iPhone 14": { price: "$79.00",  unit: "pieza", sku: "PRO-001" } },
    { "Mica Vidrio iPhone 15": { price: "$79.00",  unit: "pieza", sku: "PRO-002" } },
    { "Mica Vidrio iPhone 16": { price: "$89.00",  unit: "pieza", sku: "PRO-003" } },
    { "Mica Privacidad iPhone 16": { price: "$129.00", unit: "pieza", sku: "PRO-004" } },
  ],
  "Apple Watch": [
    { "Apple Watch SE": { price: "$4,999.00", unit: "pieza", sku: "AW-001" } },
    { "Apple Watch Series 8": { price: "$7,999.00", unit: "pieza", sku: "AW-002" } },
    { "Apple Watch Ultra": { price: "$14,999.00", unit: "pieza", sku: "AW-003" } },
  ],
  "iPad": [
    { "iPad 10.2": { price: "$5,999.00", unit: "pieza", sku: "IPD-001" } },
    { "iPad Air": { price: "$8,999.00", unit: "pieza", sku: "IPD-002" } },
    { "iPad Pro 11": { price: "$12,999.00", unit: "pieza", sku: "IPD-003" } },
    { "iPad Pro 12.9": { price: "$18,999.00", unit: "pieza", sku: "IPD-004" } },
  ],
  "Mac": [
    { "MacBook Air M2": { price: "$14,999.00", unit: "pieza", sku: "MAC-001" } },
    { "MacBook Pro 13 M2": { price: "$19,999.00", unit: "pieza", sku: "MAC-002" } }, 
    { "MacBook Pro 14 M2 Pro": { price: "$29,999.00", unit: "pieza", sku: "MAC-003" } },
    { "MacBook Pro 16 M2 Pro": { price: "$39,999.00", unit: "pieza", sku: "MAC-004" } },
  ],
  "AirPods": [
    { "AirPods 3ra Gen": { price: "$2,299.00", unit: "pieza", sku: "APD-001" } },
    { "AirPods Pro 2": { price: "$3,799.00", unit: "pieza", sku: "APD-002" } },
  ],
  "Apple TV": [
    { "Apple TV 4K": { price: "$3,499.00", unit: "pieza", sku: "TV-001" } },
    { "Apple TV HD": { price: "$2,499.00", unit: "pieza", sku: "TV-002" } },
  ],
  "HomePod": [
    { "HomePod mini": { price: "$1,299.00", unit: "pieza", sku: "HP-001" } },
    { "HomePod": { price: "$4,999.00", unit: "pieza", sku: "HP-002" } },
  ],
  "Servicios": [
    { "AppleCare+ iPhone": { price: "$2,999.00", unit: "pieza", sku: "SRV-001" } },
    { "AppleCare+ Mac": { price: "$4,999.00", unit: "pieza", sku: "SRV-002" } },
    { "AppleCare+ iPad": { price: "$1,999.00", unit: "pieza", sku: "SRV-003" } },
    { "AppleCare+ Apple Watch": { price: "$1,499.00", unit: "pieza", sku: "SRV-004" } },
  ],
  "Software": [
    { "Final Cut Pro": { price: "$3,499.00", unit: "licencia", sku: "SFT-001" } },
    { "Logic Pro": { price: "$2,499.00", unit: "licencia", sku: "SFT-002" } },
    { "Adobe Photoshop": { price: "$1,299.00", unit: "suscripción anual", sku: "SFT-003" } },
    { "Microsoft Office 365": { price: "$999.00", unit: "suscripción anual", sku: "SFT-004" } },
  ],
  "Accesorios para Mac": [
    { "Magic Mouse": { price: "$1,299.00", unit: "pieza", sku: "AMC-001" } },
    { "Magic Keyboard": { price: "$2,499.00", unit: "pieza", sku: "AMC-002" } },
    { "Magic Trackpad": { price: "$2,999.00", unit: "pieza", sku: "AMC-003" } },
  ],
  "Accesorios para iPad": [
    { "Apple Pencil 1ra Gen": { price: "$1,299.00", unit: "pieza", sku: "API-001" } },
    { "Apple Pencil 2da Gen": { price: "$2,499.00", unit: "pieza", sku: "API-002" } },
    { "Smart Keyboard Folio": { price: "$3,999.00", unit: "pieza", sku: "API-003" } },
  ],
  "Accesorios para Apple Watch": [
    { "Correa Deportiva": { price: "$499.00", unit: "pieza", sku: "AWC-001" } },
    { "Correa de Cuero": { price: "$999.00", unit: "pieza", sku: "AWC-002" } },
    { "Correa de Nylon": { price: "$699.00", unit: "pieza", sku: "AWC-003" } },
  ],
  "Accesorios para iPhone": [
    { "Cargador Inalámbrico": { price: "$499.00", unit: "pieza", sku: "API-001" } },
    { "Soporte para Auto": { price: "$299.00", unit: "pieza", sku: "API-002" } },
    { "Lente para Cámara": { price: "$899.00", unit: "pieza", sku: "API-003" } },
  ],
  "Accesorios para AirPods": [
    { "Estuche de Carga Inalámbrica": { price: "$499.00", unit: "pieza", sku: "APC-001" } },
    { "Ganchos para Oreja": { price: "$199.00", unit: "pieza", sku: "APC-002" } },
    { "Almohadillas de Repuesto": { price: "$299.00", unit: "pieza", sku: "APC-003" } },
  ],
  "Accesorios para Apple TV": [
    { "Control Remoto Siri": { price: "$1,299.00", unit: "pieza", sku: "ATC-001" } },
    { "Soporte para Apple TV": { price: "$499.00", unit: "pieza", sku: "ATC-002" } },
    { "Cable HDMI": { price: "$199.00", unit: "pieza", sku: "ATC-003" } },
  ],
  "Accesorios para HomePod": [
    { "Soporte para HomePod": { price: "$499.00", unit: "pieza", sku: "HPC-001" } },
    { "Cable de Repuesto": { price: "$199.00", unit: "pieza", sku: "HPC-002" } },
    { "Funda para HomePod mini": { price: "$299.00", unit: "pieza", sku: "HPC-003" } },
  ],
};