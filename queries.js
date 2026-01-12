
//Part 1: Data Model
// Query used to load initial data
load('data.js');


//Part 2: Slow Query Analysis
//Given query 1:
db.tickets.find({
tenantId: "tenant_123",
status: "open",
createdAt: { $gte: ISODate("2025-01-01") }
}).sort({ createdAt: -1 }).limit(20)


// Created Indexes to optimize Query 1
db.tickets.createIndex({ tenantId: 1, status: 1, createdAt: -1 });

//Given query 2:

db.tickets.find({
description: { $regex: "refund", $options: "i" }
})

// Created Index to optimize Query 2
db.tickets.createIndex({
  description: "text",
})

//Modified query 2 to leverage text index
db.tickets.find({
  $text: { $search: "refund" }
})


//Part 3: Index Design
//Index for Open Tickets Dashboard (tenant-wise)
db.tickets.createIndex({
  tenantId: 1,
  status: 1,
  createdAt: -1
})

//Index for Agent Workload Report
db.tickets.createIndex({
  agentId: 1,
  status: 1
})


//Index for SlA Escalation Queries
db.tickets.createIndex(
  { createdAt: 1 },
  {
    partialFilterExpression: {
      status: { $in: ["open", "pending"] }
    }
  }
)


//Index for Tag-based Ticket Search
db.tickets.createIndex({
  tags: 1
})


//Part 4: MongoDB Full-Text Search
//Index created 
db.tickets.createIndex({
  subject: "text",
  description: "text",
  tags: "text"
})


// Query used to run text search for "refund delayed response"
db.tickets.find({
  $text: { $search: "refund delayed response" }
})

