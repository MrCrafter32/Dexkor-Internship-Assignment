const tenants = ["tenant_101", "tenant_102", "tenant_103", "tenant_104", "tenant_105"];
const statuses = ["open", "pending", "resolved", "closed"];
const priorities = ["low", "medium", "high"];
const tags = ["refund", "billing", "login", "delay", "payment"];

let docs = [];

for (let i = 1; i <= 50000; i++) {
  docs.push({
    tenantId: tenants[i % tenants.length],
    ticketNumber: `TKT-${i}`,
    subject: "Customer support issue",
    description: "Customer issue number " + i,
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    tags: [tags[i % tags.length]],
    customerEmail: `user${i}@example.com`,
    agentId: `agent_${i % 15}`,
    createdAt: new Date(Date.now() - i * 60000),
    updatedAt: new Date()
  });
}

db.tickets.insertMany(docs);
