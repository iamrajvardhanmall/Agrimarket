export const graphNodes = [
  { id: "Nashik APMC", label: "Nashik APMC", type: "market" },
  { id: "Lasalgaon Market", label: "Lasalgaon Market", type: "market" },
  { id: "Pimpalgaon Baswant", label: "Pimpalgaon Baswant", type: "market" },
  { id: "FreshKart Foods", label: "FreshKart Foods", type: "buyer" },
  { id: "Sahyadri Processors", label: "Sahyadri Processors", type: "buyer" },
  { id: "GreenBasket Retail", label: "GreenBasket Retail", type: "buyer" },
];

export const graphEdges = [
  { source: "Nashik APMC", target: "FreshKart Foods", weight: 94 },
  { source: "Nashik APMC", target: "Sahyadri Processors", weight: 87 },
  { source: "Lasalgaon Market", target: "FreshKart Foods", weight: 94 },
  { source: "Lasalgaon Market", target: "Sahyadri Processors", weight: 87 },
  { source: "Pimpalgaon Baswant", target: "GreenBasket Retail", weight: 79 },
];
