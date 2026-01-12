Dexkor Internship Assignment:

All the indexes mentioned here are in the indexes.js file and queries are in the queries.js file. All the execution Stats are in the executionStats folder.

1.  Dataset
    The code used to generate the documents is in the data.js file
    Name of the collection created and is being used : tickets
    Total Documents Generated: 50000
    Fields: _id
            tenantId
            subject
            description
            status
            priority
            tags
            customerEmail
            agentId
            createdAt
            updatedAt
    
2.  Slow Query Analysis
    Without any indexed fields, both queries initially employed the COLLSCAN query-execution method to discover their results. Consequently, the database executed a whole collection scan and returned the documents that matched the queries. The server additionally had to sort all of the documents from Query 1 according to relevance to the sorted fields. Based on the complexity of Query 1, Query 2 required more CPU cycles to execute because it contained a regular expression.

    To fix these issues indexes were created for the following fields:
        Query 1:
            tenantID
            status
            createdAt
        Query 2:
            description(text index)

    The regex condition was forcing the database to perform a COLLSCAN so the query is modified to do a text search on the description as it is a text index.

    After applying the indexes:
        Collection scans were eliminated
        Sorting was handled by the index where applicable
        Query execution time and resource usage were significantly reduced

3.  Index Design
    1.  Open Tickets Dashboard (Tenant-Wise)
        Dashboard queries are frequently used to filter tickets by tenants and status of the tickets and most will sort them by the latest tickets first. Placing tenantID and status first in the index allows mongodb to filter the result set easily. while indexing createdAt in the descending order allows the database to return sorted results direclty from the index without having any additional sorting tasks.

    2. Agent Workload View (agentId+status)
       An agent workload view is often used to group or filter tickets by agentId to analyze workload distribution. Placing agentId first in the index allows mongodb to efficiently retrieve tickets assigned to the agent. Further including status in the index optimizes queries that focus on filtering open or closed tickets of the specific agent.

    3. SLA-Escalation Queries
       SLA Escalation is used to identify tickets that have remained unresolved beyond a defined time limit. Since closed tickets are not relevant for SLA monitoring a partial index on only unresolved tickets (open,pending statuses) was created. This will reduce the index and and ensures the SLA Escaltion Queries do not waste resources. By including createdAt in the index will allow the database to filter out the results in the given time range.
    
    4. Tag-based Filtering
       Tags are used to categorize tickets by issue type. The tags field is an array, where each ticket can have one or more tags. MongoDB automatically creates a multikey index when an index is created on an array field. This allows each tag value to be indexed individually, enabling fast lookups for tickets associated with a specific issue type.

       Without this index, filtering tickets by tag would require scanning the entire collection, which becomes inefficient as the number of tickets grows.

4. MongoDB Full-Text Search
   MongoDB text search is an efficient feature for querying string content for text within your defined collection, allowing for text queries that are not limited to just matching the exact text. In the original search query, a condition of a case insensitive regex was used, causing MongoDB to execute a full collection scan. This was not only taxing on CPU, but would not allow for growth as the dataset increased. Therefore, a multi-field text index was defined to enable searching for text across multiple fields of a ticket that are important in a customer support system. Important keywords can be in the subject of a ticket, the description of a ticket, and as associated tags. By indexing all of these fields, the search results will be complete and in alignment with actual user behavior.

   MongoDB  tokenizes all indexed fields in the database and stores the tokenized terms in a single inverted index, Java enables efficient searching of keywords across multiple fields rather than scanning the complete MongoDB collection.

    Q. How MongoDB Text Scoring Works?
    A. It assigns a relevnace score to each matching document based on the frequency of matched terms, number of matched search terms, field in which terms appear. The score allows MongoDB to rank results by relevance, making search results more useful in real-world applications.

    Q. Why $text search is faster than regex?
    A. Regex-based searches require MongoDB to scan every document in the collection and perform string matching at runtime. This leads to collection scans (COLLSCAN), high CPU usage, and poor scalability as the dataset grows. $text search uses a precomputed inverted index, where words are tokenized and indexed in advance. When a search is executed, MongoDB directly looks up the relevant terms in the index instead of scanning all documents.

    Q. What are the limitations of native MongoDB Text Search?
    A. While MongoDB’s native text search is efficient for basic full-text search, it has some limitations:
        Only one text index is allowed per collection.
        No support for fuzzy matching.
        No built-in autocomplete.
        Limited control over relevance scoring and boosting.
        Not suitable for advanced search analytics.